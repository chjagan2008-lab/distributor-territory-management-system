import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, PlusCircle, BarChart2, LogOut, Droplets, X } from 'lucide-react';

const sidebarVariants = {
  hidden:  { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut', staggerChildren: 0.07, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden:  { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35 } },
};
const activeStyle   = { background: 'rgba(245,158,11,0.18)', border: '1px solid rgba(245,158,11,0.35)', color: '#fbbf24', borderRadius: 12 };
const inactiveStyle = { background: 'transparent', border: '1px solid transparent', color: 'rgba(248,250,252,0.5)', borderRadius: 12 };

function NavItem({ to, icon: Icon, label, onClose }) {
  return (
    <motion.div variants={itemVariants}>
      <NavLink to={to} className={() => 'block'} onClick={onClose}
        style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', textDecoration: 'none',
          fontWeight: 500, fontSize: 13, transition: 'all 0.2s', position: 'relative',
          ...(isActive ? activeStyle : inactiveStyle),
        })}>
        {({ isActive }) => (
          <>
            {isActive && (
              <motion.div layoutId="activeBar"
                style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 3, borderRadius: 4, background: '#f59e0b' }}
                initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.2 }} />
            )}
            <motion.div whileHover={{ rotate: 12, scale: 1.15 }} transition={{ duration: 0.2, type: 'spring', stiffness: 300 }} style={{ flexShrink: 0 }}>
              <Icon style={{ width: 18, height: 18, color: isActive ? '#fbbf24' : 'rgba(248,250,252,0.45)' }} />
            </motion.div>
            <span>{label}</span>
          </>
        )}
      </NavLink>
    </motion.div>
  );
}

function Sidebar({ onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // 📝 NOTE: Check screen width with JavaScript — NOT Tailwind class
  // 📝 NOTE: Tailwind lg:hidden was NOT working because of inline style conflicts
  // 📝 NOTE: window.innerWidth < 1024 = mobile/tablet → show X button
  // 📝 NOTE: window.innerWidth >= 1024 = desktop → X button does NOT render
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <motion.div
      className="w-64 flex flex-col"
      style={{ background: '#0b1a0d', borderRight: '1px solid rgba(255,255,255,0.07)', height: '100vh', overflowY: 'auto' }}
      variants={sidebarVariants} initial="hidden" animate="visible"
    >

      {/* ── LOGO SECTION ───────────────────────────────────────── */}
      <motion.div variants={itemVariants}
        style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

          {/* AE Monogram */}
          <motion.div
            style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#16a34a,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0, boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}
            initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 16 }}
            whileHover={{ rotate: 360, scale: 1.1 }}>
            AE
          </motion.div>

          {/* Brand text */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} style={{ flex: 1 }}>
            <h1 style={{ color: '#f8fafc', fontWeight: 700, fontSize: 15, lineHeight: 1.2, margin: 0 }}>Arvi Edibles</h1>
            <p style={{ color: 'rgba(248,250,252,0.38)', fontSize: 11, marginTop: 2, letterSpacing: '0.5px' }}>Distributor System</p>
          </motion.div>

          {/* ── X CLOSE BUTTON ────────────────────────────────────────
              📝 NOTE: isMobile && means button ONLY renders on mobile
              📝 NOTE: On desktop — this button does NOT exist in DOM
              📝 NOTE: JS check is reliable, Tailwind lg:hidden was not */}
          {isMobile && (
            <button
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'rgba(248,250,252,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              aria-label="Close menu">
              <X style={{ width: 16, height: 16 }} />
            </button>
          )}
        </div>

        {/* Golden accent line */}
        <div style={{ width: 32, height: 2, background: '#f59e0b', borderRadius: 2, marginTop: 14 }} />
      </motion.div>

      {/* ── NAVIGATION ─────────────────────────────────────────── */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>
        <motion.p variants={itemVariants}
          style={{ color: 'rgba(248,250,252,0.28)', fontSize: 10, fontWeight: 600, letterSpacing: '1.2px', textTransform: 'uppercase', padding: '0 14px', marginBottom: 10 }}>
          Main Menu
        </motion.p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavItem to="/dashboard"       icon={LayoutDashboard} label="Dashboard"       onClose={onClose} />
          <NavItem to="/add-distributor" icon={PlusCircle}      label="Add Distributor" onClose={onClose} />
          <NavItem to="/reports"         icon={BarChart2}        label="Reports"         onClose={onClose} />
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '1rem 0.5rem' }} />

        {/* Live Tracking card */}
        <motion.div variants={itemVariants}
          style={{ background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.18)', borderRadius: 12, padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Droplets style={{ width: 14, height: 14, color: '#4ade80' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#4ade80' }}>Live Tracking</span>
          </div>
          <p style={{ fontSize: 10, color: 'rgba(248,250,252,0.38)', lineHeight: 1.6 }}>
            Territory coverage · Off-take · New outlets · Performance
          </p>
        </motion.div>
      </nav>

      {/* ── USER + LOGOUT ──────────────────────────────────────── */}
      <motion.div variants={itemVariants}
        style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {user.username && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#16a34a,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ color: '#f8fafc', fontSize: 12, fontWeight: 600, margin: 0 }}>{user.username}</p>
              <p style={{ color: 'rgba(248,250,252,0.38)', fontSize: 10, margin: 0, textTransform: 'capitalize' }}>{user.role || 'Admin'}</p>
            </div>
          </div>
        )}

        <motion.button onClick={handleLogout} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{ width: '100%', padding: '9px 14px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.07)', color: 'rgba(248,68,68,0.8)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 12, transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; e.currentTarget.style.color = 'rgba(248,68,68,0.8)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; }}>
          <LogOut style={{ width: 13, height: 13 }} />
          Logout
        </motion.button>

        <p style={{ color: 'rgba(248,250,252,0.18)', fontSize: 10, textAlign: 'center' }}>Arvi Edibles © 2026</p>
      </motion.div>
    </motion.div>
  );
}

export default Sidebar;