// 📝 NOTE: ReportsPage.js — Redesigned to match dark glassmorphism theme
// 📝 NOTE: ALL logic unchanged — count-up, CSV export, charts, animations
// 📝 NOTE: Only colors, backgrounds, borders updated to dark theme

import API_BASE from '../config';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';

// ─── STYLE TOKENS ────────────────────────────────────────────────────────────
// 📝 NOTE: Same token system used across all redesigned pages
const T = {
  bg:         '#0b1a0d',
  card:       'rgba(255,255,255,0.04)',
  border:     'rgba(255,255,255,0.09)',
  text:       '#f8fafc',
  textMuted:  'rgba(248,250,252,0.45)',
  textFaint:  'rgba(248,250,252,0.22)',
  green:      '#16a34a',
  greenGlow:  'rgba(22,163,74,0.15)',
  amber:      '#f59e0b',
  amberGlow:  'rgba(245,158,11,0.15)',
  blue:       '#378ADD',
  blueGlow:   'rgba(55,138,221,0.15)',
  purple:     '#a855f7',
  purpleGlow: 'rgba(168,85,247,0.15)',
};

// ─── COUNT UP HOOK (UNCHANGED) ───────────────────────────────────────────────
// 📝 NOTE: Animates numbers from 0 → target with easeOut curve
function useCountUp(target, duration = 1200) {
  const [count, setCount]   = useState(0);
  const startTime           = useRef(null);
  const frameRef            = useRef(null);

  useEffect(() => {
    const numTarget = parseFloat(target);
    if (!numTarget || numTarget === 0) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const easeOut  = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((easeOut * numTarget).toFixed(1)));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
      else setCount(numTarget);
    };

    startTime.current = null;
    frameRef.current  = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return count;
}

// ─── SKELETON LOADER ─────────────────────────────────────────────────────────
// 📝 NOTE: Dark themed skeleton — shown while API data loads
function SkeletonReports() {
  const skBox = (w, h) => ({
    height: h, width: w,
    background: 'rgba(255,255,255,0.07)',
    borderRadius: 6, marginBottom: 8,
  });
  return (
    <div style={{ padding: 32, background: T.bg, minHeight: '100vh' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:32 }}>
        <div>
          <div style={skBox(200,28)} />
          <div style={skBox(280,14)} />
        </div>
        <div style={skBox(120,40)} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20, marginBottom:28 }}>
        {Array(4).fill(0).map((_,i) => (
          <div key={i} style={{ background:T.card, border:`1px solid ${T.border}`,
            borderRadius:16, padding:20, height:96 }}>
            <div style={skBox(90,12)} /><div style={skBox(60,28)} />
          </div>
        ))}
      </div>
      <div style={{ background:T.card, border:`1px solid ${T.border}`,
        borderRadius:16, height:80, marginBottom:28 }} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:24, marginBottom:28 }}>
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, height:280 }} />
        <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, height:280 }} />
      </div>
      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:24 }}>
        <div style={skBox(160,18)} />
        {Array(3).fill(0).map((_,i) => (
          <div key={i} style={{ display:'flex', gap:24, marginBottom:12 }}>
            {[32,112,96,64,48,64].map((w,j) => (
              <div key={j} style={skBox(w,14)} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SUMMARY CARD ────────────────────────────────────────────────────────────
// 📝 NOTE: 4 stat cards at top — each has coloured accent + count-up number
function SummaryCard({ label, rawValue, accentColor, accentGlow, icon, delay, suffix='', isDecimal=false }) {
  const animated = useCountUp(parseFloat(rawValue) || 0);
  const displayValue = isDecimal
    ? animated.toFixed(1) + suffix
    : Math.floor(animated).toLocaleString() + suffix;

  return (
    <motion.div
      style={{
        background:   T.card,
        border:       `1px solid ${T.border}`,
        borderRadius: 16,
        padding:      '1.25rem',
        position:     'relative',
        overflow:     'hidden',
        cursor:       'default',
      }}
      initial={{ opacity:0, y:30 }}
      animate={{ opacity:1, y:0  }}
      whileHover={{ y:-4, scale:1.02 }}
      transition={{ duration:0.4, delay }}
    >
      {/* Coloured top bar */}
      <div style={{
        position:'absolute', top:0, left:0, right:0,
        height:3, background:accentColor,
        borderRadius:'16px 16px 0 0',
      }} />
      {/* Glow circle behind icon */}
      <div style={{
        position:'absolute', top:-20, right:-20,
        width:80, height:80, borderRadius:'50%',
        background:accentGlow,
      }} />
      <div style={{ display:'flex', justifyContent:'space-between',
        alignItems:'flex-start', marginBottom:10, marginTop:4 }}>
        <p style={{ color:T.textMuted, fontSize:12, fontWeight:500 }}>{label}</p>
        <span style={{ fontSize:16, padding:'4px 6px',
          borderRadius:8, background:accentGlow }}>{icon}</span>
      </div>
      {/* 📝 NOTE: animatedValue counts up from 0 on page load */}
      <p style={{ fontSize:30, fontWeight:700, color:accentColor, margin:0 }}>
        {displayValue}
      </p>
    </motion.div>
  );
}

// ─── TABLE PROGRESS BAR ───────────────────────────────────────────────────────
// 📝 NOTE: Animated coverage bar in each table row — dark themed
function TableProgressBar({ value, delay }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{
        width:64, height:4, background:'rgba(255,255,255,0.08)',
        borderRadius:4, overflow:'hidden',
      }}>
        <motion.div
          style={{ height:'100%', background:T.blue, borderRadius:4 }}
          initial={{ width:0 }}
          animate={{ width:`${Math.min(value,100)}%` }}
          transition={{ duration:0.8, delay, ease:'easeOut' }}
        />
      </div>
      <span style={{ fontSize:11, color:T.textMuted }}>{value}%</span>
    </div>
  );
}

// ─── MAIN REPORTS PAGE ────────────────────────────────────────────────────────
function ReportsPage() {
  const [distributors, setDistributors] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  // 📝 NOTE: exportFlash briefly shows "✓ Exported!" on the button
  const [exportFlash,  setExportFlash]  = useState(false);

  // 📝 NOTE: Fetch all distributors from backend — UNCHANGED
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/distributors`);
        const data     = await response.json();
        const list     = Array.isArray(data) ? data
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

  // ─── COMPUTED STATS (UNCHANGED) ────────────────────────────────────────────
  const totalDistributors = distributors.length;
  const activeCount       = distributors.filter(d => d.status === 'active').length;
  const totalOfftake      = distributors.reduce((s,d) => s + (d.monthly_offtake||0), 0);
  const avgCoverage       = distributors.length
    ? (distributors.reduce((s,d) => s+(parseFloat(d.coverage_metrics)||0),0) / distributors.length).toFixed(1)
    : 0;
  const topPerformer      = distributors.find(d => d.performance_ranking === 1);

  // ─── CHART DATA (UNCHANGED) ────────────────────────────────────────────────
  const offtakeData  = distributors.map(d => ({
    name:    d.distributor_name.split(' ')[0],
    offtake: d.monthly_offtake,
    outlets: d.new_outlet_additions || 0,
  }));
  const coverageData = distributors.map(d => ({
    name:     d.distributor_name.split(' ')[0],
    coverage: parseFloat(d.coverage_metrics) || 0,
  }));

  // ─── CSV EXPORT (UNCHANGED) ────────────────────────────────────────────────
  // 📝 NOTE: Creates a CSV file and triggers browser download
  const exportCSV = () => {
    const headers = ['ID','Name','Territory','Monthly Offtake',
      'New Outlets','Coverage %','Ranking','Status'];
    const rows = distributors.map(d => [
      d.id, d.distributor_name, d.territory, d.monthly_offtake,
      d.new_outlet_additions||0, d.coverage_metrics||0,
      d.performance_ranking||'N/A', d.status,
    ]);
    const csv  = [headers,...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'arvi-edibles-distributors.csv';
    a.click();
    URL.revokeObjectURL(url);
    setExportFlash(true);
    setTimeout(() => setExportFlash(false), 2000);
  };

  if (loading) return <SkeletonReports />;

  if (error) {
    return (
      <div style={{ padding:32, background:T.bg, minHeight:'100vh' }}>
        <motion.div
          initial={{ opacity:0, scale:0.95 }}
          animate={{ opacity:1, scale:1 }}
          style={{
            background:'rgba(239,68,68,0.10)',
            border:'1px solid rgba(239,68,68,0.25)',
            borderRadius:16, padding:24, textAlign:'center',
          }}
        >
          <p style={{ color:'#f87171', fontWeight:600 }}>⚠️ {error}</p>
          <p style={{ color:T.textFaint, fontSize:13, marginTop:4 }}>
            Make sure backend is running on port 5000
          </p>
        </motion.div>
      </div>
    );
  }

  // Shared dark tooltip style for all charts
  const tooltipStyle = {
    backgroundColor: '#1a2e1c',
    border:          '1px solid rgba(255,255,255,0.12)',
    borderRadius:    10,
    fontSize:        12,
    color:           T.text,
  };

  return (
    // 📝 NOTE: Dark background — matches all other redesigned pages
    <div style={{ padding:32, minHeight:'100vh', background:T.bg }}>

      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <motion.div
        style={{ display:'flex', alignItems:'center',
          justifyContent:'space-between', marginBottom:28 }}
        initial={{ opacity:0, y:-20 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.5 }}
      >
        <div>
          <h2 style={{ fontSize:24, fontWeight:700, color:T.text, margin:0 }}>
            Reports & Analytics
          </h2>
          <p style={{ color:T.textMuted, marginTop:4, fontSize:14 }}>
            Performance overview for all distributors
          </p>
          {/* 📝 NOTE: Golden accent line — brand signature across all pages */}
          <div style={{
            width:36, height:2, background:T.amber,
            borderRadius:2, marginTop:10,
          }} />
        </div>

        {/* 📝 NOTE: Export button flashes green after download */}
        <motion.button
          onClick={exportCSV}
          whileHover={{ scale:1.04 }}
          whileTap={{ scale:0.96 }}
          style={{
            display:        'flex',
            alignItems:     'center',
            gap:            8,
            padding:        '10px 18px',
            borderRadius:   10,
            border:         `1px solid ${exportFlash
              ? 'rgba(74,222,128,0.4)'
              : 'rgba(22,163,74,0.3)'}`,
            background:     exportFlash
              ? 'rgba(74,222,128,0.15)'
              : 'rgba(22,163,74,0.12)',
            color:          exportFlash ? '#4ade80' : '#4ade80',
            fontWeight:     600,
            fontSize:       13,
            cursor:         'pointer',
          }}
        >
          <AnimatePresence mode="wait">
            {exportFlash ? (
              <motion.span key="check"
                initial={{ opacity:0, scale:0.5 }}
                animate={{ opacity:1, scale:1 }}
                exit={{ opacity:0 }}>
                ✓ Exported!
              </motion.span>
            ) : (
              <motion.span key="download"
                initial={{ opacity:0 }}
                animate={{ opacity:1 }}
                exit={{ opacity:0 }}>
                ⬇ Export CSV
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* ── SUMMARY CARDS ───────────────────────────────────────────────── */}
      {/* 📝 NOTE: 4 cards in a row — each has different accent colour      */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)',
        gap:20, marginBottom:28 }}>
        <SummaryCard label="Total Distributors" rawValue={totalDistributors}
          accentColor={T.green}  accentGlow={T.greenGlow}  icon="🏪" delay={0.1} />
        <SummaryCard label="Active Distributors" rawValue={activeCount}
          accentColor={T.amber}  accentGlow={T.amberGlow}  icon="✅" delay={0.2} />
        <SummaryCard label="Total Offtake" rawValue={totalOfftake}
          accentColor={T.blue}   accentGlow={T.blueGlow}   icon="📦" delay={0.3} />
        <SummaryCard label="Avg Coverage" rawValue={avgCoverage}
          accentColor={T.purple} accentGlow={T.purpleGlow} icon="📊" delay={0.4} suffix="%" isDecimal />
      </div>

      {/* ── TOP PERFORMER BANNER ────────────────────────────────────────── */}
      {/* 📝 NOTE: Only shown when a rank #1 distributor exists in data     */}
      {topPerformer && (
        <motion.div
          style={{
            borderRadius: 16,
            padding:      '1.25rem 1.5rem',
            marginBottom: 28,
            display:      'flex',
            alignItems:   'center',
            gap:          16,
            position:     'relative',
            overflow:     'hidden',
            background:   'linear-gradient(135deg, #14532d 0%, #166534 100%)',
            border:       '1px solid rgba(74,222,128,0.2)',
          }}
          initial={{ opacity:0, x:-30 }}
          animate={{ opacity:1, x:0  }}
          transition={{ duration:0.5, delay:0.45 }}
        >
          {/* Decorative amber glow */}
          <div style={{
            position:'absolute', right:0, top:0,
            width:160, height:160, borderRadius:'50%',
            background:'rgba(245,158,11,0.12)',
            filter:'blur(40px)',
            transform:'translate(20%,-20%)',
          }} />

          {/* Pulsing avatar */}
          <div style={{ position:'relative', flexShrink:0 }}>
            <motion.div
              style={{
                position:'absolute', inset:0, borderRadius:12,
                background:'rgba(245,158,11,0.3)',
              }}
              animate={{ scale:[1,1.2,1] }}
              transition={{ duration:2, repeat:Infinity, ease:'easeInOut' }}
            />
            <div style={{
              position:       'relative',
              width:          48, height:48,
              background:     'linear-gradient(135deg,#16a34a,#f59e0b)',
              borderRadius:   12,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              color:          '#fff',
              fontWeight:     700,
              fontSize:       18,
              zIndex:         10,
            }}>
              {topPerformer.distributor_name.charAt(0)}
            </div>
          </div>

          <div style={{ position:'relative', zIndex:10 }}>
            <p style={{
              color:'rgba(74,222,128,0.7)', fontSize:11,
              fontWeight:600, letterSpacing:'1px',
              textTransform:'uppercase', margin:0,
            }}>
              🏆 Top Performer — Rank #1
            </p>
            <p style={{ color:'#f8fafc', fontWeight:700,
              fontSize:17, margin:'3px 0' }}>
              {topPerformer.distributor_name}
            </p>
            <p style={{ color:'rgba(248,250,252,0.55)', fontSize:13, margin:0 }}>
              {topPerformer.territory} · {topPerformer.monthly_offtake?.toLocaleString()} units
            </p>
          </div>

          {/* 📝 NOTE: Animated trophy spins gently */}
          <motion.div
            style={{ marginLeft:'auto', fontSize:32,
              position:'relative', zIndex:10 }}
            animate={{ rotate:[-5,5,-5] }}
            transition={{ duration:2, repeat:Infinity, ease:'easeInOut' }}
          >
            🏆
          </motion.div>
        </motion.div>
      )}

      {/* ── CHARTS ROW ──────────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)',
        gap:24, marginBottom:28 }}>

        {/* Bar chart — Offtake vs Outlets */}
        <motion.div
          style={{ background:T.card, border:`1px solid ${T.border}`,
            borderRadius:16, padding:24 }}
          initial={{ opacity:0, y:30 }}
          animate={{ opacity:1, y:0  }}
          whileHover={{ scale:1.01 }}
          transition={{ duration:0.5, delay:0.5 }}
        >
          <h3 style={{ fontSize:14, fontWeight:600,
            color:T.text, margin:'0 0 4px' }}>
            Monthly Offtake vs New Outlets
          </h3>
          <p style={{ color:T.textFaint, fontSize:11, margin:'0 0 18px' }}>
            Comparing offtake units and new outlet additions
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={offtakeData}
              margin={{ top:5, right:10, left:0, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize:11, fill:T.textMuted }} />
              <YAxis tick={{ fontSize:11, fill:T.textMuted }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend formatter={v => (
                <span style={{ fontSize:11, color:T.textMuted }}>{v}</span>
              )} />
              <Bar dataKey="offtake" fill={T.green}
                radius={[4,4,0,0]} name="Offtake"
                isAnimationActive animationDuration={1200} />
              <Bar dataKey="outlets" fill={T.amber}
                radius={[4,4,0,0]} name="New Outlets"
                isAnimationActive animationDuration={1400} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Line chart — Coverage trend */}
        <motion.div
          style={{ background:T.card, border:`1px solid ${T.border}`,
            borderRadius:16, padding:24 }}
          initial={{ opacity:0, y:30 }}
          animate={{ opacity:1, y:0  }}
          whileHover={{ scale:1.01 }}
          transition={{ duration:0.5, delay:0.6 }}
        >
          <h3 style={{ fontSize:14, fontWeight:600,
            color:T.text, margin:'0 0 4px' }}>
            Coverage Metrics Trend
          </h3>
          <p style={{ color:T.textFaint, fontSize:11, margin:'0 0 18px' }}>
            Territory coverage percentage per distributor
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={coverageData}
              margin={{ top:5, right:10, left:0, bottom:5 }}>
              <CartesianGrid strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fontSize:11, fill:T.textMuted }} />
              <YAxis domain={[0,100]} tick={{ fontSize:11, fill:T.textMuted }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend formatter={v => (
                <span style={{ fontSize:11, color:T.textMuted }}>{v}</span>
              )} />
              <Line type="monotone" dataKey="coverage"
                stroke={T.blue} strokeWidth={2.5}
                dot={{ fill:T.blue, r:4 }}
                activeDot={{ r:7 }} name="Coverage %"
                isAnimationActive animationDuration={1500} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── DETAILED TABLE ──────────────────────────────────────────────── */}
      <motion.div
        style={{ background:T.card, border:`1px solid ${T.border}`,
          borderRadius:16, padding:24 }}
        initial={{ opacity:0, y:30 }}
        animate={{ opacity:1, y:0  }}
        transition={{ duration:0.5, delay:0.7 }}
      >
        {/* Green-to-amber top accent bar */}
        <div style={{
          height:3, borderRadius:2, marginBottom:20,
          background:'linear-gradient(90deg, #16a34a, #f59e0b)',
        }} />

        <div style={{ display:'flex', alignItems:'center',
          justifyContent:'space-between', marginBottom:16 }}>
          <h3 style={{ fontSize:14, fontWeight:600,
            color:T.text, margin:0 }}>
            Detailed Performance Table
          </h3>
          <span style={{
            fontSize:11, color:T.textMuted,
            background:'rgba(255,255,255,0.05)',
            padding:'3px 10px', borderRadius:20,
            border:`1px solid ${T.border}`,
          }}>
            {distributors.length} records
          </span>
        </div>

        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', fontSize:13, borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${T.border}` }}>
                {['Rank','Name','Territory','Offtake','Outlets','Coverage','Status'].map(h => (
                  <th key={h} style={{
                    textAlign:     'left',
                    color:         T.textFaint,
                    fontWeight:    500,
                    paddingBottom: 10,
                    paddingRight:  16,
                    fontSize:      11,
                    letterSpacing: '0.8px',
                    textTransform: 'uppercase',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {distributors
                .sort((a,b) => (a.performance_ranking||99)-(b.performance_ranking||99))
                .map((d,i) => (
                  <motion.tr
                    key={d.id}
                    style={{ borderBottom:`1px solid ${T.border}`,
                      cursor:'default' }}
                    initial={{ opacity:0, x:-12 }}
                    animate={{ opacity:1, x:0  }}
                    transition={{ delay:0.8 + i*0.07 }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background='rgba(22,163,74,0.06)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background='transparent';
                    }}
                  >
                    {/* Rank badge */}
                    <td style={{ padding:'12px 16px 12px 0' }}>
                      {d.performance_ranking === 1 ? (
                        <span style={{
                          display:'inline-flex', alignItems:'center',
                          gap:4, padding:'2px 8px',
                          background:'rgba(245,158,11,0.15)',
                          color:'#fbbf24', borderRadius:20,
                          fontSize:11, fontWeight:700,
                          border:'1px solid rgba(245,158,11,0.3)',
                        }}>
                          🥇 #1
                        </span>
                      ) : (
                        <span style={{ fontWeight:700, color:'#4ade80', fontSize:12 }}>
                          #{d.performance_ranking||'N/A'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding:'12px 16px 12px 0',
                      fontWeight:600, color:T.text }}>
                      {d.distributor_name}
                    </td>
                    <td style={{ padding:'12px 16px 12px 0',
                      color:T.textMuted }}>
                      {d.territory}
                    </td>
                    <td style={{ padding:'12px 16px 12px 0',
                      fontWeight:500, color:T.text }}>
                      {d.monthly_offtake?.toLocaleString()}
                    </td>
                    <td style={{ padding:'12px 16px 12px 0',
                      color:T.textMuted }}>
                      {d.new_outlet_additions||0}
                    </td>
                    <td style={{ padding:'12px 16px 12px 0' }}>
                      {/* 📝 NOTE: Animated progress bar per row */}
                      <TableProgressBar
                        value={d.coverage_metrics||0}
                        delay={0.9 + i*0.07}
                      />
                    </td>
                    <td style={{ padding:'12px 0' }}>
                      <span style={{
                        padding:'3px 10px', borderRadius:20,
                        fontSize:11, fontWeight:600,
                        background:
                          d.status==='active'   ? 'rgba(74,222,128,0.12)'
                          : d.status==='inactive' ? 'rgba(239,68,68,0.12)'
                          : 'rgba(245,158,11,0.12)',
                        color:
                          d.status==='active'   ? '#4ade80'
                          : d.status==='inactive' ? '#f87171'
                          : '#fbbf24',
                      }}>
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