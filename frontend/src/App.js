// 📝 NOTE: App.js — Fixed mobile responsive layout
// 📝 NOTE: Mobile/Tablet: sidebar COMPLETELY HIDDEN, hamburger opens as overlay
// 📝 NOTE: Desktop (1024px+): sidebar always visible on left side
// 📝 NOTE: Key fix: sidebar is ALWAYS fixed/absolute — never takes page space
//          On desktop, main content has left margin = sidebar width (256px)

import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Layout/Sidebar';
import FormPage from './pages/FormPage';
import DashboardPage from './pages/DashboardPage';
import DetailPage from './pages/DetailPage';
import ReportsPage from './pages/ReportsPage';
import EditPage from './pages/EditPage';
import LoginPage from './pages/LoginPage';

// 📝 NOTE: ProtectedRoute — checks JWT token (UNCHANGED)
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  // 📝 NOTE: Controls whether mobile sidebar overlay is open
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>

          {/* Public — Login (no sidebar) */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected — all app pages */}
          <Route path="/*" element={
            <ProtectedRoute>
              <div style={{ minHeight: '100vh', background: '#0b1a0d' }}>

                {/* ── SIDEBAR (always fixed position) ───────────────────────
                    📝 NOTE: position fixed = sidebar NEVER takes up page space
                    📝 NOTE: On mobile: hidden off-screen with translateX(-100%)
                    📝 NOTE: On mobile open: slides in with translateX(0)
                    📝 NOTE: On desktop: always translateX(0) via CSS class     */}
                <div
                  className={`lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                  style={{
                    position:   'fixed',
                    top:        0,
                    left:       0,
                    bottom:     0,
                    width:      256,
                    zIndex:     50,
                    transition: 'transform 0.3s ease-in-out',
                  }}
                >
                  <Sidebar onClose={() => setSidebarOpen(false)} />
                </div>

                {/* ── DARK OVERLAY (mobile only, behind sidebar) ────────────
                    📝 NOTE: Appears when sidebar opens on mobile
                    📝 NOTE: Tap it to close sidebar                           */}
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSidebarOpen(false)}
                      style={{
                        position: 'fixed',
                        inset:    0,
                        zIndex:   40,
                        background: 'rgba(0,0,0,0.65)',
                      }}
                      className="lg:hidden"
                    />
                  )}
                </AnimatePresence>

                {/* ── MAIN CONTENT AREA ─────────────────────────────────────
                    📝 NOTE: On mobile → NO left margin (full width)
                    📝 NOTE: On desktop → 256px left margin = space for sidebar
                    📝 NOTE: lg:ml-64 adds the margin only on large screens    */}
                <div
                  className="lg:ml-64"
                  style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
                >

                  {/* ── MOBILE TOP HEADER ─────────────────────────────────
                      📝 NOTE: lg:hidden = only shows on mobile/tablet
                      📝 NOTE: Has hamburger ☰ button + brand badge           */}
                  <div
                    className="lg:hidden"
                    style={{
                      position:     'sticky',
                      top:          0,
                      zIndex:       30,
                      display:      'flex',
                      alignItems:   'center',
                      gap:          12,
                      padding:      '10px 16px',
                      background:   '#0b1a0d',
                      borderBottom: '1px solid rgba(255,255,255,0.07)',
                      flexShrink:   0,
                    }}
                  >
                    {/* Hamburger ☰ */}
                    <button
                      onClick={() => setSidebarOpen(true)}
                      aria-label="Open menu"
                      style={{
                        background:    'rgba(255,255,255,0.07)',
                        border:        '1px solid rgba(255,255,255,0.12)',
                        borderRadius:  8,
                        padding:       '7px 9px',
                        cursor:        'pointer',
                        display:       'flex',
                        flexDirection: 'column',
                        gap:           4,
                        flexShrink:    0,
                      }}
                    >
                      {/* 📝 NOTE: 3 white lines = hamburger icon */}
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: 18, height: 2,
                          background: '#f8fafc', borderRadius: 2,
                        }} />
                      ))}
                    </button>

                    {/* AE badge */}
                    <div style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      background: 'linear-gradient(135deg, #16a34a, #f59e0b)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: '#fff',
                    }}>
                      AE
                    </div>

                    {/* Brand name */}
                    <div>
                      <p style={{ color: '#f8fafc', fontSize: 14, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
                        Arvi Edibles
                      </p>
                      <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: 10, margin: 0 }}>
                        Distributor System
                      </p>
                    </div>
                  </div>

                  {/* ── PAGE ROUTES ─────────────────────────────────────── */}
                  <div style={{ flex: 1, overflowX: 'hidden' }}>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" />} />
                      <Route path="/dashboard"           element={<DashboardPage />} />
                      <Route path="/add-distributor"     element={<FormPage />} />
                      <Route path="/distributor/:id"     element={<DetailPage />} />
                      <Route path="/distributor/:id/edit" element={<EditPage />} />
                      <Route path="/reports"             element={<ReportsPage />} />
                    </Routes>
                  </div>

                </div>
              </div>
            </ProtectedRoute>
          } />

        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;