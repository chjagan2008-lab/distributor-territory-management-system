import API_BASE from '../config';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, TrendingUp,
         ShoppingBag, Star, Activity, Award } from 'lucide-react';

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

function SkeletonDetail() {
  return (
    <div className="p-8 animate-pulse">
      <div className="h-5 w-36 bg-gray-200 rounded mb-6" />
      <div className="rounded-2xl p-8 mb-6 bg-gray-200 h-32" />
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

function StatCard({ icon: Icon, iconBg, iconColor, label, value,
                    prefix = '', suffix = '', subtext, delay, extra }) {
  const animatedValue = useCountUp(typeof value === 'number' ? value : 0);

  return (
    <motion.div
      className="rounded-2xl p-6 border border-gray-100 relative overflow-hidden"
      style={{
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
      <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-5"
        style={{ background: iconColor }} />
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <p className="text-gray-500 text-sm font-medium">{label}</p>
      </div>
      <p className="text-4xl font-bold"
        style={{ color: iconColor.replace('text-', '') }}>
        {prefix}
        {typeof value === 'number' ? animatedValue.toLocaleString() : value}
        {suffix}
      </p>
      <p className="text-gray-400 text-sm mt-1">{subtext}</p>
      {extra}
    </motion.div>
  );
}

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

function RankingStars({ rank }) {
  if (!rank) return null;
  const stars = Math.max(1, 6 - rank);
  return (
    <motion.div className="flex gap-1 mt-3"
      initial="hidden" animate="visible"
      variants={{ visible: { transition: {
        staggerChildren: 0.1, delayChildren: 0.5
      }}}}>
      {Array(5).fill(0).map((_, i) => (
        <motion.div key={i}
          variants={{
            hidden: { opacity: 0, scale: 0 },
            visible: { opacity: 1, scale: 1 }
          }}
          transition={{ type: "spring", stiffness: 300 }}>
          <Star className="w-4 h-4"
            fill={i < stars ? "#9333ea" : "none"}
            stroke={i < stars ? "#9333ea" : "#d1d5db"} />
        </motion.div>
      ))}
      <span className="text-xs text-gray-400 ml-1 self-center">
        Rank #{rank}
      </span>
    </motion.div>
  );
}

function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [distributor, setDistributor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── NEW: Delete state ─────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // ── NEW: Delete handler ───────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/api/distributors/${id}`, {
        method: 'DELETE'
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
      <div className="p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center"
        >
          <p className="text-red-600 font-medium">⚠️ {error}</p>
          <button onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-green-800 text-white rounded-xl text-sm">
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const initials = distributor.distributor_name
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const statusColors = {
    active:   { bg: 'bg-green-500',  text: 'text-white',     label: '● Active' },
    inactive: { bg: 'bg-red-500',    text: 'text-white',     label: '● Inactive' },
    pending:  { bg: 'bg-yellow-400', text: 'text-gray-900',  label: '● Pending' },
  };
  const statusStyle = statusColors[distributor.status] || statusColors.pending;

  return (
    <div className="p-8 min-h-screen"
      style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #fafafa 60%)" }}>

      {/* ── Top Bar: Back + Edit + Delete ─────────────────── */}
      <div className="flex items-center justify-between mb-6">

        <motion.button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-500
                     hover:text-green-800 transition-colors
                     font-medium text-sm group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ x: -4 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </motion.button>

        {/* Edit + Delete buttons */}
        <motion.div className="flex gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Edit */}
          <motion.button
            onClick={() => navigate(`/distributor/${id}/edit`)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
                       text-white text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg, #1565C0, #1976d2)",
              boxShadow: "0 4px 12px rgba(21,101,192,0.3)"
            }}
          >
            ✏️ Edit
          </motion.button>

          {/* Delete */}
          <motion.button
            onClick={() => setShowDeleteModal(true)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl
                       text-white text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg, #c62828, #d32f2f)",
              boxShadow: "0 4px 12px rgba(198,40,40,0.3)"
            }}
          >
            🗑️ Delete
          </motion.button>
        </motion.div>
      </div>

      {/* ── Delete Confirmation Modal ──────────────────────── */}
      {showDeleteModal && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-center">
              <div className="text-5xl mb-4">🗑️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Delete Distributor?
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Are you sure you want to delete{' '}
                <strong>{distributor.distributor_name}</strong>?
                This cannot be undone!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl
                             text-gray-600 font-semibold hover:bg-gray-50
                             transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl
                             font-semibold hover:bg-red-700 transition-colors
                             disabled:opacity-60 flex items-center
                             justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white
                                      border-t-transparent rounded-full
                                      animate-spin"/>
                      Deleting...
                    </>
                  ) : (
                    'Yes, Delete!'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* ── Hero Card ─────────────────────────────────────── */}
      <motion.div
        className="rounded-2xl p-8 mb-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1B5E20 0%, #2e7d32 60%, #1a5e35 100%)",
          boxShadow: "0 8px 40px rgba(27,94,32,0.25)",
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "#F9A825", filter: "blur(60px)",
                   transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
          style={{ background: "#ffffff", filter: "blur(40px)",
                   transform: "translate(-20%, 30%)" }} />

        <div className="relative flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{ background: "#F9A825", opacity: 0.3 }}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative w-20 h-20 bg-yellow-500 rounded-2xl
                            flex items-center justify-center text-green-900
                            font-bold text-2xl z-10"
              style={{ boxShadow: "0 4px 16px rgba(249,168,37,0.4)" }}>
              {initials}
            </div>
          </div>

          <div className="flex-1">
            <motion.h2 className="text-3xl font-bold text-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}>
              {distributor.distributor_name}
            </motion.h2>
            <motion.p
              className="text-green-200 mt-1.5 flex items-center gap-2 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}>
              <MapPin className="w-4 h-4 text-yellow-400" />
              {distributor.territory}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}>
            <span className={`px-4 py-2 rounded-full text-sm font-bold
                             ${statusStyle.bg} ${statusStyle.text}`}
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
              {statusStyle.label.toUpperCase()}
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Stats Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <StatCard icon={ShoppingBag} iconBg="bg-green-50"
          iconColor="text-green-700" label="Monthly Offtake"
          value={distributor.monthly_offtake} suffix=" units"
          subtext="Units dispatched this month" delay={0.2} />

        <StatCard icon={TrendingUp} iconBg="bg-yellow-50"
          iconColor="text-yellow-600" label="New Outlet Additions"
          value={distributor.new_outlet_additions ?? 0}
          subtext="New outlets added this period" delay={0.3} />

        <StatCard icon={Activity} iconBg="bg-blue-50"
          iconColor="text-blue-600" label="Coverage Metrics"
          value={distributor.coverage_metrics ?? 0} suffix="%"
          subtext="Territory coverage" delay={0.4}
          extra={<CoverageBar value={distributor.coverage_metrics ?? 0} />} />

        <StatCard icon={Award} iconBg="bg-purple-50"
          iconColor="text-purple-600" label="Performance Ranking"
          value={distributor.performance_ranking ?? null}
          prefix="#" subtext="Overall ranking" delay={0.5}
          extra={<RankingStars rank={distributor.performance_ranking} />} />
      </div>

      {/* ── Record Info Card ──────────────────────────────── */}
      <motion.div
        className="bg-white rounded-2xl p-6 border border-gray-100"
        style={{ boxShadow: "0 4px 24px rgba(27,94,32,0.06)" }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <div className="h-0.5 w-full rounded-full mb-5"
          style={{ background: "linear-gradient(90deg, #1B5E20, #F9A825)" }} />

        <h3 className="text-lg font-semibold text-gray-700 mb-4
                       flex items-center gap-2">
          📋 Record Information
        </h3>

        <div className="grid grid-cols-2 gap-5 text-sm">
          {[
            { label: "Record ID",    value: `#${distributor.id}` },
            { label: "Status",
              value: distributor.status?.charAt(0).toUpperCase()
                   + distributor.status?.slice(1) },
            { label: "Created At",
              value: new Date(distributor.created_at).toLocaleDateString(
                'en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
            { label: "Last Updated",
              value: new Date(distributor.updated_at).toLocaleDateString(
                'en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
          ].map((item, i) => (
            <motion.div key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.07 }}>
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