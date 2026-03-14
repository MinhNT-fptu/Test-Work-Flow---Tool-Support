-- ============================
-- RECREATE DATABASE
-- ============================
IF DB_ID(N'SWP391_JIRA_GITHUB_TOOL_SUPPORT') IS NOT NULL
BEGIN
    ALTER DATABASE SWP391_JIRA_GITHUB_TOOL_SUPPORT SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE SWP391_JIRA_GITHUB_TOOL_SUPPORT;
END
GO

CREATE DATABASE SWP391_JIRA_GITHUB_TOOL_SUPPORT;
GO
USE SWP391_JIRA_GITHUB_TOOL_SUPPORT;
GO

-- ============================
-- LOOKUP TABLES
-- ============================
CREATE TABLE Role (
    role_id INT IDENTITY(1,1) PRIMARY KEY,
    role_code NVARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE MemberRole (
    member_role_id INT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE TaskStatus (
    status_id INT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE RequirementStatus (
    status_id INT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE Priority (
    priority_id INT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE IntegrationType (
    integration_type_id INT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(30) NOT NULL UNIQUE
);
GO

-- ============================
-- SEED LOOKUP
-- ============================
INSERT INTO Role(role_code) VALUES (N'ADMIN'), (N'LECTURER'), (N'STUDENT');

SET IDENTITY_INSERT MemberRole ON;
INSERT INTO MemberRole(member_role_id, code) VALUES (1, N'LEADER'), (2, N'MEMBER');
SET IDENTITY_INSERT MemberRole OFF;

INSERT INTO TaskStatus(code) VALUES (N'TODO'), (N'IN_PROGRESS'), (N'DONE');
INSERT INTO RequirementStatus(code) VALUES (N'ACTIVE'), (N'DONE');
INSERT INTO Priority(code) VALUES (N'LOW'), (N'MEDIUM'), (N'HIGH');
INSERT INTO IntegrationType(code) VALUES (N'JIRA'), (N'GITHUB');
GO

-- ============================
-- USERS
-- ============================
CREATE TABLE Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    full_name NVARCHAR(100) NOT NULL,
    email NVARCHAR(120) NOT NULL UNIQUE,
    github_username NVARCHAR(100) NULL,
    jira_account_id NVARCHAR(255) NULL,
    password_hash NVARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_User_Role FOREIGN KEY (role_id) REFERENCES Role(role_id)
);
GO

CREATE UNIQUE INDEX UX_Users_github_username_notnull
ON dbo.Users(github_username)
WHERE github_username IS NOT NULL;
GO

CREATE UNIQUE INDEX UX_Users_jira_account_id_notnull
ON dbo.Users(jira_account_id)
WHERE jira_account_id IS NOT NULL;
GO

-- ============================
-- ACADEMIC STRUCTURE
-- Semester -> Course -> Class
-- ============================
CREATE TABLE Semester (
    semester_id INT IDENTITY(1,1) PRIMARY KEY,
    semester_code NVARCHAR(30) NOT NULL UNIQUE,   
    semester_name NVARCHAR(100) NOT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Course (
    course_id INT IDENTITY(1,1) PRIMARY KEY,
    course_code NVARCHAR(30) NOT NULL UNIQUE,    
    course_name NVARCHAR(150) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Class (
    class_id INT IDENTITY(1,1) PRIMARY KEY,
    class_code NVARCHAR(50) NOT NULL,
    course_id INT NOT NULL,
    semester_id INT NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Class_Course
        FOREIGN KEY (course_id) REFERENCES Course(course_id),

    CONSTRAINT FK_Class_Semester
        FOREIGN KEY (semester_id) REFERENCES Semester(semester_id),

    CONSTRAINT UQ_Class_Code_Course_Semester
        UNIQUE (class_code, course_id, semester_id)
);
GO

CREATE INDEX IX_Class_Course_Semester
ON Class(course_id, semester_id);
GO

-- ============================
-- LECTURER ASSIGNMENT
-- assign lecturer to class (not group)
-- ============================
CREATE TABLE LecturerAssignment (
    class_id INT PRIMARY KEY,
    lecturer_id INT NOT NULL,
    assigned_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_LectAssign_Class
        FOREIGN KEY (class_id) REFERENCES Class(class_id) ON DELETE CASCADE,

    CONSTRAINT FK_LectAssign_Lecturer
        FOREIGN KEY (lecturer_id) REFERENCES Users(user_id)
);
GO

CREATE INDEX IX_LecturerAssignment_Lecturer
ON LecturerAssignment(lecturer_id);
GO

CREATE TABLE ClassEnrollment (
    class_id INT NOT NULL,
    student_id INT NOT NULL,
    joined_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    PRIMARY KEY (class_id, student_id),

    CONSTRAINT FK_ClassEnrollment_Class
        FOREIGN KEY (class_id) REFERENCES Class(class_id) ON DELETE CASCADE,

    CONSTRAINT FK_ClassEnrollment_Student
        FOREIGN KEY (student_id) REFERENCES Users(user_id)
);
GO

CREATE INDEX IX_ClassEnrollment_Student
ON ClassEnrollment(student_id);
GO

-- ============================
-- STUDENT GROUP
-- each group belongs to a class
-- ============================
CREATE TABLE StudentGroup (
    group_id INT IDENTITY(1,1) PRIMARY KEY,
    class_id INT NOT NULL,
    group_name NVARCHAR(120) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_StudentGroup_Class
        FOREIGN KEY (class_id) REFERENCES Class(class_id) ON DELETE CASCADE,

    CONSTRAINT UQ_StudentGroup_Class_GroupName
        UNIQUE (class_id, group_name)
);
GO

CREATE INDEX IX_StudentGroup_Class
ON StudentGroup(class_id);
GO

CREATE TABLE GroupMember (
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    member_role_id INT NOT NULL,
    joined_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    PRIMARY KEY (group_id, user_id),

    CONSTRAINT FK_GroupMember_Group
        FOREIGN KEY (group_id) REFERENCES StudentGroup(group_id) ON DELETE CASCADE,

    CONSTRAINT FK_GroupMember_User
        FOREIGN KEY (user_id) REFERENCES Users(user_id),

    CONSTRAINT FK_GroupMember_MemberRole
        FOREIGN KEY (member_role_id) REFERENCES MemberRole(member_role_id)
);
GO

CREATE UNIQUE INDEX UX_Group_OneLeader
ON GroupMember(group_id)
WHERE member_role_id = 1;
GO

CREATE INDEX IX_GroupMember_User
ON GroupMember(user_id);
GO

-- ============================
-- INTEGRATION CONFIG
-- ============================
CREATE TABLE IntegrationConfig (
    config_id INT IDENTITY(1,1) PRIMARY KEY,
    group_id INT NOT NULL,
    integration_type_id INT NOT NULL,

    -- Jira
    base_url NVARCHAR(255) NULL,
    project_key NVARCHAR(50) NULL,
    jira_email NVARCHAR(120) NULL,

    -- GitHub
    repo_full_name NVARCHAR(200) NULL,
    token_encrypted VARBINARY(512) NULL,

    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Config_Group
        FOREIGN KEY (group_id) REFERENCES StudentGroup(group_id) ON DELETE CASCADE,

    CONSTRAINT FK_Config_Type
        FOREIGN KEY (integration_type_id) REFERENCES IntegrationType(integration_type_id),

    CONSTRAINT UX_Group_Integration
        UNIQUE (group_id, integration_type_id)
);
GO

-- ============================
-- REQUIREMENT
-- ============================
CREATE TABLE Requirement (
    requirement_id INT IDENTITY(1,1) PRIMARY KEY,
    group_id INT NOT NULL,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX) NULL,
    priority_id INT NOT NULL,
    status_id INT NOT NULL,
    created_by INT NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    jira_issue_key NVARCHAR(50) NULL,
    jira_issue_type NVARCHAR(50) NULL,
    jira_status_raw NVARCHAR(100) NULL,
    jira_priority_raw NVARCHAR(100) NULL,
    jira_updated_at DATETIME2 NULL,

    CONSTRAINT FK_Req_Group
        FOREIGN KEY (group_id) REFERENCES StudentGroup(group_id) ON DELETE CASCADE,

    CONSTRAINT FK_Req_Priority
        FOREIGN KEY (priority_id) REFERENCES Priority(priority_id),

    CONSTRAINT FK_Req_Status
        FOREIGN KEY (status_id) REFERENCES RequirementStatus(status_id),

    CONSTRAINT FK_Req_CreatedBy
        FOREIGN KEY (created_by) REFERENCES Users(user_id),

    CONSTRAINT UX_Req_Jira UNIQUE (jira_issue_key),

    CONSTRAINT CK_Requirement_JiraIssueType
        CHECK (jira_issue_type IS NULL OR jira_issue_type IN (N'EPIC'))
);
GO

-- ============================
-- TASK
-- ============================
CREATE TABLE Task (
    task_id INT IDENTITY(1,1) PRIMARY KEY,
    requirement_id INT NOT NULL,
    group_id INT NOT NULL,
    parent_task_id INT NULL,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX) NULL,
    assignee_id INT NULL,
    status_id INT NOT NULL,
    estimate_hours DECIMAL(6,2) NULL,
    start_date DATE NULL,
    due_date DATE NULL,
    completed_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    jira_issue_key NVARCHAR(50) NULL,
    jira_issue_type NVARCHAR(50) NULL,
    jira_parent_issue_key NVARCHAR(50) NULL,
    jira_status_raw NVARCHAR(100) NULL,
    jira_priority_raw NVARCHAR(100) NULL,
    jira_assignee_account_id NVARCHAR(255) NULL,
    jira_updated_at DATETIME2 NULL,

    CONSTRAINT FK_Task_Req
        FOREIGN KEY (requirement_id) REFERENCES Requirement(requirement_id) ON DELETE CASCADE,

    CONSTRAINT FK_Task_Group
        FOREIGN KEY (group_id) REFERENCES StudentGroup(group_id) ON DELETE NO ACTION,

    CONSTRAINT FK_Task_Assignee
        FOREIGN KEY (assignee_id) REFERENCES Users(user_id),

    CONSTRAINT FK_Task_Status
        FOREIGN KEY (status_id) REFERENCES TaskStatus(status_id),

    CONSTRAINT FK_Task_ParentTask
        FOREIGN KEY (parent_task_id) REFERENCES Task(task_id),

    CONSTRAINT UX_Task_Jira UNIQUE (jira_issue_key),

    CONSTRAINT CK_Task_JiraIssueType
        CHECK (jira_issue_type IS NULL OR jira_issue_type IN (N'STORY', N'SUBTASK'))
);
GO

-- ============================
-- TASK STATUS HISTORY
-- ============================
CREATE TABLE TaskStatusHistory (
    history_id INT IDENTITY(1,1) PRIMARY KEY,
    task_id INT NOT NULL,
    from_status_id INT NULL,
    to_status_id INT NOT NULL,
    changed_by INT NOT NULL,
    changed_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    note NVARCHAR(255) NULL,

    CONSTRAINT FK_Hist_Task
        FOREIGN KEY (task_id) REFERENCES Task(task_id) ON DELETE CASCADE,

    CONSTRAINT FK_Hist_FromStatus
        FOREIGN KEY (from_status_id) REFERENCES TaskStatus(status_id),

    CONSTRAINT FK_Hist_ToStatus
        FOREIGN KEY (to_status_id) REFERENCES TaskStatus(status_id),

    CONSTRAINT FK_Hist_ChangedBy
        FOREIGN KEY (changed_by) REFERENCES Users(user_id)
);
GO

-- ============================
-- REPOSITORY
-- ============================
CREATE TABLE Repository (
    repo_id INT IDENTITY(1,1) PRIMARY KEY,
    group_id INT NOT NULL,
    full_name NVARCHAR(200) NOT NULL UNIQUE,
    default_branch NVARCHAR(100) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

    CONSTRAINT FK_Repo_Group
        FOREIGN KEY (group_id) REFERENCES StudentGroup(group_id) ON DELETE CASCADE
);
GO

-- ============================
-- GIT COMMIT
-- ============================
CREATE TABLE GitCommit (
    commit_id INT IDENTITY(1,1) PRIMARY KEY,
    repo_id INT NOT NULL,
    sha VARCHAR(64) NOT NULL,
    author_user_id INT NULL,
    author_name NVARCHAR(120) NULL,
    author_email NVARCHAR(120) NULL,
    author_login NVARCHAR(100) NULL,
    commit_date DATETIME2 NOT NULL,
    message NVARCHAR(MAX) NULL,
    additions INT NULL,
    deletions INT NULL,
    files_changed INT NULL,

    CONSTRAINT FK_GitCommit_Repo
        FOREIGN KEY (repo_id) REFERENCES Repository(repo_id) ON DELETE CASCADE,

    CONSTRAINT FK_GitCommit_AuthorUser
        FOREIGN KEY (author_user_id) REFERENCES Users(user_id),

    CONSTRAINT UX_Repo_SHA
        UNIQUE (repo_id, sha)
);
GO

-- ============================
-- SYNC LOG
-- ============================
CREATE TABLE SyncLog (
    sync_id INT IDENTITY(1,1) PRIMARY KEY,
    group_id INT NOT NULL,
    source NVARCHAR(20) NOT NULL,
    started_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ended_at DATETIME2 NULL,
    inserted_count INT NOT NULL,
    updated_count INT NOT NULL,
    status NVARCHAR(20) NOT NULL,
    detail_message NVARCHAR(MAX) NULL,

    CONSTRAINT FK_Sync_Group
        FOREIGN KEY (group_id) REFERENCES StudentGroup(group_id) ON DELETE CASCADE,

    CONSTRAINT CK_SyncLog_Status
        CHECK (status IN ('RUNNING','SUCCESS','FAILED')),

    CONSTRAINT CK_SyncLog_Source
        CHECK (source IN ('JIRA','GITHUB'))
);
GO

CREATE UNIQUE INDEX UX_SyncLog_OneRunningPerSource
ON dbo.SyncLog(group_id, source)
WHERE status = 'RUNNING';
GO

-- ============================
-- HELPFUL INDEXES
-- ============================
CREATE INDEX IX_Task_GroupStatus ON Task(group_id, status_id);
CREATE INDEX IX_Task_DueDate ON Task(group_id, due_date);
CREATE INDEX IX_Task_ParentTask ON Task(parent_task_id);
CREATE INDEX IX_GitCommit_Date ON GitCommit(repo_id, commit_date);
CREATE INDEX IX_Sync_GroupDate ON SyncLog(group_id, started_at);
CREATE INDEX IX_GitCommit_Repo_AuthorUser_Date ON GitCommit(repo_id, author_user_id, commit_date);
CREATE INDEX IX_GitCommit_Repo_AuthorEmail_Date ON GitCommit(repo_id, author_email, commit_date);

CREATE INDEX IX_Requirement_Group_Status_Priority
ON dbo.Requirement(group_id, status_id, priority_id);

CREATE INDEX IX_Task_Requirement_IssueType_Status
ON dbo.Task(requirement_id, jira_issue_type, status_id);

CREATE INDEX IX_Task_Assignee_IssueType_Status
ON dbo.Task(assignee_id, jira_issue_type, status_id);

CREATE INDEX IX_Task_Group_Parent_IssueType
ON dbo.Task(group_id, parent_task_id, jira_issue_type);
GO

-- ============================
-- OPTIONAL DEFAULT SEED FOR ACADEMIC DATA
-- ============================
INSERT INTO Semester(semester_code, semester_name)
VALUES (N'SP26', N'Spring 2026');

INSERT INTO Course(course_code, course_name)
VALUES (N'SWP391', N'Software Project Management');

INSERT INTO Class(class_code, course_id, semester_id)
SELECT N'SE1901',
       c.course_id,
       s.semester_id
FROM Course c
CROSS JOIN Semester s
WHERE c.course_code = N'SWP391'
  AND s.semester_code = N'SP26';
GO