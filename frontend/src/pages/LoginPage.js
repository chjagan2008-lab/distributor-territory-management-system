import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader, AlertCircle } from 'lucide-react';
import API_BASE from '../config';

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        // Save token and user to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Cannot connect to server. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #1B5E20 0%, #2e7d32 50%, #1a5e35 100%)"
      }}>

      {/* Decorative circles */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10"
        style={{ background: "#F9A825", filter: "blur(80px)",
                 transform: "translate(-30%, -30%)" }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10"
        style={{ background: "#F9A825", filter: "blur(80px)",
                 transform: "translate(30%, 30%)" }} />

      <motion.div
        className="w-full max-w-md mx-4 relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >

        {/* Logo + Title */}
        <div className="text-center mb-8">
          <motion.div
            className="w-20 h-20 bg-yellow-500 rounded-2xl flex items-center
                       justify-center mx-auto mb-4 text-green-900 font-bold text-2xl"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.2 }}
            whileHover={{ rotate: 10, scale: 1.1 }}
            style={{ boxShadow: "0 8px 32px rgba(249,168,37,0.4)" }}
          >
            🛢️
          </motion.div>
          <motion.h1
            className="text-3xl font-bold text-white"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Arvi Edibles
          </motion.h1>
          <motion.p
            className="text-green-300 mt-1 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Distributor Territory Management System
          </motion.p>
        </div>

        {/* Login Card */}
        <motion.div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {/* Green top bar */}
          <div className="h-1 w-full"
            style={{
              background: "linear-gradient(90deg, #1B5E20, #F9A825)"
            }} />

          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Welcome Back!
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Sign in to access the dashboard
            </p>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="mb-4 p-3 bg-red-50 border border-red-200
                             rounded-xl flex items-center gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>

              {/* Username */}
              <div className="mb-4">
                <label className="block text-sm font-semibold
                                  text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  required
                  className="w-full px-4 py-3 border border-gray-200
                             rounded-xl focus:outline-none focus:ring-2
                             focus:ring-green-400 focus:border-green-400
                             transition-all text-gray-800 text-sm"
                />
              </div>

              {/* Password */}
              <div className="mb-6">
                <label className="block text-sm font-semibold
                                  text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                    className="w-full px-4 py-3 pr-12 border border-gray-200
                               rounded-xl focus:outline-none focus:ring-2
                               focus:ring-green-400 focus:border-green-400
                               transition-all text-gray-800 text-sm"
                  />
                  {/* Show/Hide password toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                               text-gray-400 hover:text-gray-600"
                  >
                    {showPassword
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                className="w-full py-3 text-white font-semibold rounded-xl
                           flex items-center justify-center gap-2
                           disabled:opacity-70 transition-all"
                style={{
                  background: "linear-gradient(135deg, #1B5E20, #2e7d32)",
                  boxShadow: "0 4px 16px rgba(27,94,32,0.35)"
                }}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  '🔐 Sign In'
                )}
              </motion.button>

            </form>

            {/* Default credentials hint */}
            <div className="mt-4 p-3 bg-green-50 border border-green-100
                            rounded-xl text-center">
              <p className="text-green-700 text-xs font-medium">
                Default credentials
              </p>
              <p className="text-green-600 text-xs mt-0.5">
                Username: <strong>admin</strong> &nbsp;|&nbsp;
                Password: <strong>admin123</strong>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-green-400 text-xs mt-6">
          Arvi Edibles © 2026 · Distributor Management System
        </p>

      </motion.div>
    </div>
  );
}

export default LoginPage;