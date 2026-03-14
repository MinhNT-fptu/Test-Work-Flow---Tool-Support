import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  BookOpen,
  Mail,
  Building2
} from 'lucide-react';
import './AdminShared.css'; // Reusable styles

// --- MOCK DATA ---
const MOCK_COURSES = [
  { id: 'c1', code: 'SWP391', name: 'Software Development Project' },
  { id: 'c2', code: 'PRN211', name: 'Basic Cross-Platform Application Programming' },
  { id: 'c3', code: 'PRB301', name: 'Probability and Statistics' },
  { id: 'c4', code: 'DBI202', name: 'Database Systems' },
];

const INITIAL_LECTURERS = [
  { id: 'l1', name: 'Dr. John Doe', email: 'john@university.edu', department: 'Software Engineering', assignedCourses: ['c1', 'c2'] },
  { id: 'l2', name: 'Prof. Jane Smith', email: 'jane@university.edu', department: 'Computer Science', assignedCourses: [] },
  { id: 'l3', name: 'Dr. Alan Turing', email: 'alan@university.edu', department: 'Mathematics', assignedCourses: ['c3'] },
];
// -----------------

function AdminLecturer() {
  const [lecturers, setLecturers] = useState(INITIAL_LECTURERS);
  
  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  // States
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', department: '' });
  const [assignedCourseIds, setAssignedCourseIds] = useState([]);

  // Handlers
  const handleOpenCreate = () => {
    setSelectedLecturer(null);
    setFormData({ name: '', email: '', department: '' });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (lecturer) => {
    setSelectedLecturer(lecturer);
    setFormData({ name: lecturer.name, email: lecturer.email, department: lecturer.department });
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    if (selectedLecturer) {
      // Edit
      setLecturers(lecturers.map(l => 
        l.id === selectedLecturer.id ? { ...l, ...formData } : l
      ));
    } else {
      // Create
      const newLecturer = {
        id: Date.now().toString(),
        assignedCourses: [],
        ...formData
      };
      setLecturers([...lecturers, newLecturer]);
    }
    setIsFormModalOpen(false);
  };

  const handleOpenDelete = (lecturer) => {
    setSelectedLecturer(lecturer);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setLecturers(lecturers.filter(l => l.id !== selectedLecturer.id));
    setIsDeleteModalOpen(false);
    setSelectedLecturer(null);
  };

  const handleOpenAssign = (lecturer) => {
    setSelectedLecturer(lecturer);
    setAssignedCourseIds([...lecturer.assignedCourses]);
    setIsAssignModalOpen(true);
  };

  const toggleCourseAssignment = (courseId) => {
    if (assignedCourseIds.includes(courseId)) {
      setAssignedCourseIds(assignedCourseIds.filter(id => id !== courseId));
    } else {
      setAssignedCourseIds([...assignedCourseIds, courseId]);
    }
  };

  const submitAssign = (e) => {
    e.preventDefault();
    setLecturers(lecturers.map(l => 
      l.id === selectedLecturer.id ? { ...l, assignedCourses: assignedCourseIds } : l
    ));
    setIsAssignModalOpen(false);
  };

  return (
    <div className="admin-page-layout">
      {/* HEADER */}
      <div className="admin-header">
        <h2 className="admin-title">
          <Briefcase className="admin-title-icon" size={28} />
          Lecturer Management
        </h2>
        <button className="admin-btn-primary" onClick={handleOpenCreate}>
          <Plus size={20} />
          Add Lecturer
        </button>
      </div>

      {/* TABLE */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Lecturer Profile</th>
              <th>Department</th>
              <th>Assigned Courses</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lecturers.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>No lecturers found.</td>
              </tr>
            ) : (
              lecturers.map(lecturer => (
                <tr key={lecturer.id}>
                  <td>
                    <div className="row-title">{lecturer.name}</div>
                    <div className="row-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} /> {lecturer.email}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <Building2 size={14} />
                      {lecturer.department || 'Not specified'}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${lecturer.assignedCourses.length > 0 ? 'active' : 'inactive'}`}>
                      {lecturer.assignedCourses.length} Courses
                    </span>
                  </td>
                  <td>
                    <div className="action-group">
                      <button 
                        className="action-btn-sm assign"
                        onClick={() => handleOpenAssign(lecturer)}
                        title="Assign Courses to Lecturer"
                      >
                        <BookOpen size={16} /> Assign Courses
                      </button>
                      <button 
                        className="action-btn-sm edit"
                        onClick={() => handleOpenEdit(lecturer)}
                        title="Edit Lecturer"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="action-btn-sm delete"
                        onClick={() => handleOpenDelete(lecturer)}
                        title="Delete Lecturer"
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

      {/* CREATE / EDIT MODAL */}
      {isFormModalOpen && (
        <div className="modal-overlay" onClick={() => setIsFormModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSubmitForm}>
              <div className="modal-header">
                <h3>{selectedLecturer ? <><Edit size={20}/> Edit Lecturer</> : <><Plus size={20}/> Add Lecturer</>}</h3>
                <button type="button" className="close-btn" onClick={() => setIsFormModalOpen(false)}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input 
                    type="text" 
                    id="name"
                    className="form-input" 
                    placeholder="e.g. Dr. John Doe" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email"
                    className="form-input" 
                    placeholder="e.g. email@university.edu" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="department">Department (Optional)</label>
                  <input 
                    type="text" 
                    id="department"
                    className="form-input" 
                    placeholder="e.g. Computer Science" 
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsFormModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Save Lecturer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN COURSE MODAL */}
      {isAssignModalOpen && selectedLecturer && (
        <div className="modal-overlay" onClick={() => setIsAssignModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <form onSubmit={submitAssign}>
              <div className="modal-header">
                <h3><BookOpen size={20}/> Assign Courses to Lecturer</h3>
                <button type="button" className="close-btn" onClick={() => setIsAssignModalOpen(false)}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <p style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Select courses to assign to <strong>{selectedLecturer.name}</strong>:
                </p>
                
                <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)' }}>
                  {MOCK_COURSES.map(course => (
                    <label key={course.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={assignedCourseIds.includes(course.id)}
                        onChange={() => toggleCourseAssignment(course.id)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                      />
                      <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                        <strong>{course.code}</strong> - {course.name}
                      </span>
                    </label>
                  ))}
                  {MOCK_COURSES.length === 0 && <span style={{ color: 'var(--text-tertiary)' }}>No courses available.</span>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Save Assignments</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && selectedLecturer && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header" style={{ borderBottomColor: 'rgba(239, 68, 68, 0.2)' }}>
              <h3 style={{ color: '#ef4444' }}><Trash2 size={20} /> Confirm Deletion</h3>
              <button type="button" className="close-btn" onClick={() => setIsDeleteModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: 'var(--text-primary)' }}>
                Are you sure you want to delete lecturer <strong>{selectedLecturer.name}</strong>?
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button type="button" className="btn-submit" style={{ background: '#ef4444' }} onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminLecturer;
