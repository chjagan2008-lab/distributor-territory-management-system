import API_BASE from '../config';
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, Legend
} from "recharts";

function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const startTime = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (target === 0) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    startTime.current = null;
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-6 border border-gray-100 overflow-hidden relative"
      style={{ background: "rgba(255,255,255,0.7)" }}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer
                      bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <div className="h-3 w-24 bg-gray-200 rounded-full mb-4 animate-pulse" />
      <div className="h-10 w-16 bg-gray-200 rounded-lg mb-3 animate-pulse" />
      <div className="h-3 w-20 bg-gray-100 rounded-full animate-pulse" />
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="space-y-3">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="h-4 w-6 bg-gray-100 rounded" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
          <div className="h-4 w-16 bg-gray-100 rounded" />
          <div className="h-4 w-12 bg-gray-100 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

// ── StatCard: now uses text symbols instead of emojis ──────
// Also has a colored top border instead of a decorative circle
function StatCard({ label, value, suffix = "", color, icon, delay }) {
  const animatedValue = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.5, delay }}
      style={{
        background: "rgba(255, 255, 255, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.5)",
        boxShadow: "0 8px 32px rgba(27, 94, 32, 0.08)",
        cursor: "default",
      }}
      className="rounded-2xl p-6 relative overflow-hidden"
    >
      {/* TOP COLORED BORDER — replaces the broken emoji circle */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: color }}
      />

      <div className="flex items-start justify-between mb-3 mt-1">
        <p className="text-gray-500 text-sm font-medium">{label}</p>
        {/* Icon bubble — uses text symbols, not emojis */}
        <span
          className="text-lg font-bold p-2 rounded-xl"
          style={{ background: color + "18", color: color }}
        >
          {icon}
        </span>
      </div>

      {/* Count-up number */}
      <p className="text-4xl font-bold mt-1" style={{ color }}>
        {animatedValue.toLocaleString()}{suffix}
      </p>

      {/* Bottom accent bar */}
      <div className="mt-4 h-1 rounded-full opacity-20" style={{ background: color }} />
    </motion.div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

function DashboardPage() {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/distributors`);
        if (!response.ok) throw new Error("Failed to fetch data from server");
        const data = await response.json();
        const list = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
        setDistributors(list);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDistributors();
  }, []);

  const totalDistributors = distributors.length;
  const totalOfftake = distributors.reduce((sum, d) => sum + (d.monthly_offtake || 0), 0);
  const activeCount = distributors.filter((d) => d.status === "active").length;

  const barData = distributors.map(d => ({
    name: d.distributor_name.split(' ')[0],
    offtake: d.monthly_offtake,
  }));

  const pieData = [
    { name: 'Active',   value: distributors.filter(d => d.status === 'active').length },
    { name: 'Inactive', value: distributors.filter(d => d.status === 'inactive').length },
    { name: 'Pending',  value: distributors.filter(d => d.status === 'pending').length },
  ].filter(item => item.value > 0);

  const PIE_COLORS = ['#1B5E20', '#ef4444', '#F9A825'];

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-40 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-72 bg-gray-100 rounded" />
        </div>
        <div className="grid grid-cols-3 gap-6 mb-8">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="h-5 w-32 bg-gray-200 rounded mb-6 animate-pulse" />
          <SkeletonTable />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
        >
          <p className="text-red-600 font-medium">⚠️ Could not load data</p>
          <p className="text-red-400 text-sm mt-1">{error}</p>
          <p className="text-gray-400 text-sm mt-2">
            Make sure your backend is running on port 5000
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen"
      style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #fafafa 60%)" }}>

      {/* Page Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 mt-1">
          Welcome to Arvi Edibles Distributor Management System
        </p>
      </motion.div>

      {/* Stat Cards — fixed icons, top colored border */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Total Distributors"
          value={totalDistributors}
          color="#1B5E20"
          icon="▤"
          delay={0.1}
        />
        <StatCard
          label="Total Monthly Offtake"
          value={totalOfftake}
          suffix=" units"
          color="#1565C0"
          icon="◈"
          delay={0.2}
        />
        <StatCard
          label="Active Distributors"
          value={activeCount}
          color="#F9A825"
          icon="◉"
          delay={0.3}
        />
      </div>

      {/* Charts Row */}
      {distributors.length > 0 && (
        <motion.div
          className="grid grid-cols-2 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Monthly Offtake by Distributor
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '13px',
                }} />
                <Bar dataKey="offtake" fill="#1B5E20" radius={[6, 6, 0, 0]}
                  name="Monthly Offtake" isAnimationActive={true} animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Distributor Status
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  paddingAngle={4} dataKey="value"
                  isAnimationActive={true} animationDuration={1200}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '13px',
                }} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(value) => (
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>
      )}

      {/* Distributors Table */}
      <motion.div
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          All Distributors
          <span className="text-sm font-normal text-gray-400 ml-2">
            (click a row to see details)
          </span>
        </h3>

        {distributors.length === 0 ? (
          <div className="h-48 bg-gray-50 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 text-lg">No distributors yet</p>
              <p className="text-gray-300 text-sm mt-1">
                Use "Add Distributor" to add your first record
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-gray-500 font-medium pb-3 pr-4">#</th>
                  <th className="text-left text-gray-500 font-medium pb-3 pr-4">Name</th>
                  <th className="text-left text-gray-500 font-medium pb-3 pr-4">Territory</th>
                  <th className="text-left text-gray-500 font-medium pb-3 pr-4">Offtake</th>
                  <th className="text-left text-gray-500 font-medium pb-3 pr-4">Outlets</th>
                  <th className="text-left text-gray-500 font-medium pb-3 pr-4">Coverage</th>
                  <th className="text-left text-gray-500 font-medium pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {distributors.map((d, index) => (
                  <motion.tr
                    key={d.id}
                    onClick={() => navigate(`/distributor/${d.id}`)}
                    className="border-b border-gray-50 cursor-pointer group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.07 }}
                    whileHover={{ backgroundColor: "#f0fdf4" }}
                    style={{ position: "relative" }}
                  >
                    <td className="py-3 pr-4 text-gray-400">{index + 1}</td>
                    <td className="py-3 pr-4">
                      <span className="font-medium text-green-800 group-hover:underline">
                        {d.distributor_name}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{d.territory}</td>
                    <td className="py-3 pr-4 text-gray-600">
                      {d.monthly_offtake?.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {d.new_outlet_additions ?? 0}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {d.coverage_metrics ?? 0}%
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        d.status === "active"
                          ? "bg-green-100 text-green-700"
                          : d.status === "inactive"
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {d.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default DashboardPage;