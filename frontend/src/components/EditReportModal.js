import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

function EditReportModal({ complaint, onClose, onSaved }) {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    damageType: complaint.damageType || 'Road',
    description: complaint.description || '',
    priority: complaint.priority || 'Medium',
    address: complaint.location?.address || '',
  });
  const [newImages, setNewImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const editsUsed = complaint.editCount || 0;
  const editsRemaining = 2 - editsUsed;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    setPreviewUrls(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('damageType', formData.damageType);
      data.append('description', formData.description);
      data.append('priority', formData.priority);
      data.append('address', formData.address);
      newImages.forEach((img) => data.append('images', img));

      const res = await fetch(
        `http://localhost:5000/api/complaints/${complaint._id}/edit`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: data,
        }
      );

      const result = await res.json();
      if (!res.ok) {
        setError(result.message || 'Failed to update report');
      } else {
        onSaved(result);
        onClose();
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Overlay + modal styles
  const overlay = {
    position: 'fixed', inset: 0, zIndex: 200,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
    animation: 'fadeInOverlay 0.2s ease',
  };

  const modal = {
    background: isDark ? '#1e293b' : '#ffffff',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
    borderRadius: '20px',
    boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '32px',
    animation: 'slideUpModal 0.3s cubic-bezier(0.16,1,0.3,1)',
  };

  const selectStyle = {
    width: '100%', padding: '14px 18px',
    background: isDark ? '#0f172a' : '#f8fafc',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
    borderRadius: '12px',
    color: isDark ? '#fff' : '#0f172a',
    fontSize: '1rem', appearance: 'none', cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  };

  const textareaStyle = {
    ...selectStyle,
    resize: 'vertical', minHeight: '110px',
    lineHeight: 1.6,
  };

  return (
    <>
      <style>{`
        @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpModal { from { opacity: 0; transform: translateY(30px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .edit-modal-input:focus { outline: none; border-color: var(--accent-cyan) !important; box-shadow: 0 0 0 3px rgba(6,182,212,0.2); }
      `}</style>

      <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={modal}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: '0 0 6px 0', fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.6rem', color: isDark ? '#fff' : '#0f172a' }}>
                Edit Report
              </h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                ID: {complaint._id.substring(0, 8)}...
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Edit usage info banner */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px', borderRadius: '12px', marginBottom: '24px',
            background: editsRemaining === 1
              ? 'rgba(245, 158, 11, 0.1)' : 'rgba(6, 182, 212, 0.1)',
            border: `1px solid ${editsRemaining === 1 ? 'rgba(245,158,11,0.3)' : 'rgba(6,182,212,0.3)'}`,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke={editsRemaining === 1 ? 'var(--warning)' : 'var(--accent-cyan)'} strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: editsRemaining === 1 ? 'var(--warning)' : 'var(--accent-cyan)' }}>
              {editsUsed === 0
                ? 'You have 2 edits available for this report.'
                : `Edit ${editsUsed}/2 used — ${editsRemaining} edit remaining.`}
            </span>
          </div>

          {/* Error message */}
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.875rem', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">

            {/* Damage Type + Priority */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Category
                </label>
                <div style={{ position: 'relative' }}>
                  <select name="damageType" value={formData.damageType} onChange={handleChange} style={selectStyle} className="edit-modal-input">
                    <option value="Road">Road / Pothole</option>
                    <option value="Bridge">Bridge</option>
                    <option value="Streetlight">Streetlight</option>
                    <option value="Building">Public Building</option>
                    <option value="Other">Other</option>
                  </select>
                  <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Severity
                </label>
                <div style={{ position: 'relative' }}>
                  <select name="priority" value={formData.priority} onChange={handleChange} style={selectStyle} className="edit-modal-input">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                  <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Description
              </label>
              <textarea
                name="description" value={formData.description}
                onChange={handleChange} required
                className="edit-modal-input"
                style={textareaStyle}
                placeholder="Describe the damage in detail..."
              />
            </div>

            {/* Address */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Location Address
              </label>
              <input
                type="text" name="address" value={formData.address}
                onChange={handleChange}
                className="edit-modal-input"
                style={selectStyle}
                placeholder="E.g., Intersection of Main St & 4th Ave"
              />
            </div>

            {/* Image upload */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Replace Photos (optional)
              </label>
              <div style={{ border: `2px dashed ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`, borderRadius: '12px', padding: '20px', textAlign: 'center', background: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.03)' }}>
                <input type="file" multiple accept="image/*" onChange={handleImageChange} id="edit-file-upload" style={{ display: 'none' }} />
                <label htmlFor="edit-file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span style={{ fontSize: '0.9rem', color: isDark ? 'white' : '#0f172a', fontWeight: 500 }}>Click to upload new photos</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Uploading new images will replace existing ones</span>
                </label>
              </div>
              {previewUrls.length > 0 && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '14px', flexWrap: 'wrap' }}>
                  {previewUrls.map((url, i) => (
                    <img key={i} src={url} alt="New preview" style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--accent-cyan)' }} />
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}` }}>
              <button type="button" onClick={onClose} className="btn btn-secondary" style={{ padding: '10px 22px', fontSize: '0.9rem' }}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '10px 28px', fontSize: '0.9rem' }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                    </svg>
                    Save Changes
                  </span>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}

export default EditReportModal;
