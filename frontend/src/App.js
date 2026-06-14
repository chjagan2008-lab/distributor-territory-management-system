import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import FormPage from './pages/FormPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      {/* 
        This is the main layout:
        - Sidebar on the LEFT (fixed, always visible)
        - Page content on the RIGHT (changes based on URL)
      */}
      <div className="flex h-screen bg-gray-50">
        
        {/* LEFT: Sidebar navigation */}
        <Sidebar />
        
        {/* RIGHT: Main content area */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            {/* / → redirect to /dashboard automatically */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/add-distributor" element={<FormPage />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;