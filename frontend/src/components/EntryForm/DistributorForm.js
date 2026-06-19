// 📝 NOTE: DistributorForm.js — Custom dark-themed Status dropdown
// 📝 NOTE: Replaces native <select> (which forced white OS-styled popup)
// 📝 NOTE: with a fully custom div-based dropdown — every part dark themed
// 📝 NOTE: ALL other form logic, validation, API calls — 100% UNCHANGED

import API_BASE from '../../config';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader, Plus, ChevronDown } from 'lucide-react';

const T = {
  card:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.09)',
  inputBg:'rgba(255,255,255,0.06)', inputBorder:'rgba(255,255,255,0.10)',
  text:'#f8fafc', textMuted:'rgba(248,250,252,0.45)', textFaint:'rgba(248,250,252,0.25)',
  green:'#16a34a', greenGlow:'rgba(22,163,74,0.15)', amber:'#f59e0b',
};

const formContainerVariants = { hidden:{opacity:0}, visible:{opacity:1,transition:{staggerChildren:0.08,delayChildren:0.2}} };
const fieldRowVariants = { hidden:{opacity:0,y:20}, visible:{opacity:1,y:0,transition:{duration:0.4}} };
const shakeVariants = { idle:{x:0}, shake:{x:[0,-10,10,-8,8,-4,4,0],transition:{duration:0.5}} };

function AnimatedField({ label, required, children }) {
  return (
    <motion.div variants={fieldRowVariants}>
      <label style={{ display:'block', fontSize:11, fontWeight:600, color:T.textMuted, letterSpacing:'0.7px', textTransform:'uppercase', marginBottom:6 }}>
        {label}{' '}{required && <span style={{ color:'#4ade80' }}>*</span>}
      </label>
      {children}
    </motion.div>
  );
}

const inputStyle = { width:'100%', padding:'11px 14px', background:T.inputBg, border:`1px solid ${T.inputBorder}`, borderRadius:10, fontSize:13, color:T.text, outline:'none', transition:'all 0.2s' };
const onFocus = (e) => { e.target.style.borderColor='rgba(22,163,74,0.65)'; e.target.style.background='rgba(22,163,74,0.08)'; e.target.style.boxShadow='0 0 0 3px rgba(22,163,74,0.15)'; };
const onBlur  = (e) => { e.target.style.borderColor=T.inputBorder; e.target.style.background=T.inputBg; e.target.style.boxShadow='none'; };

// ── CUSTOM STATUS DROPDOWN ────────────────────────────────────────────────────
// 📝 NOTE: Built from <div>s instead of native <select>
// 📝 NOTE: This gives 100% control over the open dropdown list styling
// 📝 NOTE: Native <select> popups are drawn by the OS/browser — can't be styled
const STATUS_OPTIONS = [
  { value:'active',   label:'Active',   dot:'#4ade80' },
  { value:'inactive', label:'Inactive', dot:'#f87171' },
  { value:'pending',  label:'Pending',  dot:'#fbbf24' },
];

function StatusDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  // 📝 NOTE: openUpward = true when there isn't enough space below the field
  // 📝 NOTE: Prevents the dropdown list getting clipped by the viewport/window edge
  const [openUpward, setOpenUpward] = useState(false);
  const wrapRef = useRef(null);
  const selected = STATUS_OPTIONS.find(o => o.value === value) || STATUS_OPTIONS[0];

  // 📝 NOTE: Close dropdown when clicking anywhere outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 📝 NOTE: Before opening, measure space below the field vs space above
  // 📝 NOTE: Dropdown list height ≈ 3 options × ~40px = ~130px, use 150px as safe estimate
  const handleToggle = () => {
    if (!open && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const DROPDOWN_HEIGHT_ESTIMATE = 220; // 📝 NOTE: generous margin so it reliably flips before clipping
      setOpenUpward(spaceBelow < DROPDOWN_HEIGHT_ESTIMATE);
    }
    setOpen(o => !o);
  };

  return (
    <div ref={wrapRef} style={{ position:'relative' }}>
      {/* Closed box — looks identical to other inputs */}
      <button
        type="button"
        onClick={handleToggle}
        style={{
          ...inputStyle,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          cursor:'pointer', textAlign:'left',
          borderColor: open ? 'rgba(22,163,74,0.65)' : T.inputBorder,
          background: open ? 'rgba(22,163,74,0.08)' : T.inputBg,
          boxShadow: open ? '0 0 0 3px rgba(22,163,74,0.15)' : 'none',
        }}
      >
        <span style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:selected.dot, flexShrink:0 }} />
          {selected.label}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration:0.2 }}>
          <ChevronDown style={{ width:15, height:15, color:T.textMuted }} />
        </motion.span>
      </button>

      {/* Open dropdown list — fully custom, dark themed, no OS styling */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, y: openUpward ? 6 : -6, scale:0.98 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y: openUpward ? 6 : -6, scale:0.98 }}
            transition={{ duration:0.15 }}
            style={{
              position:'absolute',
              // 📝 NOTE: Opens downward by default, flips above the field when near bottom edge
              ...(openUpward
                ? { bottom:'calc(100% + 6px)' }
                : { top:'calc(100% + 6px)' }),
              left:0, right:0,
              background:'#0f2412',
              border:'1px solid rgba(255,255,255,0.12)',
              borderRadius:10,
              overflow:'hidden',
              maxHeight: 200,          // 📝 NOTE: safety cap so list never exceeds this height
              overflowY: 'auto',       // 📝 NOTE: scrolls internally if it ever would overflow
              zIndex:20,
              boxShadow:'0 8px 24px rgba(0,0,0,0.45)',
            }}
          >
            {STATUS_OPTIONS.map(opt => {
              const isActive = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  style={{
                    display:'flex', alignItems:'center', gap:8,
                    padding:'10px 14px', fontSize:13, cursor:'pointer',
                    color: isActive ? '#4ade80' : T.text,
                    background: isActive ? 'rgba(22,163,74,0.12)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ width:8, height:8, borderRadius:'50%', background:opt.dot, flexShrink:0 }} />
                  {opt.label}
                  {isActive && <CheckCircle style={{ width:14, height:14, marginLeft:'auto', color:'#4ade80' }} />}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DistributorForm() {
  const [formData, setFormData] = useState({ distributor_name:'', territory:'', monthly_offtake:'', new_outlet_additions:'', coverage_metrics:'', performance_ranking:'', status:'active' });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');
  const [shakeKey, setShakeKey] = useState(0);

  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(false), 3000); return () => clearTimeout(t); } }, [success]);

  const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
  const handleStatusChange = (newStatus) => { setFormData(prev => ({ ...prev, status: newStatus })); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError(''); setSuccess(false);
    try {
      const response = await fetch(`${API_BASE}/api/distributors`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ ...formData, monthly_offtake:parseInt(formData.monthly_offtake), new_outlet_additions:parseInt(formData.new_outlet_additions)||0, coverage_metrics:parseFloat(formData.coverage_metrics)||0, performance_ranking:parseInt(formData.performance_ranking)||null }),
      });
      const data = await response.json();
      if (data.success) { setSuccess(true); setFormData({ distributor_name:'', territory:'', monthly_offtake:'', new_outlet_additions:'', coverage_metrics:'', performance_ranking:'', status:'active' }); }
      else { setError(data.message || 'Something went wrong'); setShakeKey(k => k + 1); }
    } catch (err) { setError('Cannot connect to server. Is the backend running?'); setShakeKey(k => k + 1); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <AnimatePresence mode="wait">
        {success && (
          <motion.div key="success-toast" style={{ marginBottom:20, padding:'12px 16px', display:'flex', alignItems:'center', gap:10, position:'relative', overflow:'hidden', background:'rgba(22,163,74,0.12)', border:'1px solid rgba(22,163,74,0.3)', borderRadius:12 }}
            initial={{opacity:0,y:-16,scale:0.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-16,scale:0.97}} transition={{duration:0.3,ease:'easeOut'}}>
            <div style={{ padding:6, background:'rgba(22,163,74,0.2)', borderRadius:8, flexShrink:0 }}>
              <CheckCircle style={{ width:18, height:18, color:'#4ade80' }} />
            </div>
            <div>
              <p style={{ color:'#4ade80', fontWeight:600, fontSize:13, margin:0 }}>Distributor added successfully!</p>
              <p style={{ color:'rgba(74,222,128,0.65)', fontSize:11, marginTop:2 }}>Record saved to database. Disappears in 3s.</p>
            </div>
            <motion.div style={{ position:'absolute', bottom:0, left:0, height:2, background:'#4ade80' }} initial={{width:'100%'}} animate={{width:'0%'}} transition={{duration:3,ease:'linear'}} />
          </motion.div>
        )}
        {error && (
          <motion.div key="error-toast" style={{ marginBottom:20, padding:'12px 16px', display:'flex', alignItems:'center', gap:10, background:'rgba(239,68,68,0.10)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:12 }}
            initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} transition={{duration:0.3}}>
            <div style={{ padding:6, background:'rgba(239,68,68,0.15)', borderRadius:8, flexShrink:0 }}>
              <AlertCircle style={{ width:18, height:18, color:'#f87171' }} />
            </div>
            <p style={{ color:'#fca5a5', fontSize:13, fontWeight:500, margin:0 }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div key={shakeKey} variants={shakeVariants} animate={shakeKey > 0 ? 'shake' : 'idle'}
        style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, overflow:'hidden' }}
        initial={{opacity:0,x:40}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.45,ease:'easeOut'}}>
        <div style={{ height:3, background:'linear-gradient(90deg,#16a34a,#f59e0b)' }} />

        <div style={{ padding:'clamp(16px,4vw,32px)' }}>
          <div style={{ marginBottom:20 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:T.text, margin:0 }}>Distributor Details</h3>
            <p style={{ color:T.textFaint, fontSize:12, marginTop:4 }}>Fields marked with <span style={{ color:'#4ade80', fontWeight:600 }}>*</span> are required</p>
          </div>

          <motion.form onSubmit={handleSubmit} variants={formContainerVariants} initial="hidden" animate="visible">

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'clamp(12px,3vw,24px)', marginBottom:16 }}>
              <AnimatedField label="Distributor Name" required>
                <input type="text" name="distributor_name" value={formData.distributor_name} onChange={handleChange} required placeholder="e.g. Ravi Kumar" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </AnimatedField>
              <AnimatedField label="Territory" required>
                <input type="text" name="territory" value={formData.territory} onChange={handleChange} required placeholder="e.g. Hyderabad North" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </AnimatedField>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'clamp(12px,3vw,24px)', marginBottom:16 }}>
              <AnimatedField label="Monthly Offtake (units)" required>
                <input type="number" name="monthly_offtake" value={formData.monthly_offtake} onChange={handleChange} required min="0" placeholder="e.g. 450" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </AnimatedField>
              <AnimatedField label="New Outlet Additions">
                <input type="number" name="new_outlet_additions" value={formData.new_outlet_additions} onChange={handleChange} min="0" placeholder="e.g. 12" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </AnimatedField>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'clamp(12px,3vw,24px)', marginBottom:16 }}>
              <AnimatedField label="Coverage Metrics (%)">
                <input type="number" name="coverage_metrics" value={formData.coverage_metrics} onChange={handleChange} min="0" max="100" step="0.01" placeholder="e.g. 87.50" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </AnimatedField>
              <AnimatedField label="Performance Ranking">
                <input type="number" name="performance_ranking" value={formData.performance_ranking} onChange={handleChange} min="1" placeholder="e.g. 1" style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </AnimatedField>
            </div>

            {/* 📝 NOTE: Custom dropdown replaces native <select> here */}
            <motion.div variants={fieldRowVariants} style={{ marginBottom:24, position:'relative' }}>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:T.textMuted, letterSpacing:'0.7px', textTransform:'uppercase', marginBottom:6 }}>Status</label>
              <StatusDropdown value={formData.status} onChange={handleStatusChange} />
            </motion.div>

            <motion.div variants={fieldRowVariants}>
              <motion.button type="submit" disabled={loading} whileHover={{scale:loading?1:1.02}} whileTap={{scale:loading?1:0.97}} transition={{duration:0.15}}
                style={{ width:'100%', padding:'13px', borderRadius:10, border:'none', cursor:loading?'not-allowed':'pointer', color:'#fff', fontSize:14, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:7,
                  background:loading?'rgba(22,163,74,0.4)':'linear-gradient(135deg,#16a34a,#15803d)', boxShadow:loading?'none':'0 4px 16px rgba(22,163,74,0.38)' }}>
                {loading ? (<><Loader style={{width:16,height:16}} className="animate-spin" />Saving to database...</>) : (<><Plus style={{width:16,height:16}} />Add Distributor</>)}
              </motion.button>
            </motion.div>

          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}

export default DistributorForm;