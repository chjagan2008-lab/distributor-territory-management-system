import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Layout/Sidebar';
import FormPage from './pages/FormPage';
import DashboardPage from './pages/DashboardPage';
import DetailPage from './pages/DetailPage';
import ReportsPage from './pages/ReportsPage';
import EditPage from './pages/EditPage';
import LoginPage from './pages/LoginPage';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// ── PAGE TRANSITION VARIANTS (UNCHANGED) ─────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeIn' } },
};

function PageWrapper({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" style={{ height: '100%' }}>
      {children}
    </motion.div>
  );
}

// ── APP LAYOUT ────────────────────────────────────────────────────────────────
function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 📝 NOTE: isMobile = true when screen width < 1024px (mobile/tablet)
  // 📝 NOTE: This is JavaScript — works 100% regardless of Tailwind config
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  // 📝 NOTE: Update isMobile whenever window is resized
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 📝 NOTE: Auto-close sidebar when resizing to desktop
  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  return (
    <div style={{ minHeight: '100vh', background: '#0b1a0d', position: 'relative', overflow: 'hidden' }}>

      {/* ── MOBILE OVERLAY ──────────────────────────────────────────────────
          📝 NOTE: Only renders on mobile when sidebar is open
          📝 NOTE: Tap to close sidebar                                      */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.65)' }}
          />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────
          📝 NOTE: Desktop → always translateX(0) — always visible
          📝 NOTE: Mobile  → translateX(-100%) hidden, translateX(0) when open */}
      <div style={{
        position:   'fixed', top: 0, left: 0, bottom: 0, width: 256, zIndex: 50,
        transform:  !isMobile
          ? 'translateX(0)'
          : sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
      }}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────
          📝 NOTE: Desktop → marginLeft 256px to make space for sidebar
          📝 NOTE: Mobile  → marginLeft 0, sidebar floats above content      */}
      <div style={{ marginLeft: isMobile ? 0 : 256, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* ── MOBILE HEADER BAR ───────────────────────────────────────────
            📝 NOTE: isMobile && means this ONLY renders on mobile
            📝 NOTE: On desktop — this block does NOT exist in the DOM
            📝 NOTE: Contains hamburger ☰ button + AE badge + Arvi Edibles  */}
        {isMobile && (
          <div style={{
            position: 'sticky', top: 0, zIndex: 30,
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 16px', background: '#0b1a0d',
            borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
          }}>
            {/* Hamburger ☰ */}
            <button
              onClick={() => setSidebarOpen(true)} aria-label="Open menu"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '7px 9px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 18, height: 2, background: '#f8fafc', borderRadius: 2 }} />)}
            </button>

            {/* AE badge */}
            <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: 'linear-gradient(135deg,#16a34a,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
              AE
            </div>

            {/* Brand name */}
            <div>
              <p style={{ color: '#f8fafc', fontSize: 14, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>Arvi Edibles</p>
              <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: 10, margin: 0 }}>Distributor System</p>
            </div>
          </div>
        )}

        {/* ── PAGE ROUTES WITH TRANSITIONS ─────────────────────────────── */}
        <div style={{ flex: 1, overflowX: 'hidden' }}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.key}>
              <Route path="/"                     element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard"            element={<PageWrapper><DashboardPage /></PageWrapper>} />
              <Route path="/add-distributor"      element={<PageWrapper><FormPage /></PageWrapper>} />
              <Route path="/distributor/:id"      element={<PageWrapper><DetailPage /></PageWrapper>} />
              <Route path="/distributor/:id/edit" element={<PageWrapper><EditPage /></PageWrapper>} />
              <Route path="/reports"              element={<PageWrapper><ReportsPage /></PageWrapper>} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── ANIMATED ROUTES ───────────────────────────────────────────────────────────
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.key}>
        <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
        <Route path="/*"     element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;