// 📝 NOTE: EditPage.js — Mobile responsive version
// 📝 NOTE: Key fix: repeat(2,1fr) → auto-fit minmax for all form rows
// 📝 NOTE: Also: padding clamp, responsive font sizes

import API_BASE from '../config';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Loader, CheckCircle, AlertCircle } from 'lucide-react';

const T = { bg:'#0b1a0d', card:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.09)', inputBg:'rgba(255,255,255,0.06)', inputBorder:'rgba(255,255,255,0.10)', text:'#f8fafc', textMuted:'rgba(248,250,252,0.45)', textFaint:'rgba(248,250,252,0.22)', green:'#16a34a', amber:'#f59e0b' };
const inputStyle = { width:'100%', padding:'11px 14px', background:T.inputBg, border:`1px solid ${T.inputBorder}`, borderRadius:10, fontSize:13, color:T.text, outline:'none', transition:'all 0.2s' };
const onFocus=(e)=>{e.target.style.borderColor='rgba(22,163,74,0.65)';e.target.style.background='rgba(22,163,74,0.08)';e.target.style.boxShadow='0 0 0 3px rgba(22,163,74,0.15)';};
const onBlur=(e)=>{e.target.style.borderColor=T.inputBorder;e.target.style.background=T.inputBg;e.target.style.boxShadow='none';};

function FieldLabel({children,required}) {
  return (<label style={{display:'block',fontSize:11,fontWeight:600,color:T.textMuted,letterSpacing:'0.7px',textTransform:'uppercase',marginBottom:6}}>{children}{' '}{required&&<span style={{color:'#4ade80'}}>*</span>}</label>);
}

function EditPage() {
  const {id}=useParams(); const navigate=useNavigate();
  const [formData,setFormData]=useState({distributor_name:'',territory:'',monthly_offtake:'',new_outlet_additions:'',coverage_metrics:'',performance_ranking:'',status:'active'});
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [success,setSuccess]=useState(false);
  const [error,setError]=useState('');

  useEffect(()=>{
    const fetchDistributor=async()=>{
      try{
        const r=await fetch(`${API_BASE}/api/distributors`); const d=await r.json();
        const list=Array.isArray(d)?d:(d.data||[]);
        const found=list.find(x=>x.id===parseInt(id));
        if(!found){setError('Distributor not found');}
        else{setFormData({distributor_name:found.distributor_name||'',territory:found.territory||'',monthly_offtake:found.monthly_offtake||'',new_outlet_additions:found.new_outlet_additions||'',coverage_metrics:found.coverage_metrics||'',performance_ranking:found.performance_ranking||'',status:found.status||'active'});}
      }catch(e){setError('Could not load distributor data');}finally{setLoading(false);}
    };
    fetchDistributor();
  },[id]);

  const handleChange=(e)=>{const{name,value}=e.target;setFormData(prev=>({...prev,[name]:value}));};

  const handleSubmit=async(e)=>{
    e.preventDefault(); setSaving(true); setError('');
    try{
      const r=await fetch(`${API_BASE}/api/distributors/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({...formData,monthly_offtake:parseInt(formData.monthly_offtake),new_outlet_additions:parseInt(formData.new_outlet_additions)||0,coverage_metrics:parseFloat(formData.coverage_metrics)||0,performance_ranking:parseInt(formData.performance_ranking)||null})});
      const d=await r.json();
      if(d.success){setSuccess(true);setTimeout(()=>navigate(`/distributor/${id}`),1500);}
      else{setError(d.message||'Update failed');}
    }catch(e){setError('Cannot connect to server');}finally{setSaving(false);}
  };

  if(loading) return (
    <div style={{padding:'clamp(12px,4vw,32px)',background:T.bg,minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:36,height:36,border:`3px solid rgba(22,163,74,0.3)`,borderTop:`3px solid ${T.green}`,borderRadius:'50%',animation:'spin 0.8s linear infinite',margin:'0 auto 12px'}} />
        <p style={{color:T.textMuted,fontSize:13}}>Loading distributor data...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );

  return (
    <div style={{padding:'clamp(12px,4vw,32px)',minHeight:'100vh',background:T.bg}}>

      <motion.button onClick={()=>navigate(`/distributor/${id}`)}
        style={{display:'flex',alignItems:'center',gap:7,color:T.textMuted,fontSize:12,fontWeight:500,background:'none',border:'none',cursor:'pointer',marginBottom:20}}
        initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} whileHover={{x:-3}}
        onMouseEnter={e=>e.currentTarget.style.color='#4ade80'} onMouseLeave={e=>e.currentTarget.style.color=T.textMuted}>
        <ArrowLeft style={{width:14,height:14}} /> Back to Detail View
      </motion.button>

      <motion.div style={{marginBottom:24}} initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}>
        <h2 style={{fontSize:'clamp(18px,4vw,24px)',fontWeight:700,color:T.text,margin:0}}>Edit Distributor</h2>
        <p style={{color:T.textMuted,marginTop:4,fontSize:13}}>Update distributor #{id} information</p>
        <div style={{width:36,height:2,background:T.amber,borderRadius:2,marginTop:8}} />
      </motion.div>

      <div style={{maxWidth:640}}>
        <AnimatePresence>
          {success&&(
            <motion.div style={{marginBottom:20,padding:'10px 14px',display:'flex',alignItems:'center',gap:9,background:'rgba(22,163,74,0.12)',border:'1px solid rgba(22,163,74,0.3)',borderRadius:11}}
              initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              <CheckCircle style={{width:16,height:16,color:'#4ade80',flexShrink:0}} />
              <p style={{color:'#4ade80',fontWeight:600,fontSize:12,margin:0}}>Updated successfully! Redirecting...</p>
            </motion.div>
          )}
          {error&&(
            <motion.div style={{marginBottom:20,padding:'10px 14px',display:'flex',alignItems:'center',gap:9,background:'rgba(239,68,68,0.10)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:11}}
              initial={{opacity:0,y:-14}} animate={{opacity:1,y:0}} exit={{opacity:0}}>
              <AlertCircle style={{width:16,height:16,color:'#f87171',flexShrink:0}} />
              <p style={{color:'#fca5a5',fontSize:12,fontWeight:500,margin:0}}>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,overflow:'hidden'}}
          initial={{opacity:0,x:40}} animate={{opacity:1,x:0}} transition={{duration:0.45}}>
          <div style={{height:3,background:'linear-gradient(90deg,#16a34a,#f59e0b)'}} />
          <div style={{padding:'clamp(16px,4vw,32px)'}}>
            <div style={{marginBottom:20}}>
              <h3 style={{fontSize:14,fontWeight:700,color:T.text,margin:0}}>Distributor Details</h3>
              <p style={{color:T.textFaint,fontSize:12,marginTop:4}}>Fields marked with <span style={{color:'#4ade80',fontWeight:600}}>*</span> are required</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* 📝 NOTE: All grids use auto-fit — stack to 1 col on mobile */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'clamp(12px,3vw,20px)',marginBottom:16}}>
                <div><FieldLabel required>Distributor Name</FieldLabel><input type="text" name="distributor_name" value={formData.distributor_name} onChange={handleChange} required style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
                <div><FieldLabel required>Territory</FieldLabel><input type="text" name="territory" value={formData.territory} onChange={handleChange} required style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'clamp(12px,3vw,20px)',marginBottom:16}}>
                <div><FieldLabel required>Monthly Offtake (units)</FieldLabel><input type="number" name="monthly_offtake" value={formData.monthly_offtake} onChange={handleChange} required min="0" style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
                <div><FieldLabel>New Outlet Additions</FieldLabel><input type="number" name="new_outlet_additions" value={formData.new_outlet_additions} onChange={handleChange} min="0" style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'clamp(12px,3vw,20px)',marginBottom:16}}>
                <div><FieldLabel>Coverage Metrics (%)</FieldLabel><input type="number" name="coverage_metrics" value={formData.coverage_metrics} onChange={handleChange} min="0" max="100" step="0.01" style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
                <div><FieldLabel>Performance Ranking</FieldLabel><input type="number" name="performance_ranking" value={formData.performance_ranking} onChange={handleChange} min="1" style={inputStyle} onFocus={onFocus} onBlur={onBlur} /></div>
              </div>
              <div style={{marginBottom:24}}>
                <FieldLabel>Status</FieldLabel>
                <select name="status" value={formData.status} onChange={handleChange} style={{...inputStyle,colorScheme:'dark'}} onFocus={onFocus} onBlur={onBlur}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div style={{display:'flex',gap:10}}>
                <motion.button type="button" onClick={()=>navigate(`/distributor/${id}`)} whileHover={{scale:1.02}} whileTap={{scale:0.97}}
                  style={{flex:1,padding:'11px',background:'rgba(255,255,255,0.04)',border:`1px solid ${T.border}`,borderRadius:10,color:T.textMuted,fontWeight:600,fontSize:13,cursor:'pointer'}}>
                  Cancel
                </motion.button>
                <motion.button type="submit" disabled={saving} whileHover={{scale:saving?1:1.02}} whileTap={{scale:saving?1:0.97}}
                  style={{flex:1,padding:'11px',borderRadius:10,border:'none',color:'#fff',fontWeight:600,fontSize:13,cursor:saving?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,opacity:saving?0.7:1,
                    background:saving?'rgba(22,163,74,0.4)':'linear-gradient(135deg,#16a34a,#15803d)',boxShadow:saving?'none':'0 4px 14px rgba(22,163,74,0.35)'}}>
                  {saving?(<><Loader style={{width:14,height:14}} className="animate-spin" />Saving...</>):(<><Save style={{width:14,height:14}} />Save Changes</>)}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
export default EditPage;