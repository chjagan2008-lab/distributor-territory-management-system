// 📝 NOTE: DetailPage.js — Redesigned to match dark glassmorphism theme
// 📝 NOTE: ALL logic unchanged — delete modal, count-up, stars, coverage bar
// 📝 NOTE: Only colors, backgrounds, borders updated to dark theme

import API_BASE from '../config';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, TrendingUp,
  ShoppingBag, Star, Activity, Award
} from 'lucide-react';

// ─── STYLE TOKENS ────────────────────────────────────────────────────────────
// 📝 NOTE: Same token system used across all redesigned pages
const T = {
  bg:        '#0b1a0d',
  card:      'rgba(255,255,255,0.04)',
  border:    'rgba(255,255,255,0.09)',
  text:      '#f8fafc',
  textMuted: 'rgba(248,250,252,0.45)',
  textFaint: 'rgba(248,250,252,0.22)',
  green:     '#16a34a',
  amber:     '#f59e0b',
  blue:      '#378ADD',
  purple:    '#a855f7',
};

// ─── COUNT UP HOOK (UNCHANGED) ───────────────────────────────────────────────
// 📝 NOTE: Animates number from 0 → target with easeOut — same as all pages
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const startTime         = useRef(null);
  const frameRef          = useRef(null);

  useEffect(() => {
    if (!target || target === 0) return;
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

// ─── SKELETON LOADER ─────────────────────────────────────────────────────────
// 📝 NOTE: Dark themed skeleton shown while data loads
function SkeletonDetail() {
  const skBox = (w, h) => ({
    height: h, width: w,
    background: 'rgba(255,255,255,0.07)',
    borderRadius: 6, marginBottom: 8,
  });
  return (
    <div style={{ padding:32, background:T.bg, minHeight:'100vh' }}>
      <div style={skBox(140,18)} />
      <div style={{ background:T.card, border:`1px solid ${T.border}`,
        borderRadius:16, height:120, marginBottom:24 }} />
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)',
        gap:24, marginBottom:24 }}>
        {Array(4).fill(0).map((_,i) => (
          <div key={i} style={{ background:T.card,
            border:`1px solid ${T.border}`, borderRadius:16, padding:24 }}>
            <div style={{ display:'flex', gap:12, marginBottom:16 }}>
              <div style={{ width:40, height:40,
                background:'rgba(255,255,255,0.07)', borderRadius:10 }} />
              <div style={skBox(112,12)} />
            </div>
            <div style={skBox(80,36)} />
            <div style={skBox(96,12)} />
          </div>
        ))}
      </div>
      <div style={{ background:T.card, border:`1px solid ${T.border}`,
        borderRadius:16, padding:24 }}>
        <div style={skBox(140,18)} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
          {Array(4).fill(0).map((_,i) => (
            <div key={i}>
              <div style={skBox(64,10)} />
              <div style={skBox(96,16)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────
// 📝 NOTE: Dark glass card with icon, count-up value, subtext, and optional extra
function StatCard({ icon:Icon, iconBg, iconColor, label, value,
                    prefix='', suffix='', subtext, delay, extra }) {
  const animatedValue = useCountUp(typeof value === 'number' ? value : 0);

  return (
    <motion.div
      style={{
        background:   T.card,
        border:       `1px solid ${T.border}`,
        borderRadius: 16,
        padding:      '1.5rem',
        position:     'relative',
        overflow:     'hidden',
      }}
      initial={{ opacity:0, y:30 }}
      animate={{ opacity:1, y:0  }}
      whileHover={{ y:-4, scale:1.01 }}
      transition={{ duration:0.4, delay }}
    >
      {/* Decorative glow circle behind icon colour */}
      <div style={{
        position:'absolute', bottom:-16, right:-16,
        width:80, height:80, borderRadius:'50%',
        background:iconBg, opacity:0.4,
      }} />

      <div style={{ display:'flex', alignItems:'center',
        gap:12, marginBottom:16 }}>
        {/* Icon badge */}
        <div style={{
          width:40, height:40, borderRadius:10,
          background:iconBg,
          display:'flex', alignItems:'center', justifyContent:'center',
          flexShrink:0,
        }}>
          <Icon style={{ width:18, height:18, color:iconColor }} />
        </div>
        <p style={{ color:T.textMuted, fontSize:13, fontWeight:500 }}>
          {label}
        </p>
      </div>

      {/* 📝 NOTE: animatedValue counts up from 0 on mount */}
      <p style={{ fontSize:36, fontWeight:700, color:iconColor, margin:0 }}>
        {prefix}
        {typeof value === 'number' ? animatedValue.toLocaleString() : value}
        {suffix}
      </p>
      <p style={{ color:T.textFaint, fontSize:12, marginTop:4 }}>
        {subtext}
      </p>
      {extra}
    </motion.div>
  );
}

// ─── COVERAGE BAR ────────────────────────────────────────────────────────────
// 📝 NOTE: Animated progress bar for coverage metric — dark themed
function CoverageBar({ value }) {
  return (
    <div style={{ marginTop:12 }}>
      <div style={{
        height:4, background:'rgba(255,255,255,0.08)',
        borderRadius:4, overflow:'hidden',
      }}>
        <motion.div
          style={{
            height:'100%', borderRadius:4,
            background:'linear-gradient(90deg, #378ADD, #60a5fa)',
          }}
          initial={{ width:0 }}
          animate={{ width:`${Math.min(value,100)}%` }}
          transition={{ duration:1.2, delay:0.5, ease:'easeOut' }}
        />
      </div>
      <p style={{ fontSize:11, color:T.textFaint, marginTop:4 }}>
        {value}% of territory covered
      </p>
    </div>
  );
}

// ─── RANKING STARS ───────────────────────────────────────────────────────────
// 📝 NOTE: Shows 1–5 stars based on rank — higher rank = more stars
// 📝 NOTE: Stars animate in one by one using staggerChildren
function RankingStars({ rank }) {
  if (!rank) return null;
  const stars = Math.max(1, 6 - rank);
  return (
    <motion.div
      style={{ display:'flex', gap:4, marginTop:12 }}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: {
        staggerChildren:0.1, delayChildren:0.5,
      }}}}
    >
      {Array(5).fill(0).map((_,i) => (
        <motion.div
          key={i}
          variants={{
            hidden:  { opacity:0, scale:0 },
            visible: { opacity:1, scale:1 },
          }}
          transition={{ type:'spring', stiffness:300 }}
        >
          <Star
            style={{ width:16, height:16 }}
            fill={i < stars ? T.purple : 'none'}
            stroke={i < stars ? T.purple : 'rgba(255,255,255,0.2)'}
          />
        </motion.div>
      ))}
      <span style={{ fontSize:11, color:T.textFaint,
        marginLeft:4, alignSelf:'center' }}>
        Rank #{rank}
      </span>
    </motion.div>
  );
}

// ─── MAIN DETAIL PAGE ────────────────────────────────────────────────────────
function DetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();

  const [distributor,     setDistributor]     = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  // 📝 NOTE: Delete modal state — UNCHANGED
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting,        setDeleting]        = useState(false);

  // 📝 NOTE: Fetch distributor by ID from API — UNCHANGED
  useEffect(() => {
    const fetchDistributor = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/distributors`);
        const data     = await response.json();
        const list     = Array.isArray(data) ? data : (data.data || []);
        const found    = list.find(d => d.id === parseInt(id));
        if (!found) setError('Distributor not found');
        else setDistributor(found);
      } catch (err) {
        setError('Could not load distributor data');
      } finally {
        setLoading(false);
      }
    };
    fetchDistributor();
  }, [id]);

  // 📝 NOTE: DELETE handler — calls DELETE API then navigates to dashboard
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/api/distributors/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        navigate('/dashboard');
      } else {
        alert('Delete failed: ' + data.message);
      }
    } catch (err) {
      alert('Delete failed. Try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <SkeletonDetail />;

  if (error) {
    return (
      <div style={{ padding:32, background:T.bg, minHeight:'100vh' }}>
        <motion.div
          initial={{ opacity:0, scale:0.95 }}
          animate={{ opacity:1, scale:1 }}
          style={{
            background:   'rgba(239,68,68,0.10)',
            border:       '1px solid rgba(239,68,68,0.25)',
            borderRadius: 16, padding:24, textAlign:'center',
          }}
        >
          <p style={{ color:'#f87171', fontWeight:600 }}>⚠️ {error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              marginTop:    16, padding:'8px 20px',
              background:   T.green, color:'#fff',
              border:       'none', borderRadius:10,
              cursor:       'pointer', fontSize:13,
            }}
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // 📝 NOTE: Get first 2 initials from distributor name for avatar
  const initials = distributor.distributor_name
    .split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

  // 📝 NOTE: Status badge colours — dark themed versions
  const statusConfig = {
    active:   { bg:'rgba(74,222,128,0.15)',  text:'#4ade80',  border:'rgba(74,222,128,0.3)',  label:'● Active'   },
    inactive: { bg:'rgba(239,68,68,0.15)',   text:'#f87171',  border:'rgba(239,68,68,0.3)',   label:'● Inactive' },
    pending:  { bg:'rgba(245,158,11,0.15)',  text:'#fbbf24',  border:'rgba(245,158,11,0.3)',  label:'● Pending'  },
  };
  const statusStyle = statusConfig[distributor.status] || statusConfig.pending;

  return (
    // 📝 NOTE: Dark background — matches all other redesigned pages
    <div style={{ padding:32, minHeight:'100vh', background:T.bg }}>

      {/* ── TOP BAR — Back + Edit + Delete ──────────────────────────────── */}
      <div style={{ display:'flex', alignItems:'center',
        justifyContent:'space-between', marginBottom:24 }}>

        {/* Back button */}
        <motion.button
          onClick={() => navigate('/dashboard')}
          style={{
            display:    'flex', alignItems:'center', gap:8,
            color:      T.textMuted, fontSize:13, fontWeight:500,
            background: 'none', border:'none', cursor:'pointer',
          }}
          initial={{ opacity:0, x:-20 }}
          animate={{ opacity:1, x:0   }}
          transition={{ duration:0.3 }}
          whileHover={{ x:-4 }}
          onMouseEnter={e => e.currentTarget.style.color='#4ade80'}
          onMouseLeave={e => e.currentTarget.style.color=T.textMuted}
        >
          <ArrowLeft style={{ width:16, height:16 }} />
          Back to Dashboard
        </motion.button>

        {/* Edit + Delete buttons */}
        <motion.div
          style={{ display:'flex', gap:10 }}
          initial={{ opacity:0, x:20 }}
          animate={{ opacity:1, x:0  }}
          transition={{ duration:0.3 }}
        >
          {/* 📝 NOTE: Edit navigates to the edit page for this distributor */}
          <motion.button
            onClick={() => navigate(`/distributor/${id}/edit`)}
            whileHover={{ scale:1.04 }}
            whileTap={{  scale:0.96  }}
            style={{
              display:      'flex', alignItems:'center', gap:6,
              padding:      '8px 16px', borderRadius:10,
              background:   'rgba(55,138,221,0.15)',
              border:       '1px solid rgba(55,138,221,0.35)',
              color:        '#60a5fa', fontSize:13,
              fontWeight:   600, cursor:'pointer',
            }}
          >
            ✏️ Edit
          </motion.button>

          {/* 📝 NOTE: Delete opens confirmation modal */}
          <motion.button
            onClick={() => setShowDeleteModal(true)}
            whileHover={{ scale:1.04 }}
            whileTap={{  scale:0.96  }}
            style={{
              display:    'flex', alignItems:'center', gap:6,
              padding:    '8px 16px', borderRadius:10,
              background: 'rgba(239,68,68,0.15)',
              border:     '1px solid rgba(239,68,68,0.35)',
              color:      '#f87171', fontSize:13,
              fontWeight: 600, cursor:'pointer',
            }}
          >
            🗑️ Delete
          </motion.button>
        </motion.div>
      </div>

      {/* ── DELETE CONFIRMATION MODAL ────────────────────────────────────────
          📝 NOTE: Fixed overlay + centred modal card
          📝 NOTE: Uses normal-flow min-height wrapper (no position:fixed issues) */}
      {showDeleteModal && (
        <motion.div
          style={{
            position:       'fixed', inset:0, zIndex:50,
            display:        'flex', alignItems:'center',
            justifyContent: 'center',
            background:     'rgba(0,0,0,0.65)',
          }}
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
        >
          <motion.div
            style={{
              background:   '#0f2415',
              border:       '1px solid rgba(255,255,255,0.12)',
              borderRadius: 20,
              padding:      '2rem',
              maxWidth:     360,
              width:        '100%',
              margin:       '0 1rem',
              boxShadow:    '0 24px 60px rgba(0,0,0,0.5)',
            }}
            initial={{ scale:0.8, opacity:0 }}
            animate={{ scale:1,   opacity:1 }}
            transition={{ type:'spring', stiffness:300 }}
          >
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🗑️</div>
              <h3 style={{ fontSize:18, fontWeight:700,
                color:T.text, margin:'0 0 8px' }}>
                Delete Distributor?
              </h3>
              <p style={{ color:T.textMuted, fontSize:13,
                margin:'0 0 24px', lineHeight:1.6 }}>
                Are you sure you want to delete{' '}
                <strong style={{ color:T.text }}>
                  {distributor.distributor_name}
                </strong>?
                This cannot be undone!
              </p>
              <div style={{ display:'flex', gap:10 }}>
                {/* Cancel */}
                <button
                  onClick={() => setShowDeleteModal(false)}
                  style={{
                    flex:1, padding:'10px',
                    background:'rgba(255,255,255,0.05)',
                    border:`1px solid ${T.border}`,
                    borderRadius:10, color:T.textMuted,
                    fontWeight:600, cursor:'pointer', fontSize:13,
                  }}
                >
                  Cancel
                </button>
                {/* Confirm delete */}
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    flex:1, padding:'10px',
                    background:'rgba(239,68,68,0.2)',
                    border:'1px solid rgba(239,68,68,0.4)',
                    borderRadius:10, color:'#f87171',
                    fontWeight:600, cursor:deleting?'not-allowed':'pointer',
                    fontSize:13, opacity:deleting?0.6:1,
                    display:'flex', alignItems:'center',
                    justifyContent:'center', gap:6,
                  }}
                >
                  {deleting ? (
                    <>
                      {/* 📝 NOTE: Spinning border = loading indicator */}
                      <div style={{
                        width:14, height:14,
                        border:'2px solid #f87171',
                        borderTopColor:'transparent',
                        borderRadius:'50%',
                        animation:'spin 0.8s linear infinite',
                      }} />
                      Deleting...
                    </>
                  ) : 'Yes, Delete!'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ── HERO CARD ────────────────────────────────────────────────────── */}
      {/* 📝 NOTE: Green gradient header with distributor name + territory   */}
      <motion.div
        style={{
          borderRadius: 16,
          padding:      '2rem',
          marginBottom: 24,
          position:     'relative',
          overflow:     'hidden',
          background:   'linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)',
          border:       '1px solid rgba(74,222,128,0.15)',
          boxShadow:    '0 8px 32px rgba(22,163,74,0.2)',
        }}
        initial={{ opacity:0, y:30 }}
        animate={{ opacity:1, y:0  }}
        transition={{ duration:0.5, delay:0.1 }}
      >
        {/* Decorative amber glow */}
        <div style={{
          position:'absolute', top:0, right:0,
          width:200, height:200, borderRadius:'50%',
          background:'rgba(245,158,11,0.12)', filter:'blur(50px)',
          transform:'translate(30%,-30%)',
        }} />
        <div style={{
          position:'absolute', bottom:0, left:0,
          width:160, height:160, borderRadius:'50%',
          background:'rgba(255,255,255,0.05)', filter:'blur(30px)',
          transform:'translate(-20%,30%)',
        }} />

        <div style={{ position:'relative', display:'flex',
          alignItems:'center', gap:24 }}>

          {/* Pulsing avatar */}
          <div style={{ position:'relative', flexShrink:0 }}>
            <motion.div
              style={{
                position:'absolute', inset:0, borderRadius:16,
                background:'rgba(245,158,11,0.3)',
              }}
              animate={{ scale:[1,1.15,1] }}
              transition={{ duration:2.5, repeat:Infinity, ease:'easeInOut' }}
            />
            {/* 📝 NOTE: Green-to-amber gradient avatar with initials */}
            <div style={{
              position:       'relative',
              width:72, height:72,
              background:     'linear-gradient(135deg,#16a34a,#f59e0b)',
              borderRadius:   16,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              color:          '#fff',
              fontWeight:     700,
              fontSize:       24,
              zIndex:         10,
              boxShadow:      '0 4px 16px rgba(245,158,11,0.35)',
            }}>
              {initials}
            </div>
          </div>

          <div style={{ flex:1 }}>
            <motion.h2
              style={{ fontSize:26, fontWeight:700,
                color:'#f8fafc', margin:0 }}
              initial={{ opacity:0, y:10 }}
              animate={{ opacity:1, y:0  }}
              transition={{ delay:0.3 }}
            >
              {distributor.distributor_name}
            </motion.h2>
            <motion.p
              style={{ color:'rgba(74,222,128,0.7)', marginTop:6,
                display:'flex', alignItems:'center', gap:6, fontSize:13 }}
              initial={{ opacity:0 }}
              animate={{ opacity:1 }}
              transition={{ delay:0.4 }}
            >
              <MapPin style={{ width:14, height:14, color:T.amber }} />
              {distributor.territory}
            </motion.p>
          </div>

          {/* Status badge */}
          <motion.div
            initial={{ opacity:0, scale:0.8 }}
            animate={{ opacity:1, scale:1   }}
            transition={{ delay:0.5, type:'spring', stiffness:200 }}
          >
            <span style={{
              padding:      '6px 16px',
              borderRadius: 20,
              fontSize:     12,
              fontWeight:   700,
              background:   statusStyle.bg,
              color:        statusStyle.text,
              border:       `1px solid ${statusStyle.border}`,
            }}>
              {statusStyle.label.toUpperCase()}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* ── STATS GRID ───────────────────────────────────────────────────── */}
      {/* 📝 NOTE: 2x2 grid of stat cards — each has icon + count-up value  */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)',
        gap:24, marginBottom:24 }}>

        <StatCard
          icon={ShoppingBag}
          iconBg="rgba(22,163,74,0.12)"
          iconColor={T.green}
          label="Monthly Offtake"
          value={distributor.monthly_offtake}
          suffix=" units"
          subtext="Units dispatched this month"
          delay={0.2}
        />
        <StatCard
          icon={TrendingUp}
          iconBg="rgba(245,158,11,0.12)"
          iconColor={T.amber}
          label="New Outlet Additions"
          value={distributor.new_outlet_additions ?? 0}
          subtext="New outlets added this period"
          delay={0.3}
        />
        <StatCard
          icon={Activity}
          iconBg="rgba(55,138,221,0.12)"
          iconColor={T.blue}
          label="Coverage Metrics"
          value={distributor.coverage_metrics ?? 0}
          suffix="%"
          subtext="Territory coverage"
          delay={0.4}
          // 📝 NOTE: extra = animated progress bar rendered inside the card
          extra={<CoverageBar value={distributor.coverage_metrics ?? 0} />}
        />
        <StatCard
          icon={Award}
          iconBg="rgba(168,85,247,0.12)"
          iconColor={T.purple}
          label="Performance Ranking"
          value={distributor.performance_ranking ?? null}
          prefix="#"
          subtext="Overall ranking"
          delay={0.5}
          // 📝 NOTE: extra = animated star rating based on rank
          extra={<RankingStars rank={distributor.performance_ranking} />}
        />
      </div>

      {/* ── RECORD INFO CARD ─────────────────────────────────────────────── */}
      {/* 📝 NOTE: Shows ID, status, created date, updated date             */}
      <motion.div
        style={{
          background:   T.card,
          border:       `1px solid ${T.border}`,
          borderRadius: 16,
          padding:      24,
        }}
        initial={{ opacity:0, y:30 }}
        animate={{ opacity:1, y:0  }}
        transition={{ duration:0.4, delay:0.6 }}
      >
        {/* Green-to-amber accent bar */}
        <div style={{
          height:3, borderRadius:2, marginBottom:20,
          background:'linear-gradient(90deg, #16a34a, #f59e0b)',
        }} />

        <h3 style={{ fontSize:14, fontWeight:600,
          color:T.text, margin:'0 0 16px',
          display:'flex', alignItems:'center', gap:8 }}>
          📋 Record Information
        </h3>

        <div style={{ display:'grid',
          gridTemplateColumns:'repeat(2,1fr)', gap:20 }}>
          {[
            { label:'Record ID',
              value:`#${distributor.id}` },
            { label:'Status',
              value: distributor.status?.charAt(0).toUpperCase()
                   + distributor.status?.slice(1) },
            { label:'Created At',
              value: new Date(distributor.created_at).toLocaleDateString(
                'en-IN', { day:'numeric', month:'long', year:'numeric' }) },
            { label:'Last Updated',
              value: new Date(distributor.updated_at).toLocaleDateString(
                'en-IN', { day:'numeric', month:'long', year:'numeric' }) },
          ].map((item,i) => (
            <motion.div
              key={item.label}
              initial={{ opacity:0, x:-10 }}
              animate={{ opacity:1, x:0   }}
              transition={{ delay:0.7 + i*0.07 }}
            >
              <p style={{
                color:         T.textFaint,
                fontSize:      10,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                marginBottom:  4,
              }}>
                {item.label}
              </p>
              <p style={{ fontWeight:600, color:T.text, fontSize:14 }}>
                {item.value}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 📝 NOTE: CSS keyframe for delete button spinner — injected inline */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default DetailPage;