// 📝 NOTE: DistributorForm.js — Redesigned to match dark glassmorphism theme
// 📝 NOTE: ALL form logic, validation, API calls, animations — 100% UNCHANGED
// 📝 NOTE: Only colors, backgrounds, borders updated to dark theme

import API_BASE from '../../config';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader, Plus } from 'lucide-react';

// ─── STYLE TOKENS ────────────────────────────────────────────────────────────
// 📝 NOTE: Same token system as DashboardPage — one place to update colors
const T = {
  card:       'rgba(255,255,255,0.04)',
  border:     'rgba(255,255,255,0.09)',
  inputBg:    'rgba(255,255,255,0.06)',
  inputBorder:'rgba(255,255,255,0.10)',
  text:       '#f8fafc',
  textMuted:  'rgba(248,250,252,0.45)',
  textFaint:  'rgba(248,250,252,0.25)',
  green:      '#16a34a',
  greenGlow:  'rgba(22,163,74,0.15)',
  amber:      '#f59e0b',
};

// ─── ANIMATION VARIANTS (UNCHANGED) ──────────────────────────────────────────
// 📝 NOTE: Stagger children — each field row animates in one after another
const formContainerVariants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const fieldRowVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// 📝 NOTE: Shake animation fires when there's an error — left-right motion
const shakeVariants = {
  idle:  { x: 0 },
  shake: {
    x: [0, -10, 10, -8, 8, -4, 4, 0],
    transition: { duration: 0.5 },
  },
};

// ─── ANIMATED FIELD WRAPPER ───────────────────────────────────────────────────
// 📝 NOTE: Reusable wrapper — handles label + stagger animation per field
function AnimatedField({ label, required, children }) {
  return (
    <motion.div variants={fieldRowVariants}>
      <label
        className="block text-xs font-semibold mb-2"
        style={{
          color:         T.textMuted,
          letterSpacing: '0.7px',
          textTransform: 'uppercase',
        }}
      >
        {label}{' '}
        {required && (
          <span style={{ color: '#4ade80' }}>*</span>
        )}
      </label>
      {children}
    </motion.div>
  );
}

// ─── SHARED INPUT STYLE ───────────────────────────────────────────────────────
// 📝 NOTE: Applied to every input and select in the form
const inputStyle = {
  width:        '100%',
  padding:      '11px 14px',
  background:   T.inputBg,
  border:       `1px solid ${T.inputBorder}`,
  borderRadius: 10,
  fontSize:     13,
  color:        T.text,
  outline:      'none',
  transition:   'all 0.2s',
};

// 📝 NOTE: Focus glow — green ring like Login page inputs
const onFocus = (e) => {
  e.target.style.borderColor = 'rgba(22,163,74,0.65)';
  e.target.style.background  = 'rgba(22,163,74,0.08)';
  e.target.style.boxShadow   = '0 0 0 3px rgba(22,163,74,0.15)';
};
const onBlur = (e) => {
  e.target.style.borderColor = T.inputBorder;
  e.target.style.background  = T.inputBg;
  e.target.style.boxShadow   = 'none';
};

// ─── MAIN FORM COMPONENT ─────────────────────────────────────────────────────
function DistributorForm() {

  // 📝 NOTE: formData holds all field values — UNCHANGED
  const [formData, setFormData] = useState({
    distributor_name:     '',
    territory:            '',
    monthly_offtake:      '',
    new_outlet_additions: '',
    coverage_metrics:     '',
    performance_ranking:  '',
    status:               'active',
  });

  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');
  // 📝 NOTE: shakeKey increments on error to re-trigger shake animation
  const [shakeKey, setShakeKey] = useState(0);

  // 📝 NOTE: Auto-dismiss success toast after 3 seconds — UNCHANGED
  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  // 📝 NOTE: handleChange updates one field at a time in formData — UNCHANGED
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 📝 NOTE: handleSubmit — POST to backend, handle success/error — UNCHANGED
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE}/api/distributors`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...formData,
          monthly_offtake:      parseInt(formData.monthly_offtake),
          new_outlet_additions: parseInt(formData.new_outlet_additions) || 0,
          coverage_metrics:     parseFloat(formData.coverage_metrics)   || 0,
          performance_ranking:  parseInt(formData.performance_ranking)  || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // 📝 NOTE: Reset form after successful submission
        setFormData({
          distributor_name:     '',
          territory:            '',
          monthly_offtake:      '',
          new_outlet_additions: '',
          coverage_metrics:     '',
          performance_ranking:  '',
          status:               'active',
        });
      } else {
        setError(data.message || 'Something went wrong');
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

      {/* ── TOAST NOTIFICATIONS ───────────────────────────────────────────
          📝 NOTE: AnimatePresence lets toast animate OUT when dismissed
          📝 NOTE: mode="wait" = finish exit before showing next toast     */}
      <AnimatePresence mode="wait">

        {/* Success toast */}
        {success && (
          <motion.div
            key="success-toast"
            className="mb-6 p-4 flex items-center gap-3 relative overflow-hidden"
            style={{
              background:   'rgba(22,163,74,0.12)',
              border:       '1px solid rgba(22,163,74,0.3)',
              borderRadius: 12,
            }}
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,   scale: 1    }}
            exit={{   opacity: 0, y: -16,  scale: 0.97 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div style={{
              padding:      6,
              background:   'rgba(22,163,74,0.2)',
              borderRadius: 8,
              flexShrink:   0,
            }}>
              <CheckCircle className="w-5 h-5" style={{ color: '#4ade80' }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#4ade80' }}>
                Distributor added successfully!
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(74,222,128,0.65)' }}>
                Record saved to database. Disappears in 3s.
              </p>
            </div>
            {/* 📝 NOTE: Progress bar shrinks over 3s — visual countdown */}
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 rounded-b-xl"
              style={{ background: '#4ade80' }}
              initial={{ width: '100%' }}
              animate={{ width: '0%'   }}
              transition={{ duration: 3, ease: 'linear' }}
            />
          </motion.div>
        )}

        {/* Error toast */}
        {error && (
          <motion.div
            key="error-toast"
            className="mb-6 p-4 flex items-center gap-3"
            style={{
              background:   'rgba(239,68,68,0.10)',
              border:       '1px solid rgba(239,68,68,0.25)',
              borderRadius: 12,
            }}
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0   }}
            exit={{   opacity: 0, y: -16  }}
            transition={{ duration: 0.3 }}
          >
            <div style={{
              padding:      6,
              background:   'rgba(239,68,68,0.15)',
              borderRadius: 8,
              flexShrink:   0,
            }}>
              <AlertCircle className="w-5 h-5" style={{ color: '#f87171' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: '#fca5a5' }}>
              {error}
            </p>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── FORM CARD ────────────────────────────────────────────────────────
          📝 NOTE: key={shakeKey} forces re-mount on error = replays shake
          📝 NOTE: animate={shakeKey > 0 ? 'shake' : 'idle'} triggers it   */}
      <motion.div
        key={shakeKey}
        variants={shakeVariants}
        animate={shakeKey > 0 ? 'shake' : 'idle'}
        style={{
          background:   T.card,
          border:       `1px solid ${T.border}`,
          borderRadius: 16,
          overflow:     'hidden',
        }}
        initial={{ opacity: 0, x: 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {/* 📝 NOTE: Green-to-amber gradient top bar — matches brand colors */}
        <div style={{
          height:     3,
          background: 'linear-gradient(90deg, #16a34a, #f59e0b)',
        }} />

        <div className="p-8">

          {/* Card header */}
          <div className="mb-7">
            <h3 className="text-base font-bold" style={{ color: T.text }}>
              Distributor Details
            </h3>
            <p className="text-xs mt-1" style={{ color: T.textFaint }}>
              Fields marked with{' '}
              <span style={{ color: '#4ade80', fontWeight: 600 }}>*</span>
              {' '}are required
            </p>
          </div>

          {/* 📝 NOTE: motion.form with stagger variants — UNCHANGED logic */}
          <motion.form
            onSubmit={handleSubmit}
            variants={formContainerVariants}
            initial="hidden"
            animate="visible"
          >

            {/* ── ROW 1: Name + Territory ──────────────────────────────── */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <AnimatedField label="Distributor Name" required>
                <input
                  type="text" name="distributor_name"
                  value={formData.distributor_name}
                  onChange={handleChange} required
                  placeholder="e.g. Ravi Kumar"
                  style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </AnimatedField>
              <AnimatedField label="Territory" required>
                <input
                  type="text" name="territory"
                  value={formData.territory}
                  onChange={handleChange} required
                  placeholder="e.g. Hyderabad North"
                  style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </AnimatedField>
            </div>

            {/* ── ROW 2: Offtake + Outlets ─────────────────────────────── */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <AnimatedField label="Monthly Offtake (units)" required>
                <input
                  type="number" name="monthly_offtake"
                  value={formData.monthly_offtake}
                  onChange={handleChange} required min="0"
                  placeholder="e.g. 450"
                  style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </AnimatedField>
              <AnimatedField label="New Outlet Additions">
                <input
                  type="number" name="new_outlet_additions"
                  value={formData.new_outlet_additions}
                  onChange={handleChange} min="0"
                  placeholder="e.g. 12"
                  style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </AnimatedField>
            </div>

            {/* ── ROW 3: Coverage + Ranking ────────────────────────────── */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <AnimatedField label="Coverage Metrics (%)">
                <input
                  type="number" name="coverage_metrics"
                  value={formData.coverage_metrics}
                  onChange={handleChange} min="0" max="100" step="0.01"
                  placeholder="e.g. 87.50"
                  style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </AnimatedField>
              <AnimatedField label="Performance Ranking">
                <input
                  type="number" name="performance_ranking"
                  value={formData.performance_ranking}
                  onChange={handleChange} min="1"
                  placeholder="e.g. 1"
                  style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </AnimatedField>
            </div>

            {/* ── ROW 4: Status ────────────────────────────────────────── */}
            <motion.div variants={fieldRowVariants} className="mb-8">
              <label
                className="block text-xs font-semibold mb-2"
                style={{
                  color:         T.textMuted,
                  letterSpacing: '0.7px',
                  textTransform: 'uppercase',
                }}
              >
                Status
              </label>
              {/* 📝 NOTE: select needs extra CSS to style the dropdown arrow */}
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{
                  ...inputStyle,
                  // Makes dropdown arrow visible on dark background
                  colorScheme: 'dark',
                }}
                onFocus={onFocus}
                onBlur={onBlur}
              >
                <option value="active">✅ Active</option>
                <option value="inactive">🔴 Inactive</option>
                <option value="pending">🟡 Pending</option>
              </select>
            </motion.div>

            {/* ── SUBMIT BUTTON ─────────────────────────────────────────── */}
            {/* 📝 NOTE: whileTap scale gives a satisfying "press" feeling  */}
            <motion.div variants={fieldRowVariants}>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{  scale: loading ? 1 : 0.97 }}
                transition={{ duration: 0.15 }}
                className="w-full font-semibold flex items-center
                           justify-center gap-2 disabled:opacity-60
                           disabled:cursor-not-allowed"
                style={{
                  padding:      '13px',
                  borderRadius: 10,
                  border:       'none',
                  cursor:       loading ? 'not-allowed' : 'pointer',
                  color:        '#fff',
                  fontSize:     14,
                  // 📝 NOTE: Dimmer green when loading, full gradient when idle
                  background:   loading
                    ? 'rgba(22,163,74,0.4)'
                    : 'linear-gradient(135deg, #16a34a, #15803d)',
                  boxShadow: loading
                    ? 'none'
                    : '0 4px 16px rgba(22,163,74,0.38)',
                }}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving to database...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Distributor
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