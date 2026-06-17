// 📝 NOTE: LoginPage.js — FINAL version with FIXED real sunflower SVG
// 📝 NOTE: Sunflowers now have 12 outer petals + 12 inner petals + seed disc
// 📝 NOTE: ALL authentication logic 100% unchanged

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader, AlertCircle } from 'lucide-react';
import API_BASE from '../config';

function LoginPage() {

  // ─── STATE (UNCHANGED) ──────────────────────────────────────────────────────
  const navigate = useNavigate();
  const [formData, setFormData]         = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  // ─── HANDLERS (UNCHANGED) ───────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Cannot connect to server. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── SHARED INPUT STYLE ─────────────────────────────────────────────────────
  const inputStyle = {
    width: '100%', padding: '11px 40px 11px 36px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.11)',
    borderRadius: 10, fontSize: 13, color: '#f8fafc', outline: 'none',
  };
  const onFocus = (e) => {
    e.target.style.borderColor = 'rgba(22,163,74,0.65)';
    e.target.style.background  = 'rgba(22,163,74,0.08)';
    e.target.style.boxShadow   = '0 0 0 3px rgba(22,163,74,0.15)';
  };
  const onBlur = (e) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.11)';
    e.target.style.background  = 'rgba(255,255,255,0.07)';
    e.target.style.boxShadow   = 'none';
  };

  // ─── SUNFLOWER PETAL HELPER ─────────────────────────────────────────────────
  // 📝 NOTE: This function generates all 12 petals for one sunflower
  // 📝 NOTE: Each petal is an ellipse rotated around the flower centre
  // 📝 NOTE: rx = petal width, ry = petal length, cy = distance from centre
  const renderPetals = (outerRx, outerRy, outerCy, innerRx, innerRy, innerCy) => (
    <>
      {/* 📝 NOTE: 12 OUTER petals — every 30 degrees (360 / 12 = 30) */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map(deg => (
        <ellipse
          key={`o${deg}`}
          cx="0" cy={outerCy}
          rx={outerRx} ry={outerRy}
          fill="#f5c842"
          transform={`rotate(${deg})`}
          opacity="0.95"
        />
      ))}
      {/* 📝 NOTE: 12 INNER petals — offset by 15deg to fill gaps between outer */}
      {[15,45,75,105,135,165,195,225,255,285,315,345].map(deg => (
        <ellipse
          key={`i${deg}`}
          cx="0" cy={innerCy}
          rx={innerRx} ry={innerRy}
          fill="#e8b820"
          transform={`rotate(${deg})`}
          opacity="0.7"
        />
      ))}
    </>
  );

  // ─── SEED DOT HELPER ────────────────────────────────────────────────────────
  // 📝 NOTE: Small dots on the dark brown centre disc = sunflower seed pattern
  const SeedDots = ({ r }) => (
    <>
      <circle cx="0"    cy={-r*0.5} r="2"   fill="#5d3200" opacity="0.85"/>
      <circle cx={r*0.4}  cy={-r*0.3} r="2"   fill="#5d3200" opacity="0.85"/>
      <circle cx={r*0.5}  cy={r*0.2}  r="2"   fill="#5d3200" opacity="0.85"/>
      <circle cx="0"    cy={r*0.55}  r="2"   fill="#5d3200" opacity="0.85"/>
      <circle cx={-r*0.4} cy={r*0.3}  r="2"   fill="#5d3200" opacity="0.85"/>
      <circle cx={-r*0.5} cy={-r*0.2} r="2"   fill="#5d3200" opacity="0.85"/>
      <circle cx={r*0.2}  cy="0"      r="1.5" fill="#7a4500" opacity="0.6"/>
      <circle cx={-r*0.2} cy="0"      r="1.5" fill="#7a4500" opacity="0.6"/>
    </>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#0c1f0e' }}
    >

      {/* ═══════════════════════════════════════════════════════════════════
          ILLUSTRATED SVG BACKGROUND — FIXED SUNFLOWERS 🌻
          📝 NOTE: Sunflowers now use proper petal technique:
                   - renderPetals() draws 24 ellipses per flower (12+12)
                   - Each ellipse is positioned at cy=-28 (above centre)
                   - rotate(deg) spins it around the centre point (0,0)
                   - This creates a perfect radial petal arrangement
      ════════════════════════════════════════════════════════════════════ */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
        viewBox="0 0 700 620"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* ── ANIMATION KEYFRAMES ───────────────────────────────────────── */}
        <style>{`
          @keyframes sway {
            0%,100% { transform: rotate(-3deg); }
            50%      { transform: rotate(3deg);  }
          }
          @keyframes drip {
            0%,100% { transform: translateY(0px);  }
            50%     { transform: translateY(7px);  }
          }
          @keyframes floatLeaf {
            0%,100% { transform: translateY(0px)  rotate(0deg); }
            50%     { transform: translateY(-9px) rotate(6deg); }
          }
          .sf1 { transform-origin: 80px 580px;  animation: sway 4s ease-in-out infinite; }
          .sf2 { transform-origin: 620px 580px; animation: sway 5s ease-in-out infinite 0.6s; }
          .sp1 { transform-origin: 580px 590px; animation: sway 6s ease-in-out infinite 1s; }
          .sp2 { transform-origin: 130px 590px; animation: sway 5.5s ease-in-out infinite 0.8s; }
          .d1  { animation: drip 3s ease-in-out infinite; }
          .d2  { animation: drip 4s ease-in-out infinite 1s; }
          .d3  { animation: drip 3.5s ease-in-out infinite 0.5s; }
          .l1  { animation: floatLeaf 5s ease-in-out infinite; }
          .l2  { animation: floatLeaf 6s ease-in-out infinite 1.5s; }
          .l3  { animation: floatLeaf 7s ease-in-out infinite 2s; }
        `}</style>

        {/* Dark base */}
        <rect width="700" height="620" fill="#0c1f0e" />

        {/* ── LEFT SUNFLOWER ────────────────────────────────────────────── */}
        {/* 📝 NOTE: Ground shadow ellipse makes it look planted in soil    */}
        <ellipse cx="80" cy="575" rx="65" ry="16" fill="rgba(22,163,74,0.15)" />
        <g className="sf1">
          {/* Stem */}
          <rect x="77" y="340" width="6" height="235" rx="3" fill="#1a5c1a" />
          {/* Stem leaves — angled ellipses left and right of stem */}
          <ellipse cx="60" cy="420" rx="24" ry="10" fill="#1a6b1a" opacity="0.8"
            transform="rotate(-30 60 420)" />
          <ellipse cx="100" cy="460" rx="24" ry="10" fill="#1a6b1a" opacity="0.8"
            transform="rotate(30 100 460)" />

          {/* 📝 NOTE: translate(80,310) moves origin to flower head centre
              📝 NOTE: All petals draw relative to (0,0) = flower centre   */}
          <g transform="translate(80, 310)">
            {renderPetals(7, 16, -28, 5, 11, -20)}
            {/* Dark seed disc */}
            <circle cx="0" cy="0" r="14" fill="#3d1f00" />
            <SeedDots r={14} />
          </g>
        </g>

        {/* ── RIGHT SUNFLOWER ───────────────────────────────────────────── */}
        <ellipse cx="620" cy="575" rx="65" ry="16" fill="rgba(22,163,74,0.15)" />
        <g className="sf2">
          <rect x="617" y="345" width="6" height="230" rx="3" fill="#1a5c1a" />
          <ellipse cx="600" cy="425" rx="22" ry="10" fill="#1a6b1a" opacity="0.8"
            transform="rotate(-30 600 425)" />
          <ellipse cx="638" cy="465" rx="22" ry="10" fill="#1a6b1a" opacity="0.8"
            transform="rotate(30 638 465)" />
          <g transform="translate(620, 315)">
            {renderPetals(6.5, 15, -26, 4.5, 10, -18)}
            <circle cx="0" cy="0" r="13" fill="#3d1f00" />
            <SeedDots r={13} />
          </g>
        </g>

        {/* ── SMALL PLANT — bottom right ────────────────────────────────── */}
        <g className="sp1">
          <rect x="577" y="445" width="5" height="145" rx="2" fill="#155215" />
          <ellipse cx="562" cy="460" rx="17" ry="8" fill="#1a6b1a" opacity="0.7"
            transform="rotate(-30 562 460)" />
          <ellipse cx="595" cy="472" rx="17" ry="8" fill="#1a6b1a" opacity="0.7"
            transform="rotate(30 595 472)" />
          <ellipse cx="580" cy="440" rx="13" ry="20" fill="#1e7a1e" opacity="0.6" />
        </g>

        {/* ── SMALL PLANT — bottom left ─────────────────────────────────── */}
        <g className="sp2">
          <rect x="127" y="450" width="5" height="140" rx="2" fill="#155215" />
          <ellipse cx="113" cy="465" rx="17" ry="8" fill="#1a6b1a" opacity="0.7"
            transform="rotate(-30 113 465)" />
          <ellipse cx="145" cy="476" rx="17" ry="8" fill="#1a6b1a" opacity="0.7"
            transform="rotate(30 145 476)" />
          <ellipse cx="130" cy="445" rx="13" ry="20" fill="#1e7a1e" opacity="0.6" />
        </g>

        {/* ── OIL DROPS ─────────────────────────────────────────────────── */}
        {/* 📝 NOTE: SVG path draws teardrop = classic oil drop shape       */}
        <g className="d1">
          <path d="M560 55 C560 55 544 82 544 96 C544 106 551 113 560 113
                   C569 113 576 106 576 96 C576 82 560 55 560 55Z"
            fill="#f59e0b" opacity="0.85" />
          <ellipse cx="553" cy="94" rx="4" ry="7"
            fill="rgba(255,255,255,0.22)" transform="rotate(-15 553 94)" />
        </g>
        <g className="d2">
          <path d="M598 95 C598 95 587 116 587 127 C587 134 592 140 598 140
                   C605 140 610 134 610 127 C610 116 598 95 598 95Z"
            fill="#f59e0b" opacity="0.55" />
        </g>
        <g className="d3">
          <path d="M140 75 C140 75 128 97 128 108 C128 116 133 121 140 121
                   C147 121 152 116 152 108 C152 97 140 75 140 75Z"
            fill="#f59e0b" opacity="0.7" />
          <ellipse cx="134" cy="106" rx="3" ry="6"
            fill="rgba(255,255,255,0.2)" transform="rotate(-15 134 106)" />
        </g>

        {/* ── FLOATING LEAVES ───────────────────────────────────────────── */}
        <g className="l1" opacity="0.5">
          <ellipse cx="500" cy="155" rx="22" ry="9" fill="#1e7a1e"
            transform="rotate(-35 500 155)" />
          <line x1="500" y1="146" x2="500" y2="164"
            stroke="#16a34a" strokeWidth="1" transform="rotate(-35 500 155)" />
        </g>
        <g className="l2" opacity="0.4">
          <ellipse cx="190" cy="195" rx="18" ry="7" fill="#1e7a1e"
            transform="rotate(20 190 195)" />
          <line x1="190" y1="188" x2="190" y2="202"
            stroke="#16a34a" strokeWidth="1" transform="rotate(20 190 195)" />
        </g>
        <g className="l3" opacity="0.35">
          <ellipse cx="640" cy="275" rx="16" ry="6" fill="#1e7a1e"
            transform="rotate(-15 640 275)" />
        </g>

        {/* ── PARTICLES ─────────────────────────────────────────────────── */}
        <circle cx="350" cy="75"  r="3"   fill="#f59e0b" opacity="0.5"  />
        <circle cx="420" cy="135" r="2"   fill="#f59e0b" opacity="0.35" />
        <circle cx="270" cy="115" r="2.5" fill="#f59e0b" opacity="0.4"  />
        <circle cx="480" cy="215" r="2"   fill="#4ade80" opacity="0.3"  />
        <circle cx="220" cy="295" r="1.5" fill="#4ade80" opacity="0.25" />
        <circle cx="530" cy="400" r="2"   fill="#f59e0b" opacity="0.3"  />

        {/* ── GROUND ────────────────────────────────────────────────────── */}
        <rect x="0" y="545" width="700" height="75" fill="#071209" opacity="0.55" />
        <ellipse cx="350" cy="568" rx="290" ry="32"
          fill="rgba(22,163,74,0.06)" />
      </svg>

      {/* Dark overlay — makes card readable over illustrated background */}
      <div
        className="absolute inset-0"
        style={{ zIndex: 1, background: 'rgba(8,18,9,0.60)' }}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          GLASS LOGIN CARD
      ════════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="relative w-full max-w-sm mx-4"
        style={{
          zIndex:              10,
          background:          'rgba(255,255,255,0.06)',
          border:              '1px solid rgba(255,255,255,0.13)',
          borderRadius:        20,
          backdropFilter:      'blur(18px)',
          WebkitBackdropFilter:'blur(18px)',
          padding:             '2.4rem 2.2rem',
        }}
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* AE Monogram */}
        <div
          className="flex items-center justify-center mx-auto mb-4 font-bold text-white"
          style={{
            width: 54, height: 54, borderRadius: 14, fontSize: 20,
            background:  'linear-gradient(135deg, #16a34a, #f59e0b)',
            boxShadow:   '0 6px 20px rgba(22,163,74,0.4)',
          }}
        >
          AE
        </div>

        {/* Brand name */}
        <div className="text-center mb-6">
          <h1 className="font-bold text-lg" style={{ color: '#f8fafc' }}>
            Arvi Edibles
          </h1>
          <p className="text-xs mt-1" style={{
            color: 'rgba(248,250,252,0.38)',
            letterSpacing: '1.2px', textTransform: 'uppercase',
          }}>
            Territory Management System
          </p>
          {/* Golden accent line */}
          <div className="mx-auto mt-3" style={{
            width: 32, height: 2, background: '#f59e0b', borderRadius: 2,
          }} />
        </div>

        {/* Form header */}
        <p className="text-xs font-semibold mb-1" style={{
          color: 'rgba(248,250,252,0.45)',
          letterSpacing: '0.8px', textTransform: 'uppercase',
        }}>
          Distributor Portal
        </p>
        <h2 className="text-xl font-bold mb-1" style={{ color: '#f8fafc' }}>
          Welcome back
        </h2>
        <p className="text-sm mb-6" style={{ color: 'rgba(248,250,252,0.45)' }}>
          Sign in to your territory dashboard
        </p>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-5 p-3 flex items-center gap-3"
              style={{
                background: 'rgba(239,68,68,0.12)',
                border:     '1px solid rgba(239,68,68,0.3)',
                borderRadius: 10,
              }}
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{ opacity: 0, scale: 0.97 }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0"
                style={{ color: '#f87171' }} />
              <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login form */}
        <form onSubmit={handleSubmit}>

          {/* Username */}
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-2" style={{
              color: 'rgba(248,250,252,0.45)',
              letterSpacing: '0.7px', textTransform: 'uppercase',
            }}>
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2
                               pointer-events-none text-sm"
                style={{ color: 'rgba(248,250,252,0.28)' }}>
                👤
              </span>
              <input
                type="text" name="username"
                value={formData.username} onChange={handleChange}
                placeholder="Enter your username" required
                style={inputStyle} onFocus={onFocus} onBlur={onBlur}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold" style={{
                color: 'rgba(248,250,252,0.45)',
                letterSpacing: '0.7px', textTransform: 'uppercase',
              }}>
                Password
              </label>
              <span className="text-xs cursor-pointer" style={{ color: '#4ade80' }}>
                Need help? Contact admin
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2
                               pointer-events-none text-sm"
                style={{ color: 'rgba(248,250,252,0.28)' }}>
                🔒
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password} onChange={handleChange}
                placeholder="Enter your password" required
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={onFocus} onBlur={onBlur}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(248,250,252,0.35)',
                }}
              >
                {showPassword
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye    className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <motion.button
            type="submit" disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{  scale: loading ? 1 : 0.97 }}
            className="w-full flex items-center justify-center gap-2
                       font-semibold text-white text-sm"
            style={{
              padding:      '12px',
              borderRadius: 10,
              border:       'none',
              cursor:       loading ? 'not-allowed' : 'pointer',
              background:   loading
                ? 'rgba(74,222,128,0.35)'
                : 'linear-gradient(135deg, #16a34a, #15803d)',
              boxShadow: loading ? 'none' : '0 4px 16px rgba(22,163,74,0.38)',
            }}
          >
            {loading ? (
              <><Loader className="w-4 h-4 animate-spin" /> Signing in...</>
            ) : (
              '🔐 Sign in to Dashboard'
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <p className="text-xs" style={{ color: 'rgba(248,250,252,0.28)' }}>
            default credentials
          </p>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Credentials hint */}
        <motion.div
          className="flex items-center gap-3"
          style={{
            background:   'rgba(245,158,11,0.09)',
            border:       '1px solid rgba(245,158,11,0.22)',
            borderRadius: 10, padding: '9px 13px',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <span style={{ fontSize: 15, color: '#f59e0b' }}>🔑</span>
          <p className="text-xs" style={{
            color: 'rgba(248,250,252,0.48)', lineHeight: 1.6,
          }}>
            Username:{' '}
            <strong style={{ color: '#fbbf24', fontWeight: 600 }}>admin</strong>
            {' · '}
            Password:{' '}
            <strong style={{ color: '#fbbf24', fontWeight: 600 }}>admin123</strong>
          </p>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-xs mt-5"
          style={{ color: 'rgba(248,250,252,0.2)', lineHeight: 1.7 }}>
          Arvi Edibles © 2026 · Internal Management System
          <br />
          <span style={{ color: 'rgba(248,250,252,0.13)' }}>
            Unauthorized access is strictly prohibited
          </span>
        </p>

      </motion.div>
    </div>
  );
}

export default LoginPage;