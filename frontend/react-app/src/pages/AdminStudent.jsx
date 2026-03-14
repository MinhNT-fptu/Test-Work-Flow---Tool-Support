import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Trash2, 
  X,
  BookOpen,
  Mail,
  Fingerprint,
  Eye
} from 'lucide-react';
import './AdminShared.css'; // Reusable styles

// --- MOCK DATA ---
const MOCK_COURSES = [
  { id: 'c1', code: 'SWP391', name: 'Software Development Project' },
  { id: 'c2', code: 'PRN211', name: 'Basic Cross-Platform Application Programming' },
  { id: 'c3', code: 'PRB301', name: 'Probability and Statistics' },
  { id: 'c4', code: 'DBI202', name: 'Database Systems' },
];

const INITIAL_STUDENTS = [
  { id: 's1', rollNumber: 'HE160001', name: 'Alice Smith', email: 'alicesmith@fpt.edu.vn', phone: '0987654321', dob: '2004-05-12', address: 'Hanoi, Vietnam', assignedCourses: ['c1', 'c2'] },
  { id: 's2', rollNumber: 'HE160002', name: 'Bob Johnson', email: 'bobjohnson@fpt.edu.vn', phone: '0912345678', dob: '2003-11-23', address: 'Ho Chi Minh City, Vietnam', assignedCourses: ['c1'] },
  { id: 's3', rollNumber: 'HE160003', name: 'Charlie Williams', email: 'charliew@fpt.edu.vn', phone: '', dob: '', address: '', assignedCourses: [] },
];
// -----------------

function AdminStudent() {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  
  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  // States
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', rollNumber: '', phone: '', dob: '', address: '' });
  const [assignedCourseIds, setAssignedCourseIds] = useState([]);

  // Handlers
  const handleOpenCreate = () => {
    setSelectedStudent(null);
    setFormData({ name: '', email: '', rollNumber: '', phone: '', dob: '', address: '' });
    setIsFormModalOpen(true);
  };

  const handleOpenDetails = (student) => {
    setSelectedStudent(student);
    setFormData({ 
      name: student.name, 
      email: student.email, 
      rollNumber: student.rollNumber,
      phone: student.phone || '',
      dob: student.dob || '',
      address: student.address || ''
    });
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.rollNumber) return;

    if (selectedStudent) {
      // Edit
      setStudents(students.map(s => 
        s.id === selectedStudent.id ? { ...s, ...formData } : s
      ));
    } else {
      // Create
      const newStudent = {
        id: Date.now().toString(),
        assignedCourses: [],
        ...formData
      };
      setStudents([...students, newStudent]);
    }
    setIsFormModalOpen(false);
  };

  const handleOpenDelete = (student) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setStudents(students.filter(s => s.id !== selectedStudent.id));
    setIsDeleteModalOpen(false);
    setSelectedStudent(null);
  };

  const handleOpenAssign = (student) => {
    setSelectedStudent(student);
    setAssignedCourseIds([...student.assignedCourses]);
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
    setStudents(students.map(s => 
      s.id === selectedStudent.id ? { ...s, assignedCourses: assignedCourseIds } : s
    ));
    setIsAssignModalOpen(false);
  };

  return (
    <div className="admin-page-layout">
      {/* HEADER */}
      <div className="admin-header">
        <h2 className="admin-title">
          <GraduationCap className="admin-title-icon" size={28} />
          Student Management
        </h2>
        <button className="admin-btn-primary" onClick={handleOpenCreate}>
          <Plus size={20} />
          Add Student
        </button>
      </div>

      {/* TABLE */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Student Profile</th>
              <th>Roll Number</th>
              <th>Enrolled Courses</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>No students found.</td>
              </tr>
            ) : (
              students.map(student => (
                <tr key={student.id}>
                  <td>
                    <div className="row-title">{student.name}</div>
                    <div className="row-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} /> {student.email}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '500' }}>
                      <Fingerprint size={14} />
                      {student.rollNumber}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${student.assignedCourses.length > 0 ? 'active' : 'inactive'}`}>
                      {student.assignedCourses.length} Courses
                    </span>
                  </td>
                  <td>
                    <div className="action-group">
                      <button 
                        className="action-btn-sm assign"
                        onClick={() => handleOpenAssign(student)}
                        title="Enroll in Courses"
                      >
                        <BookOpen size={16} /> Enroll Courses
                      </button>
                      <button 
                        className="action-btn-sm edit"
                        onClick={() => handleOpenDetails(student)}
                        title="View & Edit Details"
                      >
                        <Eye size={16} /> View Details
                      </button>
                      <button 
                        className="action-btn-sm delete"
                        onClick={() => handleOpenDelete(student)}
                        title="Delete Student"
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

      {/* CREATE / DETAILS MODAL */}
      {isFormModalOpen && (
        <div className="modal-overlay" onClick={() => setIsFormModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <form onSubmit={handleSubmitForm}>
              <div className="modal-header">
                <h3>{selectedStudent ? <><Eye size={20}/> Student Details</> : <><Plus size={20}/> Add Student</>}</h3>
                <button type="button" className="close-btn" onClick={() => setIsFormModalOpen(false)}><X size={20} /></button>
              </div>
              <div className="modal-body">
                {/* 2-column layout for student form */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label htmlFor="rollNumber">Roll Number / Student ID *</label>
                    <input 
                      type="text" 
                      id="rollNumber"
                      className="form-input" 
                      placeholder="e.g. HE160000" 
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input 
                      type="text" 
                      id="name"
                      className="form-input" 
                      placeholder="e.g. Alice Smith" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input 
                      type="email" 
                      id="email"
                      className="form-input" 
                      placeholder="e.g. alicesmith@fpt.edu.vn" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone"
                      className="form-input" 
                      placeholder="e.g. 0987654321" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="dob">Date of Birth</label>
                    <input 
                      type="date" 
                      id="dob"
                      className="form-input" 
                      value={formData.dob}
                      onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input 
                      type="text" 
                      id="address"
                      className="form-input" 
                      placeholder="e.g. Hanoi, Vietnam" 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsFormModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN COURSE MODAL */}
      {isAssignModalOpen && selectedStudent && (
        <div className="modal-overlay" onClick={() => setIsAssignModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <form onSubmit={submitAssign}>
              <div className="modal-header">
                <h3><BookOpen size={20}/> Course Enrollment</h3>
                <button type="button" className="close-btn" onClick={() => setIsAssignModalOpen(false)}><X size={20} /></button>
              </div>
              <div className="modal-body">
                <p style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  Select courses to enroll <strong>{selectedStudent.name}</strong> ({selectedStudent.rollNumber}):
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
                <button type="submit" className="btn-submit">Save Enrollment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && selectedStudent && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header" style={{ borderBottomColor: 'rgba(239, 68, 68, 0.2)' }}>
              <h3 style={{ color: '#ef4444' }}><Trash2 size={20} /> Confirm Deletion</h3>
              <button type="button" className="close-btn" onClick={() => setIsDeleteModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: 'var(--text-primary)' }}>
                Are you sure you want to delete student <strong>{selectedStudent.name}</strong> ({selectedStudent.rollNumber})?
              </p>
              <p style={{ margin: '10px 0 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                This will also remove all their course enrollments.
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

export default AdminStudent;
