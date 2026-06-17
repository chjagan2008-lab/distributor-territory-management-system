// 📝 NOTE: DashboardPage.js — Redesigned to match dark glassmorphism theme
// 📝 NOTE: ALL data logic, hooks, API calls, charts kept 100% UNCHANGED
// 📝 NOTE: Only visual styling updated to match Login + Sidebar dark theme

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, Legend
} from "recharts";
import API_BASE from '../config';

// ─── SHARED STYLE TOKENS ────────────────────────────────────────────────────
// 📝 NOTE: Define colors once at the top — easy to update later
const T = {
  bg:          '#0b1a0d',           // page background
  card:        'rgba(255,255,255,0.04)', // glass card bg
  cardBorder:  'rgba(255,255,255,0.09)', // glass card border
  textPrimary: '#f8fafc',           // main white text
  textMuted:   'rgba(248,250,252,0.45)', // muted grey text
  textFaint:   'rgba(248,250,252,0.25)', // very faint text
  green:       '#16a34a',           // brand green
  greenGlow:   'rgba(22,163,74,0.15)',
  amber:       '#f59e0b',           // brand amber/gold
  amberGlow:   'rgba(245,158,11,0.15)',
  red:         '#ef4444',
  redGlow:     'rgba(239,68,68,0.12)',
  border:      'rgba(255,255,255,0.07)',
};

// ─── USE COUNT UP HOOK ───────────────────────────────────────────────────────
// 📝 NOTE: Animates numbers from 0 to target value on load — UNCHANGED
function useCountUp(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const startTime = useRef(null);
  const frameRef  = useRef(null);

  useEffect(() => {
    if (target === 0) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const easeOut  = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };
    startTime.current = null;
    frameRef.current  = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
}

// ─── SKELETON LOADERS ────────────────────────────────────────────────────────
// 📝 NOTE: Shown while data is loading — dark themed version
function SkeletonCard() {
  return (
    <div style={{
      background:   T.card,
      border:       `1px solid ${T.cardBorder}`,
      borderRadius: 16,
      padding:      24,
    }}>
      <div style={{ height: 12, width: 80, background: 'rgba(255,255,255,0.08)',
        borderRadius: 6, marginBottom: 16 }} />
      <div style={{ height: 36, width: 60, background: 'rgba(255,255,255,0.08)',
        borderRadius: 8, marginBottom: 12 }} />
      <div style={{ height: 10, width: 64, background: 'rgba(255,255,255,0.05)',
        borderRadius: 6 }} />
    </div>
  );
}

function SkeletonTable() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array(4).fill(0).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 16 }}>
          {[24, 128, 96, 64, 48, 64].map((w, j) => (
            <div key={j} style={{
              height: 14, width: w,
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 4,
            }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────
// 📝 NOTE: Shows animated number with icon and label
// 📝 NOTE: accentColor = top border + icon bg + number color
function StatCard({ label, value, suffix = "", accentColor, accentGlow, icon, delay }) {
  const animatedValue = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ duration: 0.5, delay }}
      style={{
        background:       T.card,
        border:           `1px solid ${T.cardBorder}`,
        borderRadius:     16,
        padding:          '1.5rem',
        position:         'relative',
        overflow:         'hidden',
        cursor:           'default',
        backdropFilter:   'blur(12px)',
      }}
    >
      {/* 📝 NOTE: Coloured top accent bar — each card has different colour */}
      <div style={{
        position:     'absolute',
        top: 0, left: 0, right: 0,
        height:       3,
        background:   accentColor,
        borderRadius: '16px 16px 0 0',
      }} />

      {/* 📝 NOTE: Subtle glow circle behind icon */}
      <div style={{
        position:     'absolute',
        top:          -30, right: -30,
        width:        100, height: 100,
        borderRadius: '50%',
        background:   accentGlow,
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: 12, marginTop: 4 }}>
        <p style={{ color: T.textMuted, fontSize: 13, fontWeight: 500 }}>
          {label}
        </p>
        {/* 📝 NOTE: Icon badge with matching accent glow background */}
        <span style={{
          fontSize:       18,
          padding:        '6px 8px',
          borderRadius:   10,
          background:     accentGlow,
          border:         `1px solid ${accentColor}30`,
        }}>
          {icon}
        </span>
      </div>

      {/* 📝 NOTE: animatedValue counts up from 0 on page load */}
      <p style={{ fontSize: 36, fontWeight: 700, color: accentColor, margin: 0 }}>
        {animatedValue.toLocaleString()}{suffix}
      </p>

      {/* Bottom accent line */}
      <div style={{
        marginTop:    16, height: 2, borderRadius: 2,
        background:   accentColor, opacity: 0.18,
      }} />
    </motion.div>
  );
}

// ─── ANIMATION VARIANTS ──────────────────────────────────────────────────────
const containerVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

// ─── MAIN DASHBOARD COMPONENT ────────────────────────────────────────────────
function DashboardPage() {

  // 📝 NOTE: All state variables — UNCHANGED from your original
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery]   = useState('');
  const [sortField, setSortField]       = useState(null);
  const [sortOrder, setSortOrder]       = useState('asc');
  const [currentPage, setCurrentPage]   = useState(1);
  const ITEMS_PER_PAGE = 10;
  const navigate = useNavigate();

  // 📝 NOTE: Fetch distributors from backend API — UNCHANGED
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

  // 📝 NOTE: Reset to page 1 whenever filter or search changes — UNCHANGED
  useEffect(() => { setCurrentPage(1); }, [statusFilter, searchQuery]);

  // ─── COMPUTED VALUES ─────────────────────────────────────────────────────
  // 📝 NOTE: All these calculations are UNCHANGED
  const totalDistributors = distributors.length;
  const totalOfftake      = distributors.reduce((sum, d) => sum + (d.monthly_offtake || 0), 0);
  const activeCount       = distributors.filter(d => d.status === "active").length;
  const lowCoverageCount  = distributors.filter(d => (parseFloat(d.coverage_metrics) || 0) < 70).length;
  const lowOfftakeCount   = distributors.filter(d => (d.monthly_offtake || 0) < 300).length;

  // 📝 NOTE: Sort handler toggles asc/desc on same field — UNCHANGED
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 📝 NOTE: Filter → Search → Sort pipeline — UNCHANGED
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

  // 📝 NOTE: Slice data for current page — UNCHANGED
  const totalPages             = Math.ceil(filteredDistributors.length / ITEMS_PER_PAGE);
  const paginatedDistributors  = filteredDistributors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 📝 NOTE: Chart data — UNCHANGED
  const barData  = distributors.map(d => ({
    name:    d.distributor_name.split(' ')[0],
    offtake: d.monthly_offtake,
  }));
  const pieData  = [
    { name: 'Active',   value: distributors.filter(d => d.status === 'active').length },
    { name: 'Inactive', value: distributors.filter(d => d.status === 'inactive').length },
    { name: 'Pending',  value: distributors.filter(d => d.status === 'pending').length },
  ].filter(item => item.value > 0);
  const PIE_COLORS = ['#16a34a', '#ef4444', '#f59e0b'];

  // ─── LOADING STATE ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: 32, background: T.bg, minHeight: '100vh' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ height: 28, width: 140, background: 'rgba(255,255,255,0.08)',
            borderRadius: 8, marginBottom: 8 }} />
          <div style={{ height: 14, width: 280, background: 'rgba(255,255,255,0.05)',
            borderRadius: 6 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
          gap: 24, marginBottom: 32 }}>
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.cardBorder}`,
          borderRadius: 16, padding: 24 }}>
          <div style={{ height: 18, width: 120, background: 'rgba(255,255,255,0.08)',
            borderRadius: 6, marginBottom: 24 }} />
          <SkeletonTable />
        </div>
      </div>
    );
  }

  // ─── ERROR STATE ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ padding: 32, background: T.bg, minHeight: '100vh' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background:   T.redGlow,
            border:       '1px solid rgba(239,68,68,0.3)',
            borderRadius: 16,
            padding:      24,
            textAlign:    'center',
          }}
        >
          <p style={{ color: '#f87171', fontWeight: 600 }}>Could not load data</p>
          <p style={{ color: 'rgba(248,113,113,0.7)', fontSize: 13, marginTop: 4 }}>
            {error}
          </p>
          <p style={{ color: T.textFaint, fontSize: 13, marginTop: 8 }}>
            Make sure backend is running on port 5000
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── MAIN RENDER ─────────────────────────────────────────────────────────
  return (
    // 📝 NOTE: Dark background matches sidebar + login page perfectly
    <div style={{ padding: 32, minHeight: '100vh', background: T.bg }}>

      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <motion.div
        style={{ marginBottom: 28 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 style={{ fontSize: 26, fontWeight: 700, color: T.textPrimary, margin: 0 }}>
          Dashboard
        </h2>
        <p style={{ color: T.textMuted, marginTop: 4, fontSize: 14 }}>
          Welcome to Arvi Edibles Distributor Management System
        </p>
        {/* 📝 NOTE: Golden accent line — same as login + sidebar signature */}
        <div style={{
          width: 36, height: 2, background: T.amber,
          borderRadius: 2, marginTop: 10,
        }} />
      </motion.div>

      {/* ── ALERT BANNERS ───────────────────────────────────────────────── */}
      {/* 📝 NOTE: Only shown when there are coverage or offtake problems */}
      {(lowCoverageCount > 0 || lowOfftakeCount > 0) && (
        <motion.div
          style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {lowCoverageCount > 0 && (
            <div style={{
              display:      'flex',
              alignItems:   'center',
              gap:          12,
              padding:      '12px 16px',
              borderRadius: 12,
              background:   'rgba(239,68,68,0.10)',
              border:       '1px solid rgba(239,68,68,0.25)',
            }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#f87171', fontWeight: 600,
                  fontSize: 13, margin: 0 }}>Low Coverage Alert</p>
                <p style={{ color: 'rgba(248,113,113,0.7)', fontSize: 12,
                  marginTop: 2 }}>
                  {lowCoverageCount} distributor(s) have coverage below 70%.
                  Immediate attention required!
                </p>
              </div>
              <span style={{
                background:   'rgba(239,68,68,0.15)',
                color:        '#f87171',
                padding:      '3px 10px',
                borderRadius: 20,
                fontSize:     11,
                fontWeight:   700,
                whiteSpace:   'nowrap',
              }}>
                {lowCoverageCount} affected
              </span>
            </div>
          )}
          {lowOfftakeCount > 0 && (
            <div style={{
              display:      'flex',
              alignItems:   'center',
              gap:          12,
              padding:      '12px 16px',
              borderRadius: 12,
              background:   'rgba(245,158,11,0.10)',
              border:       '1px solid rgba(245,158,11,0.25)',
            }}>
              <span style={{ fontSize: 18 }}>📉</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#fbbf24', fontWeight: 600,
                  fontSize: 13, margin: 0 }}>Low Offtake Alert</p>
                <p style={{ color: 'rgba(251,191,36,0.7)', fontSize: 12,
                  marginTop: 2 }}>
                  {lowOfftakeCount} distributor(s) have monthly offtake below
                  300 units. Review performance!
                </p>
              </div>
              <span style={{
                background:   'rgba(245,158,11,0.15)',
                color:        '#fbbf24',
                padding:      '3px 10px',
                borderRadius: 20,
                fontSize:     11,
                fontWeight:   700,
                whiteSpace:   'nowrap',
              }}>
                {lowOfftakeCount} affected
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* ── STAT CARDS ──────────────────────────────────────────────────── */}
      {/* 📝 NOTE: 3 cards in a row — each has different accent colour */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 24, marginBottom: 28,
      }}>
        <StatCard
          label="Total Distributors"
          value={totalDistributors}
          accentColor={T.green}
          accentGlow={T.greenGlow}
          icon="🏪" delay={0.1}
        />
        <StatCard
          label="Total Monthly Offtake"
          value={totalOfftake}
          accentColor="#378ADD"
          accentGlow="rgba(55,138,221,0.15)"
          icon="📦" delay={0.2}
        />
        <StatCard
          label="Active Distributors"
          value={activeCount}
          accentColor={T.amber}
          accentGlow={T.amberGlow}
          icon="✅" delay={0.3}
        />
      </div>

      {/* ── CHARTS ROW ──────────────────────────────────────────────────── */}
      {/* 📝 NOTE: Only shown when there is data to display */}
      {distributors.length > 0 && (
        <motion.div
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 24, marginBottom: 28,
          }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Bar Chart Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            style={{
              background:   T.card,
              border:       `1px solid ${T.cardBorder}`,
              borderRadius: 16,
              padding:      24,
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 600,
              color: T.textPrimary, marginBottom: 20, margin: '0 0 20px' }}>
              Monthly Offtake by Distributor
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.06)" />
                {/* 📝 NOTE: Axis tick colors changed to match dark theme */}
                <XAxis dataKey="name"
                  tick={{ fontSize: 11, fill: T.textMuted }} />
                <YAxis
                  tick={{ fontSize: 11, fill: T.textMuted }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a2e1c',
                    border:          '1px solid rgba(255,255,255,0.12)',
                    borderRadius:    10,
                    fontSize:        12,
                    color:           T.textPrimary,
                  }}
                />
                <Bar dataKey="offtake" fill={T.green}
                  radius={[6, 6, 0, 0]} name="Monthly Offtake"
                  isAnimationActive animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            style={{
              background:   T.card,
              border:       `1px solid ${T.cardBorder}`,
              borderRadius: 16,
              padding:      24,
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 600,
              color: T.textPrimary, margin: '0 0 20px' }}>
              Distributor Status
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  paddingAngle={4} dataKey="value"
                  isAnimationActive animationDuration={1200}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a2e1c',
                    border:          '1px solid rgba(255,255,255,0.12)',
                    borderRadius:    10,
                    fontSize:        12,
                    color:           T.textPrimary,
                  }}
                />
                <Legend iconType="circle" iconSize={8}
                  formatter={(value) => (
                    <span style={{ fontSize: 12, color: T.textMuted }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </motion.div>
      )}

      {/* ── DISTRIBUTORS TABLE ──────────────────────────────────────────── */}
      <motion.div
        style={{
          background:   T.card,
          border:       `1px solid ${T.cardBorder}`,
          borderRadius: 16,
          padding:      24,
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {/* Table toolbar — search + filters */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          marginBottom:   16,
          flexWrap:       'wrap',
          gap:            12,
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 600,
            color: T.textPrimary, margin: 0 }}>
            All Distributors{' '}
            <span style={{ fontSize: 12, fontWeight: 400, color: T.textFaint }}>
              (click a row to see details)
            </span>
          </h3>

          <div style={{ display: 'flex', alignItems: 'center',
            gap: 10, flexWrap: 'wrap' }}>

            {/* 📝 NOTE: Search input — dark themed */}
            <div style={{ position: 'relative' }}>
              <span style={{
                position:  'absolute', left: 10,
                top: '50%', transform: 'translateY(-50%)',
                fontSize:  13, color: T.textMuted,
                pointerEvents: 'none',
              }}>🔍</span>
              <input
                type="text"
                placeholder="Search name or territory..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  paddingLeft:   32,
                  paddingRight:  searchQuery ? 28 : 12,
                  paddingTop:    8,
                  paddingBottom: 8,
                  background:    'rgba(255,255,255,0.05)',
                  border:        '1px solid rgba(255,255,255,0.1)',
                  borderRadius:  10,
                  fontSize:      12,
                  color:         T.textPrimary,
                  outline:       'none',
                  width:         200,
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(22,163,74,0.6)';
                  e.target.style.boxShadow   = '0 0 0 3px rgba(22,163,74,0.12)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.target.style.boxShadow   = 'none';
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position:   'absolute', right: 8,
                    top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color:      T.textMuted, cursor: 'pointer',
                    fontSize:   11, fontWeight: 700,
                  }}
                >✕</button>
              )}
            </div>

            {/* 📝 NOTE: Filter buttons — amber when active, muted when not */}
            <div style={{ display: 'flex', gap: 6 }}>
              {['all', 'active', 'inactive', 'pending'].map(filter => {
                const isActive = statusFilter === filter;
                const colors = {
                  all:      { bg: 'rgba(22,163,74,0.2)',   text: '#4ade80',  border: 'rgba(22,163,74,0.4)'  },
                  active:   { bg: 'rgba(74,222,128,0.12)', text: '#4ade80',  border: 'rgba(74,222,128,0.3)' },
                  inactive: { bg: 'rgba(239,68,68,0.12)',  text: '#f87171',  border: 'rgba(239,68,68,0.3)'  },
                  pending:  { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24',  border: 'rgba(245,158,11,0.3)' },
                };
                return (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    style={{
                      padding:      '5px 10px',
                      borderRadius: 8,
                      fontSize:     11,
                      fontWeight:   600,
                      cursor:       'pointer',
                      textTransform:'capitalize',
                      transition:   'all 0.2s',
                      background:   isActive
                        ? colors[filter].bg
                        : 'rgba(255,255,255,0.04)',
                      color: isActive
                        ? colors[filter].text
                        : T.textFaint,
                      border: `1px solid ${isActive
                        ? colors[filter].border
                        : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    {filter === 'all'
                      ? `All (${distributors.length})`
                      : `${filter} (${distributors.filter(
                          d => d.status === filter).length})`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Search hint */}
        {searchQuery && (
          <p style={{ fontSize: 11, color: T.textFaint, marginBottom: 10 }}>
            Showing results for{' '}
            <span style={{ color: '#4ade80', fontWeight: 600 }}>
              "{searchQuery}"
            </span>
            {' '}— {filteredDistributors.length} found{' '}
            <button onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none',
                color: '#f87171', cursor: 'pointer', fontSize: 11,
                textDecoration: 'underline' }}>
              clear
            </button>
          </p>
        )}

        {/* Sort hint */}
        {sortField && (
          <p style={{ fontSize: 11, color: T.textFaint, marginBottom: 10 }}>
            Sorted by{' '}
            <span style={{ color: '#4ade80', fontWeight: 600 }}>
              {sortField.replace('_', ' ')}
            </span>
            {' '}— {sortOrder === 'asc' ? 'low to high ↑' : 'high to low ↓'}{' '}
            <button onClick={() => setSortField(null)}
              style={{ background: 'none', border: 'none',
                color: '#f87171', cursor: 'pointer', fontSize: 11,
                textDecoration: 'underline' }}>
              clear sort
            </button>
          </p>
        )}

        {/* Empty state */}
        {filteredDistributors.length === 0 ? (
          <div style={{
            height:         160,
            background:     'rgba(255,255,255,0.02)',
            borderRadius:   12,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexDirection:  'column',
            gap:            8,
          }}>
            <p style={{ color: T.textMuted, fontSize: 14 }}>
              {searchQuery
                ? `No results for "${searchQuery}"`
                : `No ${statusFilter} distributors found`}
            </p>
            <button
              onClick={() => { setStatusFilter('all'); setSearchQuery(''); }}
              style={{ background: 'none', border: 'none',
                color: '#4ade80', cursor: 'pointer',
                fontSize: 12, textDecoration: 'underline' }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {/* ── TABLE ────────────────────────────────────────────────── */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    <th style={{ textAlign: 'left', color: T.textMuted,
                      fontWeight: 500, paddingBottom: 10, paddingRight: 16,
                      fontSize: 12 }}>#</th>
                    {[
                      { label: 'Name',      field: 'distributor_name' },
                      { label: 'Territory', field: 'territory' },
                      { label: 'Offtake',   field: 'monthly_offtake' },
                      { label: 'Outlets',   field: 'new_outlet_additions' },
                      { label: 'Coverage',  field: 'coverage_metrics' },
                    ].map(col => (
                      <th
                        key={col.field}
                        onClick={() => handleSort(col.field)}
                        style={{
                          textAlign:   'left',
                          color:       sortField === col.field
                            ? '#4ade80' : T.textMuted,
                          fontWeight:  500,
                          paddingBottom: 10,
                          paddingRight:  16,
                          cursor:      'pointer',
                          fontSize:    12,
                          userSelect:  'none',
                          whiteSpace:  'nowrap',
                        }}
                      >
                        {col.label}{' '}
                        {sortField === col.field
                          ? (sortOrder === 'asc' ? '↑' : '↓')
                          : <span style={{ color: 'rgba(255,255,255,0.15)' }}>↕</span>}
                      </th>
                    ))}
                    <th style={{ textAlign: 'left', color: T.textMuted,
                      fontWeight: 500, paddingBottom: 10,
                      paddingRight: 16, fontSize: 12 }}>Status</th>
                    <th style={{ textAlign: 'left', color: T.textMuted,
                      fontWeight: 500, paddingBottom: 10, fontSize: 12 }}>
                      Alerts
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDistributors.map((d, index) => (
                    <motion.tr
                      key={d.id}
                      onClick={() => navigate(`/distributor/${d.id}`)}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 * index }}
                      style={{ borderBottom: `1px solid ${T.border}`,
                        cursor: 'pointer' }}
                      // 📝 NOTE: Row hover = subtle green glow background
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(22,163,74,0.06)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={{ padding: '12px 16px 12px 0',
                        color: T.textFaint, fontSize: 12 }}>
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td style={{ padding: '12px 16px 12px 0' }}>
                        <span style={{ color: '#4ade80', fontWeight: 600 }}>
                          {d.distributor_name}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px 12px 0',
                        color: T.textMuted }}>{d.territory}</td>
                      <td style={{ padding: '12px 16px 12px 0',
                        color: T.textMuted }}>
                        {d.monthly_offtake?.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px 12px 0',
                        color: T.textMuted }}>
                        {d.new_outlet_additions ?? 0}
                      </td>
                      <td style={{ padding: '12px 16px 12px 0',
                        color: T.textMuted }}>
                        {d.coverage_metrics ?? 0}%
                      </td>
                      <td style={{ padding: '12px 16px 12px 0' }}>
                        {/* 📝 NOTE: Status badge colours match dark theme */}
                        <span style={{
                          padding:      '3px 10px',
                          borderRadius: 20,
                          fontSize:     11,
                          fontWeight:   600,
                          background:
                            d.status === 'active'
                              ? 'rgba(74,222,128,0.12)'
                              : d.status === 'inactive'
                              ? 'rgba(239,68,68,0.12)'
                              : 'rgba(245,158,11,0.12)',
                          color:
                            d.status === 'active'   ? '#4ade80'
                            : d.status === 'inactive' ? '#f87171'
                            : '#fbbf24',
                        }}>
                          {d.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 0 12px 0' }}>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {(parseFloat(d.coverage_metrics) || 0) < 70 && (
                            <span style={{
                              padding:      '2px 8px',
                              borderRadius: 20,
                              fontSize:     10,
                              fontWeight:   600,
                              background:   'rgba(239,68,68,0.12)',
                              color:        '#f87171',
                            }}>⚠️ Low Coverage</span>
                          )}
                          {(d.monthly_offtake || 0) < 300 && (
                            <span style={{
                              padding:      '2px 8px',
                              borderRadius: 20,
                              fontSize:     10,
                              fontWeight:   600,
                              background:   'rgba(245,158,11,0.12)',
                              color:        '#fbbf24',
                            }}>📉 Low Offtake</span>
                          )}
                          {(parseFloat(d.coverage_metrics) || 0) >= 70 &&
                           (d.monthly_offtake || 0) >= 300 && (
                            <span style={{
                              padding:      '2px 8px',
                              borderRadius: 20,
                              fontSize:     10,
                              fontWeight:   600,
                              background:   'rgba(74,222,128,0.12)',
                              color:        '#4ade80',
                            }}>✅ Good</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── PAGINATION ──────────────────────────────────────────── */}
            {/* 📝 NOTE: Only shown when there are multiple pages */}
            {totalPages > 1 && (
              <div style={{
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'space-between',
                marginTop:      20,
                paddingTop:     16,
                borderTop:      `1px solid ${T.border}`,
              }}>
                <p style={{ fontSize: 11, color: T.textFaint }}>
                  Showing{' '}
                  <span style={{ color: T.textMuted, fontWeight: 600 }}>
                    {((currentPage - 1) * ITEMS_PER_PAGE) + 1}
                  </span>
                  {' '}to{' '}
                  <span style={{ color: T.textMuted, fontWeight: 600 }}>
                    {Math.min(currentPage * ITEMS_PER_PAGE,
                      filteredDistributors.length)}
                  </span>
                  {' '}of{' '}
                  <span style={{ color: T.textMuted, fontWeight: 600 }}>
                    {filteredDistributors.length}
                  </span>
                  {' '}records
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* Previous button */}
                  <motion.button
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={currentPage === 1}
                    whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                    whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                    style={{
                      padding:      '5px 10px',
                      borderRadius: 8,
                      fontSize:     11,
                      fontWeight:   600,
                      cursor:       currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity:      currentPage === 1 ? 0.35 : 1,
                      background:   'rgba(255,255,255,0.04)',
                      border:       `1px solid ${T.border}`,
                      color:        T.textMuted,
                    }}
                  >← Previous</motion.button>

                  {/* Page number buttons */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <motion.button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        width:        30, height: 30,
                        borderRadius: 8,
                        fontSize:     11,
                        fontWeight:   600,
                        cursor:       'pointer',
                        background:   currentPage === page
                          ? T.green : 'rgba(255,255,255,0.04)',
                        color:        currentPage === page
                          ? '#fff' : T.textMuted,
                        border:       `1px solid ${currentPage === page
                          ? T.green : T.border}`,
                      }}
                    >{page}</motion.button>
                  ))}

                  {/* Next button */}
                  <motion.button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage === totalPages}
                    whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                    whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                    style={{
                      padding:      '5px 10px',
                      borderRadius: 8,
                      fontSize:     11,
                      fontWeight:   600,
                      cursor:       currentPage === totalPages
                        ? 'not-allowed' : 'pointer',
                      opacity:      currentPage === totalPages ? 0.35 : 1,
                      background:   'rgba(255,255,255,0.04)',
                      border:       `1px solid ${T.border}`,
                      color:        T.textMuted,
                    }}
                  >Next →</motion.button>
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