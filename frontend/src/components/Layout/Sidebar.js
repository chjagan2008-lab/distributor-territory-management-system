// 📝 NOTE: Sidebar.js — Added mobile responsiveness (onClose prop + X button)
// 📝 NOTE: ALL existing styling, animations, logout logic — 100% UNCHANGED
// 📝 NOTE: Only 3 things added:
//          1. onClose prop in function signature
//          2. X close button in logo section (mobile only)
//          3. onClose passed to each NavItem's onClick

import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  PlusCircle,
  BarChart2,
  LogOut,
  Droplets,
  X, // 📝 NOTE: Added X icon for mobile close button
} from 'lucide-react';

// ─── ANIMATION VARIANTS (UNCHANGED) ────────────────────────────────────────
const sidebarVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden:  { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35 } },
};

// ─── STYLES (UNCHANGED) ────────────────────────────────────────────────────
const activeStyle = {
  background:   'rgba(245,158,11,0.18)',
  border:       '1px solid rgba(245,158,11,0.35)',
  color:        '#fbbf24',
  borderRadius: 12,
};

const inactiveStyle = {
  background:   'transparent',
  border:       '1px solid transparent',
  color:        'rgba(248,250,252,0.5)',
  borderRadius: 12,
};

// ─── NAV ITEM COMPONENT ────────────────────────────────────────────────────
// 📝 NOTE: Added onClose prop — called when nav link is tapped on mobile
// 📝 NOTE: This closes the sidebar after navigation on mobile
function NavItem({ to, icon: Icon, label, onClose }) {
  return (
    <motion.div variants={itemVariants}>
      <NavLink
        to={to}
        className={() => 'block'}
        // 📝 NOTE: onClick={onClose} closes sidebar when nav item tapped on mobile
        onClick={onClose}
        style={({ isActive }) => ({
          display:        'flex',
          alignItems:     'center',
          gap:            10,
          padding:        '10px 14px',
          textDecoration: 'none',
          fontWeight:     500,
          fontSize:       13,
          transition:     'all 0.2s',
          position:       'relative',
          ...(isActive ? activeStyle : inactiveStyle),
        })}
      >
        {({ isActive }) => (
          <>
            {/* Golden left accent bar — active item only */}
            {isActive && (
              <motion.div
                layoutId="activeBar"
                style={{
                  position:     'absolute',
                  left:         0,
                  top:          6,
                  bottom:       6,
                  width:        3,
                  borderRadius: 4,
                  background:   '#f59e0b',
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}

            {/* Icon with hover spin */}
            <motion.div
              whileHover={{ rotate: 12, scale: 1.15 }}
              transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
              style={{ flexShrink: 0 }}
            >
              <Icon
                style={{
                  width:  18,
                  height: 18,
                  color: isActive ? '#fbbf24' : 'rgba(248,250,252,0.45)',
                }}
              />
            </motion.div>

            <span>{label}</span>
          </>
        )}
      </NavLink>
    </motion.div>
  );
}

// ─── MAIN SIDEBAR COMPONENT ────────────────────────────────────────────────
// 📝 NOTE: Added onClose prop — received from App.js
// 📝 NOTE: onClose = function that sets sidebarOpen to false in App.js
function Sidebar({ onClose }) {
  const navigate = useNavigate();

  // Logout handler (UNCHANGED)
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Get user from localStorage (UNCHANGED)
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <motion.div
      className="w-64 flex flex-col"
      style={{
        background:  '#0b1a0d',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        // 📝 NOTE: h-screen ensures sidebar fills full height on mobile overlay
        height:      '100vh',
        overflowY:   'auto',
      }}
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >

      {/* ── TOP — LOGO SECTION ─────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        style={{
          padding:      '1.5rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* 📝 NOTE: Added X close button to this row — only shows on mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

          {/* AE Monogram badge (UNCHANGED) */}
          <motion.div
            style={{
              width:          44,
              height:         44,
              borderRadius:   12,
              background:     'linear-gradient(135deg, #16a34a, #f59e0b)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              color:          '#fff',
              fontWeight:     700,
              fontSize:       16,
              flexShrink:     0,
              boxShadow:      '0 4px 14px rgba(22,163,74,0.35)',
            }}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 16 }}
            whileHover={{ rotate: 360, scale: 1.1 }}
          >
            AE
          </motion.div>

          {/* Brand text (UNCHANGED) */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            style={{ flex: 1 }}
          >
            <h1 style={{
              color: '#f8fafc', fontWeight: 700, fontSize: 15,
              lineHeight: 1.2, margin: 0,
            }}>
              Arvi Edibles
            </h1>
            <p style={{
              color: 'rgba(248,250,252,0.38)', fontSize: 11,
              marginTop: 2, letterSpacing: '0.5px',
            }}>
              Distributor System
            </p>
          </motion.div>

          {/* ── X CLOSE BUTTON ─────────────────────────────────────────────
              📝 NOTE: lg:hidden = only visible on mobile/tablet screens
              📝 NOTE: On desktop this button is completely hidden
              📝 NOTE: Calls onClose() → sets sidebarOpen=false in App.js
              📝 NOTE: This slides the sidebar back off screen             */}
          <button
            onClick={onClose}
            className="lg:hidden"
            style={{
              background:   'rgba(255,255,255,0.06)',
              border:       '1px solid rgba(255,255,255,0.10)',
              borderRadius: 8,
              padding:      6,
              cursor:       'pointer',
              color:        'rgba(248,250,252,0.5)',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              flexShrink:   0,
            }}
            aria-label="Close menu"
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Golden accent line (UNCHANGED) */}
        <div style={{
          width: 32, height: 2, background: '#f59e0b',
          borderRadius: 2, marginTop: 14,
        }} />
      </motion.div>

      {/* ── MIDDLE — NAVIGATION (UNCHANGED except onClose passed to NavItem) */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>

        <motion.p
          variants={itemVariants}
          style={{
            color: 'rgba(248,250,252,0.28)', fontSize: 10, fontWeight: 600,
            letterSpacing: '1.2px', textTransform: 'uppercase',
            padding: '0 14px', marginBottom: 10,
          }}
        >
          Main Menu
        </motion.p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* 📝 NOTE: onClose passed so tapping a nav link closes sidebar on mobile */}
          <NavItem to="/dashboard"       icon={LayoutDashboard} label="Dashboard"       onClose={onClose} />
          <NavItem to="/add-distributor" icon={PlusCircle}      label="Add Distributor" onClose={onClose} />
          <NavItem to="/reports"         icon={BarChart2}        label="Reports"         onClose={onClose} />
        </div>

        {/* Divider (UNCHANGED) */}
        <div style={{
          height: 1, background: 'rgba(255,255,255,0.06)',
          margin: '1rem 0.5rem',
        }} />

        {/* Live Tracking info card (UNCHANGED) */}
        <motion.div
          variants={itemVariants}
          style={{
            background:   'rgba(22,163,74,0.08)',
            border:       '1px solid rgba(22,163,74,0.18)',
            borderRadius: 12,
            padding:      '10px 12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Droplets style={{ width: 14, height: 14, color: '#4ade80' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#4ade80' }}>
              Live Tracking
            </span>
          </div>
          <p style={{ fontSize: 10, color: 'rgba(248,250,252,0.38)', lineHeight: 1.6 }}>
            Territory coverage · Off-take · New outlets · Performance
          </p>
        </motion.div>
      </nav>

      {/* ── BOTTOM — USER INFO + LOGOUT (UNCHANGED) ───────────────────── */}
      <motion.div
        variants={itemVariants}
        style={{
          padding:   '1rem 0.75rem',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {user.username && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12, marginBottom: 10,
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, #16a34a, #f59e0b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0,
            }}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ color: '#f8fafc', fontSize: 12, fontWeight: 600, margin: 0 }}>
                {user.username}
              </p>
              <p style={{
                color: 'rgba(248,250,252,0.38)', fontSize: 10,
                margin: 0, textTransform: 'capitalize',
              }}>
                {user.role || 'Admin'}
              </p>
            </div>
          </div>
        )}

        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: '100%', padding: '9px 14px', borderRadius: 12,
            border: '1px solid rgba(239,68,68,0.25)',
            background: 'rgba(239,68,68,0.07)',
            color: 'rgba(248,68,68,0.8)', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 7, marginBottom: 12, transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background  = 'rgba(239,68,68,0.18)';
            e.currentTarget.style.color       = '#f87171';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background  = 'rgba(239,68,68,0.07)';
            e.currentTarget.style.color       = 'rgba(248,68,68,0.8)';
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)';
          }}
        >
          <LogOut style={{ width: 13, height: 13 }} />
          Logout
        </motion.button>

        <p style={{ color: 'rgba(248,250,252,0.18)', fontSize: 10, textAlign: 'center' }}>
          Arvi Edibles © 2026
        </p>
      </motion.div>

    </motion.div>
  );
}

export default Sidebar;