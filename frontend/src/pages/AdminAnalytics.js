import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AnimatedBackground from '../components/AnimatedBackground';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
  LineChart, Line, Area, AreaChart
} from 'recharts';

const STATUS_COLORS = {
  'Submitted': '#64748b',
  'Under Review': '#f59e0b',
  'Assigned': '#3b82f6',
  'In Progress': '#06b6d4',
  'Resolved': '#10b981'
};

const PRIORITY_COLORS = {
  'Low': '#10b981',
  'Medium': '#f59e0b',
  'High': '#f97316',
  'Critical': '#ef4444'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'rgba(9,9,11,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', backdropFilter: 'blur(20px)' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#fff', fontWeight: 700, fontSize: '1rem', margin: 0 }}>{p.value} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94a3b8' }}>reports</span></p>
        ))}
      </div>
    );
  }
  return null;
};

function KpiCard({ label, value, sub, color, icon, delay }) {
  return (
    <div className={`glass-panel animate-fade-in ${delay}`} style={{ padding: '28px', display: 'flex', gap: '20px', alignItems: 'center', borderLeft: `3px solid ${color}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: color, opacity: 0.05, pointerEvents: 'none' }} />
      <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${color}30` }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', fontWeight: 600 }}>{label}</p>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'white', margin: 0, lineHeight: 1, fontFamily: 'Outfit' }}>{value}</h2>
        {sub && <p style={{ color, fontSize: '0.78rem', marginTop: '6px', fontWeight: 600 }}>{sub}</p>}
      </div>
    </div>
  );
}

function AdminAnalytics() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || !user || user.role !== 'Admin') { navigate('/login'); return; }
    fetchComplaints(token);
  }, [navigate]);

  const fetchComplaints = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/complaints/all', {
        headers: { 'Authorization': `Bearer ${token || localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setComplaints(data);
      setLastUpdated(new Date());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  // Derived metrics
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const critical = complaints.filter(c => c.priority === 'Critical').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const pending = complaints.filter(c => !['Resolved'].includes(c.status)).length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Category data
  const categoryData = [
    { name: 'Road', value: complaints.filter(c => c.damageType === 'Road').length },
    { name: 'Bridge', value: complaints.filter(c => c.damageType === 'Bridge').length },
    { name: 'Streetlight', value: complaints.filter(c => c.damageType === 'Streetlight').length },
    { name: 'Building', value: complaints.filter(c => c.damageType === 'Building').length },
    { name: 'Other', value: complaints.filter(c => c.damageType === 'Other').length },
  ];

  // Status donut data
  const statusData = Object.entries(STATUS_COLORS)
    .map(([name]) => ({ name, value: complaints.filter(c => c.status === name).length }))
    .filter(d => d.value > 0);

  // Priority horizontal bar data
  const priorityData = [
    { name: 'Low', value: complaints.filter(c => c.priority === 'Low').length, fill: '#10b981' },
    { name: 'Medium', value: complaints.filter(c => c.priority === 'Medium').length, fill: '#f59e0b' },
    { name: 'High', value: complaints.filter(c => c.priority === 'High').length, fill: '#f97316' },
    { name: 'Critical', value: complaints.filter(c => c.priority === 'Critical').length, fill: '#ef4444' },
  ];

  // Monthly trend: last 6 months
  const monthlyTrend = (() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months.push({
        name: d.toLocaleString('default', { month: 'short' }),
        value: complaints.filter(c => {
          const cd = new Date(c.createdAt);
          return `${cd.getFullYear()}-${cd.getMonth()}` === key;
        }).length
      });
    }
    return months;
  })();

  // Recent 5 reports for activity feed
  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="app-container" style={{ minHeight: '100vh', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar />
      <div className="container animate-fade-in delay-1" style={{ paddingBottom: '60px' }}>

        {/* ---- Header ---- */}
        <div className="page-header" style={{ marginBottom: '8px' }}>
          <div>
            <h1 className="page-title">Analytics Command Centre</h1>
            <p className="page-subtitle">Real-time intelligence on city-wide infrastructure health.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {lastUpdated && <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Updated {lastUpdated.toLocaleTimeString()}</span>}
            <button className="btn btn-secondary" onClick={() => fetchComplaints()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              Refresh
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/admin/reports')}>
              View All Reports →
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '120px 20px' }}>
            <div style={{ width: '48px', height: '48px', border: '3px solid rgba(6,182,212,0.2)', borderTop: '3px solid var(--accent-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px auto' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading analytics engine...</p>
          </div>
        ) : (
          <>
            {/* ---- 6-Card KPI Row ---- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <KpiCard delay="delay-2" label="Total Reports" value={total} sub="All time submissions" color="#3b82f6"
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>} />
              <KpiCard delay="delay-2" label="Resolved" value={resolved} sub={`${resolutionRate}% resolution rate`} color="#10b981"
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>} />
              <KpiCard delay="delay-3" label="Pending Action" value={pending} sub="Awaiting resolution" color="#f59e0b"
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
              <KpiCard delay="delay-3" label="In Progress" value={inProgress} sub="Actively being fixed" color="#06b6d4"
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>} />
              <KpiCard delay="delay-4" label="Critical Issues" value={critical} sub="Needs immediate action" color="#ef4444"
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>} />
              <KpiCard delay="delay-4" label="Resolution Rate" value={`${resolutionRate}%`} sub={total > 0 ? `${resolved} of ${total} resolved` : 'No data yet'} color="#8b5cf6"
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>} />
            </div>

            {/* ---- Charts Row 1: Bar + Donut ---- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '24px' }}>

              {/* Bar Chart – Incidents by Category */}
              <div className="glass-panel animate-fade-in delay-3" style={{ padding: '28px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, color: 'white', marginBottom: '4px' }}>Incidents by Category</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Volume of reports filed per infrastructure type</p>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={categoryData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} dy={8} />
                    <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} dx={-4} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="url(#barGrad)" radius={[8, 8, 0, 0]} maxBarSize={55} animationDuration={1200} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Donut – Pipeline Status */}
              <div className="glass-panel animate-fade-in delay-4" style={{ padding: '28px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, color: 'white', marginBottom: '4px' }}>Pipeline Status Breakdown</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Current distribution across all lifecycle stages</p>
                </div>
                {statusData.length === 0 ? (
                  <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={statusData} cx="50%" cy="44%" innerRadius={72} outerRadius={108} paddingAngle={5} dataKey="value" stroke="none" cornerRadius={8} animationDuration={1200}>
                        {statusData.map((entry, i) => <Cell key={i} fill={STATUS_COLORS[entry.name]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'rgba(9,9,11,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: 'white', fontWeight: 700 }} />
                      <Legend verticalAlign="bottom" iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'Outfit', paddingTop: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* ---- Charts Row 2: Area Trend + Priority Bars ---- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px', marginBottom: '24px' }}>

              {/* Area Chart – Monthly Trend */}
              <div className="glass-panel animate-fade-in delay-4" style={{ padding: '28px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, color: 'white', marginBottom: '4px' }}>6-Month Submission Trend</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Number of reports submitted each month</p>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={monthlyTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} dy={8} />
                    <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} dx={-4} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ r: 5, fill: '#06b6d4', strokeWidth: 0 }} activeDot={{ r: 7, fill: '#fff', stroke: '#06b6d4', strokeWidth: 2 }} animationDuration={1200} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Priority Distribution – Horizontal Bars */}
              <div className="glass-panel animate-fade-in delay-5" style={{ padding: '28px' }}>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, color: 'white', marginBottom: '4px' }}>Priority Distribution</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Breakdown of severity levels across all reports</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {priorityData.map(p => {
                    const pct = total > 0 ? Math.round((p.value / total) * 100) : 0;
                    return (
                      <div key={p.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'white' }}>{p.name}</span>
                          <span style={{ fontSize: '0.85rem', color: p.fill, fontWeight: 700 }}>{p.value} <span style={{ color: '#475569', fontWeight: 400 }}>({pct}%)</span></span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: p.fill, borderRadius: '999px', transition: 'width 1.2s ease', boxShadow: `0 0 8px ${p.fill}60` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ---- Recent Activity Feed ---- */}
            <div className="glass-panel animate-fade-in delay-5" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--glass-border)' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', fontWeight: 700, color: 'white', marginBottom: '4px' }}>Recent Activity Feed</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Latest 5 submitted reports</p>
                </div>
                <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 14px' }} onClick={() => navigate('/admin/reports')}>View All</button>
              </div>
              {recentComplaints.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px 0' }}>No reports yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recentComplaints.map((c, i) => (
                    <div key={c._id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', gap: '16px', padding: '14px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                      <div>
                        <p style={{ color: 'white', fontWeight: 600, fontSize: '0.92rem', marginBottom: '3px' }}>{c.damageType} Damage</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{c.userId?.name || 'Unknown'} · {c.location?.address || 'Location not specified'}</p>
                      </div>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: `${PRIORITY_COLORS[c.priority] || '#64748b'}18`, color: PRIORITY_COLORS[c.priority] || '#64748b', border: `1px solid ${PRIORITY_COLORS[c.priority] || '#64748b'}30`, whiteSpace: 'nowrap' }}>{c.priority}</span>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, background: `${STATUS_COLORS[c.status] || '#64748b'}18`, color: STATUS_COLORS[c.status] || '#64748b', border: `1px solid ${STATUS_COLORS[c.status] || '#64748b'}30`, whiteSpace: 'nowrap' }}>{c.status}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </>
        )}
      </div>
    </div>
  );
}

export default AdminAnalytics;
