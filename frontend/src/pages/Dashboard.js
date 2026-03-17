import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import EditReportModal from '../components/EditReportModal';

function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null); // complaint being edited
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user) { navigate('/login'); return; }
    if (user.role === 'Admin') { navigate('/admin'); return; }

    fetchComplaints(token);
  }, [navigate]);

  const fetchComplaints = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/complaints', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setComplaints(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Called when a report is saved via the modal
  const handleReportSaved = (updated) => {
    setComplaints(prev => prev.map(c => c._id === updated._id ? updated : c));
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Submitted': return 'badge-submitted';
      case 'Under Review': return 'badge-review';
      case 'Assigned': return 'badge-assigned';
      case 'In Progress': return 'badge-progress';
      case 'Resolved': return 'badge-resolved';
      default: return 'badge-submitted';
    }
  };

  // Returns edit eligibility info for a complaint
  const getEditInfo = (comp) => {
    const editableStatuses = ['Submitted', 'Under Review'];
    const statusOk = editableStatuses.includes(comp.status);
    const editsUsed = comp.editCount || 0;
    const editsLeft = 2 - editsUsed;
    const canEdit = statusOk && editsLeft > 0;
    return { canEdit, editsUsed, editsLeft, statusOk };
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar />
      <div className="container animate-fade-in delay-1">
        
        <div className="page-header">
           <div>
              <h1 className="page-title">My Reports</h1>
              <p className="page-subtitle">Track the status of the infrastructure damages you've reported.</p>
           </div>
           <button className="btn btn-primary" onClick={() => navigate('/report')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              New Report
           </button>
        </div>

        {/* Professional Hero Banner */}
        <div className="glass-panel animate-fade-in delay-2" style={{ 
          padding: 0, 
          marginBottom: '40px', 
          minHeight: '240px', 
          display: 'flex', 
          alignItems: 'center',
          background: 'linear-gradient(to right, #1e293b, rgba(30, 41, 59, 0.8))',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ padding: '40px', maxWidth: '600px', zIndex: 1 }}>
            <span style={{ 
              display: 'inline-block', padding: '6px 12px', background: 'rgba(59, 130, 246, 0.2)', 
              color: '#60a5fa', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, 
              letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>Citizen Dashboard</span>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--text-primary)', marginBottom: '12px', lineHeight: 1.2 }}>Empowering you to rebuild our community.</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, margin: 0 }}>
              Your reported incidents directly notify city engineering teams to rapidly repair roads, bridges, and public utilities.
            </p>
          </div>
        </div>
        
        {loading ? (
           <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
              Loading reports...
           </div>
        ) : complaints.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
            </div>
            <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: '8px' }}>No reports yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px auto' }}>You haven't reported any infrastructure damage yet. Help your community by reporting an issue.</p>
            <button className="btn btn-primary" onClick={() => navigate('/report')}>Start a Report</button>
          </div>
        ) : (
          <div className="grid-cards">
            {complaints.map((comp, i) => {
              const { canEdit, editsUsed, editsLeft, statusOk } = getEditInfo(comp);
              return (
                <div key={comp._id} className={`glass-panel animate-fade-in`} style={{ animationDelay: `${i * 0.1}s`, padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: 'var(--text-primary)' }}>{comp.damageType}</h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {comp._id.substring(0, 8)}...</div>
                    </div>
                    <span className={`badge ${getStatusClass(comp.status)}`}>{comp.status}</span>
                  </div>
                  
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.95rem', lineHeight: '1.5', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', display: '-webkit-box', overflow: 'hidden' }}>
                    {comp.description}
                  </p>
                  
                  <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '0.85rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      <span style={{ color: 'var(--text-primary)' }}>{comp.location?.address || 'GPS Coordinates Provided'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      <span style={{ color: 'var(--text-secondary)' }}>{new Date(comp.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Progress Timeline */}
                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', padding: '0 10px' }}>
                      <div style={{ position: 'absolute', top: '50%', left: '16px', right: '16px', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0, transform: 'translateY(-50%)' }}></div>
                      <div style={{ 
                         position: 'absolute', top: '50%', left: '16px', height: '2px', 
                         background: 'var(--accent-cyan)', zIndex: 0, transform: 'translateY(-50%)', transition: 'width 0.5s ease',
                         width: `${(['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'].indexOf(comp.status) / 4) * 100}%`,
                         maxWidth: 'calc(100% - 32px)'
                      }}></div>

                      {['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'].map((step, stepIdx) => {
                        const statuses = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];
                        const currentIndex = statuses.indexOf(comp.status);
                        const isCompleted = stepIdx <= currentIndex;
                        const isActive = stepIdx === currentIndex;
                        return (
                          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '8px' }}>
                            <div style={{ 
                              width: isActive ? '20px' : '16px', 
                              height: isActive ? '20px' : '16px', 
                              borderRadius: '50%', 
                              background: isCompleted ? 'var(--accent-cyan)' : 'var(--bg-surface)',
                              border: `2.5px solid ${isCompleted ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.2)'}`,
                              boxShadow: isActive ? '0 0 12px var(--accent-cyan)' : 'none',
                              transition: 'all 0.3s ease'
                            }}>
                              {isCompleted && !isActive && <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" style={{ display: 'block', padding: '2px' }}><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                       <span style={{ color: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'].indexOf(comp.status) >= 0 ? 'var(--text-primary)' : '' }}>Sent</span>
                       <span style={{ color: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'].indexOf(comp.status) >= 1 ? 'var(--text-primary)' : '' }}>Review</span>
                       <span style={{ color: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'].indexOf(comp.status) >= 2 ? 'var(--text-primary)' : '' }}>Assign</span>
                       <span style={{ color: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'].indexOf(comp.status) >= 3 ? 'var(--text-primary)' : '', textAlign: 'center' }}>Fixing</span>
                       <span style={{ color: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'].indexOf(comp.status) >= 4 ? 'var(--success)' : '' }}>Done</span>
                    </div>
                  </div>

                  {/* ── Edit Report Button / Status ── */}
                  <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {canEdit ? (
                      <button
                        onClick={() => setEditTarget(comp)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '9px 18px', borderRadius: '10px', cursor: 'pointer',
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.35)',
                          color: '#60a5fa', fontWeight: 600, fontSize: '0.85rem',
                          transition: 'all 0.2s ease',
                          fontFamily: 'Inter, sans-serif',
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit Report
                        <span style={{
                          marginLeft: '4px', padding: '2px 8px', borderRadius: '20px',
                          background: editsLeft === 1 ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)',
                          color: editsLeft === 1 ? 'var(--warning)' : '#93c5fd',
                          fontSize: '0.75rem', fontWeight: 700,
                        }}>
                          {editsLeft}/2 left
                        </span>
                      </button>
                    ) : (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '9px 18px',
                        color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 500,
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        {!statusOk
                          ? 'Editing locked — report is being processed'
                          : 'Edit limit reached (2/2 used)'}
                      </div>
                    )}
                  </div>

                  {/* Attached Images */}
                  {comp.images && comp.images.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                       <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.05em' }}>Attached Evidence</h4>
                       <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                         {comp.images.map((img, idx) => (
                           <div key={idx} style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)', flexShrink: 0 }}>
                             <img src={`http://localhost:5000${img}`} alt="Damage Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                           </div>
                         ))}
                       </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <EditReportModal
          complaint={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleReportSaved}
        />
      )}
    </div>
  );
}

export default Dashboard;
