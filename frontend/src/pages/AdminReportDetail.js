import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function AdminReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchComplaint(token);
  }, [id, navigate]);

  const fetchComplaint = async (token) => {
    try {
      const res = await fetch(`http://localhost:5000/api/complaints/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setComplaint(data);
      } else {
        alert('Failed to load report details.');
        navigate('/admin/reports');
      }
    } catch (err) {
      console.error(err);
      navigate('/admin/reports');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/complaints/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setComplaint({ ...complaint, status: newStatus });
        alert('Status updated successfully');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Submitted': return 'badge-submitted';
      case 'Under Review': return 'badge-review';
      case 'Assigned': return 'badge-assigned';
      case 'In Progress': return 'badge-progress';
      case 'Resolved': return 'badge-resolved';
      default: return 'badge-submitted';
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>Loading report data...</div>
      </div>
    );
  }

  if (!complaint) return null;

  return (
    <div className="app-container">
      <Navbar />
      <div className="container animate-fade-in delay-1" style={{ maxWidth: '900px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/reports')} style={{ padding: '8px 16px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Feed
          </button>
          <h1 className="page-title" style={{ fontSize: '1.8rem' }}>Incident Report Detail</h1>
        </div>

        <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          
          {/* Main Info */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '2rem', fontFamily: 'Outfit', fontWeight: 800, color: 'white', marginBottom: '8px' }}>{complaint.damageType}</h2>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Report ID: {complaint._id}</div>
              </div>
              <span className={`badge ${getStatusClass(complaint.status)}`} style={{ fontSize: '0.9rem', padding: '8px 16px' }}>{complaint.status}</span>
            </div>

            <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', marginBottom: '24px', border: '1px solid var(--glass-border)' }}>
              <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Description provided by Citizen</h4>
              <p style={{ color: 'white', lineHeight: 1.6, fontSize: '1.05rem', margin: 0 }}>
                {complaint.description || "No description provided."}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
               <div>
                 <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>Severity Level</div>
                 <div style={{ fontWeight: 600, color: complaint.priority === 'Critical' ? 'var(--danger)' : complaint.priority === 'High' ? 'var(--warning)' : 'white' }}>{complaint.priority}</div>
               </div>
               <div>
                 <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>Date Filed</div>
                 <div style={{ fontWeight: 500, color: 'white' }}>{new Date(complaint.createdAt).toLocaleString()}</div>
               </div>
               <div>
                 <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>Location</div>
                 <div style={{ fontWeight: 500, color: 'var(--accent-cyan)' }}>{complaint.location?.address || 'GPS Coordinates Available'}</div>
               </div>
            </div>

            <h4 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Attached Evidence</h4>
            {complaint.images && complaint.images.length > 0 ? (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
                 {complaint.images.map((img, idx) => (
                   <a key={idx} href={`http://localhost:5000${img}`} target="_blank" rel="noreferrer" style={{ display: 'block', height: '150px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                     <img src={`http://localhost:5000${img}`} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} onMouseOver={e=>e.currentTarget.style.transform='scale(1.05)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'} />
                   </a>
                 ))}
               </div>
            ) : (
               <div style={{ padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-secondary)' }}>No images attached to this report.</div>
            )}
          </div>

          {/* Action Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontFamily: 'Outfit', fontWeight: 600 }}>Update Status</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Move this incident to the next step in the resolution lifecycle.</p>
              
              <select 
                 className="input-field" 
                 style={{ width: '100%', cursor: 'pointer', appearance: 'auto', marginBottom: '16px' }}
                 value={complaint.status}
                 onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontFamily: 'Outfit', fontWeight: 600 }}>Reporter Details</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
                   {complaint.userId?.name.charAt(0)}
                 </div>
                 <div>
                   <div style={{ fontWeight: 600, color: 'white' }}>{complaint.userId?.name}</div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>Citizen Reporter</div>
                 </div>
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                 <strong>Email:</strong> {complaint.userId?.email}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                 <strong>Mobile:</strong> {complaint.userId?.mobile || 'N/A'}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default AdminReportDetail;
