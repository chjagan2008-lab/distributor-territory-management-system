import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, Legend
} from "recharts";
import API_BASE from '../config';

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
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: color }} />
      <div className="flex items-start justify-between mb-3 mt-1">
        <p className="text-gray-500 text-sm font-medium">{label}</p>
        <span className="text-lg font-bold p-2 rounded-xl"
          style={{ background: color + "18", color: color }}>
          {icon}
        </span>
      </div>
      <p className="text-4xl font-bold mt-1" style={{ color }}>
        {animatedValue.toLocaleString()}{suffix}
      </p>
      <div className="mt-4 h-1 rounded-full opacity-20"
        style={{ background: color }} />
    </motion.div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

function DashboardPage() {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  // ── Pagination state ──────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10; // Change back to 10!

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/distributors`);
        if (!response.ok) throw new Error("Failed to fetch data from server");
        const data = await response.json();
        const list = Array.isArray(data)
          ? data : (Array.isArray(data.data) ? data.data : []);
        setDistributors(list);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDistributors();
  }, []);

  // ── Reset to page 1 when filter/search changes ────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  const totalDistributors = distributors.length;
  const totalOfftake = distributors.reduce(
    (sum, d) => sum + (d.monthly_offtake || 0), 0);
  const activeCount = distributors.filter(
    (d) => d.status === "active").length;

  const lowCoverageCount = distributors.filter(
    d => (parseFloat(d.coverage_metrics) || 0) < 70).length;
  const lowOfftakeCount = distributors.filter(
    d => (d.monthly_offtake || 0) < 300).length;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // ── Filter + Search + Sort ────────────────────────────────
  const filteredDistributors = distributors
    .filter(d => statusFilter === 'all' ? true : d.status === statusFilter)
    .filter(d => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        d.distributor_name.toLowerCase().includes(q) ||
        d.territory.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      let aVal = a[sortField] ?? '';
      let bVal = b[sortField] ?? '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // ── Pagination calculations ───────────────────────────────
  const totalPages = Math.ceil(filteredDistributors.length / ITEMS_PER_PAGE);
  const paginatedDistributors = filteredDistributors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const barData = distributors.map(d => ({
    name: d.distributor_name.split(' ')[0],
    offtake: d.monthly_offtake,
  }));

  const pieData = [
    { name: 'Active',
      value: distributors.filter(d => d.status === 'active').length },
    { name: 'Inactive',
      value: distributors.filter(d => d.status === 'inactive').length },
    { name: 'Pending',
      value: distributors.filter(d => d.status === 'pending').length },
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
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
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
          <p className="text-red-600 font-medium">Could not load data</p>
          <p className="text-red-400 text-sm mt-1">{error}</p>
          <p className="text-gray-400 text-sm mt-2">
            Make sure backend is running on port 5000
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen"
      style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #fafafa 60%)" }}>

      {/* Page Header */}
      <motion.div className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 mt-1">
          Welcome to Arvi Edibles Distributor Management System
        </p>
      </motion.div>

      {/* Alert Banners */}
      {(lowCoverageCount > 0 || lowOfftakeCount > 0) && (
        <motion.div className="mb-6 grid gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {lowCoverageCount > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl
                            bg-red-50 border border-red-200">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-red-700 font-semibold text-sm">
                  Low Coverage Alert
                </p>
                <p className="text-red-500 text-xs mt-0.5">
                  {lowCoverageCount} distributor(s) have coverage below 70%.
                  Immediate attention required!
                </p>
              </div>
              <span className="ml-auto bg-red-100 text-red-700
                               px-3 py-1 rounded-full text-xs font-bold">
                {lowCoverageCount} affected
              </span>
            </div>
          )}
          {lowOfftakeCount > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl
                            bg-yellow-50 border border-yellow-200">
              <span className="text-xl">📉</span>
              <div>
                <p className="text-yellow-700 font-semibold text-sm">
                  Low Offtake Alert
                </p>
                <p className="text-yellow-600 text-xs mt-0.5">
                  {lowOfftakeCount} distributor(s) have monthly offtake
                  below 300 units. Review performance!
                </p>
              </div>
              <span className="ml-auto bg-yellow-100 text-yellow-700
                               px-3 py-1 rounded-full text-xs font-bold">
                {lowOfftakeCount} affected
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard label="Total Distributors" value={totalDistributors}
          color="#1B5E20" icon="▤" delay={0.1} />
        <StatCard label="Total Monthly Offtake" value={totalOfftake}
          color="#1565C0" icon="◈" delay={0.2} />
        <StatCard label="Active Distributors" value={activeCount}
          color="#F9A825" icon="◉" delay={0.3} />
      </div>

      {/* Charts Row */}
      {distributors.length > 0 && (
        <motion.div className="grid grid-cols-2 gap-6 mb-8"
          variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Monthly Offtake by Distributor
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip contentStyle={{
                  backgroundColor: 'white', border: '1px solid #e5e7eb',
                  borderRadius: '12px', fontSize: '13px',
                }} />
                <Bar dataKey="offtake" fill="#1B5E20" radius={[6, 6, 0, 0]}
                  name="Monthly Offtake" isAnimationActive
                  animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Distributor Status
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  paddingAngle={4} dataKey="value"
                  isAnimationActive animationDuration={1200}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{
                  backgroundColor: 'white', border: '1px solid #e5e7eb',
                  borderRadius: '12px', fontSize: '13px',
                }} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(value) => (
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>
                      {value}
                    </span>
                  )} />
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
        {/* Table header + Search + Filter */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="text-lg font-semibold text-gray-700">
            All Distributors
            <span className="text-sm font-normal text-gray-400 ml-2">
              (click a row to see details)
            </span>
          </h3>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Box */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2
                               text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search name or territory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-8 py-2 border border-gray-200 rounded-xl
                           text-sm focus:outline-none focus:ring-2
                           focus:ring-green-400 focus:border-green-400
                           transition-all w-56"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {['all', 'active', 'inactive', 'pending'].map(filter => (
                <button key={filter} onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold
                              transition-all duration-200 capitalize ${
                    statusFilter === filter
                      ? filter === 'all' ? 'bg-green-800 text-white'
                        : filter === 'active' ? 'bg-green-100 text-green-800'
                        : filter === 'inactive' ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {filter === 'all'
                    ? `All (${distributors.length})`
                    : `${filter} (${distributors.filter(
                        d => d.status === filter).length})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search hint */}
        {searchQuery && (
          <p className="text-xs text-gray-400 mb-3">
            Showing results for{' '}
            <span className="text-green-700 font-medium">"{searchQuery}"</span>
            {' '}— {filteredDistributors.length} found
            <button onClick={() => setSearchQuery('')}
              className="ml-2 text-red-400 hover:text-red-600 underline">
              clear
            </button>
          </p>
        )}

        {/* Sort hint */}
        {sortField && (
          <p className="text-xs text-gray-400 mb-3">
            Sorted by{' '}
            <span className="text-green-700 font-medium">
              {sortField.replace('_', ' ')}
            </span>{' '}
            — {sortOrder === 'asc' ? 'low to high ↑' : 'high to low ↓'}
            <button onClick={() => setSortField(null)}
              className="ml-2 text-red-400 hover:text-red-600 underline">
              clear sort
            </button>
          </p>
        )}

        {/* Empty state */}
        {filteredDistributors.length === 0 ? (
          <div className="h-48 bg-gray-50 rounded-xl flex items-center
                          justify-center">
            <div className="text-center">
              <p className="text-gray-400 text-lg">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : `No ${statusFilter} distributors found`}
              </p>
              <button
                onClick={() => { setStatusFilter('all'); setSearchQuery(''); }}
                className="mt-2 text-green-600 text-sm hover:underline"
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-gray-500 font-medium pb-3 pr-4">
                      #
                    </th>
                    {[
                      { label: 'Name',      field: 'distributor_name' },
                      { label: 'Territory', field: 'territory' },
                      { label: 'Offtake',   field: 'monthly_offtake' },
                      { label: 'Outlets',   field: 'new_outlet_additions' },
                      { label: 'Coverage',  field: 'coverage_metrics' },
                    ].map(col => (
                      <th key={col.field}
                        onClick={() => handleSort(col.field)}
                        className="text-left text-gray-500 font-medium pb-3 pr-4
                                   cursor-pointer hover:text-green-800
                                   select-none transition-colors duration-150"
                      >
                        <span className="flex items-center gap-1">
                          {col.label}
                          {sortField === col.field ? (
                            <span className="text-green-700 font-bold">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          ) : (
                            <span className="text-gray-300">↕</span>
                          )}
                        </span>
                      </th>
                    ))}
                    <th className="text-left text-gray-500 font-medium pb-3 pr-4">
                      Status
                    </th>
                    <th className="text-left text-gray-500 font-medium pb-3">
                      Alerts
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* ── Use paginatedDistributors not filteredDistributors ── */}
                  {paginatedDistributors.map((d, index) => (
                    <motion.tr
                      key={d.id}
                      onClick={() => navigate(`/distributor/${d.id}`)}
                      className="border-b border-gray-50 cursor-pointer group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                      whileHover={{ backgroundColor: "#f0fdf4" }}
                      style={{ position: "relative" }}
                    >
                      {/* Row number shows GLOBAL index not page index */}
                      <td className="py-3 pr-4 text-gray-400">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="font-medium text-green-800
                                         group-hover:underline">
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
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-1 rounded-full text-xs
                                          font-medium ${
                          d.status === "active"
                            ? "bg-green-100 text-green-700"
                            : d.status === "inactive"
                            ? "bg-red-100 text-red-600"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1 flex-wrap">
                          {(parseFloat(d.coverage_metrics) || 0) < 70 && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600
                                             rounded-full text-xs font-medium">
                              ⚠️ Low Coverage
                            </span>
                          )}
                          {(d.monthly_offtake || 0) < 300 && (
                            <span className="px-2 py-0.5 bg-yellow-100
                                             text-yellow-700 rounded-full
                                             text-xs font-medium">
                              📉 Low Offtake
                            </span>
                          )}
                          {(parseFloat(d.coverage_metrics) || 0) >= 70 &&
                           (d.monthly_offtake || 0) >= 300 && (
                            <span className="px-2 py-0.5 bg-green-100
                                             text-green-600 rounded-full
                                             text-xs font-medium">
                              ✅ Good
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Pagination Controls ───────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6
                              pt-4 border-t border-gray-100">

                {/* Record count info */}
                <p className="text-xs text-gray-400">
                  Showing{' '}
                  <span className="font-medium text-gray-600">
                    {((currentPage - 1) * ITEMS_PER_PAGE) + 1}
                  </span>
                  {' '}to{' '}
                  <span className="font-medium text-gray-600">
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredDistributors.length
                    )}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium text-gray-600">
                    {filteredDistributors.length}
                  </span>
                  {' '}records
                </p>

                {/* Page buttons */}
                <div className="flex items-center gap-2">

                  {/* Previous */}
                  <motion.button
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={currentPage === 1}
                    whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                    whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold
                               border border-gray-200 transition-all
                               disabled:opacity-40 disabled:cursor-not-allowed
                               hover:bg-green-50 hover:border-green-300
                               hover:text-green-800"
                  >
                    ← Previous
                  </motion.button>

                  {/* Page numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .map(page => (
                      <motion.button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-8 h-8 rounded-xl text-xs font-semibold
                                    transition-all ${
                          currentPage === page
                            ? 'bg-green-800 text-white shadow-md'
                            : 'border border-gray-200 text-gray-500 hover:bg-green-50 hover:border-green-300 hover:text-green-800'
                        }`}
                      >
                        {page}
                      </motion.button>
                    ))}

                  {/* Next */}
                  <motion.button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage === totalPages}
                    whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                    whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold
                               border border-gray-200 transition-all
                               disabled:opacity-40 disabled:cursor-not-allowed
                               hover:bg-green-50 hover:border-green-300
                               hover:text-green-800"
                  >
                    Next →
                  </motion.button>

                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

export default DashboardPage;