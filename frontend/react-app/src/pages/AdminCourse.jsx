import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  UserPlus, 
  CalendarPlus, 
  X,
  GraduationCap,
  CalendarRange,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit,
  Trash2
} from 'lucide-react';
import './AdminCourse.css';

// --- MOCK DATA ---
const MOCK_LECTURERS = [
  { id: 'l1', name: 'Dr. John Doe', email: 'john@university.edu' },
  { id: 'l2', name: 'Prof. Jane Smith', email: 'jane@university.edu' },
  { id: 'l3', name: 'Dr. Alan Turing', email: 'alan@university.edu' },
];

const MOCK_TRIMESTERS = [
  { id: 't1', name: 'Spring 2026' },
  { id: 't2', name: 'Summer 2026' },
  { id: 't3', name: 'Fall 2026' },
];

const INITIAL_COURSES = [
  { 
    id: 1, 
    code: 'SWP391', 
    name: 'Software Project Management', 
    lecturerId: 'l1', 
    trimesterId: 't1' 
  },
  { 
    id: 2, 
    code: 'PRF192', 
    name: 'Programming Fundamentals', 
    lecturerId: null, 
    trimesterId: 't1' 
  },
  { 
    id: 3, 
    code: 'PRN211', 
    name: 'Basic Cross-Platform Application Programming', 
    lecturerId: 'l2', 
    trimesterId: null 
  },
];
// -----------------

function AdminCourse() {
  const [courses, setCourses] = useState(INITIAL_COURSES);
  
  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignLecturerModalOpen, setIsAssignLecturerModalOpen] = useState(false);
  const [isAssignTrimesterModalOpen, setIsAssignTrimesterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Selected items for Assignment/Edit/Delete
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Form States
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [selectedLecturerId, setSelectedLecturerId] = useState('');
  const [selectedTrimesterId, setSelectedTrimesterId] = useState('');

  // --- HANDLERS ---
  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseName) return;

    const newCourse = {
      id: Date.now(),
      code: newCourseCode.toUpperCase(),
      name: newCourseName,
      lecturerId: null,
      trimesterId: null
    };

    setCourses([...courses, newCourse]);
    setNewCourseCode('');
    setNewCourseName('');
    setIsCreateModalOpen(false);
  };

  const handleOpenEditCourse = (course) => {
    setSelectedCourse(course);
    setNewCourseCode(course.code);
    setNewCourseName(course.name);
    setIsEditModalOpen(true);
  };

  const handleEditCourse = (e) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseName || !selectedCourse) return;

    setCourses(courses.map(c => 
      c.id === selectedCourse.id 
        ? { ...c, code: newCourseCode.toUpperCase(), name: newCourseName } 
        : c
    ));
    setIsEditModalOpen(false);
    setSelectedCourse(null);
    setNewCourseCode('');
    setNewCourseName('');
  };

  const handleOpenDeleteCourse = (course) => {
    setSelectedCourse(course);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCourse = () => {
    if (!selectedCourse) return;
    setCourses(courses.filter(c => c.id !== selectedCourse.id));
    setIsDeleteModalOpen(false);
    setSelectedCourse(null);
  };

  const handleOpenAssignLecturer = (course) => {
    setSelectedCourse(course);
    setSelectedLecturerId(course.lecturerId || '');
    setIsAssignLecturerModalOpen(true);
  };

  const submitAssignLecturer = (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setCourses(courses.map(c => 
      c.id === selectedCourse.id ? { ...c, lecturerId: selectedLecturerId } : c
    ));
    setIsAssignLecturerModalOpen(false);
    setSelectedCourse(null);
  };

  const handleOpenAssignTrimester = (course) => {
    setSelectedCourse(course);
    setSelectedTrimesterId(course.trimesterId || '');
    setIsAssignTrimesterModalOpen(true);
  };

  const submitAssignTrimester = (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setCourses(courses.map(c => 
      c.id === selectedCourse.id ? { ...c, trimesterId: selectedTrimesterId } : c
    ));
    setIsAssignTrimesterModalOpen(false);
    setSelectedCourse(null);
  };

  // Helper getters
  const getLecturerName = (id) => MOCK_LECTURERS.find(l => l.id === id)?.name;
  const getTrimesterName = (id) => MOCK_TRIMESTERS.find(t => t.id === id)?.name;

  return (
    <div className="course-management">
      {/* HEADER: View Course List & Create button */}
      <div className="header-section">
        <h2 className="header-title">
          <BookOpen className="header-icon" size={28} />
          Course Management
        </h2>
        <button 
          className="create-btn" 
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus size={20} />
          Create Course
        </button>
      </div>

      {/* VIEW COURSE LIST */}
      <div className="course-list-container">
        <table className="course-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Assigned Lecturer</th>
              <th>Trimester</th>
              <th>Assignments</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No courses found. Create one to get started.
                </td>
              </tr>
            ) : (
              courses.map(course => (
                <tr key={course.id}>
                  <td>
                    <span className="course-code">{course.code}</span>
                  </td>
                  <td>
                    <span className="course-name">{course.name}</span>
                  </td>
                  <td>
                    {course.lecturerId ? (
                      <span className="badge assigned">
                        <CheckCircle2 size={14} />
                        {getLecturerName(course.lecturerId)}
                      </span>
                    ) : (
                      <span className="badge unassigned">
                        <AlertCircle size={14} />
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td>
                    {course.trimesterId ? (
                      <span className="badge assigned" style={{ color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.2)', backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                        <CalendarRange size={14} />
                        {getTrimesterName(course.trimesterId)}
                      </span>
                    ) : (
                      <span className="badge unassigned">
                        <AlertCircle size={14} />
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn edit-course"
                        onClick={() => handleOpenEditCourse(course)}
                        title="Edit Course"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="action-btn assign-lecturer" 
                        onClick={() => handleOpenAssignLecturer(course)}
                        title="Assign Lecturer"
                      >
                        <UserPlus size={16} />
                        Lecturer
                      </button>
                      <button 
                        className="action-btn assign-trimester"
                        onClick={() => handleOpenAssignTrimester(course)}
                        title="Assign Trimester"
                      >
                        <CalendarPlus size={16} />
                        Trimester
                      </button>
                      <button 
                        className="action-btn delete-course"
                        onClick={() => handleOpenDeleteCourse(course)}
                        title="Delete Course"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Create Course Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleCreateCourse}>
              <div className="modal-header">
                <h3><BookOpen size={20} /> Create New Course</h3>
                <button type="button" className="close-btn" onClick={() => setIsCreateModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="courseCode">Course Code</label>
                  <input 
                    type="text" 
                    id="courseCode"
                    className="form-input" 
                    placeholder="e.g. SWP391" 
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="courseName">Course Name</label>
                  <input 
                    type="text" 
                    id="courseName"
                    className="form-input" 
                    placeholder="e.g. Software Development Project" 
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit Course Modal */}
      {isEditModalOpen && selectedCourse && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleEditCourse}>
              <div className="modal-header">
                <h3><Edit size={20} /> Edit Course</h3>
                <button type="button" className="close-btn" onClick={() => setIsEditModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="editCourseCode">Course Code</label>
                  <input 
                    type="text" 
                    id="editCourseCode"
                    className="form-input" 
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="editCourseName">Course Name</label>
                  <input 
                    type="text" 
                    id="editCourseName"
                    className="form-input" 
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Assign Lecturer Modal */}
      {isAssignLecturerModalOpen && selectedCourse && (
        <div className="modal-overlay" onClick={() => setIsAssignLecturerModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <form onSubmit={submitAssignLecturer}>
              <div className="modal-header">
                <h3><GraduationCap size={20} /> Assign Lecturer</h3>
                <button type="button" className="close-btn" onClick={() => setIsAssignLecturerModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <p style={{ color: '#94a3b8', margin: '0 0 10px 0', fontSize: '14px' }}>
                  Assigning a lecturer for <strong>{selectedCourse.code} - {selectedCourse.name}</strong>
                </p>
                <div className="form-group">
                  <label htmlFor="lecturerSelect">Select Lecturer</label>
                  <select 
                    id="lecturerSelect" 
                    className="form-select"
                    value={selectedLecturerId}
                    onChange={(e) => setSelectedLecturerId(e.target.value)}
                  >
                    <option value="">-- No Lecturer Assigned --</option>
                    {MOCK_LECTURERS.map(lecturer => (
                      <option key={lecturer.id} value={lecturer.id}>
                        {lecturer.name} ({lecturer.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsAssignLecturerModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Save Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Assign Trimester Modal */}
      {isAssignTrimesterModalOpen && selectedCourse && (
        <div className="modal-overlay" onClick={() => setIsAssignTrimesterModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <form onSubmit={submitAssignTrimester}>
              <div className="modal-header">
                <h3><CalendarRange size={20} /> Assign Trimester</h3>
                <button type="button" className="close-btn" onClick={() => setIsAssignTrimesterModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <p style={{ color: '#94a3b8', margin: '0 0 10px 0', fontSize: '14px' }}>
                  Assigning a trimester for <strong>{selectedCourse.code} - {selectedCourse.name}</strong>
                </p>
                <div className="form-group">
                  <label htmlFor="trimesterSelect">Select Trimester</label>
                  <select 
                    id="trimesterSelect" 
                    className="form-select"
                    value={selectedTrimesterId}
                    onChange={(e) => setSelectedTrimesterId(e.target.value)}
                  >
                    <option value="">-- No Trimester Assigned --</option>
                    {MOCK_TRIMESTERS.map(trimester => (
                      <option key={trimester.id} value={trimester.id}>
                        {trimester.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsAssignTrimesterModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Save Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Delete Course Modal */}
      {isDeleteModalOpen && selectedCourse && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header" style={{ borderBottomColor: 'rgba(239, 68, 68, 0.2)' }}>
              <h3 style={{ color: '#ef4444' }}><Trash2 size={20} /> Confirm Deletion</h3>
              <button type="button" className="close-btn" onClick={() => setIsDeleteModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: '1.5' }}>
                Are you sure you want to delete the course <strong>{selectedCourse.code} - {selectedCourse.name}</strong>?
              </p>
              <p style={{ margin: '10px 0 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                This action cannot be undone. All lecturer and trimester assignments will be removed.
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button type="button" className="btn-submit" style={{ background: '#ef4444' }} onClick={handleDeleteCourse}>
                Delete Course
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminCourse;
