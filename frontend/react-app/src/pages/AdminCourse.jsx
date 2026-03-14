import React, { useState, useEffect } from 'react';
import {
  BookOpen, Plus, School, CalendarDays,
  ChevronRight, ChevronDown, Trash2, Edit, X, Layers
} from 'lucide-react';
import './AdminCourse.css';

const COURSE_API   = '/api/courses';
const SEMESTER_API = '/api/semesters';
const CLASS_API    = '/api/classes';

function AdminCourse() {
  const token = localStorage.getItem('token');
  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // ── Data ──────────────────────────────────────────
  const [courses,   setCourses]   = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [classes,   setClasses]   = useState([]);   // all classes (flat)

  // ── Expanded rows ──────────────────────────────────
  const [expandedCourseId, setExpandedCourseId] = useState(null);

  // ── Modals ─────────────────────────────────────────
  const [modal, setModal] = useState(null);
  // 'createCourse' | 'editCourse' | 'createClass' | 'editClass' | 'assignLecturer'

  // ── Forms ──────────────────────────────────────────
  const [courseForm,   setCourseForm]   = useState({ courseCode: '', courseName: '' });
  const [classForm,    setClassForm]    = useState({ classCode: '', courseId: '', semesterId: '' });
  const [lecturers,    setLecturers]    = useState([]);
  const [editTarget,   setEditTarget]   = useState(null); // course or class being edited
  const [assignTarget, setAssignTarget] = useState(null); // class being assigned
  const [selectedLecturerId, setSelectedLecturerId] = useState('');

  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  // ── Init ──────────────────────────────────────────
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, sRes, clRes, lRes] = await Promise.all([
        fetch(COURSE_API,   { headers: h }),
        fetch(SEMESTER_API, { headers: h }),
        fetch(`${CLASS_API}?size=999`, { headers: h }),
        fetch('/api/admin/users?roleCode=LECTURER&page=0&size=999', { headers: h }),
      ]);
      const [cd, sd, cld, ld] = await Promise.all([
        cRes.json(), sRes.json(), clRes.json(), lRes.json()
      ]);
      setCourses(cd.data   || []);
      setSemesters(sd.data || []);
      setClasses(cld.data?.content || []);
      const lecData = ld.data;
      setLecturers(lecData?.content || (Array.isArray(lecData) ? lecData : []));
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ────────────────────────────────────────
  const classesOf = (courseId) =>
    classes.filter(cl => cl.courseId === courseId);

  // ── Course CRUD ────────────────────────────────────
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch(COURSE_API, {
      method: 'POST',
      headers: h,
      body: JSON.stringify({
        courseCode: courseForm.courseCode.toUpperCase().trim(),
        courseName: courseForm.courseName.trim(),
      }),
    });
    if (!res.ok) { const d = await res.json(); setError(d.message || 'Error'); return; }
    setCourseForm({ courseCode: '', courseName: '' });
    setModal(null);
    fetchAll();
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`${COURSE_API}/${editTarget.courseId}`, {
      method: 'PUT',
      headers: h,
      body: JSON.stringify({
        courseCode: courseForm.courseCode.toUpperCase().trim(),
        courseName: courseForm.courseName.trim(),
      }),
    });
    if (!res.ok) { const d = await res.json(); setError(d.message || 'Error'); return; }
    setModal(null);
    fetchAll();
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Delete this course?')) return;
    const res = await fetch(`${COURSE_API}/${courseId}`, { method: 'DELETE', headers: h });
    if (!res.ok) { const d = await res.json(); alert(d.message || 'Error'); return; }
    fetchAll();
  };

  // ── Class CRUD ─────────────────────────────────────
  const handleCreateClass = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch(CLASS_API, {
      method: 'POST',
      headers: h,
      body: JSON.stringify({
        classCode:  classForm.classCode.trim().toUpperCase(),
        courseId:   Number(classForm.courseId),
        semesterId: Number(classForm.semesterId),
      }),
    });
    if (!res.ok) { const d = await res.json(); setError(d.message || 'Error'); return; }
    setModal(null);
    fetchAll();
  };

  const openCreateClass = (course) => {
    setClassForm({ classCode: '', courseId: String(course.courseId), semesterId: '' });
    setError('');
    setModal('createClass');
  };

  const openEditClass = (cl) => {
    setEditTarget(cl);
    setClassForm({
      classCode:  cl.classCode,
      courseId:   String(cl.courseId || ''),
      semesterId: String(cl.semesterId || ''),
    });
    setError('');
    setModal('editClass');
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`${CLASS_API}/${editTarget.classId}`, {
      method: 'PUT',
      headers: h,
      body: JSON.stringify({
        classCode:  classForm.classCode.trim().toUpperCase(),
        courseId:   classForm.courseId   ? Number(classForm.courseId)   : null,
        semesterId: classForm.semesterId ? Number(classForm.semesterId) : null,
      }),
    });
    if (!res.ok) { const d = await res.json(); setError(d.message || 'Error'); return; }
    setModal(null);
    fetchAll();
  };

  const openAssignLecturer = (cl) => {
    setAssignTarget(cl);
    setSelectedLecturerId(cl.lecturerId ? String(cl.lecturerId) : '');
    setError('');
    setModal('assignLecturer');
  };

  const handleAssignLecturer = async (e) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`${CLASS_API}/${assignTarget.classId}/lecturer`, {
      method: 'PUT',
      headers: h,
      body: JSON.stringify({ lecturerId: selectedLecturerId ? Number(selectedLecturerId) : null }),
    });
    if (!res.ok) { const d = await res.json(); setError(d.message || 'Error'); return; }
    setModal(null);
    fetchAll();
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Delete this class? All associated groups will also be affected.')) return;
    const res = await fetch(`${CLASS_API}/${classId}`, { method: 'DELETE', headers: h });
    if (!res.ok) { const d = await res.json(); alert(d.message || 'Error deleting class'); return; }
    fetchAll();
  };

  const openEditCourse = (course) => {
    setEditTarget(course);
    setCourseForm({ courseCode: course.courseCode, courseName: course.courseName });
    setError('');
    setModal('editCourse');
  };

  const closeModal = () => { setModal(null); setError(''); };

  // ── Render ─────────────────────────────────────────
  return (
    <div className="ac-page">

      {/* ── PAGE HEADER ── */}
      <div className="ac-header">
        <div className="ac-header-left">
          <h1><BookOpen size={22} /> Course &amp; Class Management</h1>
          <p>Manage courses and their associated classes for each semester</p>
        </div>
        <div className="ac-header-actions">
          <button className="ac-btn ac-btn-outline"
            onClick={() => { setClassForm({ classCode: '', courseId: '', semesterId: '' }); setError(''); setModal('createClass'); }}>
            <School size={15} /> New Class
          </button>
          <button className="ac-btn ac-btn-primary"
            onClick={() => { setCourseForm({ courseCode: '', courseName: '' }); setError(''); setModal('createCourse'); }}>
            <Plus size={15} /> New Course
          </button>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="ac-stats">
        <div className="ac-stat"><span className="ac-stat-val">{courses.length}</span><span>Courses</span></div>
        <div className="ac-stat"><span className="ac-stat-val">{semesters.length}</span><span>Semesters</span></div>
        <div className="ac-stat"><span className="ac-stat-val">{classes.length}</span><span>Classes</span></div>
      </div>

      {/* ── COURSE TABLE with expandable classes ── */}
      <div className="ac-table-wrap">
        <div className="ac-table-head-bar">
          <span className="ac-table-title"><Layers size={16} /> All Courses</span>
        </div>

        {loading ? (
          <div className="ac-loading">Loading…</div>
        ) : courses.length === 0 ? (
          <div className="ac-empty">
            <div className="ac-empty-icon">📚</div>
            <p>No courses yet</p>
            <span>Click "New Course" to get started.</span>
          </div>
        ) : (
          <table className="ac-table">
            <thead>
              <tr>
                <th style={{ width: 32 }} />
                <th>Code</th>
                <th>Course Name</th>
                <th>Classes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                const expanded = expandedCourseId === course.courseId;
                const cls = classesOf(course.courseId);
                return (
                  <React.Fragment key={course.courseId}>
                    {/* Course row */}
                    <tr
                      className={`ac-course-row ${expanded ? 'ac-course-row--active' : ''}`}
                      onClick={() => setExpandedCourseId(expanded ? null : course.courseId)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <span className="ac-chevron">
                          {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                        </span>
                      </td>
                      <td><span className="ac-code-badge">{course.courseCode}</span></td>
                      <td className="ac-course-name">{course.courseName}</td>
                      <td>
                        <span className="ac-class-count">{cls.length} class{cls.length !== 1 ? 'es' : ''}</span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="ac-actions">
                          <button className="ac-action-btn ac-action-add"
                            title="Add Class"
                            onClick={() => openCreateClass(course)}>
                            <Plus size={13} /> Class
                          </button>
                          <button className="ac-action-btn ac-action-edit"
                            title="Edit Course"
                            onClick={() => openEditCourse(course)}>
                            <Edit size={13} />
                          </button>
                          <button className="ac-action-btn ac-action-del"
                            title="Delete Course"
                            onClick={() => handleDeleteCourse(course.courseId)}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded: class list */}
                    {expanded && (
                      <tr className="ac-expand-row">
                        <td colSpan={5} style={{ padding: 0 }}>
                          <div className="ac-class-panel">
                            <div className="ac-class-panel-header">
                              <CalendarDays size={14} />
                              Classes in <strong>{course.courseCode}</strong>
                            </div>
                            {cls.length === 0 ? (
                              <div className="ac-class-empty">
                                No classes yet —
                                <button className="ac-link-btn" onClick={() => openCreateClass(course)}>
                                  Add one now
                                </button>
                              </div>
                            ) : (
                              <div className="ac-class-grid">
                                {cls.map((cl) => (
                                  <div key={cl.classId} className="ac-class-card">
                                    <div className="ac-class-card-code">{cl.classCode}</div>
                                    <div className="ac-class-card-sem">{cl.semesterCode}</div>
                                    <button
                                      className="ac-class-del-btn"
                                      title="Delete class"
                                      onClick={() => handleDeleteClass(cl.classId)}
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Semesters section ── */}
      <div className="ac-sem-section">
        <div className="ac-table-head-bar">
          <span className="ac-table-title"><CalendarDays size={16} /> Semesters</span>
        </div>
        <div className="ac-sem-grid">
          {semesters.map((s) => (
            <div key={s.semesterId} className="ac-sem-card">
              <div className="ac-sem-code">{s.semesterCode}</div>
              <div className="ac-sem-name">{s.semesterName}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════ MODALS ════════════ */}

      {/* Create Course */}
      {modal === 'createCourse' && (
        <div className="ac-overlay" onClick={closeModal}>
          <div className="ac-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ac-modal-head">
              <h3><BookOpen size={18} /> New Course</h3>
              <button className="ac-modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateCourse}>
              <div className="ac-modal-body">
                <div className="ac-fg">
                  <label>Course Code *</label>
                  <input placeholder="e.g. SWP391" value={courseForm.courseCode}
                    onChange={(e) => setCourseForm({ ...courseForm, courseCode: e.target.value })} required />
                </div>
                <div className="ac-fg">
                  <label>Course Name *</label>
                  <input placeholder="e.g. Software Project Management" value={courseForm.courseName}
                    onChange={(e) => setCourseForm({ ...courseForm, courseName: e.target.value })} required />
                </div>
                {error && <div className="ac-error">⚠️ {error}</div>}
              </div>
              <div className="ac-modal-foot">
                <button type="button" className="ac-btn ac-btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="ac-btn ac-btn-primary">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course */}
      {modal === 'editCourse' && editTarget && (
        <div className="ac-overlay" onClick={closeModal}>
          <div className="ac-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ac-modal-head">
              <h3><Edit size={18} /> Edit Course</h3>
              <button className="ac-modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleEditCourse}>
              <div className="ac-modal-body">
                <div className="ac-fg">
                  <label>Course Code *</label>
                  <input value={courseForm.courseCode}
                    onChange={(e) => setCourseForm({ ...courseForm, courseCode: e.target.value })} required />
                </div>
                <div className="ac-fg">
                  <label>Course Name *</label>
                  <input value={courseForm.courseName}
                    onChange={(e) => setCourseForm({ ...courseForm, courseName: e.target.value })} required />
                </div>
                {error && <div className="ac-error">⚠️ {error}</div>}
              </div>
              <div className="ac-modal-foot">
                <button type="button" className="ac-btn ac-btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="ac-btn ac-btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Class */}
      {modal === 'createClass' && (
        <div className="ac-overlay" onClick={closeModal}>
          <div className="ac-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ac-modal-head">
              <h3><School size={18} /> New Class</h3>
              <button className="ac-modal-close" onClick={closeModal}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateClass}>
              <div className="ac-modal-body">
                <div className="ac-fg">
                  <label>Class Code *</label>
                  <input placeholder="e.g. SE1901" value={classForm.classCode}
                    onChange={(e) => setClassForm({ ...classForm, classCode: e.target.value })} required />
                </div>
                <div className="ac-fg">
                  <label>Course *</label>
                  <select value={classForm.courseId}
                    onChange={(e) => setClassForm({ ...classForm, courseId: e.target.value })} required>
                    <option value="">-- Select Course --</option>
                    {courses.map((c) => (
                      <option key={c.courseId} value={c.courseId}>
                        {c.courseCode} — {c.courseName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="ac-fg">
                  <label>Semester *</label>
                  <select value={classForm.semesterId}
                    onChange={(e) => setClassForm({ ...classForm, semesterId: e.target.value })} required>
                    <option value="">-- Select Semester --</option>
                    {semesters.map((s) => (
                      <option key={s.semesterId} value={s.semesterId}>
                        {s.semesterCode} — {s.semesterName}
                      </option>
                    ))}
                  </select>
                </div>
                {error && <div className="ac-error">⚠️ {error}</div>}
              </div>
              <div className="ac-modal-foot">
                <button type="button" className="ac-btn ac-btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="ac-btn ac-btn-primary">Create Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminCourse;
