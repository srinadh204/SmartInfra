import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isDark, toggleTheme, setDarkMode } = useTheme();
  const { user, updateUser, clearUser } = useUser();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarFileRef = React.useRef(null);
  const profileMenuRef = React.useRef(null);

  const token = localStorage.getItem('token');

  // Close profile menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Listen for local storage changes handled by UserContext — no need for duplicate listener

  useEffect(() => {
    if (token && user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile-picture', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      if (res.ok) {
        const data = await res.json();
        const oldUser = JSON.parse(localStorage.getItem('user'));
        const updated = { ...oldUser, profilePicture: data.user.profilePicture };
        updateUser(updated);
      }
    } catch (err) { console.error(err); }
    finally { setUploadingAvatar(false); setShowProfileMenu(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('loginFormCleared');
    clearUser();
    // Always reset to dark/night mode on logout
    localStorage.setItem('theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    if (setDarkMode) setDarkMode(true);
    navigate('/login');
  };


  const markRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) { console.error(err); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const isActive = (path) => location.pathname === path;

  const linkColor = (path) =>
    isActive(path) ? (isDark ? '#fff' : '#0f172a') : 'var(--text-secondary)';

  // Animated toggle slider
  const ThemeToggle = () => (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Day Mode' : 'Switch to Night Mode'}
      aria-label="Toggle day/night mode"
    >
      <div className={`theme-toggle-track ${!isDark ? 'light-mode' : ''}`}>
        {/* Tiny stars visible only in dark mode */}
        <div className="theme-toggle-stars">
          <span className="theme-toggle-star" style={{ top: '5px', left: '8px' }} />
          <span className="theme-toggle-star" style={{ top: '12px', left: '14px', width: '1.5px', height: '1.5px' }} />
          <span className="theme-toggle-star" style={{ top: '7px', left: '20px', width: '1px', height: '1px' }} />
        </div>
        {/* Sliding thumb with emoji */}
        <div className={`theme-toggle-thumb ${isDark ? 'dark' : ''}`}>
          {isDark ? '🌙' : '☀️'}
        </div>
      </div>
    </button>
  );

  return (
    <nav style={{
      padding: '16px 40px',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Logo */}
      <Link
        to={user ? (user.role === 'Admin' ? '/admin' : '/home') : '/login'}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', cursor: 'pointer', transition: 'opacity 0.2s ease' }}
        onMouseOver={e => e.currentTarget.style.opacity = '0.8'}
        onMouseOut={e => e.currentTarget.style.opacity = '1'}
      >
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', color: 'white', boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}>
          S
        </div>
        <span className="nav-logo-text">
          Smart Infra
        </span>
      </Link>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative' }}>

          {/* Desktop Nav Links */}
          <div className="nav-links-desktop">
            {user.role === 'Citizen' && (
              <>
                <Link to="/home" style={{ color: linkColor('/home'), textDecoration: 'none', fontWeight: 500, transition: 'color 0.3s ease' }}>Home</Link>
                <Link to="/dashboard" style={{ color: linkColor('/dashboard'), textDecoration: 'none', fontWeight: 500, transition: 'color 0.3s ease' }}>Dashboard</Link>
                <Link to="/report" style={{ color: linkColor('/report'), textDecoration: 'none', fontWeight: 500, transition: 'color 0.3s ease' }}>Report Damage</Link>
                <Link to="/how-it-works" style={{ color: linkColor('/how-it-works'), textDecoration: 'none', fontWeight: 500, transition: 'color 0.3s ease' }}>How It Works</Link>
              </>
            )}
            {user.role === 'Admin' && (
              <>
                <Link to="/admin" style={{ color: linkColor('/admin'), textDecoration: 'none', fontWeight: 500, transition: 'color 0.3s ease' }}>Home</Link>
                <Link to="/admin/analytics" style={{ color: linkColor('/admin/analytics'), textDecoration: 'none', fontWeight: 500, transition: 'color 0.3s ease' }}>Analytics</Link>
                <Link to="/admin/reports" style={{ color: linkColor('/admin/reports'), textDecoration: 'none', fontWeight: 500, transition: 'color 0.3s ease' }}>Database Feed</Link>
                <Link to="/admin/map" style={{ color: linkColor('/admin/map'), textDecoration: 'none', fontWeight: 500, transition: 'color 0.3s ease' }}>Map View</Link>
              </>
            )}
          </div>

          <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }}></div>

          {/* 🌙 / ☀️ Theme Toggle */}
          <ThemeToggle />

          <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }}></div>

          {/* Notification Bell */}
          <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setShowDropdown(!showDropdown)}>
            <span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', transition: 'color 0.3s ease' }}
              onMouseOver={e => e.currentTarget.style.color = isDark ? '#fff' : '#0f172a'}
              onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </span>
            {unreadCount > 0 && (
              <span style={{ background: 'var(--danger)', color: 'white', borderRadius: '50%', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold', position: 'absolute', top: '-6px', right: '-8px', border: `2px solid ${isDark ? '#0f172a' : '#f0f4f8'}` }}>
                {unreadCount}
              </span>
            )}
          </div>

          {/* Notifications Dropdown */}
          {showDropdown && (
            <div className="glass-panel animate-fade-in" style={{ position: 'absolute', top: '50px', right: '100px', width: '340px', zIndex: 100, padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Notifications</h4>
                {unreadCount > 0 && <span className="badge badge-progress">{unreadCount} New</span>}
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.length === 0 && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>You're all caught up!</p>}
                {notifications.map(n => (
                  <div key={n._id}
                    onClick={() => !n.isRead && markRead(n._id)}
                    style={{ padding: '12px', borderRadius: '8px', cursor: n.isRead ? 'default' : 'pointer', transition: 'all 0.2s', border: '1px solid', borderColor: n.isRead ? 'transparent' : 'rgba(6, 182, 212, 0.3)', background: n.isRead ? 'rgba(128,128,128,0.04)' : 'rgba(6, 182, 212, 0.05)' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)', lineHeight: '1.4' }}>{n.message}</p>
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>{new Date(n.createdAt).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button className="nav-mobile-btn" onClick={() => setShowMobileMenu(!showMobileMenu)} style={{ color: isDark ? 'white' : '#0f172a' }}>
            {showMobileMenu ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            )}
          </button>

          {/* Desktop Profile + Logout */}
          <div className="nav-actions-desktop">

            {/* Hidden file input for avatar upload */}
            <input
              ref={avatarFileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleAvatarUpload}
            />

            {/* Avatar with dropdown */}
            <div ref={profileMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProfileMenu(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', gap: '10px', transition: 'opacity 0.2s' }}
                title="Profile options"
              >
                {/* Avatar circle */}
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: user?.profilePicture
                    ? `url(http://localhost:5000${user.profilePicture}) center/cover no-repeat`
                    : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-primary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', flexShrink: 0, overflow: 'hidden',
                  boxShadow: showProfileMenu ? '0 0 0 3px var(--accent-primary)' : '0 4px 12px rgba(6,182,212,0.3)',
                  transition: 'box-shadow 0.2s ease'
                }}>
                  {!user?.profilePicture && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  )}
                  {uploadingAvatar && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.2' }}>{user.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 500, lineHeight: '1.2', marginTop: '2px' }}>{user.role}</span>
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="glass-panel animate-fade-in" style={{
                  position: 'absolute', top: '52px', right: 0,
                  width: '200px', zIndex: 200, padding: '8px',
                  borderRadius: '14px', border: '1px solid var(--glass-border)',
                }}>
                  {/* Big avatar preview at top */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderBottom: '1px solid var(--glass-border)', marginBottom: '6px' }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                      background: user?.profilePicture
                        ? `url(http://localhost:5000${user.profilePicture}) center/cover no-repeat`
                        : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-primary))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.2rem', fontWeight: 700
                    }}>
                      {!user?.profilePicture && (user.name ? user.name.charAt(0).toUpperCase() : 'U')}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{user.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{user.role}</div>
                    </div>
                  </div>

                  {/* View Profile */}
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 500, transition: 'background 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    View Profile
                  </Link>

                  {/* Update Photo */}
                  <button
                    onClick={() => { avatarFileRef.current?.click(); }}
                    disabled={uploadingAvatar}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 500, cursor: uploadingAvatar ? 'wait' : 'pointer', transition: 'background 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    {uploadingAvatar ? 'Uploading...' : 'Update Photo'}
                  </button>

                  <div style={{ height: '1px', background: 'var(--glass-border)', margin: '6px 0' }} />

                  {/* Logout */}
                  <button
                    onClick={() => { setShowProfileMenu(false); handleLogout(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {user && (
        <div className={`nav-mobile-menu ${showMobileMenu ? 'open' : ''}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {user.role === 'Citizen' && (
              <>
                <Link to="/home" onClick={() => setShowMobileMenu(false)} style={{ color: linkColor('/home'), textDecoration: 'none', fontWeight: 500 }}>Home</Link>
                <Link to="/dashboard" onClick={() => setShowMobileMenu(false)} style={{ color: linkColor('/dashboard'), textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
                <Link to="/report" onClick={() => setShowMobileMenu(false)} style={{ color: linkColor('/report'), textDecoration: 'none', fontWeight: 500 }}>Report Damage</Link>
                <Link to="/how-it-works" onClick={() => setShowMobileMenu(false)} style={{ color: linkColor('/how-it-works'), textDecoration: 'none', fontWeight: 500 }}>How It Works</Link>
              </>
            )}
            {user.role === 'Admin' && (
              <>
                <Link to="/admin" onClick={() => setShowMobileMenu(false)} style={{ color: linkColor('/admin'), textDecoration: 'none', fontWeight: 500 }}>Home</Link>
                <Link to="/admin/analytics" onClick={() => setShowMobileMenu(false)} style={{ color: linkColor('/admin/analytics'), textDecoration: 'none', fontWeight: 500 }}>Analytics</Link>
                <Link to="/admin/reports" onClick={() => setShowMobileMenu(false)} style={{ color: linkColor('/admin/reports'), textDecoration: 'none', fontWeight: 500 }}>Database Feed</Link>
                <Link to="/admin/map" onClick={() => setShowMobileMenu(false)} style={{ color: linkColor('/admin/map'), textDecoration: 'none', fontWeight: 500 }}>Map View</Link>
              </>
            )}

            <div style={{ height: '1px', background: 'var(--glass-border)', margin: '4px 0' }}></div>

            {/* Theme Toggle Row in Mobile Menu */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                {isDark ? '🌙 Night Mode' : '☀️ Day Mode'}
              </span>
              <ThemeToggle />
            </div>

            <div style={{ height: '1px', background: 'var(--glass-border)', margin: '4px 0' }}></div>

            <Link to="/profile" onClick={() => setShowMobileMenu(false)} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '12px' }}>
              Profile Settings
            </Link>
            <button onClick={() => { setShowMobileMenu(false); handleLogout(); }} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', width: 'fit-content', marginTop: '8px' }}>Logout</button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
