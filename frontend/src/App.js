import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Layout/Sidebar';
import FormPage from './pages/FormPage';
import DashboardPage from './pages/DashboardPage';
import DetailPage from './pages/DetailPage';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/add-distributor" element={<FormPage />} />
              <Route path="/distributor/:id" element={<DetailPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;