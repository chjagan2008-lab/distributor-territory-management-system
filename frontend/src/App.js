import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Layout/Sidebar';
import FormPage from './pages/FormPage';
import DashboardPage from './pages/DashboardPage';
import DetailPage from './pages/DetailPage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50">

        {/* LEFT: Sidebar navigation */}
        <Sidebar />

        {/* RIGHT: Main content area */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/add-distributor" element={<FormPage />} />
              {/* New: /distributor/1, /distributor/2 etc */}
              <Route path="/distributor/:id" element={<DetailPage />} />
            </Routes>
          </AnimatePresence>
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;