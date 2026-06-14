import API_BASE from '../config';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
  Legend
} from 'recharts';

// ============================================================
// 📝 NOTE: COUNT-UP HOOK (same as Dashboard + Detail)
// Animates a number from 0 → target with easeOut curve.
// Only works for numbers — strings like "87%" are handled separately.
// ============================================================
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const startTime = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const numTarget = parseFloat(target);
    if (!numTarget || numTarget === 0) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((easeOut * numTarget).toFixed(1)));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
      else setCount(numTarget);
    };

    startTime.current = null;
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
}

// ============================================================
// 📝 NOTE: SKELETON REPORTS PAGE
// Shown while data is loading. Mirrors the real layout exactly
// so the page doesn't "jump" when real data arrives.
// ============================================================
function SkeletonReports() {
  return (
    <div className="p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-52 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-72 bg-gray-100 rounded" />
        </div>
        <div className="h-11 w-32 bg-gray-200 rounded-xl" />
      </div>
      {/* 4 summary card skeletons */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-24">
            <div className="h-3 w-24 bg-gray-100 rounded mb-3" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      {/* Top performer skeleton */}
      <div className="h-20 bg-gray-200 rounded-2xl mb-8" />
      {/* Chart skeletons */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 h-64" />
        <div className="bg-white rounded-2xl p-6 border border-gray-100 h-64" />
      </div>
      {/* Table skeleton */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="flex gap-6 mb-3">
            <div className="h-4 w-8 bg-gray-100 rounded" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 📝 NOTE: SUMMARY CARD WITH COUNT-UP
// Each of the 4 cards at the top counts up its number.
// isDecimal = true for the avgCoverage (shows one decimal place).
// ============================================================
function SummaryCard({ label, rawValue, color, icon, delay, suffix = '', isDecimal = false }) {
  const animated = useCountUp(parseFloat(rawValue) || 0);

  const displayValue = isDecimal
    ? animated.toFixed(1) + suffix
    : Math.floor(animated).toLocaleString() + suffix;

  return (
    <motion.div
      className="bg-white rounded-2xl p-5 border border-gray-100 relative overflow-hidden"
      style={{ boxShadow: "0 4px 20px rgba(27,94,32,0.07)" }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.4, delay }}
    >
      {/* Colored top border */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: color }} />

      {/* Decorative bg circle */}
      <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full opacity-5"
        style={{ background: color }} />

      <div className="flex items-center justify-between mb-2 mt-1">
        <p className="text-gray-500 text-xs font-medium">{label}</p>
        <span className="text-base font-bold" style={{ color }}>{icon}</span>
      </div>
      <p className="text-3xl font-bold" style={{ color }}>
        {displayValue}
      </p>
    </motion.div>
  );
}

// ============================================================
// 📝 NOTE: ANIMATED TABLE PROGRESS BAR
// The small coverage bar inside each table row.
// Uses motion.div with initial width 0 → real width.
// delay is passed in so bars appear after the row fades in.
// ============================================================
function TableProgressBar({ value, delay }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
        />
      </div>
      <span className="text-gray-500 text-xs">{value}%</span>
    </div>
  );
}

// ============================================================
// MAIN REPORTS PAGE COMPONENT
// ============================================================
function ReportsPage() {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 📝 exportFlash: briefly shows a "✓ Exported!" message on the button
  const [exportFlash, setExportFlash] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
       const response = await fetch(`${API_BASE}/api/distributors`);
        const data = await response.json();
        const list = Array.isArray(data) ? data
          : (Array.isArray(data.data) ? data.data : []);
        setDistributors(list);
      } catch (err) {
        setError('Could not load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Calculated Stats ──────────────────────────────────────
  const totalDistributors = distributors.length;
  const activeCount = distributors.filter(d => d.status === 'active').length;
  const totalOfftake = distributors.reduce((s, d) => s + (d.monthly_offtake || 0), 0);
  const avgCoverage = distributors.length
    ? (distributors.reduce((s, d) => s + (parseFloat(d.coverage_metrics) || 0), 0) / distributors.length).toFixed(1)
    : 0;
  const topPerformer = distributors.find(d => d.performance_ranking === 1);

  // ── Chart Data ────────────────────────────────────────────
  const offtakeData = distributors.map(d => ({
    name: d.distributor_name.split(' ')[0],
    offtake: d.monthly_offtake,
    outlets: d.new_outlet_additions || 0,
  }));

  const coverageData = distributors.map(d => ({
    name: d.distributor_name.split(' ')[0],
    coverage: parseFloat(d.coverage_metrics) || 0,
  }));

  // ── CSV Export ────────────────────────────────────────────
  // 📝 After exporting, we flash the button green for 2 seconds
  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Territory', 'Monthly Offtake',
      'New Outlets', 'Coverage %', 'Ranking', 'Status'];
    const rows = distributors.map(d => [
      d.id, d.distributor_name, d.territory, d.monthly_offtake,
      d.new_outlet_additions || 0, d.coverage_metrics || 0,
      d.performance_ranking || 'N/A', d.status,
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arvi-edibles-distributors.csv';
    a.click();
    URL.revokeObjectURL(url);

    // Flash the button
    setExportFlash(true);
    setTimeout(() => setExportFlash(false), 2000);
  };

  if (loading) return <SkeletonReports />;

  if (error) {
    return (
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
        >
          <p className="text-red-600 font-medium">⚠️ {error}</p>
          <p className="text-gray-400 text-sm mt-1">
            Make sure backend is running on port 5000
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen"
      style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #fafafa 60%)" }}>

      {/* ── Page Header ───────────────────────────────────── */}
      <motion.div
        className="flex items-center justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Reports & Analytics</h2>
          <p className="text-gray-500 mt-1">
            Performance overview for all distributors
          </p>
        </div>

        {/* 📝 Export button: turns green + shows checkmark after download */}
        <motion.button
          onClick={exportCSV}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          animate={{
            background: exportFlash
              ? "linear-gradient(135deg, #166534, #15803d)"
              : "linear-gradient(135deg, #1B5E20, #2e7d32)",
          }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl
                     text-white font-semibold text-sm"
          style={{ boxShadow: "0 4px 16px rgba(27,94,32,0.25)" }}
        >
          {/* AnimatePresence swaps the icon smoothly */}
          <AnimatePresence mode="wait">
            {exportFlash ? (
              <motion.span
                key="check"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                ✓ Exported!
              </motion.span>
            ) : (
              <motion.span
                key="download"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                ⬇ Export CSV
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* ── Summary Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        <SummaryCard label="Total Distributors" rawValue={totalDistributors}
          color="#1B5E20" icon="▤" delay={0.1} />
        <SummaryCard label="Active Distributors" rawValue={activeCount}
          color="#F9A825" icon="◉" delay={0.2} />
        <SummaryCard label="Total Offtake" rawValue={totalOfftake}
          color="#1565C0" icon="◈" delay={0.3} suffix=" " />
        <SummaryCard label="Avg Coverage" rawValue={avgCoverage}
          color="#7B1FA2" icon="◎" delay={0.4} suffix="%" isDecimal />
      </div>

      {/* ── Top Performer Banner ───────────────────────────── */}
      {topPerformer && (
        <motion.div
          className="rounded-2xl p-5 mb-8 flex items-center gap-4 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1B5E20 0%, #2e7d32 100%)",
            boxShadow: "0 4px 24px rgba(27,94,32,0.2)",
          }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
        >
          {/* Decorative blur circle */}
          <div className="absolute right-0 top-0 w-40 h-40 rounded-full opacity-10"
            style={{ background: "#F9A825", filter: "blur(40px)", transform: "translate(20%,-20%)" }} />

          {/* Pulsing avatar */}
          <div className="relative flex-shrink-0">
            <motion.div
              className="absolute inset-0 rounded-xl bg-yellow-400 opacity-30"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative w-12 h-12 bg-yellow-500 rounded-xl flex items-center
                            justify-center text-green-900 font-bold text-lg z-10">
              {topPerformer.distributor_name.charAt(0)}
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-green-200 text-xs font-medium uppercase tracking-wide">
              🏆 Top Performer — Rank #1
            </p>
            <p className="text-white font-bold text-lg">
              {topPerformer.distributor_name}
            </p>
            <p className="text-green-300 text-sm">
              {topPerformer.territory} · {topPerformer.monthly_offtake?.toLocaleString()} units
            </p>
          </div>

          {/* Animated trophy */}
          <motion.div
            className="ml-auto text-4xl relative z-10"
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            🏆
          </motion.div>
        </motion.div>
      )}

      {/* ── Charts Row ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-6 mb-8">

        <motion.div
          className="bg-white rounded-2xl p-6 border border-gray-100"
          style={{ boxShadow: "0 4px 20px rgba(27,94,32,0.06)" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className="text-base font-semibold text-gray-700 mb-1">
            Monthly Offtake vs New Outlets
          </h3>
          <p className="text-gray-400 text-xs mb-4">
            Comparing offtake units and new outlet additions
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={offtakeData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{
                backgroundColor: 'white', border: '1px solid #e5e7eb',
                borderRadius: '12px', fontSize: '12px',
              }} />
              <Legend />
              <Bar dataKey="offtake" fill="#1B5E20" radius={[4, 4, 0, 0]}
                name="Offtake" isAnimationActive animationDuration={1200} />
              <Bar dataKey="outlets" fill="#F9A825" radius={[4, 4, 0, 0]}
                name="New Outlets" isAnimationActive animationDuration={1400} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-6 border border-gray-100"
          style={{ boxShadow: "0 4px 20px rgba(27,94,32,0.06)" }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-base font-semibold text-gray-700 mb-1">
            Coverage Metrics Trend
          </h3>
          <p className="text-gray-400 text-xs mb-4">
            Territory coverage percentage per distributor
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={coverageData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{
                backgroundColor: 'white', border: '1px solid #e5e7eb',
                borderRadius: '12px', fontSize: '12px',
              }} />
              <Legend />
              <Line type="monotone" dataKey="coverage" stroke="#1565C0"
                strokeWidth={2.5} dot={{ fill: '#1565C0', r: 5 }}
                activeDot={{ r: 7 }} name="Coverage %"
                isAnimationActive animationDuration={1500} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

      </div>

      {/* ── Full Data Table ───────────────────────────────── */}
      <motion.div
        className="bg-white rounded-2xl p-6 border border-gray-100"
        style={{ boxShadow: "0 4px 20px rgba(27,94,32,0.06)" }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        {/* Green→Amber top accent */}
        <div className="h-0.5 w-full rounded-full mb-5"
          style={{ background: "linear-gradient(90deg, #1B5E20, #F9A825)" }} />

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-700">
            Detailed Performance Table
          </h3>
          <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            {distributors.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Rank', 'Name', 'Territory', 'Offtake', 'Outlets', 'Coverage', 'Status'].map(h => (
                  <th key={h}
                    className="text-left text-gray-400 font-medium pb-3 pr-4 text-xs uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {distributors
                .sort((a, b) => (a.performance_ranking || 99) - (b.performance_ranking || 99))
                .map((d, i) => (
                  <motion.tr
                    key={d.id}
                    className="border-b border-gray-50 cursor-default"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ backgroundColor: "#f0fdf4" }}
                    transition={{ delay: 0.8 + i * 0.07 }}
                  >
                    <td className="py-3 pr-4">
                      {/* 📝 Rank #1 gets a gold badge, others just show the number */}
                      {d.performance_ranking === 1 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5
                                         bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                          🥇 #1
                        </span>
                      ) : (
                        <span className="font-bold text-green-800">
                          #{d.performance_ranking || 'N/A'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 font-medium text-gray-800">
                      {d.distributor_name}
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{d.territory}</td>
                    <td className="py-3 pr-4 font-medium text-gray-700">
                      {d.monthly_offtake?.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-gray-500">
                      {d.new_outlet_additions || 0}
                    </td>
                    <td className="py-3 pr-4">
                      {/* 📝 Each bar animates after its row appears (delay staggered) */}
                      <TableProgressBar
                        value={d.coverage_metrics || 0}
                        delay={0.9 + i * 0.07}
                      />
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        d.status === 'active'   ? 'bg-green-100 text-green-700'
                        : d.status === 'inactive' ? 'bg-red-100 text-red-600'
                        : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
      </motion.div>

    </div>
  );
}

export default ReportsPage;