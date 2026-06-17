// 📝 NOTE: DetailPage.js — Mobile responsive version
// 📝 NOTE: Key fix: repeat(2,1fr) → auto-fit minmax for stat cards grid
// 📝 NOTE: Also: padding clamp, hero card wraps on mobile, top bar wraps

import API_BASE from '../config';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, TrendingUp, ShoppingBag, Star, Activity, Award } from 'lucide-react';

const T = { bg:'#0b1a0d', card:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.09)', text:'#f8fafc', textMuted:'rgba(248,250,252,0.45)', textFaint:'rgba(248,250,252,0.22)', green:'#16a34a', amber:'#f59e0b', blue:'#378ADD', purple:'#a855f7' };

function useCountUp(target, duration=1200) {
  const [count,setCount]=useState(0); const startTime=useRef(null); const frameRef=useRef(null);
  useEffect(()=>{
    if(!target||target===0) return; if(frameRef.current) cancelAnimationFrame(frameRef.current);
    const animate=(ts)=>{ if(!startTime.current) startTime.current=ts; const p=Math.min((ts-startTime.current)/duration,1); const e=1-Math.pow(1-p,3); setCount(Math.floor(e*target)); if(p<1){frameRef.current=requestAnimationFrame(animate);}else{setCount(target);} };
    startTime.current=null; frameRef.current=requestAnimationFrame(animate);
    return()=>cancelAnimationFrame(frameRef.current);
  },[target,duration]);
  return count;
}

function StatCard({icon:Icon,iconBg,iconColor,label,value,prefix='',suffix='',subtext,delay,extra}) {
  const animatedValue=useCountUp(typeof value==='number'?value:0);
  return (
    <motion.div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'1.25rem',position:'relative',overflow:'hidden'}}
      initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} whileHover={{y:-3,scale:1.01}} transition={{duration:0.4,delay}}>
      <div style={{position:'absolute',bottom:-12,right:-12,width:60,height:60,borderRadius:'50%',background:iconBg,opacity:0.4}} />
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
        <div style={{width:38,height:38,borderRadius:10,background:iconBg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <Icon style={{width:17,height:17,color:iconColor}} />
        </div>
        <p style={{color:T.textMuted,fontSize:12,fontWeight:500,margin:0}}>{label}</p>
      </div>
      <p style={{fontSize:'clamp(26px,5vw,36px)',fontWeight:700,color:iconColor,margin:0}}>
        {prefix}{typeof value==='number'?animatedValue.toLocaleString():value}{suffix}
      </p>
      <p style={{color:T.textFaint,fontSize:11,marginTop:3}}>{subtext}</p>
      {extra}
    </motion.div>
  );
}

function CoverageBar({value}) {
  return (
    <div style={{marginTop:10}}>
      <div style={{height:4,background:'rgba(255,255,255,0.08)',borderRadius:4,overflow:'hidden'}}>
        <motion.div style={{height:'100%',borderRadius:4,background:'linear-gradient(90deg,#378ADD,#60a5fa)'}}
          initial={{width:0}} animate={{width:`${Math.min(value,100)}%`}} transition={{duration:1.2,delay:0.5,ease:'easeOut'}} />
      </div>
      <p style={{fontSize:10,color:T.textFaint,marginTop:3}}>{value}% of territory covered</p>
    </div>
  );
}

function RankingStars({rank}) {
  if(!rank) return null;
  const stars=Math.max(1,6-rank);
  return (
    <motion.div style={{display:'flex',gap:3,marginTop:10,flexWrap:'wrap'}}
      initial="hidden" animate="visible" variants={{visible:{transition:{staggerChildren:0.1,delayChildren:0.5}}}}>
      {Array(5).fill(0).map((_,i)=>(
        <motion.div key={i} variants={{hidden:{opacity:0,scale:0},visible:{opacity:1,scale:1}}} transition={{type:'spring',stiffness:300}}>
          <Star style={{width:14,height:14}} fill={i<stars?T.purple:'none'} stroke={i<stars?T.purple:'rgba(255,255,255,0.2)'} />
        </motion.div>
      ))}
      <span style={{fontSize:10,color:T.textFaint,marginLeft:3,alignSelf:'center'}}>Rank #{rank}</span>
    </motion.div>
  );
}

function DetailPage() {
  const {id}=useParams(); const navigate=useNavigate();
  const [distributor,setDistributor]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [showDeleteModal,setShowDeleteModal]=useState(false);
  const [deleting,setDeleting]=useState(false);

  useEffect(()=>{
    const fetchDistributor=async()=>{
      try{
        const r=await fetch(`${API_BASE}/api/distributors`); const d=await r.json();
        const list=Array.isArray(d)?d:(d.data||[]);
        const found=list.find(x=>x.id===parseInt(id));
        if(!found) setError('Distributor not found'); else setDistributor(found);
      }catch(e){setError('Could not load distributor data');}finally{setLoading(false);}
    };
    fetchDistributor();
  },[id]);

  const handleDelete=async()=>{
    setDeleting(true);
    try{
      const r=await fetch(`${API_BASE}/api/distributors/${id}`,{method:'DELETE'});
      const d=await r.json();
      if(d.success){navigate('/dashboard');}else{alert('Delete failed: '+d.message);}
    }catch(e){alert('Delete failed. Try again.');}finally{setDeleting(false);}
  };

  if(loading) return <div style={{padding:'clamp(12px,4vw,32px)',background:T.bg,minHeight:'100vh'}}><p style={{color:T.textMuted}}>Loading...</p></div>;
  if(error) return (
    <div style={{padding:'clamp(12px,4vw,32px)',background:T.bg,minHeight:'100vh'}}>
      <div style={{background:'rgba(239,68,68,0.10)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:16,padding:24,textAlign:'center'}}>
        <p style={{color:'#f87171',fontWeight:600}}>⚠️ {error}</p>
        <button onClick={()=>navigate('/dashboard')} style={{marginTop:12,padding:'8px 18px',background:T.green,color:'#fff',border:'none',borderRadius:9,cursor:'pointer',fontSize:12}}>Back to Dashboard</button>
      </div>
    </div>
  );

  const initials=distributor.distributor_name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const statusConfig={
    active:{bg:'rgba(74,222,128,0.15)',text:'#4ade80',border:'rgba(74,222,128,0.3)',label:'● Active'},
    inactive:{bg:'rgba(239,68,68,0.15)',text:'#f87171',border:'rgba(239,68,68,0.3)',label:'● Inactive'},
    pending:{bg:'rgba(245,158,11,0.15)',text:'#fbbf24',border:'rgba(245,158,11,0.3)',label:'● Pending'},
  };
  const statusStyle=statusConfig[distributor.status]||statusConfig.pending;

  return (
    <div style={{padding:'clamp(12px,4vw,32px)',minHeight:'100vh',background:T.bg}}>

      {/* Top bar — wraps on mobile */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:10}}>
        <motion.button onClick={()=>navigate('/dashboard')}
          style={{display:'flex',alignItems:'center',gap:7,color:T.textMuted,fontSize:12,fontWeight:500,background:'none',border:'none',cursor:'pointer'}}
          initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} whileHover={{x:-3}}
          onMouseEnter={e=>e.currentTarget.style.color='#4ade80'} onMouseLeave={e=>e.currentTarget.style.color=T.textMuted}>
          <ArrowLeft style={{width:14,height:14}} /> Back to Dashboard
        </motion.button>
        <motion.div style={{display:'flex',gap:8}} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}}>
          <motion.button onClick={()=>navigate(`/distributor/${id}/edit`)} whileHover={{scale:1.04}} whileTap={{scale:0.96}}
            style={{display:'flex',alignItems:'center',gap:5,padding:'7px 12px',borderRadius:9,background:'rgba(55,138,221,0.15)',border:'1px solid rgba(55,138,221,0.35)',color:'#60a5fa',fontSize:12,fontWeight:600,cursor:'pointer'}}>
            ✏️ Edit
          </motion.button>
          <motion.button onClick={()=>setShowDeleteModal(true)} whileHover={{scale:1.04}} whileTap={{scale:0.96}}
            style={{display:'flex',alignItems:'center',gap:5,padding:'7px 12px',borderRadius:9,background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.35)',color:'#f87171',fontSize:12,fontWeight:600,cursor:'pointer'}}>
            🗑️ Delete
          </motion.button>
        </motion.div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal&&(
        <motion.div style={{position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.65)',padding:16}}
          initial={{opacity:0}} animate={{opacity:1}}>
          <motion.div style={{background:'#0f2415',border:'1px solid rgba(255,255,255,0.12)',borderRadius:18,padding:'1.75rem',maxWidth:340,width:'100%',boxShadow:'0 24px 60px rgba(0,0,0,0.5)'}}
            initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:'spring',stiffness:300}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:42,marginBottom:12}}>🗑️</div>
              <h3 style={{fontSize:16,fontWeight:700,color:T.text,margin:'0 0 8px'}}>Delete Distributor?</h3>
              <p style={{color:T.textMuted,fontSize:12,margin:'0 0 20px',lineHeight:1.6}}>
                Are you sure you want to delete <strong style={{color:T.text}}>{distributor.distributor_name}</strong>? This cannot be undone!
              </p>
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>setShowDeleteModal(false)} style={{flex:1,padding:'10px',background:'rgba(255,255,255,0.05)',border:`1px solid ${T.border}`,borderRadius:9,color:T.textMuted,fontWeight:600,cursor:'pointer',fontSize:12}}>Cancel</button>
                <button onClick={handleDelete} disabled={deleting}
                  style={{flex:1,padding:'10px',background:'rgba(239,68,68,0.2)',border:'1px solid rgba(239,68,68,0.4)',borderRadius:9,color:'#f87171',fontWeight:600,cursor:deleting?'not-allowed':'pointer',fontSize:12,opacity:deleting?0.6:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>
                  {deleting?(<><div style={{width:12,height:12,border:'2px solid #f87171',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>Deleting...</>):'Yes, Delete!'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Hero card — flex wraps on mobile */}
      <motion.div style={{borderRadius:16,padding:'clamp(16px,4vw,28px)',marginBottom:20,position:'relative',overflow:'hidden',background:'linear-gradient(135deg,#14532d 0%,#166534 60%,#15803d 100%)',border:'1px solid rgba(74,222,128,0.15)'}}
        initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.1}}>
        <div style={{position:'absolute',top:0,right:0,width:160,height:160,borderRadius:'50%',background:'rgba(245,158,11,0.10)',filter:'blur(40px)',transform:'translate(30%,-30%)'}} />
        <div style={{position:'relative',display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <div style={{position:'relative',flexShrink:0}}>
            <motion.div style={{position:'absolute',inset:0,borderRadius:14,background:'rgba(245,158,11,0.3)'}}
              animate={{scale:[1,1.15,1]}} transition={{duration:2.5,repeat:Infinity,ease:'easeInOut'}} />
            <div style={{position:'relative',width:'clamp(52px,10vw,72px)',height:'clamp(52px,10vw,72px)',background:'linear-gradient(135deg,#16a34a,#f59e0b)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:'clamp(18px,4vw,24px)',zIndex:10}}>
              {initials}
            </div>
          </div>
          <div style={{flex:1,minWidth:120}}>
            <h2 style={{fontSize:'clamp(18px,4vw,26px)',fontWeight:700,color:'#f8fafc',margin:0}}>{distributor.distributor_name}</h2>
            <p style={{color:'rgba(74,222,128,0.7)',marginTop:5,display:'flex',alignItems:'center',gap:5,fontSize:12}}>
              <MapPin style={{width:12,height:12,color:T.amber}} />{distributor.territory}
            </p>
          </div>
          <span style={{padding:'5px 14px',borderRadius:20,fontSize:11,fontWeight:700,background:statusStyle.bg,color:statusStyle.text,border:`1px solid ${statusStyle.border}`,flexShrink:0}}>
            {statusStyle.label.toUpperCase()}
          </span>
        </div>
      </motion.div>

      {/* 📝 NOTE: KEY FIX — repeat(2,1fr) → auto-fit minmax
          On mobile (< 440px): 1 column (cards stack)
          On tablet/desktop: 2 columns side by side */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:16,marginBottom:20}}>
        <StatCard icon={ShoppingBag} iconBg="rgba(22,163,74,0.12)" iconColor={T.green} label="Monthly Offtake" value={distributor.monthly_offtake} suffix=" units" subtext="Units dispatched this month" delay={0.2} />
        <StatCard icon={TrendingUp} iconBg="rgba(245,158,11,0.12)" iconColor={T.amber} label="New Outlet Additions" value={distributor.new_outlet_additions??0} subtext="New outlets added this period" delay={0.3} />
        <StatCard icon={Activity} iconBg="rgba(55,138,221,0.12)" iconColor={T.blue} label="Coverage Metrics" value={distributor.coverage_metrics??0} suffix="%" subtext="Territory coverage" delay={0.4} extra={<CoverageBar value={distributor.coverage_metrics??0} />} />
        <StatCard icon={Award} iconBg="rgba(168,85,247,0.12)" iconColor={T.purple} label="Performance Ranking" value={distributor.performance_ranking??null} prefix="#" subtext="Overall ranking" delay={0.5} extra={<RankingStars rank={distributor.performance_ranking} />} />
      </div>

      {/* Record info */}
      <motion.div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'clamp(14px,3vw,24px)'}}
        initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.4,delay:0.6}}>
        <div style={{height:3,borderRadius:2,marginBottom:16,background:'linear-gradient(90deg,#16a34a,#f59e0b)'}} />
        <h3 style={{fontSize:13,fontWeight:600,color:T.text,margin:'0 0 14px',display:'flex',alignItems:'center',gap:7}}>📋 Record Information</h3>
        {/* 📝 NOTE: Also auto-fit here so it wraps on tiny screens */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:16}}>
          {[
            {label:'Record ID',value:`#${distributor.id}`},
            {label:'Status',value:distributor.status?.charAt(0).toUpperCase()+distributor.status?.slice(1)},
            {label:'Created At',value:new Date(distributor.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})},
            {label:'Last Updated',value:new Date(distributor.updated_at).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})},
          ].map((item,i)=>(
            <motion.div key={item.label} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:0.7+i*0.06}}>
              <p style={{color:T.textFaint,fontSize:10,textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:3}}>{item.label}</p>
              <p style={{fontWeight:600,color:T.text,fontSize:13,margin:0}}>{item.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
export default DetailPage;