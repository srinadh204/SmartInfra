import React from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';

function CitizenHome() {
  const navigate = useNavigate();

  return (
    <div className="app-container" style={{ minHeight: '100vh', position: 'relative', fontFamily: "'DM Sans', sans-serif" }}>
      <AnimatedBackground />
      <Navbar />

      {/* ── Google Fonts + global keyframes injected via style tag ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Mono:wght@700&family=DM+Sans:wght@400;500&display=swap');
        @keyframes ch-blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(1.4)} }
        @keyframes ch-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
        .ch-btn-primary { transition: transform .2s ease, box-shadow .2s ease !important; }
        .ch-btn-primary:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 40px rgba(6,182,212,.52) !important; }
        .ch-btn-ghost:hover { border-color: rgba(148,163,184,.65) !important; color: white !important; background: rgba(255,255,255,.04) !important; }
        .ch-card:hover { transform: translateY(-5px) !important; }
        .ch-cat:hover { background: rgba(6,182,212,.13) !important; border-color: rgba(6,182,212,.42) !important; color: #06b6d4 !important; }
        .ch-learn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 36px rgba(6,182,212,.46) !important; }
      `}</style>

      {/* Ambient orbs — purely decorative, pointer-events none */}
      <div style={{ position: 'fixed', top: '-5%', left: '-8%', width: '540px', height: '540px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-5%', right: '-8%', width: '620px', height: '620px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '42%', right: '3%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div className="container animate-fade-in delay-1" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Main Hero Section ── */}
        <div className="glass-panel hero-panel" style={{
          textAlign: 'center', padding: '72px 28px', marginBottom: '48px',
          background: 'rgba(6,10,20,.82)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(6,182,212,.15)',
          borderRadius: '28px',
          boxShadow: '0 0 80px rgba(6,182,212,.07), inset 0 1px 0 rgba(255,255,255,.05)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* grid texture */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: '28px', backgroundImage: 'linear-gradient(rgba(6,182,212,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,.03) 1px, transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none' }} />
          {/* top accent line */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '220px', height: '2px', background: 'linear-gradient(90deg, transparent, #06b6d4, #10b981, transparent)' }} />

          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '7px 20px', background: 'rgba(59,130,246,.07)',
            color: '#60a5fa', borderRadius: '40px', fontSize: '0.72rem', fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '28px',
            border: '1px solid rgba(59,130,246,.25)',
            fontFamily: "'Space Mono', monospace",
            position: 'relative', zIndex: 1,
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#60a5fa', boxShadow: '0 0 10px #60a5fa', display: 'inline-block', animation: 'ch-blink 2s infinite' }} />
            Welcome to Smart Infra
          </span>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 4rem)', fontWeight: 800,
            fontFamily: "'Syne', sans-serif",
            color: 'white', marginBottom: '22px', lineHeight: 1.08,
            letterSpacing: '-0.025em', position: 'relative', zIndex: 1,
          }}>
            Help Us Build A{' '}
            <span style={{ background: 'linear-gradient(135deg, #06b6d4, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Better City.
            </span>
          </h1>

          <p style={{
            fontSize: '1.12rem', color: 'rgba(148,163,184,.88)',
            maxWidth: '680px', margin: '0 auto 44px auto', lineHeight: 1.75,
            position: 'relative', zIndex: 1,
          }}>
            Smart Infra is a community-driven platform designed to connect citizens directly with municipal engineering teams. Notice a dangerous pothole, a broken streetlight, or a damaged bridge? Report it here instantly.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <button
              className="btn btn-primary ch-btn-primary"
              onClick={() => navigate('/report')}
              style={{
                padding: '15px 40px', fontSize: '0.95rem', fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                border: 'none', borderRadius: '12px', color: 'white',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px',
                boxShadow: '0 0 28px rgba(6,182,212,.32)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Report an Issue
            </button>
            <button
              className="btn btn-secondary ch-btn-ghost"
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '15px 40px', fontSize: '0.95rem', fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                background: 'transparent',
                border: '1px solid rgba(148,163,184,.3)',
                borderRadius: '12px', color: 'rgba(148,163,184,.88)',
                cursor: 'pointer', transition: 'border-color .2s, color .2s, background .2s',
              }}
            >
              View My Reports
            </button>
          </div>

          {/* divider dots */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginTop: '48px', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '70px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(6,182,212,.5))' }} />
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 12px #06b6d4' }} />
            <div style={{ width: '70px', height: '1px', background: 'linear-gradient(270deg, transparent, rgba(6,182,212,.5))' }} />
          </div>
        </div>

        {/* ── Core Benefits ── */}
        <div style={{ marginBottom: '72px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }} className="animate-fade-in delay-2">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', padding: '6px 18px', background: 'rgba(6,182,212,.07)', border: '1px solid rgba(6,182,212,.22)', borderRadius: '40px', marginBottom: '18px' }}>
              <span style={{ color: '#06b6d4', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', fontFamily: "'Space Mono', monospace" }}>PLATFORM BENEFITS</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.7rem)', color: 'white', fontWeight: 800, fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em', marginBottom: '10px' }}>Platform Benefits</h2>
            <p style={{ color: 'rgba(148,163,184,.82)', fontSize: '1.02rem' }}>How participating in Smart Infra creates a better community.</p>
          </div>

          <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>

            <div className="glass-panel animate-fade-in delay-2 ch-card" style={{
              padding: '32px 28px',
              background: 'rgba(8,12,22,.82)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(6,182,212,.22)',
              borderRadius: '20px',
              boxShadow: '0 0 40px rgba(6,182,212,.18), inset 0 1px 0 rgba(255,255,255,.04)',
              position: 'relative', overflow: 'hidden',
              transition: 'transform .3s ease, box-shadow .3s ease',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #06b6d4, transparent)' }} />
              <div style={{ width: '50px', height: '50px', borderRadius: '13px', background: 'rgba(6,182,212,.12)', border: '1px solid rgba(6,182,212,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', color: '#06b6d4' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(6,182,212,.1)', border: '1px solid rgba(6,182,212,.28)', borderRadius: '30px', padding: '3px 12px', marginBottom: '12px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 6px #06b6d4', display: 'inline-block' }} />
                <span style={{ color: '#06b6d4', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', fontFamily: "'Space Mono', monospace" }}>FAST ROUTING</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '10px', fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>Rapid City Response</h3>
              <p style={{ color: 'rgba(148,163,184,.85)', fontSize: '0.93rem', lineHeight: 1.75, margin: 0 }}>Reports are instantly routed to the central municipal dashboard, allowing engineering teams to dispatch resources without bureaucratic delays.</p>
            </div>

            <div className="glass-panel animate-fade-in delay-3 ch-card" style={{
              padding: '32px 28px',
              background: 'rgba(8,12,22,.82)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139,92,246,.22)',
              borderRadius: '20px',
              boxShadow: '0 0 40px rgba(139,92,246,.18), inset 0 1px 0 rgba(255,255,255,.04)',
              position: 'relative', overflow: 'hidden',
              transition: 'transform .3s ease, box-shadow .3s ease',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #8b5cf6, transparent)' }} />
              <div style={{ width: '50px', height: '50px', borderRadius: '13px', background: 'rgba(139,92,246,.12)', border: '1px solid rgba(139,92,246,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', color: '#8b5cf6' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.28)', borderRadius: '30px', padding: '3px 12px', marginBottom: '12px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#8b5cf6', boxShadow: '0 0 6px #8b5cf6', display: 'inline-block' }} />
                <span style={{ color: '#8b5cf6', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', fontFamily: "'Space Mono', monospace" }}>FULL VISIBILITY</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '10px', fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>Full Transparency</h3>
              <p style={{ color: 'rgba(148,163,184,.85)', fontSize: '0.93rem', lineHeight: 1.75, margin: 0 }}>Never wonder what happened to your report. Track the exact status (Under Review, Assigned, Resolved) directly from your personal dashboard.</p>
            </div>

            <div className="glass-panel animate-fade-in delay-4 ch-card" style={{
              padding: '32px 28px',
              background: 'rgba(8,12,22,.82)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(16,185,129,.22)',
              borderRadius: '20px',
              boxShadow: '0 0 40px rgba(16,185,129,.18), inset 0 1px 0 rgba(255,255,255,.04)',
              position: 'relative', overflow: 'hidden',
              transition: 'transform .3s ease, box-shadow .3s ease',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #10b981, transparent)' }} />
              <div style={{ width: '50px', height: '50px', borderRadius: '13px', background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', color: '#10b981' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.28)', borderRadius: '30px', padding: '3px 12px', marginBottom: '12px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', display: 'inline-block' }} />
                <span style={{ color: '#10b981', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', fontFamily: "'Space Mono', monospace" }}>ANALYTICS</span>
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'white', marginBottom: '10px', fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>Data-Driven Impact</h3>
              <p style={{ color: 'rgba(148,163,184,.85)', fontSize: '0.93rem', lineHeight: 1.75, margin: 0 }}>Your isolated reports aggregate into real-time analytics, helping city planners allocate infrastructure budgets to areas that need them most.</p>
            </div>

          </div>
        </div>

        {/* ── Visual Examples Gallery ── */}
        <div style={{ marginBottom: '72px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }} className="animate-fade-in delay-2">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', padding: '6px 18px', background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.22)', borderRadius: '40px', marginBottom: '18px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', display: 'inline-block', animation: 'ch-blink 1.5s infinite' }} />
              <span style={{ color: '#ef4444', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.15em', fontFamily: "'Space Mono', monospace" }}>LIVE FEED</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.7rem)', color: 'white', fontWeight: 800, fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em', marginBottom: '10px' }}>Recently Reported</h2>
            <p style={{ color: 'rgba(148,163,184,.82)', fontSize: '1.02rem' }}>See real examples of infrastructure damage submitted by citizens like you.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '22px' }}>

            {/* Example 1 - Damaged Road */}
            <div className="glass-panel animate-fade-in delay-2 ch-card" style={{
              padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column',
              background: 'rgba(8,12,22,.85)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(239,68,68,.22)',
              borderRadius: '20px',
              boxShadow: '0 0 36px rgba(239,68,68,.14)',
              transition: 'transform .3s ease',
            }}>
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img src="/images/media__1773395412684.jpg" alt="Severely Damaged Road" style={{ width: '100%', height: '180px', objectFit: 'cover', filter: 'brightness(.75) saturate(.9)', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 45%, rgba(239,68,68,.18))' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #ef4444, transparent)' }} />
              </div>
              <div style={{ padding: '20px 22px' }}>
                <span style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, border: '1px solid rgba(239,68,68,.3)', fontFamily: "'Space Mono', monospace", letterSpacing: '0.04em' }}>High Priority Hazard</span>
                <h4 style={{ color: 'white', fontSize: '1.08rem', margin: '12px 0 8px 0', fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>Severe Road Fissures</h4>
                <p style={{ color: 'rgba(148,163,184,.86)', fontSize: '0.86rem', margin: 0, lineHeight: 1.7 }}>Deep asphalt fissures and sinkholes drastically increase the risk of high-speed vehicular roll-overs, severe tire blowouts, and night-time pedestrian injuries.</p>
              </div>
            </div>

            {/* Example 2 - Cracked Building */}
            <div className="glass-panel animate-fade-in delay-3 ch-card" style={{
              padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column',
              background: 'rgba(8,12,22,.85)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(249,115,22,.22)',
              borderRadius: '20px',
              boxShadow: '0 0 36px rgba(249,115,22,.14)',
              transition: 'transform .3s ease',
            }}>
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img src="/images/media__1773395421940.jpg" alt="Cracked Building Structure" style={{ width: '100%', height: '180px', objectFit: 'cover', filter: 'brightness(.75) saturate(.9)', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 45%, rgba(249,115,22,.18))' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #f97316, transparent)' }} />
              </div>
              <div style={{ padding: '20px 22px' }}>
                <span style={{ background: 'rgba(239,68,68,.1)', color: '#ef4444', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, border: '1px solid rgba(239,68,68,.3)', fontFamily: "'Space Mono', monospace", letterSpacing: '0.04em' }}>Critical Priority</span>
                <h4 style={{ color: 'white', fontSize: '1.08rem', margin: '12px 0 8px 0', fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>Structural Wall Cracks</h4>
                <p style={{ color: 'rgba(148,163,184,.86)', fontSize: '0.86rem', margin: 0, lineHeight: 1.7 }}>Deep load-bearing wall cracks indicate compromised foundational integrity. Unreported, this risks imminent and catastrophic building collapse during weather stress.</p>
              </div>
            </div>

            {/* Example 3 - Broken Streetlight */}
            <div className="glass-panel animate-fade-in delay-4 ch-card" style={{
              padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column',
              background: 'rgba(8,12,22,.85)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(234,179,8,.22)',
              borderRadius: '20px',
              boxShadow: '0 0 36px rgba(234,179,8,.12)',
              transition: 'transform .3s ease',
            }}>
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                <img src="/images/media__1773395302653.jpg" alt="Exposed Streetlight" style={{ width: '100%', height: '180px', objectFit: 'cover', filter: 'brightness(0.8)', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 45%, rgba(234,179,8,.15))' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #eab308, transparent)' }} />
              </div>
              <div style={{ padding: '20px 22px' }}>
                <span style={{ background: 'rgba(234,179,8,.1)', color: '#eab308', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, border: '1px solid rgba(234,179,8,.3)', fontFamily: "'Space Mono', monospace", letterSpacing: '0.04em' }}>Medium Priority</span>
                <h4 style={{ color: 'white', fontSize: '1.08rem', margin: '12px 0 8px 0', fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>Exposed Wiring/Outage</h4>
                <p style={{ color: 'rgba(148,163,184,.86)', fontSize: '0.86rem', margin: 0, lineHeight: 1.7 }}>Broken street fixtures with exposed live wiring pose a lethal electrocution hazard to pets and children, while compounding night-time vehicular collision rates.</p>
              </div>
            </div>

          </div>
        </div>

        {/* ── Call to Action for Reporting Flow ── */}
        <div className="glass-panel animate-fade-in delay-3" style={{
          marginBottom: '72px', padding: '52px 40px', textAlign: 'center',
          background: 'rgba(6,10,20,.88)',
          border: '1px solid rgba(6,182,212,.18)',
          borderRadius: '28px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 80px rgba(6,182,212,.07)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* grid texture */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: '28px', backgroundImage: 'linear-gradient(rgba(6,182,212,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,.04) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
          {/* top line */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '180px', height: '2px', background: 'linear-gradient(90deg, transparent, #06b6d4, #10b981, transparent)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ width: '60px', height: '60px', margin: '0 auto 20px auto', background: 'rgba(6,182,212,.1)', border: '1px solid rgba(6,182,212,.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4', animation: 'ch-float 3s ease-in-out infinite' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: 'white', fontWeight: 800, fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em', marginBottom: '14px' }}>Wondering How It Works?</h2>
            <p style={{ color: 'rgba(148,163,184,.85)', fontSize: '1.02rem', maxWidth: '560px', margin: '0 auto 36px auto', lineHeight: 1.75 }}>
              Want to learn exactly what happens when you file an infrastructure report? View our comprehensive step-by-step breakdown of the reporting and municipal resolution process.
            </p>
            <button
              className="btn btn-secondary ch-learn"
              onClick={() => navigate('/how-it-works')}
              style={{
                padding: '14px 38px', fontSize: '0.93rem', fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                border: 'none', borderRadius: '12px', color: 'white',
                cursor: 'pointer',
                boxShadow: '0 0 26px rgba(6,182,212,.3)',
                transition: 'transform .2s ease, box-shadow .2s ease',
              }}
            >
              Learn How It Works →
            </button>
          </div>
        </div>

        {/* ── FAQ Preview ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '72px' }}>

          <div className="glass-panel animate-fade-in delay-4 ch-card" style={{
            background: 'rgba(8,12,22,.82)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(6,182,212,.18)',
            borderRadius: '20px', padding: '30px 28px',
            boxShadow: '0 0 40px rgba(6,182,212,.07)',
            position: 'relative', overflow: 'hidden',
            transition: 'transform .3s ease',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '100%', background: 'linear-gradient(180deg, #06b6d4, transparent)' }} />
            <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '12px', fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>What can you report?</h3>
            <p style={{ color: 'rgba(148,163,184,.8)', fontSize: '0.92rem', marginBottom: '18px', lineHeight: 1.7 }}>Our system categorizes problems to route them to the correct engineering department.</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['Roads & Potholes','Fallen Trees','Bridge Damage','Broken Streetlights','Public Utilities'].map((cat) => (
                <span key={cat} className="ch-cat" style={{ padding: '6px 14px', background: 'rgba(6,182,212,.06)', borderRadius: '8px', color: 'rgba(148,163,184,.86)', border: '1px solid rgba(6,182,212,.14)', fontSize: '0.83rem', cursor: 'default', transition: 'background .2s, border-color .2s, color .2s' }}>{cat}</span>
              ))}
            </div>
          </div>

          <div className="glass-panel animate-fade-in delay-5 ch-card" style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            background: 'rgba(8,12,22,.82)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(139,92,246,.18)',
            borderRadius: '20px', padding: '30px 28px',
            boxShadow: '0 0 40px rgba(139,92,246,.07)',
            position: 'relative', overflow: 'hidden',
            transition: 'transform .3s ease',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '100%', background: 'linear-gradient(180deg, #8b5cf6, transparent)' }} />
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.25)', borderRadius: '30px', padding: '4px 14px', marginBottom: '14px', width: 'fit-content' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span style={{ color: '#8b5cf6', fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.14em', fontFamily: "'Space Mono', monospace" }}>DATA PRIVACY</span>
            </div>
            <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '12px', fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>Is my personal data shared?</h3>
            <p style={{ color: 'rgba(148,163,184,.85)', fontSize: '0.92rem', lineHeight: 1.75, margin: 0 }}>
              No. While reports pull your location to help crews find the damage, your personal information is kept strictly confidential within the municipal database. Your name is only used for internal verification.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default CitizenHome;