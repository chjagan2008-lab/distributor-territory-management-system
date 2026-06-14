import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader, Plus } from 'lucide-react';

// ============================================================
// 📝 NOTE: FIELD ROW VARIANTS
// Each form row (pair of inputs) will animate in one by one.
// "container" staggers the children with 0.08s between each.
// ============================================================
const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const fieldRowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ============================================================
// 📝 NOTE: SHAKE ANIMATION
// When there's an error, the form card shakes left-right.
// x: [0, -10, 10, -8, 8, 0] = a sequence of positions
// This is called a "keyframe animation" in Framer Motion.
// ============================================================
const shakeVariants = {
  idle: { x: 0 },
  shake: {
    x: [0, -10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.5 },
  },
};

// ============================================================
// 📝 NOTE: ANIMATED INPUT COMPONENT
// Instead of repeating className on every input, we make one
// reusable component. It adds a green glow when focused.
// ============================================================
function AnimatedField({ label, required, children }) {
  return (
    <motion.div variants={fieldRowVariants}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-green-600">*</span>}
      </label>
      {children}
    </motion.div>
  );
}

// Shared className for all inputs and select
const inputClass = `
  w-full px-4 py-3 border border-gray-200 rounded-xl
  focus:outline-none focus:ring-2 focus:ring-green-400
  focus:border-green-400 focus:shadow-[0_0_0_4px_rgba(27,94,32,0.08)]
  hover:border-gray-300
  transition-all duration-200 bg-white text-gray-800
  placeholder-gray-300
`;

// ============================================================
// MAIN FORM COMPONENT
// ============================================================
function DistributorForm() {
  const [formData, setFormData] = useState({
    distributor_name: '',
    territory: '',
    monthly_offtake: '',
    new_outlet_additions: '',
    coverage_metrics: '',
    performance_ranking: '',
    status: 'active',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // 📝 NOTE: "shakeKey" changes every time there's an error.
  // Changing the key forces Framer Motion to re-run the shake animation
  // even if the error message is the same as before.
  const [shakeKey, setShakeKey] = useState(0);

  // ============================================================
  // 📝 NOTE: AUTO-DISMISS SUCCESS TOAST
  // useEffect watches the "success" state.
  // When success becomes true, we start a 3-second timer.
  // After 3s, we set success back to false (toast disappears).
  // The "return () => clearTimeout(t)" cancels the timer if the
  // component unmounts early (prevents memory leaks).
  // ============================================================
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:5000/api/distributors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          monthly_offtake: parseInt(formData.monthly_offtake),
          new_outlet_additions: parseInt(formData.new_outlet_additions) || 0,
          coverage_metrics: parseFloat(formData.coverage_metrics) || 0,
          performance_ranking: parseInt(formData.performance_ranking) || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setFormData({
          distributor_name: '',
          territory: '',
          monthly_offtake: '',
          new_outlet_additions: '',
          coverage_metrics: '',
          performance_ranking: '',
          status: 'active',
        });
      } else {
        setError(data.message || 'Something went wrong');
        // 📝 Increment shakeKey to re-trigger the shake animation
        setShakeKey(k => k + 1);
      }
    } catch (err) {
      setError('Cannot connect to server. Is the backend running?');
      setShakeKey(k => k + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">

      {/* ── Toast Notifications ──────────────────────────────── */}
      {/* 📝 NOTE: AnimatePresence lets elements animate OUT when removed.
          Without it, the toast would just disappear instantly.
          "mode='wait'" means: finish exit animation before showing next. */}
      <AnimatePresence mode="wait">

        {success && (
          <motion.div
            key="success-toast"
            className="mb-6 p-4 rounded-xl flex items-center gap-3"
            style={{
              background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
              border: "1px solid #86efac",
              boxShadow: "0 4px 20px rgba(27,94,32,0.12)",
            }}
            // 📝 Enters: slides down + fades in
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            // 📝 Exits: slides up + fades out (needs AnimatePresence)
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="p-1.5 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-green-800 font-semibold text-sm">
                Distributor added successfully!
              </p>
              <p className="text-green-600 text-xs mt-0.5">
                The record has been saved to the database. Disappears in 3s.
              </p>
            </div>
            {/* Progress bar that shrinks over 3 seconds */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-green-400 rounded-b-xl"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 3, ease: "linear" }}
            />
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error-toast"
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
            style={{ boxShadow: "0 4px 20px rgba(239,68,68,0.10)" }}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-1.5 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-red-700 font-medium text-sm">{error}</p>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── Form Card ─────────────────────────────────────────── */}
      {/* 📝 NOTE: "animate={shakeKey > 0 ? 'shake' : 'idle'}"
          When shakeKey changes (on error), we switch to 'shake' state.
          The shakeVariants above define that left-right motion. */}
      <motion.div
        key={shakeKey}           // Forces re-mount on each error to replay shake
        variants={shakeVariants}
        animate={shakeKey > 0 ? 'shake' : 'idle'}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        style={{ boxShadow: "0 4px 32px rgba(27,94,32,0.07)" }}
        // Card slides in from right on page load
        initial={{ opacity: 0, x: 40 }}
        // 📝 We use whileInView here so it re-animates if you navigate away and back
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {/* Green top accent bar */}
        <div className="h-1 w-full"
          style={{ background: "linear-gradient(90deg, #1B5E20, #F9A825)" }} />

        <div className="p-8">
          {/* Form header inside card */}
          <div className="mb-7">
            <h3 className="text-lg font-bold text-gray-800">Distributor Details</h3>
            <p className="text-gray-400 text-sm mt-0.5">
              Fields marked with <span className="text-green-600 font-medium">*</span> are required
            </p>
          </div>

          {/* 📝 NOTE: motion.form with variants triggers staggered children */}
          <motion.form
            onSubmit={handleSubmit}
            variants={formContainerVariants}
            initial="hidden"
            animate="visible"
          >

            {/* ── Row 1: Name + Territory ───────────────────── */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <AnimatedField label="Distributor Name" required>
                <input
                  type="text"
                  name="distributor_name"
                  value={formData.distributor_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Ravi Kumar"
                  className={inputClass}
                />
              </AnimatedField>
              <AnimatedField label="Territory" required>
                <input
                  type="text"
                  name="territory"
                  value={formData.territory}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Hyderabad North"
                  className={inputClass}
                />
              </AnimatedField>
            </div>

            {/* ── Row 2: Offtake + New Outlets ─────────────── */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <AnimatedField label="Monthly Offtake (units)" required>
                <input
                  type="number"
                  name="monthly_offtake"
                  value={formData.monthly_offtake}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="e.g. 450"
                  className={inputClass}
                />
              </AnimatedField>
              <AnimatedField label="New Outlet Additions">
                <input
                  type="number"
                  name="new_outlet_additions"
                  value={formData.new_outlet_additions}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g. 12"
                  className={inputClass}
                />
              </AnimatedField>
            </div>

            {/* ── Row 3: Coverage + Ranking ─────────────────── */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <AnimatedField label="Coverage Metrics (%)">
                <input
                  type="number"
                  name="coverage_metrics"
                  value={formData.coverage_metrics}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="e.g. 87.50"
                  className={inputClass}
                />
              </AnimatedField>
              <AnimatedField label="Performance Ranking">
                <input
                  type="number"
                  name="performance_ranking"
                  value={formData.performance_ranking}
                  onChange={handleChange}
                  min="1"
                  placeholder="e.g. 1"
                  className={inputClass}
                />
              </AnimatedField>
            </div>

            {/* ── Row 4: Status ─────────────────────────────── */}
            <motion.div variants={fieldRowVariants} className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="active">✅ Active</option>
                <option value="inactive">🔴 Inactive</option>
                <option value="pending">🟡 Pending</option>
              </select>
            </motion.div>

            {/* ── Submit Button ──────────────────────────────── */}
            {/* 📝 NOTE: whileTap={{ scale: 0.97 }} gives a "press" feel.
                The button slightly shrinks when you click it. */}
            <motion.div variants={fieldRowVariants}>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                transition={{ duration: 0.15 }}
                className="w-full py-4 font-semibold rounded-xl
                           flex items-center justify-center gap-2
                           disabled:opacity-60 disabled:cursor-not-allowed
                           transition-colors duration-200"
                style={{
                  background: loading
                    ? "#4a7c59"
                    : "linear-gradient(135deg, #1B5E20 0%, #2e7d32 100%)",
                  color: "white",
                  boxShadow: loading ? "none" : "0 4px 16px rgba(27,94,32,0.30)",
                }}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Saving to database...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Add Distributor</span>
                  </>
                )}
              </motion.button>
            </motion.div>

          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}

export default DistributorForm;