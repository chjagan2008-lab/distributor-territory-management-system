// 📝 NOTE: App.js — Added smooth page transitions using Framer Motion
// 📝 NOTE: Each page fades out then new page slides up on navigation
// 📝 NOTE: Sidebar hamburger mobile logic — UNCHANGED

import { useState } from 'react';
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

// ── PAGE TRANSITION WRAPPER ──────────────────────────────────────────────────
// 📝 NOTE: Wraps every page with enter/exit animations
// 📝 NOTE: initial = where page starts (slightly below + invisible)
// 📝 NOTE: animate = where page ends up (normal position + visible)
// 📝 NOTE: exit    = where page goes when leaving (slightly above + invisible)
const pageVariants = {
  initial: { opacity: 0, y: 18 },       // 📝 starts below, invisible
  animate: { opacity: 1, y: 0,          // 📝 slides up to normal
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: {    opacity: 0, y: -10,         // 📝 slides slightly up while fading out
    transition: { duration: 0.2, ease: 'easeIn' }
  },
};

// 📝 NOTE: PageWrapper applies the animation to any child page component
function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ height: '100%' }}
    >
      {children}
    </motion.div>
  );
}

// ── ANIMATED ROUTES ──────────────────────────────────────────────────────────
// 📝 NOTE: Must be a separate component so useLocation() works inside Router
// 📝 NOTE: location.key changes on every navigation → AnimatePresence re-runs
function AnimatedRoutes() {
  const location = useLocation();

  return (
    // 📝 NOTE: mode="wait" = finish exit animation BEFORE starting enter
    // 📝 NOTE: This prevents two pages showing at same time
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.key}>
        <Route path="/login" element={
          <PageWrapper><LoginPage /></PageWrapper>
        } />
        <Route path="/*" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
}

// ── APP LAYOUT (sidebar + content) ───────────────────────────────────────────
function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight:'100vh', background:'#0b1a0d', position:'relative', overflow:'hidden' }}>

      {/* Mobile dark overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setSidebarOpen(false)}
            style={{ position:'fixed',inset:0,zIndex:40,background:'rgba(0,0,0,0.65)' }}
            className="lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar — fixed position always */}
      <div
        className={`lg:translate-x-0 ${sidebarOpen?'translate-x-0':'-translate-x-full'}`}
        style={{ position:'fixed',top:0,left:0,bottom:0,width:256,zIndex:50,transition:'transform 0.3s ease-in-out' }}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content — lg:ml-64 on desktop */}
      <div className="lg:ml-64" style={{ minHeight:'100vh',display:'flex',flexDirection:'column' }}>

        {/* Mobile header */}
        <div className="lg:hidden" style={{ position:'sticky',top:0,zIndex:30,display:'flex',alignItems:'center',gap:12,padding:'10px 16px',background:'#0b1a0d',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0 }}>
          <button onClick={() => setSidebarOpen(true)} aria-label="Open menu"
            style={{ background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:8,padding:'7px 9px',cursor:'pointer',display:'flex',flexDirection:'column',gap:4,flexShrink:0 }}>
            {[0,1,2].map(i=><div key={i} style={{width:18,height:2,background:'#f8fafc',borderRadius:2}}/>)}
          </button>
          <div style={{ width:30,height:30,borderRadius:8,flexShrink:0,background:'linear-gradient(135deg,#16a34a,#f59e0b)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff' }}>AE</div>
          <div>
            <p style={{color:'#f8fafc',fontSize:14,fontWeight:700,margin:0,lineHeight:1.2}}>Arvi Edibles</p>
            <p style={{color:'rgba(248,250,252,0.4)',fontSize:10,margin:0}}>Distributor System</p>
          </div>
        </div>

        {/* ── PAGE CONTENT WITH TRANSITIONS ──────────────────────────────────
            📝 NOTE: AnimatePresence here handles transitions between
                     dashboard, reports, form, detail, edit pages
            📝 NOTE: location.key = unique key per URL → triggers animation  */}
        <div style={{ flex:1, overflowX:'hidden' }}>
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

// ── MAIN APP ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;