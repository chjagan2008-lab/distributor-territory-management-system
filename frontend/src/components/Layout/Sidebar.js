import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Package, BarChart2 } from 'lucide-react';

function Sidebar() {
  return (
    <div className="w-64 bg-green-900 min-h-screen flex flex-col shadow-xl">

      {/* TOP: Logo */}
      <div className="p-6 border-b border-green-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-green-900" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">
              Arvi Edibles
            </h1>
            <p className="text-green-300 text-xs">
              Distributor System
            </p>
          </div>
        </div>
      </div>

      {/* MIDDLE: Navigation */}
      <nav className="flex-1 p-4 space-y-2">

        <p className="text-green-400 text-xs font-semibold uppercase tracking-wider mb-3 px-3">
          Main Menu
        </p>

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-yellow-500 text-green-900 font-semibold shadow-md'
                : 'text-green-200 hover:bg-green-800 hover:text-white'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/add-distributor"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-yellow-500 text-green-900 font-semibold shadow-md'
                : 'text-green-200 hover:bg-green-800 hover:text-white'
            }`
          }
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Distributor</span>
        </NavLink>

        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-yellow-500 text-green-900 font-semibold shadow-md'
                : 'text-green-200 hover:bg-green-800 hover:text-white'
            }`
          }
        >
          <BarChart2 className="w-5 h-5" />
          <span>Reports</span>
        </NavLink>

      </nav>

      {/* BOTTOM: Footer */}
      <div className="p-4 border-t border-green-700">
        <p className="text-green-400 text-xs text-center">
          Arvi Edibles © 2026
        </p>
      </div>

    </div>
  );
}

export default Sidebar;