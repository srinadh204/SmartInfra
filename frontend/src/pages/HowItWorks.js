import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';

const steps = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16M4 12h10M4 18h14"/>
        <circle cx="19" cy="18" r="3"/>
      </svg>
    ),
    tag: "STEP 01",
    title: "Select Damage Category",
    desc: "Choose the infrastructure type from the dropdown — Road / Pothole, Bridge, Streetlight, Public Building, or Other. Reports are auto-routed to the right engineering team.",
    accent: "#06b6d4",
    glow: "rgba(6,182,212,0.25)",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    tag: "STEP 02",
    title: "Select Severity Level",
    desc: "Assign urgency — Low, Medium, High, or Critical. Critical issues are instantly flagged for emergency dispatch.",
    accent: "#f59e0b",
    glow: "rgba(245,158,11,0.25)",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    tag: "STEP 03",
    title: "Provide a Description",
    desc: "Describe the damage clearly. Detail the nature of the issue and potential community impact so maintenance crews arrive prepared with the right equipment.",
    accent: "#8b5cf6",
    glow: "rgba(139,92,246,0.25)",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    tag: "STEP 04",
    title: "Enter the Address",
    desc: "Type the nearest street address or intersection. Be as precise as possible — especially for hard-to-spot damage in areas with few landmarks.",
    accent: "#10b981",
    glow: "rgba(16,185,129,0.25)",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    tag: "STEP 05",
    title: "Capture GPS Coordinates",
    desc: "Hit 'Auto Detect' to pull your exact latitude and longitude. Invaluable for damage along long highways where street addresses are scarce.",
    accent: "#06b6d4",
    glow: "rgba(6,182,212,0.25)",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
    tag: "STEP 06",
    title: "Upload Photo Evidence",
    desc: "Drag and drop or click to attach JPG/PNG images. Clear photos let dispatchers verify severity and send appropriate vehicles and crew.",
    accent: "#ec4899",
    glow: "rgba(236,72,153,0.25)",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    ),
    tag: "STEP 07",
    title: "Submit the Report",
    desc: "Click 'Submit Report'. The platform encrypts and bundles your data, GPS, and images — transmitting them directly into the city's maintenance feed.",
    accent: "#f59e0b",
    glow: "rgba(245,158,11,0.25)",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    tag: "STEP 08",
    title: "Track Your Report Status",
    desc: "A confirmation screen appears on submit. From your Dashboard, watch the report transition from 'Under Review' → 'Assigned' → 'Resolved' in real-time.",
    accent: "#10b981",
    glow: "rgba(16,185,129,0.25)",
  },
];

function StepCard({ step, index, isVisible }) {
  const isEven = index % 2 === 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isEven ? 'row' : 'row-reverse',
        alignItems: 'center',
        gap: '0',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.6s ease ${index * 0.08}s, transform 0.6s ease ${index * 0.08}s`,
        position: 'relative',
      }}
    >
      {/* Content side */}
      <div style={{ flex: 1, padding: isEven ? '0 48px 0 0' : '0 0 0 48px' }}>
        <div
          style={{
            background: 'rgba(10,12,20,0.75)',
            border: `1px solid ${step.accent}33`,
            borderRadius: '20px',
            padding: '32px 36px',
            position: 'relative',
            overflow: 'hidden',
            backdropFilter: 'blur(20px)',
            boxShadow: `0 0 40px ${step.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'default',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = `0 12px 60px ${step.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 0 40px ${step.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`;
          }}
        >
          {/* Corner accent line */}
          <div style={{
            position: 'absolute', top: 0, left: isEven ? 'auto' : 0, right: isEven ? 0 : 'auto',
            width: '80px', height: '2px',
            background: `linear-gradient(${isEven ? '270deg' : '90deg'}, transparent, ${step.accent})`,
          }} />
          <div style={{
            position: 'absolute', top: 0, left: isEven ? 'auto' : 0, right: isEven ? 0 : 'auto',
            width: '2px', height: '80px',
            background: `linear-gradient(180deg, ${step.accent}, transparent)`,
          }} />

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: `${step.accent}15`, border: `1px solid ${step.accent}40`,
            borderRadius: '30px', padding: '4px 14px', marginBottom: '16px',
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: step.accent, boxShadow: `0 0 8px ${step.accent}`,
            }} />
            <span style={{ color: step.accent, fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', fontFamily: "'Space Mono', monospace" }}>
              {step.tag}
            </span>
          </div>

          <h3 style={{
            color: 'white', fontSize: '1.35rem', fontWeight: 700,
            marginBottom: '12px', lineHeight: 1.3,
            fontFamily: "'Syne', sans-serif",
          }}>
            {step.title}
          </h3>

          <p style={{
            color: 'rgba(148,163,184,0.9)', fontSize: '0.97rem',
            lineHeight: 1.75, margin: 0,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {step.desc}
          </p>
        </div>
      </div>

      {/* Center node */}
      <div style={{
        flexShrink: 0, width: '72px', height: '72px',
        position: 'relative', zIndex: 3,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: `radial-gradient(circle, ${step.accent}20, rgba(0,0,0,0.8))`,
          border: `2px solid ${step.accent}`,
          boxShadow: `0 0 20px ${step.glow}, 0 0 60px ${step.glow}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: step.accent,
          transition: 'transform 0.3s ease',
        }}>
          {step.icon}
        </div>
      </div>

      {/* Empty side */}
      <div style={{ flex: 1 }} />
    </div>
  );
}

function HowItWorks() {
  const navigate = useNavigate();
  const [visibleSteps, setVisibleSteps] = useState(new Set());
  const stepRefs = useRef([]);

  useEffect(() => {
    // Load Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Mono:wght@700&family=DM+Sans:wght@400;500&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.idx, 10);
            setVisibleSteps((prev) => new Set([...prev, idx]));
          }
        });
      },
      { threshold: 0.15 }
    );

    stepRefs.current.forEach((ref) => { if (ref) observer.observe(ref); });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="app-container" style={{ minHeight: '100vh', position: 'relative', fontFamily: "'DM Sans', sans-serif" }}>
      <AnimatedBackground />
      <Navbar />

      {/* Ambient orbs */}
      <div style={{ position: 'fixed', top: '10%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '60px 24px 100px', position: 'relative', zIndex: 1 }}>

        {/* Hero Header */}
        <div style={{ textAlign: 'center', marginBottom: '100px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '8px 20px',
            background: 'rgba(6,182,212,0.07)',
            border: '1px solid rgba(6,182,212,0.25)',
            borderRadius: '40px', marginBottom: '28px',
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 10px #06b6d4', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ color: '#06b6d4', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.15em', fontFamily: "'Space Mono', monospace" }}>THE PROCESS</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 5vw, 4rem)', fontWeight: 800,
            fontFamily: "'Syne', sans-serif",
            color: 'white', lineHeight: 1.1, marginBottom: '24px',
            letterSpacing: '-0.02em',
          }}>
            How{' '}
            <span style={{
              background: 'linear-gradient(135deg, #06b6d4, #10b981)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Smart Infra
            </span>{' '}
            Works
          </h1>

          <p style={{
            fontSize: '1.15rem', color: 'rgba(148,163,184,0.85)',
            maxWidth: '660px', margin: '0 auto', lineHeight: 1.75,
          }}>
            Follow this step-by-step guide to report infrastructure damage to municipal authorities and ensure a swift, structured resolution.
          </p>

          {/* Decorative line */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '40px' }}>
            <div style={{ width: '60px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.5))' }} />
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#06b6d4', boxShadow: '0 0 10px #06b6d4' }} />
            <div style={{ width: '60px', height: '1px', background: 'linear-gradient(270deg, transparent, rgba(6,182,212,0.5))' }} />
          </div>
        </div>

        {/* Steps with vertical timeline */}
        <div style={{ position: 'relative' }}>
          {/* Center vertical line */}
          <div style={{
            position: 'absolute',
            left: '50%', top: 0, bottom: 0,
            width: '1px',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(180deg, transparent, rgba(6,182,212,0.3) 10%, rgba(6,182,212,0.3) 90%, transparent)',
            zIndex: 0,
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', position: 'relative', zIndex: 1 }}>
            {steps.map((step, idx) => (
              <div
                key={idx}
                data-idx={idx}
                ref={(el) => (stepRefs.current[idx] = el)}
              >
                <StepCard step={step} index={idx} isVisible={visibleSteps.has(idx)} />
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div style={{
          marginTop: '100px', textAlign: 'center',
          background: 'rgba(6,10,20,0.8)',
          border: '1px solid rgba(6,182,212,0.2)',
          borderRadius: '28px', padding: '60px 40px',
          position: 'relative', overflow: 'hidden',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 80px rgba(6,182,212,0.08)',
        }}>
          {/* Background grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            borderRadius: '28px',
          }} />
          {/* Top accent */}
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '200px', height: '2px',
            background: 'linear-gradient(90deg, transparent, #06b6d4, #10b981, transparent)',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: '30px', padding: '5px 16px', marginBottom: '24px',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', display: 'inline-block' }} />
              <span style={{ color: '#10b981', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.15em', fontFamily: "'Space Mono', monospace" }}>SYSTEM READY</span>
            </div>

            <h2 style={{
              color: 'white', fontFamily: "'Syne', sans-serif",
              fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800,
              marginBottom: '16px', letterSpacing: '-0.02em',
            }}>
              Ready to Make an Impact?
            </h2>

            <p style={{
              color: 'rgba(148,163,184,0.85)', fontSize: '1.05rem',
              maxWidth: '500px', margin: '0 auto 40px', lineHeight: 1.7,
            }}>
              Now that you know how the system works, file your first report and help improve city infrastructure.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/report')}
                style={{
                  padding: '16px 40px', fontSize: '0.95rem', fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                  border: 'none', borderRadius: '12px', color: 'white',
                  cursor: 'pointer', letterSpacing: '0.02em',
                  boxShadow: '0 0 30px rgba(6,182,212,0.35)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(6,182,212,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(6,182,212,0.35)'; }}
              >
                Report an Issue Now →
              </button>

              <button
                onClick={() => navigate('/home')}
                style={{
                  padding: '16px 40px', fontSize: '0.95rem', fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  background: 'transparent',
                  border: '1px solid rgba(148,163,184,0.3)',
                  borderRadius: '12px', color: 'rgba(148,163,184,0.9)',
                  cursor: 'pointer', letterSpacing: '0.02em',
                  transition: 'border-color 0.2s ease, color 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(148,163,184,0.7)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(148,163,184,0.3)'; e.currentTarget.style.color = 'rgba(148,163,184,0.9)'; }}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}

export default HowItWorks;