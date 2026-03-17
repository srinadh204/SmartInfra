import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../index.css';

// Fix for leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const getPriorityColor = (priority) => {
  switch(priority) {
    case 'Critical': return '#ef4444';
    case 'High':     return '#f59e0b';
    case 'Medium':   return '#eab308';
    case 'Low':      return '#22c55e';
    default:         return '#64748b';
  }
};

const getZoneColor = (count) => {
  if (count >= 10) return '#ef4444';
  if (count >= 5)  return '#f59e0b';
  if (count >= 2)  return '#eab308';
  return '#22c55e';
};

function MapBounds({ complaints }) {
  const map = useMap();
  useEffect(() => {
    if (complaints.length > 0) {
      const bounds = L.latLngBounds(complaints.map(c => [c.location.lat, c.location.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [complaints, map]);
  return null;
}

function AdminMap() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState(30);
  const [showHeatzones, setShowHeatzones] = useState(true);
  const [showRoutes, setShowRoutes] = useState(false);
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
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const valid = data.filter(c =>
        c.location &&
        typeof c.location.lat === 'number' &&
        typeof c.location.lng === 'number' &&
        !isNaN(c.location.lat) && !isNaN(c.location.lng)
      );
      valid.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setComplaints(valid);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(new Date().setDate(now.getDate() - dateRange));
    return complaints.filter(comp => {
      const matchCat    = filterCategory === 'All' || comp.damageType === filterCategory;
      const matchStatus = filterStatus === 'All' || comp.status === filterStatus;
      const matchDate   = new Date(comp.createdAt) >= cutoff;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        (comp.location.address && comp.location.address.toLowerCase().includes(q)) ||
        (comp.damageType && comp.damageType.toLowerCase().includes(q));
      return matchCat && matchStatus && matchDate && matchSearch;
    });
  }, [complaints, filterCategory, filterStatus, searchQuery, dateRange]);

  const { cityStats, activeHotspots } = useMemo(() => {
    const cityData = {};
    filteredComplaints.forEach(comp => {
      if (!comp.location.address) return;
      const parts = comp.location.address.split(',').map(s => s.trim());
      let city = parts.length > 2 ? (parts[parts.length - 3] || parts[parts.length - 2]) : parts[0] || 'Unknown';
      if (!cityData[city]) cityData[city] = { count: 0, latSum: 0, lngSum: 0 };
      cityData[city].count++;
      cityData[city].latSum += comp.location.lat;
      cityData[city].lngSum += comp.location.lng;
    });
    const statsArray = Object.keys(cityData).map(city => {
      const { count, latSum, lngSum } = cityData[city];
      return { city, count, center: [latSum / count, lngSum / count] };
    }).filter(s => !isNaN(s.center[0]) && !isNaN(s.center[1]));
    statsArray.sort((a, b) => b.count - a.count);
    return { cityStats: statsArray, activeHotspots: statsArray.filter(s => s.count >= 5).length };
  }, [filteredComplaints]);

  const topStats = useMemo(() => {
    const todayStr = new Date().toLocaleDateString();
    const todayCount = complaints.filter(c => new Date(c.createdAt).toLocaleDateString() === todayStr).length;
    const pendingCount = filteredComplaints.filter(c => c.status !== 'Resolved').length;
    const resolvedCount = filteredComplaints.filter(c => c.status === 'Resolved').length;
    return { todayCount, pendingCount, resolvedCount };
  }, [complaints, filteredComplaints]);

  const routePoints = useMemo(() => {
    if (!showRoutes) return [];
    return filteredComplaints
      .filter(c => c.status !== 'Resolved' && (c.priority === 'Critical' || c.priority === 'High'))
      .map(c => [c.location.lat, c.location.lng]);
  }, [filteredComplaints, showRoutes]);

  const exportToCSV = () => {
    if (!filteredComplaints.length) return alert('No data to export.');
    const headers = ['Date', 'Category', 'Status', 'Priority', 'Address', 'Latitude', 'Longitude'];
    const rows = filteredComplaints.map(c => [
      new Date(c.createdAt).toLocaleDateString(),
      c.damageType, c.status, c.priority,
      `"${c.location.address}"`, c.location.lat, c.location.lng
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `reports_${new Date().toLocaleDateString().replace(/\//g, '-')}.csv`;
    a.click();
  };

  const statCardStyle = (borderColor) => ({
    padding: '12px 20px', borderRadius: '16px',
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid rgba(255,255,255,0.08)`,
    borderTop: `3px solid ${borderColor}`,
    display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '100px'
  });

  const btnToggle = (active, activeColor = 'var(--accent-primary)') => ({
    padding: '7px 14px',
    background: active ? activeColor : 'rgba(0,0,0,0.5)',
    color: 'white', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.15)',
    cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
    backdropFilter: 'blur(10px)', transition: 'all 0.2s'
  });

  return (
    <div className="app-container" style={{ minHeight: '100vh', position: 'relative' }}>
      <AnimatedBackground />
      <Navbar />

      <div className="container animate-fade-in delay-1" style={{ display: 'flex', flexDirection: 'column', paddingBottom: '24px' }}>

        {/* ─── Page Header ─── */}
        <div className="page-header" style={{ marginBottom: '16px' }}>
          <div>
            <h1 className="page-title" style={{ marginBottom: '4px' }}>Geographic Dashboard</h1>
            <p className="page-subtitle" style={{ margin: 0 }}>Advanced spatial analysis &amp; operations dispatch map.</p>
          </div>
        </div>

        {/* Stats Cards — full-width wrapping row */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', marginBottom: '18px' }}>
            <div style={statCardStyle('var(--accent-primary)')}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{topStats.todayCount}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '4px' }}>Today</span>
            </div>
            <div style={statCardStyle('#f59e0b')}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>{topStats.pendingCount}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '4px' }}>Pending</span>
            </div>
            <div style={statCardStyle('#22c55e')}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#22c55e', lineHeight: 1 }}>{topStats.resolvedCount}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '4px' }}>Resolved</span>
            </div>
            <div style={statCardStyle(activeHotspots > 0 ? '#ef4444' : 'var(--glass-border)')}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: activeHotspots > 0 ? '#ef4444' : 'white', lineHeight: 1 }}>{activeHotspots}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '4px' }}>Hotspots</span>
            </div>
            <div style={statCardStyle('var(--accent-cyan)')}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-cyan)', lineHeight: 1 }}>{filteredComplaints.length}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '4px' }}>Showing</span>
            </div>
        </div>

        {/* ─── Filter Bar ─── */}
        <div className="glass-panel" style={{ padding: '14px 18px', marginBottom: '18px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', borderRadius: '16px' }}>
          <input
            type="text" placeholder="🔍  Search areas or keywords..."
            className="input-field"
            style={{ flex: 1, minWidth: '180px', margin: 0, padding: '9px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', color: 'white' }}
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          />
          <select className="input-field" style={{ width: '155px', margin: 0, padding: '9px 10px', borderRadius: '10px' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="All">All Categories</option>
            <option value="Road">Road / Pothole</option>
            <option value="Bridge">Bridge</option>
            <option value="Streetlight">Streetlight</option>
            <option value="Building">Public Building</option>
            <option value="Other">Other</option>
          </select>
          <select className="input-field" style={{ width: '155px', margin: 0, padding: '9px 10px', borderRadius: '10px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
            <span style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>Last</span>
            <input type="range" min="1" max="90" value={dateRange} onChange={e => setDateRange(Number(e.target.value))} style={{ width: '90px', accentColor: 'var(--accent-primary)' }} />
            <span style={{ minWidth: '45px', fontWeight: 600, color: 'white' }}>{dateRange}d</span>
          </div>
          <button className="btn btn-secondary" onClick={exportToCSV} style={{ padding: '8px 16px', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
            ⬇ Export CSV
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>Initialising Spatial Engine...</div>
        ) : (
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

            {/* ─── Main Map ─── */}
            <div className="glass-panel" style={{ flex: '1 1 500px', minWidth: 0, minHeight: '560px', padding: '10px', position: 'relative', zIndex: 1, borderRadius: '22px', border: '1px solid rgba(255,255,255,0.08)' }}>

              {/* Toggle Buttons overlay */}
              <div style={{ position: 'absolute', top: '22px', right: '22px', zIndex: 1000, display: 'flex', gap: '8px' }}>
                <button style={btnToggle(showHeatzones)} onClick={() => setShowHeatzones(v => !v)}>
                  {showHeatzones ? '🔥 Hide Heatzones' : '🔥 Show Heatzones'}
                </button>
                <button style={btnToggle(showRoutes, '#f59e0b')} onClick={() => setShowRoutes(v => !v)}>
                  {showRoutes ? '🚗 Hide Route' : '🚗 Dispatch Route'}
                </button>
              </div>

              <div style={{ width: '100%', height: '520px', borderRadius: '14px', overflow: 'hidden', position: 'relative' }}>
                <MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: '100%', width: '100%' }}>
                  {/* Dark CartoDB tiles */}
                  <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />

                  {filteredComplaints.length > 0 && <MapBounds complaints={filteredComplaints} />}

                  {/* Density Zone Circles */}
                  {showHeatzones && cityStats.map((stat, idx) =>
                    stat.center && (
                      <Circle
                        key={`zone-${idx}`}
                        center={stat.center}
                        pathOptions={{
                          fillColor: getZoneColor(stat.count),
                          color: getZoneColor(stat.count),
                          fillOpacity: idx === 0 ? 0.4 : 0.2,
                          weight: 1
                        }}
                        radius={Math.max(800, stat.count * 300)}
                      />
                    )
                  )}

                  {/* Dispatch Route Polyline */}
                  {showRoutes && routePoints.length > 1 && (
                    <Polyline positions={routePoints} color="#f59e0b" weight={3} dashArray="10, 8" opacity={0.85} />
                  )}

                  {/* Markers */}
                  <>
                    {filteredComplaints.map(comp => (
                      <Marker key={comp._id} position={[comp.location.lat, comp.location.lng]}>
                        <Popup>
                          <div style={{ minWidth: '230px', fontFamily: 'Inter, sans-serif' }}>
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' }}>
                              <strong style={{ fontSize: '14px', color: '#0f172a' }}>{comp.damageType} Issue</strong>
                              <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, color: 'white', background: getPriorityColor(comp.priority) }}>
                                {comp.priority}
                              </span>
                            </div>

                            {/* Image */}
                            {comp.images && comp.images.length > 0 && (
                              <img
                                src={`http://localhost:5000${comp.images[0]}`}
                                alt="Damage"
                                style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px', marginBottom: '8px' }}
                                onError={e => e.target.style.display = 'none'}
                              />
                            )}

                            {/* Details */}
                            <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6, marginBottom: '10px' }}>
                              <div><strong>📍</strong> {comp.location.address || 'N/A'}</div>
                              <div><strong>📅</strong> {new Date(comp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                              <div>
                                <strong>Status:</strong>
                                <span style={{
                                  marginLeft: '6px', padding: '1px 8px', borderRadius: '10px',
                                  fontSize: '11px', fontWeight: 600,
                                  background: comp.status === 'Resolved' ? '#dcfce7' : '#fef3c7',
                                  color: comp.status === 'Resolved' ? '#15803d' : '#92400e'
                                }}>{comp.status}</span>
                              </div>
                              {comp.description && (
                                <div style={{ marginTop: '6px', color: '#64748b', fontSize: '11px', lineHeight: 1.5, borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>{comp.description.slice(0, 120)}{comp.description.length > 120 ? '…' : ''}</div>
                              )}
                            </div>

                            {/* Action Button */}
                            <button
                              onClick={() => navigate(`/admin/reports/${comp._id}`)}
                              style={{ width: '100%', padding: '7px', background: 'linear-gradient(135deg, #3b82f6, #06b6d4)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '12px', letterSpacing: '0.02em' }}
                            >
                              View Full Report →
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </>
                </MapContainer>

                {/* Legend */}
                {showHeatzones && (
                  <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 1000, background: 'rgba(2, 6, 23, 0.85)', padding: '14px', borderRadius: '12px', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>DENSITY ZONES</div>
                    {[['#ef4444', 'Critical (10+)'], ['#f59e0b', 'High (5-9)'], ['#eab308', 'Medium (2-4)'], ['#22c55e', 'Low (1)']].map(([color, label]) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }}></div>
                        <span style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ─── Right Sidebar ─── */}
            <div className="glass-panel" style={{ flex: '1 1 300px', maxWidth: '340px', minWidth: '260px', padding: '22px', display: 'flex', flexDirection: 'column', maxHeight: '600px', overflowY: 'auto', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'white' }}>Hotspot Rankings</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {cityStats.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginTop: '20px' }}>No hotspots for current filters.</p>
                ) : (
                  cityStats.slice(0, 15).map((stat, i) => {
                    const color = getZoneColor(stat.count);
                    const label = stat.count >= 10 ? 'Critical' : stat.count >= 5 ? 'High' : stat.count >= 2 ? 'Medium' : 'Low';
                    return (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '13px 14px 13px 18px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                        position: 'relative', overflow: 'hidden', cursor: 'default',
                        transition: 'background 0.2s'
                      }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      >
                        <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3px', background: color }}></div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: 'white', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>{stat.city}</span>
                          <span style={{ fontSize: '0.72rem', color, fontWeight: 600, marginTop: '2px' }}>{label} Severity</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>{stat.count}</span>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>reports</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Empty state summary */}
              {filteredComplaints.length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-secondary)', marginTop: '20px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🗺️</div>
                  <div>No reports match these filters.<br />Try adjusting the filter criteria.</div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default AdminMap;
