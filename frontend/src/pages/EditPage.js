// 📝 NOTE: EditPage.js — Redesigned to match dark glassmorphism theme
// 📝 NOTE: ALL logic unchanged — fetch, PUT API, success redirect
// 📝 NOTE: Only colors, backgrounds, borders updated to dark theme

import API_BASE from '../config';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Loader, CheckCircle, AlertCircle } from 'lucide-react';

// ─── STYLE TOKENS ────────────────────────────────────────────────────────────
// 📝 NOTE: Same token system used across all redesigned pages
const T = {
  bg:         '#0b1a0d',
  card:       'rgba(255,255,255,0.04)',
  border:     'rgba(255,255,255,0.09)',
  inputBg:    'rgba(255,255,255,0.06)',
  inputBorder:'rgba(255,255,255,0.10)',
  text:       '#f8fafc',
  textMuted:  'rgba(248,250,252,0.45)',
  textFaint:  'rgba(248,250,252,0.22)',
  green:      '#16a34a',
  amber:      '#f59e0b',
};

// ─── SHARED INPUT STYLE ───────────────────────────────────────────────────────
// 📝 NOTE: Same style as DistributorForm — consistent across all forms
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

// 📝 NOTE: Green glow on focus — same as Login + DistributorForm
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

// ─── FIELD LABEL ──────────────────────────────────────────────────────────────
// 📝 NOTE: Reusable label — uppercase small text like all other form pages
function FieldLabel({ children, required }) {
  return (
    <label style={{
      display:       'block',
      fontSize:      11,
      fontWeight:    600,
      color:         T.textMuted,
      letterSpacing: '0.7px',
      textTransform: 'uppercase',
      marginBottom:  6,
    }}>
      {children}{' '}
      {required && (
        <span style={{ color: '#4ade80' }}>*</span>
      )}
    </label>
  );
}

// ─── MAIN EDIT PAGE ───────────────────────────────────────────────────────────
function EditPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  // 📝 NOTE: All state — UNCHANGED from original
  const [formData, setFormData] = useState({
    distributor_name:     '',
    territory:            '',
    monthly_offtake:      '',
    new_outlet_additions: '',
    coverage_metrics:     '',
    performance_ranking:  '',
    status:               'active',
  });

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  // 📝 NOTE: Fetch existing distributor data to pre-fill form — UNCHANGED
  useEffect(() => {
    const fetchDistributor = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/distributors`);
        const data     = await response.json();
        const list     = Array.isArray(data) ? data : (data.data || []);
        const found    = list.find(d => d.id === parseInt(id));

        if (!found) {
          setError('Distributor not found');
        } else {
          // 📝 NOTE: Pre-fill all fields with current distributor values
          setFormData({
            distributor_name:     found.distributor_name     || '',
            territory:            found.territory            || '',
            monthly_offtake:      found.monthly_offtake      || '',
            new_outlet_additions: found.new_outlet_additions || '',
            coverage_metrics:     found.coverage_metrics     || '',
            performance_ranking:  found.performance_ranking  || '',
            status:               found.status               || 'active',
          });
        }
      } catch (err) {
        setError('Could not load distributor data');
      } finally {
        setLoading(false);
      }
    };
    fetchDistributor();
  }, [id]);

  // 📝 NOTE: handleChange updates one field at a time — UNCHANGED
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 📝 NOTE: handleSubmit — PUT request to update distributor — UNCHANGED
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/distributors/${id}`, {
        method:  'PUT',
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
        // 📝 NOTE: Redirect back to detail page after 1.5s
        setTimeout(() => navigate(`/distributor/${id}`), 1500);
      } else {
        setError(data.message || 'Update failed');
      }
    } catch (err) {
      setError('Cannot connect to server');
    } finally {
      setSaving(false);
    }
  };

  // ─── LOADING STATE ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        padding:        32,
        background:     T.bg,
        minHeight:      '100vh',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          {/* 📝 NOTE: Spinner using border trick — top border transparent = gap */}
          <div style={{
            width:        40, height: 40,
            border:       `3px solid rgba(22,163,74,0.3)`,
            borderTop:    `3px solid ${T.green}`,
            borderRadius: '50%',
            animation:    'spin 0.8s linear infinite',
            margin:       '0 auto 16px',
          }} />
          <p style={{ color: T.textMuted, fontSize: 14 }}>
            Loading distributor data...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ─── MAIN RENDER ────────────────────────────────────────────────────────────
  return (
    // 📝 NOTE: Dark background — matches all other redesigned pages
    <div style={{ padding: 32, minHeight: '100vh', background: T.bg }}>

      {/* ── BACK BUTTON ─────────────────────────────────────────────────── */}
      <motion.button
        onClick={() => navigate(`/distributor/${id}`)}
        style={{
          display:    'flex', alignItems: 'center', gap: 8,
          color:      T.textMuted, fontSize: 13, fontWeight: 500,
          background: 'none', border: 'none', cursor: 'pointer',
          marginBottom: 24,
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0   }}
        whileHover={{ x: -4 }}
        onMouseEnter={e => e.currentTarget.style.color = '#4ade80'}
        onMouseLeave={e => e.currentTarget.style.color = T.textMuted}
      >
        <ArrowLeft style={{ width: 16, height: 16 }} />
        Back to Detail View
      </motion.button>

      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <motion.div
        style={{ marginBottom: 28 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0   }}
      >
        <h2 style={{ fontSize: 24, fontWeight: 700,
          color: T.text, margin: 0 }}>
          Edit Distributor
        </h2>
        <p style={{ color: T.textMuted, marginTop: 4, fontSize: 14 }}>
          Update distributor #{id} information
        </p>
        {/* 📝 NOTE: Golden accent line — brand signature across all pages */}
        <div style={{
          width: 36, height: 2, background: T.amber,
          borderRadius: 2, marginTop: 10,
        }} />
      </motion.div>

      <div style={{ maxWidth: 640 }}>

        {/* ── TOAST MESSAGES ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {/* Success toast */}
          {success && (
            <motion.div
              className="mb-6"
              style={{
                padding:      '12px 16px',
                borderRadius: 12,
                display:      'flex',
                alignItems:   'center',
                gap:          10,
                background:   'rgba(22,163,74,0.12)',
                border:       '1px solid rgba(22,163,74,0.3)',
                marginBottom: 24,
              }}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0   }}
              exit={{   opacity: 0           }}
            >
              <CheckCircle style={{ width:18, height:18,
                color:'#4ade80', flexShrink:0 }} />
              <p style={{ color:'#4ade80', fontWeight:600, fontSize:13 }}>
                Updated successfully! Redirecting...
              </p>
            </motion.div>
          )}

          {/* Error toast */}
          {error && (
            <motion.div
              style={{
                padding:      '12px 16px',
                borderRadius: 12,
                display:      'flex',
                alignItems:   'center',
                gap:          10,
                background:   'rgba(239,68,68,0.10)',
                border:       '1px solid rgba(239,68,68,0.25)',
                marginBottom: 24,
              }}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0   }}
              exit={{   opacity: 0           }}
            >
              <AlertCircle style={{ width:18, height:18,
                color:'#f87171', flexShrink:0 }} />
              <p style={{ color:'#fca5a5', fontSize:13, fontWeight:500 }}>
                {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FORM CARD ─────────────────────────────────────────────────── */}
        <motion.div
          style={{
            background:   T.card,
            border:       `1px solid ${T.border}`,
            borderRadius: 16,
            overflow:     'hidden',
          }}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0  }}
          transition={{ duration: 0.45 }}
        >
          {/* 📝 NOTE: Green-to-amber gradient top bar */}
          <div style={{
            height:     3,
            background: 'linear-gradient(90deg, #16a34a, #f59e0b)',
          }} />

          <div style={{ padding: '2rem' }}>

            {/* Card header */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize:15, fontWeight:700,
                color:T.text, margin:0 }}>
                Distributor Details
              </h3>
              <p style={{ color:T.textFaint, fontSize:12, marginTop:4 }}>
                Fields marked with{' '}
                <span style={{ color:'#4ade80', fontWeight:600 }}>*</span>
                {' '}are required
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              {/* ── ROW 1: Name + Territory ──────────────────────────── */}
              <div style={{ display:'grid',
                gridTemplateColumns:'repeat(2,1fr)', gap:24, marginBottom:20 }}>
                <div>
                  <FieldLabel required>Distributor Name</FieldLabel>
                  <input
                    type="text" name="distributor_name"
                    value={formData.distributor_name}
                    onChange={handleChange} required
                    style={inputStyle}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                </div>
                <div>
                  <FieldLabel required>Territory</FieldLabel>
                  <input
                    type="text" name="territory"
                    value={formData.territory}
                    onChange={handleChange} required
                    style={inputStyle}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                </div>
              </div>

              {/* ── ROW 2: Offtake + Outlets ─────────────────────────── */}
              <div style={{ display:'grid',
                gridTemplateColumns:'repeat(2,1fr)', gap:24, marginBottom:20 }}>
                <div>
                  <FieldLabel required>Monthly Offtake (units)</FieldLabel>
                  <input
                    type="number" name="monthly_offtake"
                    value={formData.monthly_offtake}
                    onChange={handleChange} required min="0"
                    style={inputStyle}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                </div>
                <div>
                  <FieldLabel>New Outlet Additions</FieldLabel>
                  <input
                    type="number" name="new_outlet_additions"
                    value={formData.new_outlet_additions}
                    onChange={handleChange} min="0"
                    style={inputStyle}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                </div>
              </div>

              {/* ── ROW 3: Coverage + Ranking ────────────────────────── */}
              <div style={{ display:'grid',
                gridTemplateColumns:'repeat(2,1fr)', gap:24, marginBottom:20 }}>
                <div>
                  <FieldLabel>Coverage Metrics (%)</FieldLabel>
                  <input
                    type="number" name="coverage_metrics"
                    value={formData.coverage_metrics}
                    onChange={handleChange} min="0" max="100" step="0.01"
                    style={inputStyle}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                </div>
                <div>
                  <FieldLabel>Performance Ranking</FieldLabel>
                  <input
                    type="number" name="performance_ranking"
                    value={formData.performance_ranking}
                    onChange={handleChange} min="1"
                    style={inputStyle}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                </div>
              </div>

              {/* ── ROW 4: Status ────────────────────────────────────── */}
              <div style={{ marginBottom: 28 }}>
                <FieldLabel>Status</FieldLabel>
                {/* 📝 NOTE: colorScheme dark = native dropdown arrow visible */}
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{ ...inputStyle, colorScheme:'dark' }}
                  onFocus={onFocus} onBlur={onBlur}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* ── BUTTONS ROW ──────────────────────────────────────── */}
              <div style={{ display:'flex', gap:12 }}>

                {/* Cancel button */}
                <motion.button
                  type="button"
                  onClick={() => navigate(`/distributor/${id}`)}
                  whileHover={{ scale:1.02 }}
                  whileTap={{  scale:0.97 }}
                  style={{
                    flex:         1,
                    padding:      '12px',
                    background:   'rgba(255,255,255,0.04)',
                    border:       `1px solid ${T.border}`,
                    borderRadius: 10,
                    color:        T.textMuted,
                    fontWeight:   600,
                    fontSize:     13,
                    cursor:       'pointer',
                  }}
                >
                  Cancel
                </motion.button>

                {/* Save button */}
                {/* 📝 NOTE: disabled when saving, shows spinner */}
                <motion.button
                  type="submit"
                  disabled={saving}
                  whileHover={{ scale: saving ? 1 : 1.02 }}
                  whileTap={{  scale: saving ? 1 : 0.97 }}
                  style={{
                    flex:         1,
                    padding:      '12px',
                    borderRadius: 10,
                    border:       'none',
                    color:        '#fff',
                    fontWeight:   600,
                    fontSize:     13,
                    cursor:       saving ? 'not-allowed' : 'pointer',
                    display:      'flex',
                    alignItems:   'center',
                    justifyContent:'center',
                    gap:          7,
                    opacity:      saving ? 0.7 : 1,
                    background:   saving
                      ? 'rgba(22,163,74,0.4)'
                      : 'linear-gradient(135deg, #16a34a, #15803d)',
                    boxShadow: saving
                      ? 'none'
                      : '0 4px 16px rgba(22,163,74,0.35)',
                  }}
                >
                  {saving ? (
                    <>
                      <Loader style={{ width:16, height:16 }}
                        className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save style={{ width:16, height:16 }} />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>

            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default EditPage;