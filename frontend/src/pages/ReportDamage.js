import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import ThankYou3D from '../components/ThankYou3D';
import AnimatedBackground from '../components/AnimatedBackground';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet marker icons broken by webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Listens for map clicks and calls onSelect(lat, lng)
function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Flies the map to a given position when it changes
function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 16, { duration: 1.2 });
  }, [position, map]);
  return null;
}

function ReportDamage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    damageType: 'Road', description: '', priority: 'Medium', address: ''
  });
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [gpsText, setGpsText] = useState('');
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null); // metres
  const [flyTarget, setFlyTarget] = useState(null);    // [lat, lng] to animate map to
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviewUrls(files.map(file => URL.createObjectURL(file)));
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      setGpsDetecting(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy; // in metres
          setLocation({ lat, lng });
          setGpsText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          setGpsAccuracy(accuracy);
          setFlyTarget([lat, lng]);
          setGpsDetecting(false);
        },
        (err) => {
          setGpsDetecting(false);
          const msgs = {
            1: 'Location access denied. Please allow location permission in your browser settings.',
            2: 'Location unavailable. Make sure GPS / Location Services are enabled on your device.',
            3: 'Location request timed out. Move to an open area and try again.',
          };
          alert(msgs[err.code] || 'Unable to retrieve your location.');
        },
        {
          enableHighAccuracy: true, // use GPS chip, not Wi-Fi / IP
          timeout: 10000,           // wait up to 10 s for a fix
          maximumAge: 0,            // never use a cached position
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('damageType', formData.damageType);
      data.append('description', formData.description);
      data.append('priority', formData.priority);
      data.append('address', formData.address);
      if (location.lat) data.append('lat', location.lat);
      if (location.lng) data.append('lng', location.lng);
      images.forEach(img => data.append('images', img));

      const res = await fetch('http://localhost:5000/api/complaints', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: data
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        alert('Failed to submit report');
      }
    } catch (err) {
      console.error(err); alert('Error submitting report.');
    } finally { setLoading(false); }
  };

  /* ── shared input style ── */
  const inputStyle = {
    background: 'rgba(6,182,212,.05)',
    border: '1px solid rgba(6,182,212,.18)',
    borderRadius: '10px',
    color: 'white',
    fontSize: '0.95rem',
    transition: 'border-color .2s, box-shadow .2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
    color: 'rgba(148,163,184,.72)', textTransform: 'uppercase',
    fontFamily: "'Space Mono', monospace", marginBottom: '8px',
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', position: 'relative', fontFamily: "'DM Sans', sans-serif" }}>
      <AnimatedBackground />
      <Navbar />

      {/* ── Fonts + keyframes ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Mono:wght@700&family=DM+Sans:wght@400;500&display=swap');
        @keyframes rd-blink  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(1.4)} }
        @keyframes rd-spin   { to { transform: rotate(360deg); } }
        @keyframes rd-pop    { from{opacity:0;transform:scale(.92)} to{opacity:1;transform:scale(1)} }
        @keyframes rd-pulse  { 0%,100%{box-shadow:0 0 0 0 rgba(6,182,212,.4)} 50%{box-shadow:0 0 0 8px rgba(6,182,212,0)} }
        .rd-field:focus { border-color: rgba(6,182,212,.55) !important; box-shadow: 0 0 0 3px rgba(6,182,212,.1) !important; outline: none !important; }
        .rd-field option { background: #0d1117; color: white; }
        .rd-submit:hover  { transform: translateY(-2px) !important; box-shadow: 0 8px 40px rgba(6,182,212,.52) !important; }
        .rd-cancel:hover  { border-color: rgba(148,163,184,.62) !important; color: white !important; background: rgba(255,255,255,.04) !important; }
        .rd-gps:hover     { border-color: rgba(6,182,212,.55) !important; color: #06b6d4 !important; background: rgba(6,182,212,.08) !important; }
        .rd-dropzone:hover { border-color: rgba(6,182,212,.5) !important; background: rgba(6,182,212,.04) !important; }
        .rd-imgthumb { animation: rd-pop .25s ease forwards; }
      `}</style>

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: '-5%', left: '-8%', width: '520px', height: '520px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,.07) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-5%', right: '-8%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,.06) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '45%', right: '2%', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(16,185,129,.05) 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div className="container animate-fade-in delay-1" style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>

        {/* ── Hero Banner ── */}
        <div className="glass-panel animate-fade-in" style={{
          padding: 0, marginBottom: '36px',
          minHeight: '200px', display: 'flex', alignItems: 'center',
          background: 'rgba(6,10,20,.88)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 0 80px rgba(6,182,212,.08), inset 0 1px 0 rgba(255,255,255,.05)',
          border: '1px solid rgba(6,182,212,.15)',
          borderRadius: '24px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* grid texture */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: '24px', backgroundImage: 'linear-gradient(rgba(6,182,212,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,.03) 1px,transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none' }} />
          {/* top accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #06b6d4, #8b5cf6, transparent)' }} />
          {/* right decorative glow blob */}
          <div style={{ position: 'absolute', right: '-40px', top: '50%', transform: 'translateY(-50%)', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,.12) 0%,transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ padding: '44px 48px', maxWidth: '600px', zIndex: 1, position: 'relative' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', padding: '5px 16px', background: 'rgba(6,182,212,.09)', border: '1px solid rgba(6,182,212,.28)', borderRadius: '40px', marginBottom: '18px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 8px #06b6d4', display: 'inline-block', animation: 'rd-blink 2s infinite' }} />
              <span style={{ color: '#06b6d4', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', fontFamily: "'Space Mono', monospace" }}>INCIDENT FILING</span>
            </div>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)', fontFamily: "'Syne', sans-serif", fontWeight: 800,
              color: 'white', marginBottom: '12px', lineHeight: 1.08, letterSpacing: '-0.025em',
              background: 'linear-gradient(135deg, #fff, #94a3b8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>File a Report</h2>
            <p style={{ color: 'rgba(226,232,240,.82)', fontSize: '1.02rem', lineHeight: 1.7, margin: 0 }}>
              Submit precise photographic and locational details regarding public infrastructure damage for immediate municipal dispatch.
            </p>
          </div>
        </div>

        {/* ── Success State ── */}
        {success ? (
          <div className="glass-panel animate-fade-in delay-2" style={{
            textAlign: 'center', padding: '64px 40px',
            background: 'rgba(8,12,22,.85)', backdropFilter: 'blur(24px)',
            border: '1px solid rgba(16,185,129,.2)', borderRadius: '24px',
            boxShadow: '0 0 70px rgba(16,185,129,.08)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '180px', height: '2px', background: 'linear-gradient(90deg,transparent,#10b981,transparent)' }} />
            <ThankYou3D />
            <div style={{ width: '80px', height: '80px', background: 'rgba(16,185,129,.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', border: '1px solid rgba(16,185,129,.25)', boxShadow: '0 0 28px rgba(16,185,129,.25)', animation: 'rd-pulse 2s infinite' }}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h2 style={{ fontSize: '2rem', color: 'white', marginBottom: '12px', fontFamily: "'Syne', sans-serif", fontWeight: 800, letterSpacing: '-0.02em' }}>Thank You for Reporting!</h2>
            <p style={{ color: 'rgba(148,163,184,.85)', marginBottom: '36px', maxWidth: '460px', margin: '0 auto 36px auto', lineHeight: 1.75, fontSize: '1rem' }}>
              Your report has been successfully submitted to the municipal authorities. It will be reviewed shortly. You can track the progress of this issue from your dashboard.
            </p>
            <button
              className="btn btn-primary rd-submit"
              onClick={() => navigate('/dashboard')}
              style={{ padding: '14px 38px', fontSize: '0.93rem', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", background: 'linear-gradient(135deg,#06b6d4,#0891b2)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', boxShadow: '0 0 26px rgba(6,182,212,.3)', transition: 'transform .2s, box-shadow .2s' }}
            >
              Go to Dashboard →
            </button>
          </div>
        ) : (

          /* ── Form Panel ── */
          <div className="glass-panel" style={{
            background: 'rgba(8,12,22,.82)', backdropFilter: 'blur(24px)',
            border: '1px solid rgba(6,182,212,.14)',
            borderRadius: '24px', padding: '40px',
            boxShadow: '0 0 70px rgba(6,182,212,.06), inset 0 1px 0 rgba(255,255,255,.04)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* grid texture */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: '24px', backgroundImage: 'linear-gradient(rgba(6,182,212,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,.022) 1px,transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none' }} />
            {/* top line */}
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '200px', height: '2px', background: 'linear-gradient(90deg,transparent,#06b6d4,#8b5cf6,transparent)' }} />

            <form onSubmit={handleSubmit} autoComplete="off" style={{ position: 'relative', zIndex: 1 }}>

              {/* ── Row 1: Category + Severity ── */}
              <div className="grid-2" style={{ gap: '22px', marginBottom: '22px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={labelStyle}>Category of Damage</label>
                  <div style={{ position: 'relative' }}>
                    <select name="damageType" value={formData.damageType} onChange={handleChange} className="input-field rd-field" style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', paddingRight: '40px' }}>
                      <option value="Road">Road / Pothole</option>
                      <option value="Bridge">Bridge</option>
                      <option value="Streetlight">Streetlight</option>
                      <option value="Building">Public Building</option>
                      <option value="Other">Other</option>
                    </select>
                    <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(148,163,184,.6)' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  </div>
                </div>

                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={labelStyle}>Severity Level</label>
                  <div style={{ position: 'relative' }}>
                    <select name="priority" value={formData.priority} onChange={handleChange} className="input-field rd-field" style={{ ...inputStyle, appearance: 'none', cursor: 'pointer', paddingRight: '40px' }}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                    <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(148,163,184,.6)' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Description ── */}
              <div className="input-group" style={{ marginBottom: '22px' }}>
                <label className="input-label" style={labelStyle}>Detailed Description</label>
                <textarea
                  name="description" value={formData.description} onChange={handleChange}
                  className="input-field rd-field"
                  placeholder="Provide as much detail as possible to help maintenance crews locate and fix the issue..."
                  required
                  style={{ ...inputStyle, minHeight: '110px', resize: 'vertical', paddingTop: '12px', lineHeight: 1.65 }}
                />
              </div>

              {/* ── Address ── */}
              <div className="input-group" style={{ marginBottom: '22px' }}>
                <label className="input-label" style={labelStyle}>Location Address</label>
                <input
                  type="text" name="address" value={formData.address} onChange={handleChange}
                  className="input-field rd-field"
                  placeholder="E.g., Intersection of Main St & 4th Ave"
                  autoComplete="off"
                  style={inputStyle}
                />
              </div>

              {/* ── GPS / Map Block ── */}
              <div className="input-group" style={{ marginBottom: '22px' }}>
                <label className="input-label" style={labelStyle}>GPS Location</label>

                {/* Action row: Auto Detect + clear */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={getLocation}
                    className="btn btn-secondary rd-gps"
                    disabled={gpsDetecting}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '9px 18px', fontSize: '0.85rem', fontWeight: 700,
                      fontFamily: "'DM Sans', sans-serif",
                      background: 'transparent',
                      border: '1px solid rgba(6,182,212,.3)',
                      borderRadius: '10px', color: 'rgba(148,163,184,.85)',
                      cursor: gpsDetecting ? 'not-allowed' : 'pointer',
                      transition: 'border-color .2s, color .2s, background .2s',
                      opacity: gpsDetecting ? 0.7 : 1,
                    }}
                  >
                    {gpsDetecting
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'rd-spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    }
                    {gpsDetecting ? 'Detecting...' : 'Auto Detect My Location'}
                  </button>

                  {location.lat && (
                    <>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#10b981', fontWeight: 700, background: 'rgba(16,185,129,.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(16,185,129,.25)', fontFamily: "'Space Mono', monospace" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Pinned
                      </span>
                      <button
                        type="button"
                        onClick={() => { setLocation({ lat: null, lng: null }); setGpsText(''); setGpsAccuracy(null); setFlyTarget(null); }}
                        style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,.7)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, padding: '4px 8px', borderRadius: '6px', transition: 'color .2s' }}
                      >
                        ✕ Clear
                      </button>
                    </>
                  )}
                </div>

                {/* Instruction hint */}
                <p style={{ fontSize: '0.78rem', color: 'rgba(148,163,184,.55)', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  Click anywhere on the map to pin the damage location, or use Auto Detect.
                </p>

                {/* Leaflet Map */}
                <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(6,182,212,.25)', boxShadow: '0 0 30px rgba(6,182,212,.1)' }}>
                  <MapContainer
                    center={[20.5937, 78.9629]} // centre of India as default
                    zoom={5}
                    style={{ height: '320px', width: '100%', background: '#0d1117' }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <MapClickHandler onSelect={(lat, lng) => {
                      setLocation({ lat, lng });
                      setGpsText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                      setGpsAccuracy(null);
                      setFlyTarget([lat, lng]);
                    }} />
                    {flyTarget && <FlyTo position={flyTarget} />}
                    {location.lat && (
                      <Marker position={[location.lat, location.lng]} />
                    )}
                  </MapContainer>
                </div>

                {/* Coordinates read-only display */}
                {location.lat && (
                  <div style={{ marginTop: '10px', animation: 'rd-pop .3s ease forwards' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#06b6d4', pointerEvents: 'none' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      </div>
                      <input
                        type="text" readOnly value={gpsText}
                        style={{
                          width: '100%', height: '42px',
                          paddingLeft: '40px', paddingRight: '70px',
                          background: 'rgba(16,185,129,.06)',
                          border: '1px solid rgba(16,185,129,.28)',
                          borderRadius: '10px', color: '#10b981',
                          fontSize: '0.92rem', fontFamily: "'Space Mono', monospace",
                          letterSpacing: '0.04em', fontWeight: 700,
                          cursor: 'default', outline: 'none',
                        }}
                      />
                      <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.68rem', color: 'rgba(16,185,129,.65)', fontFamily: "'Space Mono', monospace" }}>LAT, LNG</span>
                    </div>
                    {gpsAccuracy !== null && (
                      <p style={{ fontSize: '0.74rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px',
                        color: gpsAccuracy <= 20 ? 'rgba(16,185,129,.7)' : gpsAccuracy <= 100 ? 'rgba(245,158,11,.7)' : 'rgba(239,68,68,.6)' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        Accuracy: ±{Math.round(gpsAccuracy)} m — {gpsAccuracy <= 20 ? 'High precision (GPS)' : gpsAccuracy <= 100 ? 'Moderate precision (Wi-Fi assisted)' : 'Low precision — move outdoors for better signal'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* ── Photo Upload ── */}
              <div className="input-group" style={{ marginBottom: '22px' }}>
                <label className="input-label" style={labelStyle}>Photographic Evidence</label>
                <div
                  className="rd-dropzone"
                  style={{
                    border: '2px dashed rgba(6,182,212,.25)', borderRadius: '14px', padding: '36px 24px',
                    textAlign: 'center', background: 'rgba(6,182,212,.03)',
                    transition: 'border-color .2s, background .2s', cursor: 'pointer',
                  }}
                >
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} id="file-upload" style={{ display: 'none' }} />
                  <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '52px', height: '52px', background: 'rgba(6,182,212,.08)', border: '1px solid rgba(6,182,212,.22)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.97rem', color: 'white', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Click to browse or drag and drop</span>
                      <span style={{ fontSize: '0.82rem', color: 'rgba(148,163,184,.6)', fontFamily: "'Space Mono', monospace" }}>JPG, PNG — Max 5MB per file</span>
                    </div>
                  </label>
                </div>

                {/* Image previews */}
                {previewUrls.length > 0 && (
                  <div style={{ display: 'flex', gap: '14px', marginTop: '18px', flexWrap: 'wrap' }}>
                    {previewUrls.map((url, i) => (
                      <div key={i} className="rd-imgthumb animate-fade-in" style={{ animationDelay: `${i * 0.08}s`, position: 'relative' }}>
                        <img src={url} alt="Preview" style={{ width: '110px', height: '110px', objectFit: 'cover', borderRadius: '12px', border: '1px solid rgba(6,182,212,.3)', boxShadow: '0 0 20px rgba(6,182,212,.15)', display: 'block' }} />
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '12px', background: 'linear-gradient(180deg,transparent 55%,rgba(0,0,0,.4))' }} />
                        <span style={{ position: 'absolute', bottom: '6px', right: '8px', fontSize: '0.65rem', color: 'rgba(255,255,255,.7)', fontFamily: "'Space Mono', monospace" }}>{i + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Footer Buttons ── */}
              <div style={{ marginTop: '36px', paddingTop: '24px', borderTop: '1px solid rgba(6,182,212,.1)', display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-secondary rd-cancel"
                  style={{
                    padding: '13px 30px', fontSize: '0.9rem', fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                    background: 'transparent', border: '1px solid rgba(148,163,184,.28)',
                    borderRadius: '11px', color: 'rgba(148,163,184,.85)', cursor: 'pointer',
                    transition: 'border-color .2s, color .2s, background .2s',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary rd-submit"
                  disabled={loading}
                  style={{
                    padding: '13px 36px', fontSize: '0.9rem', fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                    background: loading ? 'rgba(6,182,212,.35)' : 'linear-gradient(135deg,#06b6d4,#0891b2)',
                    border: 'none', borderRadius: '11px', color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 0 24px rgba(6,182,212,.32)',
                    transition: 'transform .2s ease, box-shadow .2s ease',
                    display: 'inline-flex', alignItems: 'center', gap: '9px',
                  }}
                >
                  {loading
                    ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'rd-spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Processing...</>
                    : <>Submit Report<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></>
                  }
                </button>
              </div>

            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportDamage;