// 📝 NOTE: Sidebar.js — Redesigned to match dark glassmorphism login theme
// 📝 NOTE: ALL navigation logic, logout, and user display kept UNCHANGED
// 📝 NOTE: Only visual styling is updated

import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  PlusCircle,
  BarChart2,
  LogOut,
  Droplets,
} from 'lucide-react';

// ─── ANIMATION VARIANTS ────────────────────────────────────────────────────
// 📝 NOTE: sidebarVariants controls the whole sidebar sliding in from left
// 📝 NOTE: staggerChildren = each nav item appears one after another
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

// 📝 NOTE: itemVariants controls each individual nav item sliding in
const itemVariants = {
  hidden:   { opacity: 0, x: -20 },
  visible:  { opacity: 1, x: 0, transition: { duration: 0.35 } },
};

// ─── STYLES (defined once, reused in NavItem) ──────────────────────────────
// 📝 NOTE: We define styles as objects so they're easy to read and maintain

const activeStyle = {
  // 📝 NOTE: Active item = golden amber bg + dark text (stands out clearly)
  background:   'rgba(245,158,11,0.18)',
  border:       '1px solid rgba(245,158,11,0.35)',
  color:        '#fbbf24',
  borderRadius: 12,
};

const inactiveStyle = {
  // 📝 NOTE: Inactive item = fully transparent, muted green text
  background:   'transparent',
  border:       '1px solid transparent',
  color:        'rgba(248,250,252,0.5)',
  borderRadius: 12,
};

// ─── NAV ITEM COMPONENT ────────────────────────────────────────────────────
// 📝 NOTE: NavItem is a reusable component — we call it once per page link
// 📝 NOTE: Props: to = route path, icon = Lucide icon, label = text shown
function NavItem({ to, icon: Icon, label }) {
  return (
    <motion.div variants={itemVariants}>
      <NavLink
        to={to}
        // 📝 NOTE: isActive is provided by React Router — true when URL matches
        className={() => 'block'}
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
          // 📝 NOTE: Spread active or inactive style based on route match
          ...(isActive ? activeStyle : inactiveStyle),
        })}
      >
        {({ isActive }) => (
          <>
            {/* 📝 NOTE: Golden left accent bar shown only on active item */}
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

            {/* 📝 NOTE: Icon spins slightly on hover — subtle delight */}
            <motion.div
              whileHover={{ rotate: 12, scale: 1.15 }}
              transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
              style={{ flexShrink: 0 }}
            >
              <Icon
                style={{
                  width:  18,
                  height: 18,
                  // 📝 NOTE: Golden when active, muted when inactive
                  color: isActive ? '#fbbf24' : 'rgba(248,250,252,0.45)',
                }}
              />
            </motion.div>

            {/* Nav label text */}
            <span>{label}</span>
          </>
        )}
      </NavLink>
    </motion.div>
  );
}

// ─── MAIN SIDEBAR COMPONENT ────────────────────────────────────────────────
function Sidebar() {
  const navigate = useNavigate();

  // 📝 NOTE: handleLogout — clears JWT token and user from localStorage
  // 📝 NOTE: Then redirects to /login — UNCHANGED from your original
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 📝 NOTE: Read logged-in user from localStorage
  // 📝 NOTE: || '{}' prevents crash if nothing is stored yet
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    // 📝 NOTE: w-64 = 256px wide sidebar, fixed width
    // 📝 NOTE: min-h-screen = always full height of the page
    // 📝 NOTE: flex flex-col = logo on top, nav in middle, logout at bottom
    // 📝 NOTE: border-right = subtle separator from main content area
    <motion.div
      className="w-64 flex flex-col min-h-screen"
      style={{
        background:  '#0b1a0d',
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >

      {/* ══════════════════════════════════════════════════════════════════
          TOP — LOGO SECTION
          📝 NOTE: AE monogram matches the login page branding exactly
          📝 NOTE: Droplets icon from lucide = edible oils reference
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        style={{
          padding:      '1.5rem 1.25rem',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

          {/* AE Monogram badge — green to amber gradient */}
          <motion.div
            style={{
              width:        44,
              height:       44,
              borderRadius: 12,
              background:   'linear-gradient(135deg, #16a34a, #f59e0b)',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              color:        '#fff',
              fontWeight:   700,
              fontSize:     16,
              flexShrink:   0,
              boxShadow:    '0 4px 14px rgba(22,163,74,0.35)',
            }}
            // 📝 NOTE: Bounces in from below on page load
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 16 }}
            whileHover={{ rotate: 360, scale: 1.1 }}
          >
            AE
          </motion.div>

          {/* Brand text */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h1
              style={{
                color:      '#f8fafc',
                fontWeight: 700,
                fontSize:   15,
                lineHeight: 1.2,
                margin:     0,
              }}
            >
              Arvi Edibles
            </h1>
            <p
              style={{
                color:       'rgba(248,250,252,0.38)',
                fontSize:    11,
                marginTop:   2,
                letterSpacing: '0.5px',
              }}
            >
              Distributor System
            </p>
          </motion.div>
        </div>

        {/* 📝 NOTE: Golden accent line under logo — brand signature */}
        <div
          style={{
            width:        32,
            height:       2,
            background:   '#f59e0b',
            borderRadius: 2,
            marginTop:    14,
          }}
        />
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          MIDDLE — NAVIGATION LINKS
          📝 NOTE: flex-1 makes this section grow to fill available space
          📝 NOTE: This pushes the logout section to the very bottom
      ═══════════════════════════════════════════════════════════════════ */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>

        {/* Section label */}
        <motion.p
          variants={itemVariants}
          style={{
            color:         'rgba(248,250,252,0.28)',
            fontSize:      10,
            fontWeight:    600,
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            padding:       '0 14px',
            marginBottom:  10,
          }}
        >
          Main Menu
        </motion.p>

        {/* 📝 NOTE: Each NavItem maps to one page in your React Router setup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavItem to="/dashboard"       icon={LayoutDashboard} label="Dashboard"       />
          <NavItem to="/add-distributor" icon={PlusCircle}      label="Add Distributor" />
          <NavItem to="/reports"         icon={BarChart2}        label="Reports"         />
        </div>

        {/* 📝 NOTE: Divider between nav items and extra info */}
        <div
          style={{
            height:     1,
            background: 'rgba(255,255,255,0.06)',
            margin:     '1rem 0.5rem',
          }}
        />

        {/* 📝 NOTE: Small info card showing what this system tracks */}
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

      {/* ══════════════════════════════════════════════════════════════════
          BOTTOM — USER INFO + LOGOUT
          📝 NOTE: borderTop separates it from nav area
          📝 NOTE: user.username comes from JWT stored in localStorage
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        style={{
          padding:   '1rem 0.75rem',
          borderTop: '1px solid rgba(255,255,255,0.07)',
        }}
      >

        {/* User info row — only shows if username exists in localStorage */}
        {user.username && (
          <div
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          10,
              padding:      '10px 12px',
              background:   'rgba(255,255,255,0.04)',
              border:       '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              marginBottom: 10,
            }}
          >
            {/* 📝 NOTE: Avatar circle shows first letter of username */}
            <div
              style={{
                width:          30,
                height:         30,
                borderRadius:   8,
                background:     'linear-gradient(135deg, #16a34a, #f59e0b)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                color:          '#fff',
                fontWeight:     700,
                fontSize:       12,
                flexShrink:     0,
              }}
            >
              {/* 📝 NOTE: charAt(0) gets first letter, toUpperCase capitalises it */}
              {user.username.charAt(0).toUpperCase()}
            </div>

            <div>
              <p style={{ color: '#f8fafc', fontSize: 12, fontWeight: 600, margin: 0 }}>
                {user.username}
              </p>
              <p
                style={{
                  color:     'rgba(248,250,252,0.38)',
                  fontSize:  10,
                  margin:    0,
                  textTransform: 'capitalize',
                }}
              >
                {/* 📝 NOTE: role comes from JWT payload saved during login */}
                {user.role || 'Admin'}
              </p>
            </div>
          </div>
        )}

        {/* Logout button */}
        {/* 📝 NOTE: whileHover/whileTap from Framer Motion = scale effect */}
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            width:          '100%',
            padding:        '9px 14px',
            borderRadius:   12,
            border:         '1px solid rgba(239,68,68,0.25)',
            background:     'rgba(239,68,68,0.07)',
            color:          'rgba(248,68,68,0.8)',
            fontSize:       12,
            fontWeight:     600,
            cursor:         'pointer',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            7,
            marginBottom:   12,
            transition:     'all 0.2s',
          }}
          // 📝 NOTE: onMouseEnter/Leave = deeper red on hover
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.18)';
            e.currentTarget.style.color      = '#f87171';
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

        {/* Footer copyright */}
        <p
          style={{
            color:     'rgba(248,250,252,0.18)',
            fontSize:  10,
            textAlign: 'center',
          }}
        >
          Arvi Edibles © 2026
        </p>
      </motion.div>

    </motion.div>
  );
}

export default Sidebar;