import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import API_BASE from '../config';

const T = {
  bg: '#0b1a0d', card: 'rgba(255,255,255,0.04)', cardBorder: 'rgba(255,255,255,0.09)',
  textPrimary: '#f8fafc', textMuted: 'rgba(248,250,252,0.45)', textFaint: 'rgba(248,250,252,0.25)',
  green: '#16a34a', greenGlow: 'rgba(22,163,74,0.15)', amber: '#f59e0b',
  amberGlow: 'rgba(245,158,11,0.15)', red: '#ef4444', redGlow: 'rgba(239,68,68,0.12)',
  border: 'rgba(255,255,255,0.07)',
};

// ── COUNT UP HOOK (unchanged) ─────────────────────────────────────────────────
function useCountUp(target, duration = 2200) {
  // 📝 NOTE: duration changed from 1500 → 2200ms — slower = more dramatic
  const [count, setCount] = useState(0);
  const startTime = useRef(null); const frameRef = useRef(null);
  useEffect(() => {
    if (target === 0) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));
      if (progress < 1) { frameRef.current = requestAnimationFrame(animate); } else { setCount(target); }
    };
    startTime.current = null; frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);
  return count;
}

function SkeletonCard() {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: 24 }}>
      <div style={{ height: 12, width: 80, background: 'rgba(255,255,255,0.08)', borderRadius: 6, marginBottom: 16 }} />
      <div style={{ height: 36, width: 60, background: 'rgba(255,255,255,0.08)', borderRadius: 8, marginBottom: 12 }} />
    </div>
  );
}

// ── STAT CARD — ENHANCED VERSION ──────────────────────────────────────────────
// 📝 NOTE: 3 new effects added:
//   1. Card glows with accent color when count finishes
//   2. Icon spins + scales when count finishes
//   3. Number bounces up when count finishes
function StatCard({ label, value, suffix = "", accentColor, accentGlow, icon, delay }) {
  const animatedValue = useCountUp(value, 2200);

  // 📝 NOTE: finished = true when animated number reaches the target value
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    // 📝 NOTE: Only trigger once — when count reaches target
    if (animatedValue === value && value > 0) {
      setFinished(true);
    }
  }, [animatedValue, value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ duration: 0.5, delay }}
      style={{
        background: T.card,
        border: `1px solid ${T.cardBorder}`,
        borderRadius: 16,
        padding: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        // 📝 NOTE: boxShadow changes when finished = true
        // Adds a coloured glow matching the card's accent colour
        boxShadow: finished
          ? `0 0 28px ${accentColor}40, 0 4px 16px rgba(0,0,0,0.3)`
          : '0 4px 16px rgba(0,0,0,0.2)',
        transition: 'box-shadow 0.7s ease',
      }}
    >
      {/* Top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accentColor, borderRadius: '16px 16px 0 0' }} />

      {/* Background glow circle */}
      <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: accentGlow }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, marginTop: 4 }}>
        <p style={{ color: T.textMuted, fontSize: 12, fontWeight: 500, margin: 0 }}>{label}</p>

        {/* 📝 NOTE: Icon spins and scales when count finishes */}
        <motion.span
          style={{ fontSize: 16, padding: '4px 6px', borderRadius: 8, background: accentGlow, display: 'block' }}
          animate={finished ? { rotate: [0, 15, -15, 0], scale: [1, 1.25, 1] } : {}}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {icon}
        </motion.span>
      </div>

      {/* 📝 NOTE: Number bounces upward when count finishes */}
      <motion.p
        style={{ fontSize: 32, fontWeight: 700, color: accentColor, margin: 0 }}
        animate={finished ? { y: [0, -10, 0] } : {}}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {animatedValue.toLocaleString()}{suffix}
      </motion.p>
    </motion.div>
  );
}

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } } };
const itemVariants = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

function DashboardPage() {
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/distributors`);
        if (!response.ok) throw new Error("Failed to fetch data from server");
        const data = await response.json();
        const list = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
        setDistributors(list);
      } catch (err) { setError(err.message); } finally { setLoading(false); }
    };
    fetchDistributors();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [statusFilter, searchQuery]);

  const totalDistributors = distributors.length;
  const totalOfftake = distributors.reduce((sum, d) => sum + (d.monthly_offtake || 0), 0);
  const activeCount = distributors.filter(d => d.status === "active").length;
  const lowCoverageCount = distributors.filter(d => (parseFloat(d.coverage_metrics) || 0) < 70).length;
  const lowOfftakeCount = distributors.filter(d => (d.monthly_offtake || 0) < 300).length;

  const handleSort = (field) => {
    if (sortField === field) { setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }
    else { setSortField(field); setSortOrder('asc'); }
  };

  const filteredDistributors = distributors
    .filter(d => statusFilter === 'all' ? true : d.status === statusFilter)
    .filter(d => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return d.distributor_name.toLowerCase().includes(q) || d.territory.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      let aVal = a[sortField] ?? ''; let bVal = b[sortField] ?? '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filteredDistributors.length / ITEMS_PER_PAGE);
  const paginatedDistributors = filteredDistributors.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const barData = distributors.map(d => ({ name: d.distributor_name.split(' ')[0], offtake: d.monthly_offtake }));
  const pieData = [
    { name: 'Active', value: distributors.filter(d => d.status === 'active').length },
    { name: 'Inactive', value: distributors.filter(d => d.status === 'inactive').length },
    { name: 'Pending', value: distributors.filter(d => d.status === 'pending').length },
  ].filter(item => item.value > 0);
  const PIE_COLORS = ['#16a34a', '#ef4444', '#f59e0b'];

  if (loading) {
    return (
      <div style={{ padding: 'clamp(12px,4vw,32px)', background: T.bg, minHeight: '100vh' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 24 }}>
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 'clamp(12px,4vw,32px)', background: T.bg, minHeight: '100vh' }}>
        <div style={{ background: T.redGlow, border: '1px solid rgba(239,68,68,0.3)', borderRadius: 16, padding: 24, textAlign: 'center' }}>
          <p style={{ color: '#f87171', fontWeight: 600 }}>Could not load data</p>
          <p style={{ color: T.textFaint, fontSize: 13, marginTop: 4 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'clamp(12px, 4vw, 32px)', minHeight: '100vh', background: T.bg }}>

      {/* Header */}
      <motion.div style={{ marginBottom: 20 }} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{ fontSize: 'clamp(18px,4vw,26px)', fontWeight: 700, color: T.textPrimary, margin: 0 }}>Dashboard</h2>
        <p style={{ color: T.textMuted, marginTop: 4, fontSize: 13 }}>Welcome to Arvi Edibles Distributor Management System</p>
        <div style={{ width: 36, height: 2, background: T.amber, borderRadius: 2, marginTop: 8 }} />
      </motion.div>

      {/* Alert Banners */}
      {(lowCoverageCount > 0 || lowOfftakeCount > 0) && (
        <motion.div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          {lowCoverageCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
              borderRadius: 12, background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
              <div style={{ flex: 1, minWidth: 140 }}>
                <p style={{ color: '#f87171', fontWeight: 600, fontSize: 12, margin: 0 }}>Low Coverage Alert</p>
                <p style={{ color: 'rgba(248,113,113,0.7)', fontSize: 11, marginTop: 2 }}>
                  {lowCoverageCount} distributor(s) have coverage below 70%
                </p>
              </div>
              <span style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '2px 8px',
                borderRadius: 20, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                {lowCoverageCount} affected
              </span>
            </div>
          )}
          {lowOfftakeCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
              borderRadius: 12, background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>📉</span>
              <div style={{ flex: 1, minWidth: 140 }}>
                <p style={{ color: '#fbbf24', fontWeight: 600, fontSize: 12, margin: 0 }}>Low Offtake Alert</p>
                <p style={{ color: 'rgba(251,191,36,0.7)', fontSize: 11, marginTop: 2 }}>
                  {lowOfftakeCount} distributor(s) have monthly offtake below 300 units
                </p>
              </div>
              <span style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', padding: '2px 8px',
                borderRadius: 20, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                {lowOfftakeCount} affected
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Distributors" value={totalDistributors} accentColor={T.green} accentGlow={T.greenGlow} icon="🏪" delay={0.1} />
        <StatCard label="Total Monthly Offtake" value={totalOfftake} accentColor="#378ADD" accentGlow="rgba(55,138,221,0.15)" icon="📦" delay={0.2} />
        <StatCard label="Active Distributors" value={activeCount} accentColor={T.amber} accentGlow={T.amberGlow} icon="✅" delay={0.3} />
      </div>

      {/* Charts */}
      {distributors.length > 0 && (
        <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 24 }}
          variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, margin: '0 0 16px' }}>Monthly Offtake by Distributor</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: T.textMuted }} />
                <YAxis tick={{ fontSize: 10, fill: T.textMuted }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a2e1c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 11, color: T.textPrimary }} />
                <Bar dataKey="offtake" fill={T.green} radius={[4, 4, 0, 0]} name="Monthly Offtake" isAnimationActive animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
          <motion.div variants={itemVariants} style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, margin: '0 0 16px' }}>Distributor Status</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" isAnimationActive animationDuration={1200}>
                  {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a2e1c', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 11, color: T.textPrimary }} />
                <Legend iconType="circle" iconSize={8} formatter={(value) => (<span style={{ fontSize: 11, color: T.textMuted }}>{value}</span>)} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>
      )}

      {/* Table */}
      <motion.div style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: 'clamp(14px,3vw,24px)' }}
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, margin: 0 }}>
            All Distributors <span style={{ fontSize: 11, color: T.textFaint }}>(tap row for details)</span>
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: T.textMuted, pointerEvents: 'none' }}>🔍</span>
              <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 26, paddingRight: 8, paddingTop: 7, paddingBottom: 7,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, fontSize: 12, color: T.textPrimary, outline: 'none',
                  width: 'clamp(120px,25vw,180px)' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(22,163,74,0.6)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }} />
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {['all', 'active', 'inactive', 'pending'].map(filter => {
                const isActive = statusFilter === filter;
                const colors = {
                  all: { bg: 'rgba(22,163,74,0.2)', text: '#4ade80', border: 'rgba(22,163,74,0.4)' },
                  active: { bg: 'rgba(74,222,128,0.12)', text: '#4ade80', border: 'rgba(74,222,128,0.3)' },
                  inactive: { bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.3)' },
                  pending: { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
                };
                return (
                  <button key={filter} onClick={() => setStatusFilter(filter)}
                    style={{ padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                      cursor: 'pointer', textTransform: 'capitalize',
                      background: isActive ? colors[filter].bg : 'rgba(255,255,255,0.04)',
                      color: isActive ? colors[filter].text : T.textFaint,
                      border: `1px solid ${isActive ? colors[filter].border : 'rgba(255,255,255,0.08)'}` }}>
                    {filter === 'all' ? `All (${distributors.length})` : `${filter} (${distributors.filter(d => d.status === filter).length})`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {filteredDistributors.length === 0 ? (
          <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: T.textMuted, fontSize: 13 }}>No distributors found</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', minWidth: 480 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    <th style={{ textAlign: 'left', color: T.textMuted, fontWeight: 500, paddingBottom: 8, paddingRight: 12, fontSize: 11 }}>#</th>
                    {[{ label: 'Name', field: 'distributor_name' }, { label: 'Territory', field: 'territory' },
                      { label: 'Offtake', field: 'monthly_offtake' }, { label: 'Coverage', field: 'coverage_metrics' }].map(col => (
                      <th key={col.field} onClick={() => handleSort(col.field)}
                        style={{ textAlign: 'left', color: sortField === col.field ? '#4ade80' : T.textMuted,
                          fontWeight: 500, paddingBottom: 8, paddingRight: 12, cursor: 'pointer',
                          fontSize: 11, userSelect: 'none', whiteSpace: 'nowrap' }}>
                        {col.label} {sortField === col.field ? (sortOrder === 'asc' ? '↑' : '↓') : <span style={{ color: 'rgba(255,255,255,0.15)' }}>↕</span>}
                      </th>
                    ))}
                    <th style={{ textAlign: 'left', color: T.textMuted, fontWeight: 500, paddingBottom: 8, fontSize: 11 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDistributors.map((d, index) => (
                    <motion.tr key={d.id} onClick={() => navigate(`/distributor/${d.id}`)}
                      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.04 * index }}
                      style={{ borderBottom: `1px solid ${T.border}`, cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(22,163,74,0.06)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                      <td style={{ padding: '10px 12px 10px 0', color: T.textFaint, fontSize: 11 }}>
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td style={{ padding: '10px 12px 10px 0' }}>
                        <span style={{ color: '#4ade80', fontWeight: 600 }}>{d.distributor_name}</span>
                      </td>
                      <td style={{ padding: '10px 12px 10px 0', color: T.textMuted, whiteSpace: 'nowrap' }}>{d.territory}</td>
                      <td style={{ padding: '10px 12px 10px 0', color: T.textMuted }}>{d.monthly_offtake?.toLocaleString()}</td>
                      <td style={{ padding: '10px 12px 10px 0', color: T.textMuted }}>{d.coverage_metrics ?? 0}%</td>
                      <td style={{ padding: '10px 0' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                          background: d.status === 'active' ? 'rgba(74,222,128,0.12)' : d.status === 'inactive' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                          color: d.status === 'active' ? '#4ade80' : d.status === 'inactive' ? '#f87171' : '#fbbf24' }}>
                          {d.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.border}`, flexWrap: 'wrap', gap: 8 }}>
                <p style={{ fontSize: 11, color: T.textFaint }}>
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredDistributors.length)} of {filteredDistributors.length}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}
                    style={{ padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.35 : 1,
                      background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, color: T.textMuted }}>
                    ← Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      style={{ width: 28, height: 28, borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        background: currentPage === page ? T.green : 'rgba(255,255,255,0.04)',
                        color: currentPage === page ? '#fff' : T.textMuted,
                        border: `1px solid ${currentPage === page ? T.green : T.border}` }}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}
                    style={{ padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600,
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.35 : 1,
                      background: 'rgba(255,255,255,0.04)', border: `1px solid ${T.border}`, color: T.textMuted }}>
                    Next →
                  </button>
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