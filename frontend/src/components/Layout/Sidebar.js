import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, PlusCircle, Package, BarChart2 } from 'lucide-react';

// ============================================================
// 📝 NOTE: SIDEBAR SLIDE-IN VARIANTS
// The whole sidebar slides in from the LEFT on page load.
// x: -40 means it starts 40px to the left of its real position.
// ============================================================
const sidebarVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      // 📝 staggerChildren: each child (logo, nav items, footer)
      // appears 0.07s after the previous one
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

// 📝 Each child (logo section, nav item, footer) uses this variant
const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35 } },
};

// ============================================================
// 📝 NOTE: NAV ITEM COMPONENT
// We extract each nav link into its own component so we can:
// 1. Add whileHover animations
// 2. Show an animated left accent bar when active
// 3. Rotate the icon slightly on hover
// ============================================================
function NavItem({ to, icon: Icon, label }) {
  return (
    <motion.div variants={itemVariants}>
      <NavLink
        to={to}
        className={({ isActive }) =>
          // 📝 We removed transition-all here because Framer Motion
          // handles the animations now. We keep only color transitions.
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
            {/* 📝 Active accent bar: a thin line on the LEFT edge of the item.
                It scales from 0 → 1 when the link becomes active.
                scaleY: 0 = invisible (0 height), scaleY: 1 = full height */}
            {isActive && (
              <motion.div
                className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-green-900"
                layoutId="activeBar"
                // 📝 layoutId="activeBar" is Framer Motion magic:
                // when you navigate, this bar SMOOTHLY MOVES to the new active item
                // instead of disappearing and reappearing
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}

            {/* 📝 Icon: rotates 15deg on hover using group-hover won't work
                with Framer Motion, so we use whileHover on the icon wrapper */}
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

// ============================================================
// MAIN SIDEBAR COMPONENT
// ============================================================
function Sidebar() {
  return (
    // 📝 motion.div with variants="sidebarVariants" triggers the
    // stagger cascade: sidebar → logo → nav items → footer
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

          {/* 📝 Logo icon bounces in with a spring (type: "spring")
              Spring feels more physical/alive than a regular ease */}
          <motion.div
            className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 16 }}
            // 📝 whileHover: logo spins 360 degrees when you hover over it
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

        {/* 📝 "MAIN MENU" label fades in as part of the stagger */}
        <motion.p
          className="text-green-400 text-xs font-semibold uppercase tracking-wider mb-3 px-3"
          variants={itemVariants}
        >
          Main Menu
        </motion.p>

        {/* 📝 Each NavItem slides in one by one thanks to staggerChildren above */}
        <NavItem to="/dashboard"       icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/add-distributor" icon={PlusCircle}      label="Add Distributor" />
        <NavItem to="/reports"         icon={BarChart2}        label="Reports" />

      </nav>

      {/* ── Footer ────────────────────────────────────────── */}
      <motion.div
        className="p-4 border-t border-green-700"
        variants={itemVariants}
      >
        <p className="text-green-400 text-xs text-center">
          Arvi Edibles © 2026
        </p>
      </motion.div>

    </motion.div>
  );
}

export default Sidebar;