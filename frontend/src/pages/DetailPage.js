import API_BASE from '../config';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, TrendingUp,
         ShoppingBag, Star, Activity, Award } from 'lucide-react';

// ============================================================
// 📝 NOTE: REUSING THE COUNT-UP HOOK FROM DASHBOARD
// Same hook — animates a number from 0 → target over 1.2s.
// We copy it here because each page is its own file.
// ============================================================
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const startTime = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!target || target === 0) return;
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

// ============================================================
// 📝 NOTE: SKELETON DETAIL PAGE
// Shown while we wait for the API to return distributor data.
// Each "block" represents a real element (header, cards, table).
// animate-pulse = Tailwind's built-in fade in/out animation.
// ============================================================
function SkeletonDetail() {
  return (
    <div className="p-8 animate-pulse">
      {/* Back button skeleton */}
      <div className="h-5 w-36 bg-gray-200 rounded mb-6" />

      {/* Hero card skeleton */}
      <div className="rounded-2xl p-8 mb-6 bg-gray-200 h-32" />

      {/* 4 stat card skeletons */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl" />
              <div className="h-3 w-28 bg-gray-100 rounded" />
            </div>
            <div className="h-10 w-20 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-24 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Info card skeleton */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="h-5 w-36 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-16 bg-gray-100 rounded mb-2" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 📝 NOTE: STAT CARD WITH COUNT-UP
// Each card animates its number from 0 to the real value.
// "prefix" and "suffix" let us add # or % around the number.
// ============================================================
function StatCard({ icon: Icon, iconBg, iconColor, label, value, prefix = '', suffix = '', subtext, delay, extra }) {
  const animatedValue = useCountUp(typeof value === 'number' ? value : 0);

  return (
    <motion.div
      className="rounded-2xl p-6 border border-gray-100 relative overflow-hidden"
      style={{
        // 📝 Same glassmorphism as Dashboard stat cards
        background: "rgba(255,255,255,0.80)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "0 4px 24px rgba(27,94,32,0.06)",
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.4, delay }}
    >
      {/* Decorative corner circle */}
      <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-5"
        style={{ background: iconColor }} />

      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <p className="text-gray-500 text-sm font-medium">{label}</p>
      </div>

      <p className="text-4xl font-bold" style={{ color: iconColor.replace('text-', '') }}>
        {prefix}{typeof value === 'number' ? animatedValue.toLocaleString() : value}{suffix}
      </p>
      <p className="text-gray-400 text-sm mt-1">{subtext}</p>

      {/* 📝 "extra" lets us pass in a progress bar or star row */}
      {extra}
    </motion.div>
  );
}

// ============================================================
// 📝 NOTE: ANIMATED PROGRESS BAR
// Shows coverage % as a visual bar.
// The bar animates from 0% → real width on page load.
// "transition={{ duration: 1, delay: 0.6 }}" waits 0.6s then grows.
// ============================================================
function CoverageBar({ value }) {
  return (
    <div className="mt-3">
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #1565C0, #42a5f5)" }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1">{value}% of territory covered</p>
    </div>
  );
}

// ============================================================
// 📝 NOTE: STAR RANKING VISUAL
// Shows up to 5 stars based on ranking.
// Rank 1 = 5 stars, Rank 2 = 4 stars, etc.
// Stars animate in one by one using staggerChildren.
// ============================================================
function RankingStars({ rank }) {
  if (!rank) return null;
  // Convert rank number to star count (rank 1 = 5 stars, rank 5+ = 1 star)
  const stars = Math.max(1, 6 - rank);

  return (
    <motion.div
      className="flex gap-1 mt-3"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.5 } } }}
    >
      {Array(5).fill(0).map((_, i) => (
        <motion.div
          key={i}
          variants={{ hidden: { opacity: 0, scale: 0 }, visible: { opacity: 1, scale: 1 } }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Star
            className="w-4 h-4"
            fill={i < stars ? "#9333ea" : "none"}
            stroke={i < stars ? "#9333ea" : "#d1d5db"}
          />
        </motion.div>
      ))}
      <span className="text-xs text-gray-400 ml-1 self-center">Rank #{rank}</span>
    </motion.div>
  );
}

// ============================================================
// MAIN DETAIL PAGE COMPONENT
// ============================================================
function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [distributor, setDistributor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDistributor = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/distributors`);
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.data || []);
        const found = list.find(d => d.id === parseInt(id));
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

  // 📝 Show skeleton while loading (much better than a spinner)
  if (loading) return <SkeletonDetail />;

  if (error) {
    return (
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
        >
          <p className="text-red-600 font-medium">⚠️ {error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-green-800 text-white rounded-xl text-sm"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // Get initials for avatar (first letter of first + last name)
  const initials = distributor.distributor_name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const statusColors = {
    active:   { bg: 'bg-green-500',  text: 'text-white', label: '● Active' },
    inactive: { bg: 'bg-red-500',    text: 'text-white', label: '● Inactive' },
    pending:  { bg: 'bg-yellow-400', text: 'text-gray-900', label: '● Pending' },
  };
  const statusStyle = statusColors[distributor.status] || statusColors.pending;

  return (
    <div className="p-8 min-h-screen"
      style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #fafafa 60%)" }}>

      {/* ── Back Button ───────────────────────────────────────── */}
      {/* 📝 whileHover moves the whole button left 4px */}
      <motion.button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-500 hover:text-green-800
                   transition-colors mb-6 group font-medium text-sm"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ x: -4 }}
      >
        <ArrowLeft className="w-4 h-4 transition-transform" />
        Back to Dashboard
      </motion.button>

      {/* ── Hero Card ─────────────────────────────────────────── */}
      <motion.div
        className="rounded-2xl p-8 mb-6 relative overflow-hidden"
        style={{
          // 📝 Rich gradient background using your brand green
          background: "linear-gradient(135deg, #1B5E20 0%, #2e7d32 60%, #1a5e35 100%)",
          boxShadow: "0 8px 40px rgba(27,94,32,0.25)",
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Decorative blurred circles in background */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "#F9A825", filter: "blur(60px)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
          style={{ background: "#ffffff", filter: "blur(40px)", transform: "translate(-20%, 30%)" }} />

        <div className="relative flex items-center gap-6">

          {/* Avatar with animated pulse ring */}
          <div className="relative flex-shrink-0">
            {/* 📝 The outer ring pulses using Framer Motion scale animation */}
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{ background: "#F9A825", opacity: 0.3 }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative w-20 h-20 bg-yellow-500 rounded-2xl flex items-center
                            justify-center text-green-900 font-bold text-2xl z-10"
              style={{ boxShadow: "0 4px 16px rgba(249,168,37,0.4)" }}>
              {initials}
            </div>
          </div>

          {/* Name + Territory */}
          <div className="flex-1">
            <motion.h2
              className="text-3xl font-bold text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {distributor.distributor_name}
            </motion.h2>
            <motion.p
              className="text-green-200 mt-1.5 flex items-center gap-2 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <MapPin className="w-4 h-4 text-yellow-400" />
              {distributor.territory}
            </motion.p>
          </div>

          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            <span className={`px-4 py-2 rounded-full text-sm font-bold
                             ${statusStyle.bg} ${statusStyle.text}`}
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
              {statusStyle.label.toUpperCase()}
            </span>
          </motion.div>

        </div>
      </motion.div>

      {/* ── Stats Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-6 mb-6">

        <StatCard
          icon={ShoppingBag}
          iconBg="bg-green-50"
          iconColor="text-green-700"
          label="Monthly Offtake"
          value={distributor.monthly_offtake}
          suffix=" units"
          subtext="Units dispatched this month"
          delay={0.2}
        />

        <StatCard
          icon={TrendingUp}
          iconBg="bg-yellow-50"
          iconColor="text-yellow-600"
          label="New Outlet Additions"
          value={distributor.new_outlet_additions ?? 0}
          subtext="New outlets added this period"
          delay={0.3}
        />

        <StatCard
          icon={Activity}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Coverage Metrics"
          value={distributor.coverage_metrics ?? 0}
          suffix="%"
          subtext="Territory coverage"
          delay={0.4}
          // 📝 "extra" renders the animated progress bar below the number
          extra={<CoverageBar value={distributor.coverage_metrics ?? 0} />}
        />

        <StatCard
          icon={Award}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          label="Performance Ranking"
          value={distributor.performance_ranking ?? null}
          prefix="#"
          subtext="Overall ranking"
          delay={0.5}
          extra={<RankingStars rank={distributor.performance_ranking} />}
        />

      </div>

      {/* ── Record Info Card ──────────────────────────────────── */}
      <motion.div
        className="bg-white rounded-2xl p-6 border border-gray-100"
        style={{ boxShadow: "0 4px 24px rgba(27,94,32,0.06)" }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        {/* Gradient top bar matching the brand */}
        <div className="h-0.5 w-full rounded-full mb-5"
          style={{ background: "linear-gradient(90deg, #1B5E20, #F9A825)" }} />

        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
          📋 Record Information
        </h3>

        <div className="grid grid-cols-2 gap-5 text-sm">
          {[
            { label: "Record ID",    value: `#${distributor.id}` },
            { label: "Status",       value: distributor.status?.charAt(0).toUpperCase() + distributor.status?.slice(1) },
            { label: "Created At",   value: new Date(distributor.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
            { label: "Last Updated", value: new Date(distributor.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
          ].map((item, i) => (
            // 📝 Each info row fades in with a small delay after the card appears
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.07 }}
            >
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                {item.label}
              </p>
              <p className="font-semibold text-gray-700">{item.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}

export default DetailPage;