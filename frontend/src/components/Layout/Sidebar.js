import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, PlusCircle, Package, BarChart2, LogOut } from 'lucide-react';

const sidebarVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35 } },
};

function NavItem({ to, icon: Icon, label }) {
  return (
    <motion.div variants={itemVariants}>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-3 rounded-xl relative
           transition-colors duration-200 group ${
            isActive
              ? 'bg-yellow-500 text-green-900 font-semibold shadow-md'
              : 'text-green-200 hover:bg-green-800 hover:text-white'
          }`
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <motion.div
                className="absolute left-0 top-2 bottom-2 w-1
                           rounded-full bg-green-900"
                layoutId="activeBar"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}
            <motion.div
              whileHover={{ rotate: 12, scale: 1.15 }}
              transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
            </motion.div>
            <span>{label}</span>
          </>
        )}
      </NavLink>
    </motion.div>
  );
}

function Sidebar() {
  const navigate = useNavigate();

  // ── Logout handler ──────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // ── Get logged in username ──────────────────────────────
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <motion.div
      className="w-64 bg-green-900 min-h-screen flex flex-col shadow-xl"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >

      {/* ── Logo Section ──────────────────────────────────── */}
      <motion.div
        className="p-6 border-b border-green-700"
        variants={itemVariants}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center
                       justify-center"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 16 }}
            whileHover={{ rotate: 360, scale: 1.1 }}
          >
            <Package className="w-6 h-6 text-green-900" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h1 className="text-white font-bold text-lg leading-tight">
              Arvi Edibles
            </h1>
            <p className="text-green-300 text-xs">
              Distributor System
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Navigation ────────────────────────────────────── */}
      <nav className="flex-1 p-4 space-y-2">
        <motion.p
          className="text-green-400 text-xs font-semibold uppercase
                     tracking-wider mb-3 px-3"
          variants={itemVariants}
        >
          Main Menu
        </motion.p>

        <NavItem to="/dashboard"       icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/add-distributor" icon={PlusCircle}      label="Add Distributor" />
        <NavItem to="/reports"         icon={BarChart2}        label="Reports" />
      </nav>

      {/* ── Footer with Logout ────────────────────────────── */}
      <motion.div
        className="p-4 border-t border-green-700"
        variants={itemVariants}
      >
        {/* Logged in user info */}
        {user.username && (
          <div className="flex items-center gap-2 mb-3 px-2">
            <div className="w-7 h-7 bg-yellow-500 rounded-lg flex items-center
                            justify-center text-green-900 font-bold text-xs">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white text-xs font-semibold">
                {user.username}
              </p>
              <p className="text-green-400 text-xs capitalize">
                {user.role}
              </p>
            </div>
          </div>
        )}

        {/* Logout button */}
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full py-2 rounded-xl text-green-300 text-xs
                     font-semibold border border-green-700
                     hover:bg-red-600 hover:text-white
                     hover:border-red-600
                     transition-all duration-200
                     flex items-center justify-center gap-2 mb-3"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </motion.button>

        <p className="text-green-400 text-xs text-center">
          Arvi Edibles © 2026
        </p>
      </motion.div>

    </motion.div>
  );
}

export default Sidebar;