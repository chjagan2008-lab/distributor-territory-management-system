import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Layout/Sidebar';
import FormPage from './pages/FormPage';
import DashboardPage from './pages/DashboardPage';
import DetailPage from './pages/DetailPage';
import ReportsPage from './pages/ReportsPage';
import EditPage from './pages/EditPage';
import LoginPage from './pages/LoginPage';

// ── Protected Route Component ─────────────────────────────
// Checks if token exists in localStorage
// If yes → show the page
// If no → redirect to /login
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>

          {/* Public route — Login page (no sidebar) */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes — need login */}
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <main className="flex-1 overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/add-distributor" element={<FormPage />} />
                    <Route path="/distributor/:id" element={<DetailPage />} />
                    <Route path="/distributor/:id/edit" element={<EditPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          } />

        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;