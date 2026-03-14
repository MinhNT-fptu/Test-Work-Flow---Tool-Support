import { useEffect, useState } from "react";
import "./AdminGroupManagement.css";
import { useNavigate } from "react-router-dom";

const API_URL      = "/api/student_group";
const LECTURER_API = "/api/admin/users?roleCode=LECTURER&page=0&size=999";
const ASSIGN_API   = "/api/admin/groups";
const MEMBER_API   = "/api/groups";
const COURSE_API   = "/api/courses";
const SEMESTER_API = "/api/semesters";
const CLASS_API    = "/api/classes";

function AdminGroupManagement() {
  const [groups,   setGroups]   = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [members,  setMembers]  = useState([]);
  const [eligibleStudents, setEligibleStudents]   = useState([]);
  const [studentKeyword,   setStudentKeyword]     = useState("");
  const [studentPage,      setStudentPage]        = useState(0);
  const [studentTotalPages, setStudentTotalPages] = useState(0);
  const navigate = useNavigate();

  // Dropdown data
  const [courses,   setCourses]   = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [classes,   setClasses]   = useState([]);

  const [form, setForm] = useState({
    groupId: null,
    classId: null,
    courseCode: "",
    semesterCode: "",
    groupName: "",
  });

  const [filter, setFilter] = useState({ courseCode: "", semester: "" });
  const [error, setError] = useState("");
  const [showLecturerModal, setShowLecturerModal] = useState(false);
  const [showMemberModal,   setShowMemberModal]   = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const token = localStorage.getItem("token");
  const h = { Authorization: `Bearer ${token}` };

  /* ---- Initial load ---- */
  useEffect(() => {
    fetchGroups();
    fetchLecturers();
    fetchCourses();
    fetchSemesters();
  }, []);

  /* ---- Cascade: fetch classes when course + semester selected ---- */
  useEffect(() => {
    if (form.courseCode && form.semesterCode) {
      fetchClasses(form.courseCode, form.semesterCode);
    } else {
      setClasses([]);
      setForm((p) => ({ ...p, classId: null }));
    }
  }, [form.courseCode, form.semesterCode]);

  /* ---- API helper fetch ---- */
  const apiFetch = (url, opts = {}) =>
    fetch(url, { headers: h, ...opts });

  const fetchGroups = async () => {
    let q = [];
    if (filter.courseCode) q.push(`course_code=${filter.courseCode}`);
    if (filter.semester)   q.push(`semester=${filter.semester}`);
    const url = q.length ? `${API_URL}?${q.join("&")}` : API_URL;
    const data = await (await apiFetch(url)).json();
    setGroups(data.data || []);
  };

  const fetchLecturers = async () => {
    const data = await (await apiFetch(LECTURER_API)).json();
    if (data.data?.content)    setLecturers(data.data.content);
    else if (Array.isArray(data.data)) setLecturers(data.data);
    else setLecturers([]);
  };

  const fetchCourses = async () => {
    const data = await (await apiFetch(COURSE_API)).json();
    setCourses(data.data || []);
  };

  const fetchSemesters = async () => {
    const data = await (await apiFetch(SEMESTER_API)).json();
    setSemesters(data.data || []);
  };

  const fetchClasses = async (courseCode, semesterCode) => {
    const data = await (await apiFetch(
      `${CLASS_API}?courseCode=${courseCode}&semesterCode=${semesterCode}&size=999`
    )).json();
    setClasses(data.data?.content || []);
  };

  const fetchMembers = async (groupId) => {
    const data = await (await apiFetch(`${MEMBER_API}/${groupId}/members`)).json();
    setMembers(data.data || []);
  };

  const fetchEligibleStudents = async (groupId, keyword = "", p = 0) => {
    try {
      const res  = await apiFetch(
        `/api/groups/${groupId}/members/search?keyword=${keyword}&page=${p}&size=5`
      );
      const data = await res.json();
      setEligibleStudents(data.data.content);
      setStudentTotalPages(data.data.totalPages);
      setStudentPage(p);
    } catch { /* silent */ }
  };

  /* ---- Modal openers ---- */
  const openLecturer = (g) => { setSelectedGroup(g); setShowLecturerModal(true); };
  const closeLecturer = () => { setShowLecturerModal(false); setSelectedGroup(null); };

  const openMembers = async (g) => {
    setSelectedGroup(g);
    await fetchMembers(g.groupId);
    await fetchEligibleStudents(g.groupId);
    setShowMemberModal(true);
  };
  const closeMembers = () => {
    setShowMemberModal(false);
    setSelectedGroup(null);
    setMembers([]);
    setStudentKeyword("");
  };

  /* ---- CRUD actions ---- */
  const handleAssignLecturer = async (lecturerId) => {
    if (!selectedGroup) return;
    const res = await apiFetch(`${ASSIGN_API}/${selectedGroup.groupId}/lecturer`, {
      method: "PUT",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ lecturerId }),
    });
    if (res.ok) { alert("Lecturer assigned!"); closeLecturer(); fetchGroups(); }
    else { const e = await res.json(); alert("Failed: " + (e.message || "Unknown")); }
  };

  const handleAddMember = async (userId) => {
    if (!selectedGroup) return;
    const res = await apiFetch(`${MEMBER_API}/${selectedGroup.groupId}/members`, {
      method: "POST",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) {
      alert("Member added!");
      await fetchMembers(selectedGroup.groupId);
      await fetchEligibleStudents(selectedGroup.groupId, studentKeyword, studentPage);
    } else { const e = await res.json(); alert("Failed: " + (e.message || "Unknown")); }
  };

  const handleRemoveMember = async (userId) => {
    if (!selectedGroup || !window.confirm("Remove this member?")) return;
    const res = await apiFetch(`${MEMBER_API}/${selectedGroup.groupId}/members/${userId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      alert("Member removed!");
      await fetchMembers(selectedGroup.groupId);
      await fetchEligibleStudents(selectedGroup.groupId, studentKeyword, studentPage);
    } else { const e = await res.json(); alert("Failed: " + (e.message || "Unknown")); }
  };

  const handleSetLeader = async (userId) => {
    if (!selectedGroup || !window.confirm("Set as leader?")) return;
    const res = await apiFetch(`${MEMBER_API}/${selectedGroup.groupId}/leader`, {
      method: "PUT",
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (res.ok) { alert("Leader set!"); await fetchMembers(selectedGroup.groupId); }
    else { const e = await res.json(); alert("Failed: " + (e.message || "Unknown")); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.groupId && !form.classId) {
      setError("Vui lòng chọn lớp học (Class).");
      return;
    }

    const method = form.groupId ? "PUT" : "POST";
    const url    = form.groupId ? `${API_URL}/update/${form.groupId}` : `${API_URL}/add`;
    const body   = form.groupId
      ? { groupName: form.groupName }
      : { classId: form.classId, groupName: form.groupName };

    const res = await apiFetch(url, {
      method,
      headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const e = await res.json();
      setError(res.status === 409 ? "Group name already exists in this class." : (e.message || "Error occurred"));
      return;
    }
    alert(form.groupId ? "Group updated!" : "Group created!");
    resetForm();
    fetchGroups();
  };

  const handleEdit = (g) => {
    setForm({ groupId: g.groupId, classId: null, courseCode: g.courseCode || "", semesterCode: g.semesterCode || "", groupName: g.groupName });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this group? This action cannot be undone.")) return;
    await apiFetch(`${API_URL}/delete/${id}`, { method: "DELETE" });
    fetchGroups();
  };

  const resetForm = () => {
    setForm({ groupId: null, classId: null, courseCode: "", semesterCode: "", groupName: "" });
    setClasses([]);
    setError("");
  };

  /* ---- Render ---- */
  return (
    <div className="gm-page">

      {/* PAGE HEADER */}
      <div className="gm-header">
        <div className="gm-header-left">
          <h1>Group Management</h1>
          <p>Create, manage and assign lecturers to student project groups</p>
        </div>
        <div className="gm-header-stats">
          <div className="gm-stat-chip">
            🎓 Total Groups: <span className="gm-stat-value">{groups.length}</span>
          </div>
          <div className="gm-stat-chip">
            👤 Lecturers: <span className="gm-stat-value">{lecturers.length}</span>
          </div>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="gm-toolbar">
        <span className="gm-toolbar-label">🔍 Filter</span>
        <input
          placeholder="Course Code"
          value={filter.courseCode}
          onChange={(e) => setFilter({ ...filter, courseCode: e.target.value })}
        />
        <input
          placeholder="Semester"
          value={filter.semester}
          onChange={(e) => setFilter({ ...filter, semester: e.target.value })}
        />
        <button className="gm-btn gm-btn-primary" onClick={fetchGroups}>Apply</button>
        <div className="gm-toolbar-sep" />
        <button className="gm-btn gm-btn-ghost" onClick={() => { setFilter({ courseCode: "", semester: "" }); fetchGroups(); }}>
          ✕ Clear
        </button>
      </div>

      {/* CREATE / EDIT PANEL */}
      <div className="gm-panel">
        <div className="gm-panel-header">
          <h2>
            <div className="gm-panel-icon">{form.groupId ? "✏️" : "+"}</div>
            {form.groupId ? "Edit Group" : "Create New Group"}
          </h2>
          {form.groupId && (
            <button className="gm-btn gm-btn-ghost" onClick={resetForm}>
              ✕ Cancel
            </button>
          )}
        </div>

        <div className="gm-panel-body">
          <form onSubmit={handleSubmit}>
            <div className="gm-form-grid">

              {!form.groupId ? (
                <>
                  {/* Course dropdown */}
                  <div className="gm-form-group">
                    <label>📚 Course *</label>
                    <select
                      value={form.courseCode}
                      onChange={(e) =>
                        setForm({ ...form, courseCode: e.target.value, semesterCode: "", classId: null })
                      }
                      required
                    >
                      <option value="">-- Select Course --</option>
                      {courses.map((c) => (
                        <option key={c.courseId} value={c.courseCode}>
                          {c.courseCode} — {c.courseName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Semester dropdown */}
                  <div className="gm-form-group">
                    <label>🗓️ Semester *</label>
                    <select
                      value={form.semesterCode}
                      onChange={(e) =>
                        setForm({ ...form, semesterCode: e.target.value, classId: null })
                      }
                      required
                    >
                      <option value="">-- Select Semester --</option>
                      {semesters.map((s) => (
                        <option key={s.semesterId} value={s.semesterCode}>
                          {s.semesterCode} — {s.semesterName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Class dropdown (filtered) */}
                  <div className="gm-form-group">
                    <label>🏫 Class *</label>
                    <select
                      value={form.classId || ""}
                      onChange={(e) => setForm({ ...form, classId: Number(e.target.value) || null })}
                      required
                      disabled={classes.length === 0}
                    >
                      <option value="">
                        {form.courseCode && form.semesterCode
                          ? classes.length === 0
                            ? "— No classes found —"
                            : "-- Select Class --"
                          : "— Select Course & Semester first —"}
                      </option>
                      {classes.map((cls) => (
                        <option key={cls.classId} value={cls.classId}>
                          {cls.classCode}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div className="gm-form-group">
                  <label>🏫 Current Class</label>
                  <input
                    value={`${form.courseCode} / ${form.semesterCode}`}
                    disabled
                  />
                </div>
              )}

              {/* Group Name */}
              <div className="gm-form-group">
                <label>👥 Group Name *</label>
                <input
                  placeholder="e.g. Team Alpha, G1, ..."
                  value={form.groupName}
                  onChange={(e) => setForm({ ...form, groupName: e.target.value })}
                  required
                />
              </div>

              {/* Error */}
              {error && (
                <div className="gm-form-error">
                  ⚠️ {error}
                </div>
              )}

              {/* Submit */}
              <div className="gm-form-actions">
                <button type="submit" className="gm-btn gm-btn-primary">
                  {form.groupId ? "💾 Update Group" : "✚ Create Group"}
                </button>
                {form.groupId && (
                  <button type="button" className="gm-btn gm-btn-ghost" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>

            </div>
          </form>
        </div>
      </div>

      {/* GROUP TABLE */}
      <div className="gm-table-wrap">
        <div className="gm-table-toolbar">
          <div className="gm-table-title">
            📋 All Groups
            <span className="gm-badge-count">{groups.length}</span>
          </div>
        </div>

        <table className="gm-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Group</th>
              <th>Course</th>
              <th>Semester</th>
              <th>Lecturer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.length > 0 ? (
              groups.map((g, i) => (
                <tr key={g.groupId}>
                  <td>{i + 1}</td>
                  <td>
                    <div className="gm-group-cell">
                      <div className="gm-group-avatar">
                        {g.groupName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="gm-group-name">{g.groupName}</div>
                        <div className="gm-group-class">{g.classCode}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="gm-tag gm-tag-blue">{g.courseCode}</span>
                  </td>
                  <td>
                    <span className="gm-tag gm-tag-orange">{g.semesterCode || g.semester}</span>
                  </td>
                  <td>
                    {g.lecturerName
                      ? <span className="gm-tag gm-tag-green">👤 {g.lecturerName}</span>
                      : <span className="gm-tag gm-tag-gray">Not assigned</span>}
                  </td>
                  <td>
                    <div className="gm-actions">
                      <button className="gm-action-btn gm-action-edit"     onClick={() => handleEdit(g)}>✏️ Edit</button>
                      <button className="gm-action-btn gm-action-members"  onClick={() => openMembers(g)}>👥 Members</button>
                      <button className="gm-action-btn gm-action-lecturer" onClick={() => openLecturer(g)}>🎓 Lecturer</button>
                      <button className="gm-action-btn gm-action-github"   onClick={() => navigate(`/admin/groups/${g.groupId}/github-config`)}>⚙️ GitHub</button>
                      <button className="gm-action-btn gm-action-jira"     onClick={() => navigate(`/admin/groups/${g.groupId}/jira-config`)}>📋 Jira</button>
                      <button className="gm-action-btn gm-action-delete"   onClick={() => handleDelete(g.groupId)}>🗑️ Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  <div className="gm-empty">
                    <div className="gm-empty-icon">📂</div>
                    <p>No groups found</p>
                    <span>Create a new group using the form above.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---- LECTURER MODAL ---- */}
      {showLecturerModal && (
        <div className="gm-modal-overlay" onClick={closeLecturer}>
          <div className="gm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="gm-modal-head">
              <h3>
                🎓 Assign Lecturer
                <span className="gm-modal-tag">{selectedGroup?.groupName}</span>
              </h3>
              <button className="gm-modal-close" onClick={closeLecturer}>×</button>
            </div>
            <div className="gm-modal-body">
              <table className="gm-inner-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Full Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lecturers.length > 0 ? lecturers.map((l, i) => (
                    <tr key={l.userId}>
                      <td>{i + 1}</td>
                      <td><strong>{l.fullName}</strong></td>
                      <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>@{l.username}</td>
                      <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{l.email}</td>
                      <td>
                        <button
                          className="gm-assign-btn"
                          onClick={() => handleAssignLecturer(l.userId)}
                          disabled={selectedGroup?.lecturerId === l.userId}
                          style={selectedGroup?.lecturerId === l.userId ? { background: "rgba(16,185,129,0.15)", color: "#059669" } : {}}
                        >
                          {selectedGroup?.lecturerId === l.userId ? "✓ Assigned" : "Assign"}
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr className="gm-no-data"><td colSpan="5">No lecturers found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---- MEMBER MODAL ---- */}
      {showMemberModal && (
        <div className="gm-modal-overlay" onClick={closeMembers}>
          <div className="gm-modal gm-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="gm-modal-head">
              <h3>
                👥 Manage Members
                <span className="gm-modal-tag">{selectedGroup?.groupName}</span>
              </h3>
              <button className="gm-modal-close" onClick={closeMembers}>×</button>
            </div>

            <div className="gm-modal-body">
              {/* Current Members */}
              <div className="gm-modal-section">
                <div className="gm-section-header">
                  <div className="gm-section-title">
                    <div className="gm-section-dot" style={{ background: "#7c3aed" }} />
                    Current Members ({members.length})
                  </div>
                </div>
                <table className="gm-inner-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Full Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.length > 0 ? members.map((m, i) => (
                      <tr key={m.userId}>
                        <td>{i + 1}</td>
                        <td><strong>{m.fullName}</strong></td>
                        <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>@{m.username}</td>
                        <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{m.email}</td>
                        <td>
                          {m.memberRole === "LEADER"
                            ? <span className="gm-role-leader">⭐ Leader</span>
                            : <span className="gm-role-member">Member</span>}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            {m.memberRole !== "LEADER" && (
                              <button className="gm-action-btn gm-action-jira" style={{ fontSize: 11 }}
                                onClick={() => handleSetLeader(m.userId)}>
                                ⭐ Set Leader
                              </button>
                            )}
                            <button className="gm-action-btn gm-action-delete" style={{ fontSize: 11 }}
                              onClick={() => handleRemoveMember(m.userId)}>
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr className="gm-no-data"><td colSpan="6">No members yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="gm-divider" />

              {/* Add Students */}
              <div className="gm-modal-section">
                <div className="gm-section-header">
                  <div className="gm-section-title">
                    <div className="gm-section-dot" style={{ background: "#10b981" }} />
                    Add Students
                  </div>
                </div>

                <div className="gm-search-wrap">
                  <span className="gm-search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search by name or username..."
                    value={studentKeyword}
                    onChange={(e) => {
                      const v = e.target.value;
                      setStudentKeyword(v);
                      fetchEligibleStudents(selectedGroup.groupId, v.trim(), 0);
                    }}
                  />
                </div>

                <table className="gm-inner-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Full Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligibleStudents.length > 0 ? eligibleStudents.map((s, i) => (
                      <tr key={s.userId}>
                        <td>{i + 1}</td>
                        <td><strong>{s.fullName}</strong></td>
                        <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>@{s.username}</td>
                        <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{s.email}</td>
                        <td>
                          <button className="gm-action-btn gm-action-lecturer" style={{ fontSize: 11 }}
                            onClick={() => handleAddMember(s.userId)}>
                            + Add
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr className="gm-no-data"><td colSpan="5">No eligible students found</td></tr>
                    )}
                  </tbody>
                </table>

                {studentTotalPages > 1 && (
                  <div className="gm-pagination">
                    {Array.from({ length: studentTotalPages }, (_, i) => (
                      <button
                        key={i}
                        className={i === studentPage ? "gm-page-active" : ""}
                        onClick={() => fetchEligibleStudents(selectedGroup.groupId, studentKeyword, i)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminGroupManagement;
