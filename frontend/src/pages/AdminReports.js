import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';

function AdminReports() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if(!token || !user || user.role !== 'Admin') { navigate('/login'); return; }
    fetchComplaints(token);
  }, [navigate]);

  const fetchComplaints = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/complaints/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setComplaints(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/complaints/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      
      if(res.ok) {
        setComplaints(complaints.map(comp => comp._id === id ? { ...comp, status: newStatus } : comp));
      }
    } catch(err) { console.error(err); alert('Failed to update status'); }
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

  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const pending = total - resolved;

  return (
    <div className="app-container" style={{ minHeight: '100vh', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar />
      <div className="container animate-fade-in delay-1">
        
        <div className="page-header">
           <div>
              <h1 className="page-title">Global Reports Feed</h1>
              <p className="page-subtitle">A central listing of all infrastructure repairs reported city-wide.</p>
           </div>
           <button className="btn btn-secondary" onClick={() => fetchComplaints(localStorage.getItem('token'))}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
              Refresh Data
           </button>
        </div>

        {/* Professional Admin Hero Banner */}
        <div className="glass-panel animate-fade-in delay-2" style={{ 
          padding: 0, 
          marginBottom: '40px', 
          minHeight: '200px', 
          display: 'flex', 
          alignItems: 'center',
          background: 'linear-gradient(to right, rgba(9, 9, 11, 0.95) 0%, rgba(9, 9, 11, 0.5) 100%), url(https://images.unsplash.com/photo-1577908480749-c12e5cb407d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 60%',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ padding: '40px', maxWidth: '600px', zIndex: 1 }}>
            <span style={{ 
              display: 'inline-block', padding: '6px 12px', background: 'rgba(88, 28, 135, 0.2)', 
              color: '#d8b4fe', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, 
              letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px',
              border: '1px solid rgba(88, 28, 135, 0.3)'
            }}>Database Logs</span>
            <h2 style={{ fontSize: '2.2rem', color: 'white', marginBottom: '12px', lineHeight: 1.2 }}>Real-time Audit Trail</h2>
            <p style={{ color: '#e2e8f0', fontSize: '1.05rem', lineHeight: 1.6, margin: 0 }}>
              Review, update, and manage every step of the resolution lifecycle from this single pane of glass.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
           <h2 style={{ fontSize: '1.4rem', fontFamily: 'Outfit', fontWeight: 600 }}>Active Database Feed</h2>
           <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>

             {/* Category Filter */}
             <div style={{ position: 'relative' }}>
               <select 
                  className="input-field" 
                  style={{ padding: '8px 32px 8px 16px', fontSize: '0.9rem', fontWeight: 500, background: 'rgba(255,255,255,0.05)', borderRadius: '8px', appearance: 'none', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', margin: 0, color: 'white' }}
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
               >
                 <option value="All" style={{color: '#000'}}>All Categories</option>
                 <option value="Road" style={{color: '#000'}}>Road / Pothole</option>
                 <option value="Bridge" style={{color: '#000'}}>Bridge</option>
                 <option value="Streetlight" style={{color: '#000'}}>Streetlight</option>
                 <option value="Building" style={{color: '#000'}}>Public Building</option>
                 <option value="Other" style={{color: '#000'}}>Other</option>
               </select>
               <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
               </div>
             </div>

             {/* Status Filter */}
             <div style={{ position: 'relative' }}>
               <select 
                  className="input-field" 
                  style={{ padding: '8px 32px 8px 16px', fontSize: '0.9rem', fontWeight: 500, background: 'rgba(255,255,255,0.05)', borderRadius: '8px', appearance: 'none', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', margin: 0, color: 'white' }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
               >
                 <option value="All" style={{color: '#000'}}>All Statuses</option>
                 <option value="Submitted" style={{color: '#000'}}>Submitted</option>
                 <option value="Under Review" style={{color: '#000'}}>Under Review</option>
                 <option value="Assigned" style={{color: '#000'}}>Assigned</option>
                 <option value="In Progress" style={{color: '#000'}}>In Progress</option>
                 <option value="Resolved" style={{color: '#000'}}>Resolved</option>
               </select>
               <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
               </div>
             </div>

             {/* Clear Filters */}
             {(filterStatus !== 'All' || filterCategory !== 'All') && (
               <button 
                 onClick={() => { setFilterStatus('All'); setFilterCategory('All'); }}
                 style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}
                 onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                 onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
               >
                 ✕ Clear
               </button>
             )}
           </div>
        </div>

        {loading ? (
             <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>Loading system data...</div>
        ) : (
        <div className="premium-table-wrapper animate-fade-in delay-2">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Filing Date</th>
                <th>Category</th>
                <th>Author</th>
                <th>Severity</th>
                <th>Current Status</th>
                <th style={{ textAlign: 'right' }}>Management</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const filteredComplaints = complaints.filter(c =>
                  (filterStatus === 'All' || c.status === filterStatus) &&
                  (filterCategory === 'All' || c.damageType === filterCategory)
                );
                if (complaints.length === 0) {
                  return <tr><td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>No reports currently logged in the system.</td></tr>;
                }
                if (filteredComplaints.length === 0) {
                  return <tr><td colSpan="6" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>No reports match the selected filter.</td></tr>;
                }
                return filteredComplaints.map(comp => (
                  <tr key={comp._id}>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {new Date(comp.createdAt).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, color: 'white' }}>
                         {comp.damageType}
                         {comp.images && comp.images.length > 0 && 
                           <span title="Evidence Attached" style={{display: 'flex', alignItems:'center', justifyContent: 'center', width: '20px', height: '20px', background: 'rgba(59,130,246,0.15)', borderRadius: '4px'}}>
                             <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                           </span>
                         }
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.9rem', color: 'white' }}>{comp.userId?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{comp.userId?.email}</div>
                    </td>
                    <td>
                       <span style={{ 
                           display: 'inline-block', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
                           background: comp.priority === 'Critical' ? 'rgba(239, 68, 68, 0.1)' : 
                                       comp.priority === 'High' ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                           color: comp.priority === 'Critical' ? 'var(--danger)' : 
                                  comp.priority === 'High' ? 'var(--warning)' : 
                                  'var(--text-secondary)' 
                       }}>
                           {comp.priority}
                       </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusClass(comp.status)}`}>{comp.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <div style={{ position: 'relative' }}>
                          <select 
                             className="input-field" 
                             style={{ padding: '6px 28px 6px 12px', fontSize: '0.8rem', fontWeight: 500, background: 'rgba(0,0,0,0.4)', borderRadius: '6px', appearance: 'none', cursor: 'pointer', border: '1px solid var(--glass-border)', margin: 0 }}
                             value={comp.status}
                             onChange={(e) => handleStatusChange(comp._id, e.target.value)}
                          >
                            <option value="Submitted">Submitted</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Assigned">Assigned</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                          <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          </div>
                        </div>
                        <button 
                           onClick={() => navigate(`/admin/reports/${comp._id}`)}
                           style={{ padding: '6px 12px', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', color: 'var(--accent-cyan)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s ease' }}
                           onMouseOver={e => { e.currentTarget.style.background = 'var(--accent-cyan)'; e.currentTarget.style.color = 'white'; }}
                           onMouseOut={e => { e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)'; e.currentTarget.style.color = 'var(--accent-cyan)'; }}
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}

export default AdminReports;
