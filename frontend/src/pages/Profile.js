import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';
import { useUser } from '../context/UserContext';

function Profile() {
  const navigate = useNavigate();
  const { updateUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: ''
  });
  const [profilePicture, setProfilePicture] = useState('');
  const [uploadingPic, setUploadingPic] = useState(false);
  const fileInputRef = React.useRef(null);

  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProfile(token);
  }, [navigate]);

  const fetchProfile = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || '',
          email: data.email || '',
          mobile: data.mobile || ''
        });
        setProfilePicture(data.profilePicture || '');
        setUserRole(data.role);
      } else {
        setMessage('Error loading profile');
      }
    } catch (err) {
      console.error(err);
      setMessage('Server connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPic(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setProfilePicture(data.user.profilePicture);
        // Update via UserContext — reactively syncs to all pages
        const oldUser = JSON.parse(localStorage.getItem('user'));
        updateUser({ ...oldUser, profilePicture: data.user.profilePicture });
        setMessage('Profile picture updated!');
      } else {
        const errData = await res.json();
        setMessage(errData.msg || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      setMessage('Server error during upload');
    } finally {
      setUploadingPic(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        setMessage('Profile updated successfully!');
        const oldUser = JSON.parse(localStorage.getItem('user'));
        updateUser({ ...oldUser, name: updatedUser.name, email: updatedUser.email });
      } else {
        setMessage('Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setMessage('Server connection error.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container" style={{ minHeight: '100vh', position: 'relative', fontFamily: "'DM Sans', sans-serif" }}>
        <AnimatedBackground />
        <Navbar />
        <div style={{ textAlign: 'center', padding: '100px', color: 'rgba(148,163,184,.7)', fontSize: '1rem', letterSpacing: '0.05em' }}>
          Loading profile data...
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ minHeight: '100vh', position: 'relative', fontFamily: "'DM Sans', sans-serif" }}>
      <AnimatedBackground />
      <Navbar />

      {/* ── Google Fonts + keyframes ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Mono:wght@700&family=DM+Sans:wght@400;500&display=swap');
        @keyframes pf-blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(1.4)} }
        @keyframes pf-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .pf-save:hover  { transform: translateY(-2px) !important; box-shadow: 0 8px 40px rgba(6,182,212,.52) !important; }
        .pf-cancel:hover { border-color: rgba(148,163,184,.62) !important; color: white !important; background: rgba(255,255,255,.04) !important; }
        .pf-field:focus  { border-color: rgba(6,182,212,.55) !important; box-shadow: 0 0 0 3px rgba(6,182,212,.1) !important; outline: none !important; }
      `}</style>

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: '-5%', left: '-8%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-5%', right: '-8%', width: '580px', height: '580px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div className="container animate-fade-in delay-1" style={{ maxWidth: '700px', position: 'relative', zIndex: 1 }}>

        {/* ── Page Header ── */}
        <div style={{ marginBottom: '36px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', padding: '6px 18px', background: 'rgba(6,182,212,.07)', border: '1px solid rgba(6,182,212,.22)', borderRadius: '40px', marginBottom: '16px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 8px #06b6d4', display: 'inline-block', animation: 'pf-blink 2s infinite' }} />
            <span style={{ color: '#06b6d4', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', fontFamily: "'Space Mono', monospace" }}>ACCOUNT</span>
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.02em', color: 'white', marginBottom: '8px', margin: '0 0 8px 0' }}>
            Profile Settings
          </h1>
          <p style={{ color: 'rgba(148,163,184,.8)', fontSize: '1rem', margin: 0 }}>
            Manage your personal information and account details.
          </p>
        </div>

        {/* ── Message Banner ── */}
        {message && (
          <div style={{
            background: message.includes('success') ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)',
            color: message.includes('success') ? '#10b981' : '#ef4444',
            border: `1px solid ${message.includes('success') ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)'}`,
            padding: '14px 18px', borderRadius: '12px', marginBottom: '24px',
            textAlign: 'center', fontWeight: 500, fontSize: '0.93rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}>
            {message.includes('success')
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            }
            {message}
          </div>
        )}

        {/* ── Main Panel ── */}
        <div className="glass-panel" style={{
          padding: '40px',
          background: 'rgba(8,12,22,.82)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(6,182,212,.15)',
          borderRadius: '24px',
          boxShadow: '0 0 70px rgba(6,182,212,.07), inset 0 1px 0 rgba(255,255,255,.05)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* grid texture */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: '24px', backgroundImage: 'linear-gradient(rgba(6,182,212,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,.025) 1px, transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none' }} />
          {/* top accent line */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '200px', height: '2px', background: 'linear-gradient(90deg, transparent, #06b6d4, #8b5cf6, transparent)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>

            {/* ── Avatar Row ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px', paddingBottom: '32px', borderBottom: '1px solid rgba(6,182,212,.12)' }}>
              
              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePicUpload} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />

              {/* Avatar circle */}
              <div 
                onClick={() => !uploadingPic && fileInputRef.current.click()}
                style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: profilePicture 
                    ? `url(http://localhost:5000${profilePicture}) center/cover no-repeat` 
                    : 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', fontWeight: 800, color: 'white',
                  boxShadow: '0 0 30px rgba(6,182,212,.4), 0 0 60px rgba(139,92,246,.2)',
                  border: '2px solid rgba(6,182,212,.4)',
                  flexShrink: 0,
                  animation: 'pf-float 3.5s ease-in-out infinite',
                  fontFamily: "'Syne', sans-serif",
                  cursor: uploadingPic ? 'wait' : 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  group: 'avatar'
                }}
                title="Click to change profile picture"
              >
                {!profilePicture && (formData.name ? formData.name.charAt(0).toUpperCase() : 'U')}
                
                {/* Upload overlay hover effect */}
                <div style={{
                  position: 'absolute', inset: 0, 
                  background: 'rgba(0,0,0,0.5)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: uploadingPic ? 1 : 0, 
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => { if(!uploadingPic) e.currentTarget.style.opacity = 1 }}
                onMouseLeave={(e) => { if(!uploadingPic) e.currentTarget.style.opacity = 0 }}
                >
                  {uploadingPic ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'rd-spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <h2 style={{
                  fontSize: '1.7rem', color: 'white', marginBottom: '8px',
                  fontFamily: "'Syne', sans-serif", fontWeight: 800, letterSpacing: '-0.02em',
                }}>
                  {formData.name}
                </h2>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                    padding: '4px 14px',
                    background: userRole === 'Admin' ? 'rgba(245,158,11,.1)' : 'rgba(6,182,212,.1)',
                    color: userRole === 'Admin' ? '#f59e0b' : '#06b6d4',
                    border: `1px solid ${userRole === 'Admin' ? 'rgba(245,158,11,.3)' : 'rgba(6,182,212,.3)'}`,
                    borderRadius: '20px', fontSize: '0.68rem', fontWeight: 700,
                    letterSpacing: '0.12em', textTransform: 'uppercase',
                    fontFamily: "'Space Mono', monospace",
                  }}>
                    <span style={{ width: '10px', height: '5px', borderRadius: '50%', background: userRole === 'Admin' ? '#f59e0b' : '#06b6d4', boxShadow: `0 0 6px ${userRole === 'Admin' ? '#f59e0b' : '#06b6d4'}`, display: 'inline-block' }} />
                    {userRole} Account
                  </span>

                  <button
                    type="button"
                    onClick={() => !uploadingPic && fileInputRef.current.click()}
                    disabled={uploadingPic}
                    style={{
                      background: 'rgba(255,255,255,.05)',
                      border: '1px solid rgba(255,255,255,.1)',
                      color: 'rgba(255,255,255,.8)',
                      padding: '5px 14px', borderRadius: '20px',
                      fontSize: '0.75rem', fontWeight: 600,
                      cursor: uploadingPic ? 'wait' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px',
                      transition: 'all 0.2s ease',
                      fontFamily: "'DM Sans', sans-serif"
                    }}
                    onMouseOver={e => { if(!uploadingPic){ e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.color = '#fff'; } }}
                    onMouseOut={e => { if(!uploadingPic){ e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.color = 'rgba(255,255,255,.8)'; } }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    {uploadingPic ? 'Uploading...' : 'Upload Photo'}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} autoComplete="off">

              <div className="grid-2" style={{ gap: '22px', marginBottom: '22px' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(148,163,184,.75)', textTransform: 'uppercase', fontFamily: "'Space Mono', monospace", marginBottom: '8px', display: 'block' }}>Full Name</label>
                  <input
                    type="text" name="name" className="input-field pf-field"
                    value={formData.name} onChange={handleChange} required autoComplete="off"
                    style={{
                      background: 'rgba(6,182,212,.05)', border: '1px solid rgba(6,182,212,.18)',
                      borderRadius: '10px', color: 'white', fontSize: '0.95rem',
                      transition: 'border-color .2s, box-shadow .2s',
                    }}
                  />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(148,163,184,.75)', textTransform: 'uppercase', fontFamily: "'Space Mono', monospace", marginBottom: '8px', display: 'block' }}>Mobile Number</label>
                  <input
                    type="tel" name="mobile" className="input-field pf-field"
                    value={formData.mobile} onChange={handleChange} required autoComplete="off"
                    style={{
                      background: 'rgba(6,182,212,.05)', border: '1px solid rgba(6,182,212,.18)',
                      borderRadius: '10px', color: 'white', fontSize: '0.95rem',
                      transition: 'border-color .2s, box-shadow .2s',
                    }}
                  />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: '40px' }}>
                <label className="input-label" style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(148,163,184,.75)', textTransform: 'uppercase', fontFamily: "'Space Mono', monospace", marginBottom: '8px', display: 'block' }}>Email Address</label>
                <input
                  type="email" name="email" className="input-field pf-field"
                  value={formData.email} onChange={handleChange} required autoComplete="off"
                  style={{
                    background: 'rgba(6,182,212,.05)', border: '1px solid rgba(6,182,212,.18)',
                    borderRadius: '10px', color: 'white', fontSize: '0.95rem',
                    transition: 'border-color .2s, box-shadow .2s',
                  }}
                />
                <small style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: 'rgba(148,163,184,.6)', fontSize: '0.8rem' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  Your email is used for login and important system notifications.
                </small>
              </div>

              {/* ── Divider before buttons ── */}
              <div style={{ borderTop: '1px solid rgba(6,182,212,.1)', marginBottom: '28px' }} />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
                <button
                  type="button"
                  className="btn btn-secondary pf-cancel"
                  onClick={() => navigate(-1)}
                  style={{
                    padding: '13px 32px', fontSize: '0.9rem', fontWeight: 700,
                    fontFamily: "'DM Sans', sans-serif",
                    background: 'transparent',
                    border: '1px solid rgba(148,163,184,.28)',
                    borderRadius: '11px', color: 'rgba(148,163,184,.85)',
                    cursor: 'pointer',
                    transition: 'border-color .2s, color .2s, background .2s',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary pf-save"
                  disabled={saving}
                  style={{
                    padding: '13px 36px', fontSize: '0.9rem', fontWeight: 700,
                    fontFamily: "'DM Sans', sans-serif",
                    background: saving ? 'rgba(6,182,212,.4)' : 'linear-gradient(135deg, #06b6d4, #0891b2)',
                    border: 'none', borderRadius: '11px', color: 'white',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: saving ? 'none' : '0 0 24px rgba(6,182,212,.32)',
                    transition: 'transform .2s ease, box-shadow .2s ease',
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  {saving
                    ? <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        Saving Changes...
                      </>
                    : <>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                        Save Profile
                      </>
                  }
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Profile;