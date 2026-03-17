import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';
import AnimatedBackground from '../components/AnimatedBackground';

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
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
              <h1 className="page-title">Admin Command Center</h1>
              <p className="page-subtitle">Welcome to the municipal infrastructure management portal.</p>
           </div>
        </div>

        {/* Introduction Section */}
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
          <div style={{ padding: '40px', maxWidth: '800px', zIndex: 1 }}>
            <span style={{ 
              display: 'inline-block', padding: '6px 12px', background: 'rgba(139, 92, 246, 0.2)', 
              color: '#c4b5fd', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, 
              letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '16px',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}>Your Role Explained</span>
            <h2 style={{ fontSize: '2.4rem', color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.2 }}>Overseeing City Recovery</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, margin: 0 }}>
              As a <strong>Smart Infra Administrator</strong>, you are the critical bridge between citizens reporting damage and the engineering teams executing the repairs. Your primary responsibilities are to review incoming reports, assess severity, assign them to the correct municipal departments, and track them through to resolution.
            </p>
          </div>
        </div>

        <div className="grid-2" style={{ gap: '24px', marginBottom: '40px' }}>
            <div className="glass-panel animate-fade-in delay-3" style={{ padding: '32px' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                </div>
                <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: '12px', fontFamily: 'Outfit' }}>1. Advanced Analytics</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '20px' }}>
                   Access real-time visual dashboards detailing the breakdown of report categories and pipeline bottlenecks. Use this bird's-eye view to allocate engineering budgets proactively and identify infrastructure hot-spots across the city.
                </p>
                <button className="btn btn-secondary" onClick={() => navigate('/admin/analytics')} style={{ width: '100%' }}>View Analytics Demo</button>
            </div>

            <div className="glass-panel animate-fade-in delay-4" style={{ padding: '32px' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                </div>
                <h3 style={{ fontSize: '1.4rem', color: 'white', marginBottom: '12px', fontFamily: 'Outfit' }}>2. Live Database Feed</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '20px' }}>
                   This is your operational workspace. Review the raw data stream of citizen reports, complete with attached photographic evidence and severity flags. Update status markers to keep the public informed in real-time.
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/admin/reports')} style={{ width: '100%' }}>Manage Active Feed</button>
            </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
