import React, { useState } from 'react';
import { 
  CalendarRange, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Power,
  CalendarDays
} from 'lucide-react';
import './AdminShared.css'; // Reusable styles

// --- MOCK DATA ---
const INITIAL_SEMESTERS = [
  { id: '1', name: 'Spring 2026', startDate: '2026-01-10', endDate: '2026-04-30', isActive: true },
  { id: '2', name: 'Summer 2026', startDate: '2026-05-10', endDate: '2026-08-30', isActive: false },
  { id: '3', name: 'Fall 2026', startDate: '2026-09-10', endDate: '2026-12-30', isActive: false },
];
// -----------------

function AdminSemester() {
  const [semesters, setSemesters] = useState(INITIAL_SEMESTERS);
  
  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // States
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [formData, setFormData] = useState({ name: '', startDate: '', endDate: '' });

  // Handlers
  const handleOpenCreate = () => {
    setSelectedSemester(null);
    setFormData({ name: '', startDate: '', endDate: '' });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (semester) => {
    setSelectedSemester(semester);
    setFormData({ name: semester.name, startDate: semester.startDate, endDate: semester.endDate });
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate) return;

    if (selectedSemester) {
      // Edit
      setSemesters(semesters.map(s => 
        s.id === selectedSemester.id ? { ...s, ...formData } : s
      ));
    } else {
      // Create
      const newSemester = {
        id: Date.now().toString(),
        isActive: false,
        ...formData
      };
      setSemesters([...semesters, newSemester]);
    }
    setIsFormModalOpen(false);
  };

  const toggleActiveStatus = (id) => {
    setSemesters(semesters.map(s => ({
      ...s,
      isActive: s.id === id // Only the selected one becomes active, others false
    })));
  };

  const handleOpenDelete = (semester) => {
    setSelectedSemester(semester);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setSemesters(semesters.filter(s => s.id !== selectedSemester.id));
    setIsDeleteModalOpen(false);
    setSelectedSemester(null);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="admin-page-layout">
      {/* HEADER */}
      <div className="admin-header">
        <h2 className="admin-title">
          <CalendarRange className="admin-title-icon" size={28} />
          Trimester / Semester Management
        </h2>
        <button className="admin-btn-primary" onClick={handleOpenCreate}>
          <Plus size={20} />
          Create Trimester
        </button>
      </div>

      {/* TABLE */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Trimester Name</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {semesters.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>No trimesters found.</td>
              </tr>
            ) : (
              semesters.map(semester => (
                <tr key={semester.id}>
                  <td>
                    <div className="row-title">{semester.name}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                      <CalendarDays size={14} />
                      {formatDate(semester.startDate)} - {formatDate(semester.endDate)}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${semester.isActive ? 'active' : 'inactive'}`}>
                      {semester.isActive ? 'Current Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-group">
                      <button 
                        className="action-btn-sm edit"
                        onClick={() => handleOpenEdit(semester)}
                        title="Edit Trimester"
                      >
                        <Edit size={16} />
                      </button>
                      
                      {!semester.isActive && (
                        <button 
                          className="action-btn-sm success"
                          onClick={() => toggleActiveStatus(semester.id)}
                          title="Set as Active Trimester"
                        >
                          <Power size={16} /> Activate
                        </button>
                      )}

                      <button 
                        className="action-btn-sm delete"
                        onClick={() => handleOpenDelete(semester)}
                        title="Delete Trimester"
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
                <h3>{selectedSemester ? <><Edit size={20}/> Edit Trimester</> : <><Plus size={20}/> Create Trimester</>}</h3>
                <button type="button" className="close-btn" onClick={() => setIsFormModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="name">Trimester Name</label>
                  <input 
                    type="text" 
                    id="name"
                    className="form-input" 
                    placeholder="e.g. Spring 2026" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="startDate">Start Date</label>
                    <input 
                      type="date" 
                      id="startDate"
                      className="form-input" 
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="endDate">End Date</label>
                    <input 
                      type="date" 
                      id="endDate"
                      className="form-input" 
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsFormModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Save Trimester</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && selectedSemester && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header" style={{ borderBottomColor: 'rgba(239, 68, 68, 0.2)' }}>
              <h3 style={{ color: '#ef4444' }}><Trash2 size={20} /> Confirm Deletion</h3>
              <button type="button" className="close-btn" onClick={() => setIsDeleteModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: 'var(--text-primary)' }}>
                Are you sure you want to delete the trimester <strong>{selectedSemester.name}</strong>?
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

export default AdminSemester;
