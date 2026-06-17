import API_BASE from '../config';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const T = {
  bg:'#0b1a0d', card:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.09)',
  text:'#f8fafc', textMuted:'rgba(248,250,252,0.45)', textFaint:'rgba(248,250,252,0.22)',
  green:'#16a34a', greenGlow:'rgba(22,163,74,0.15)', amber:'#f59e0b', amberGlow:'rgba(245,158,11,0.15)',
  blue:'#378ADD', blueGlow:'rgba(55,138,221,0.15)', purple:'#a855f7', purpleGlow:'rgba(168,85,247,0.15)',
};

function useCountUp(target, duration=1200) {
  const [count,setCount]=useState(0); const startTime=useRef(null); const frameRef=useRef(null);
  useEffect(()=>{
    const numTarget=parseFloat(target); if(!numTarget||numTarget===0) return;
    if(frameRef.current) cancelAnimationFrame(frameRef.current);
    const animate=(timestamp)=>{
      if(!startTime.current) startTime.current=timestamp;
      const progress=Math.min((timestamp-startTime.current)/duration,1);
      const easeOut=1-Math.pow(1-progress,3);
      setCount(parseFloat((easeOut*numTarget).toFixed(1)));
      if(progress<1) frameRef.current=requestAnimationFrame(animate); else setCount(numTarget);
    };
    startTime.current=null; frameRef.current=requestAnimationFrame(animate);
    return ()=>cancelAnimationFrame(frameRef.current);
  },[target,duration]);
  return count;
}

function SummaryCard({label,rawValue,accentColor,accentGlow,icon,delay,suffix='',isDecimal=false}) {
  const animated=useCountUp(parseFloat(rawValue)||0);
  const displayValue=isDecimal ? animated.toFixed(1)+suffix : Math.floor(animated).toLocaleString()+suffix;
  return (
    <motion.div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16,
      padding:'1rem', position:'relative', overflow:'hidden', cursor:'default' }}
      initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} whileHover={{y:-3,scale:1.02}} transition={{duration:0.4,delay}}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:accentColor,borderRadius:'16px 16px 0 0'}} />
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8,marginTop:4}}>
        <p style={{color:T.textMuted,fontSize:11,fontWeight:500,margin:0}}>{label}</p>
        <span style={{fontSize:14,padding:'3px 5px',borderRadius:7,background:accentGlow}}>{icon}</span>
      </div>
      <p style={{fontSize:'clamp(22px,4vw,30px)',fontWeight:700,color:accentColor,margin:0}}>{displayValue}</p>
    </motion.div>
  );
}

function TableProgressBar({value,delay}) {
  return (
    <div style={{display:'flex',alignItems:'center',gap:6}}>
      <div style={{width:48,height:4,background:'rgba(255,255,255,0.08)',borderRadius:4,overflow:'hidden'}}>
        <motion.div style={{height:'100%',background:T.blue,borderRadius:4}}
          initial={{width:0}} animate={{width:`${Math.min(value,100)}%`}}
          transition={{duration:0.8,delay,ease:'easeOut'}} />
      </div>
      <span style={{fontSize:10,color:T.textMuted,whiteSpace:'nowrap'}}>{value}%</span>
    </div>
  );
}

function ReportsPage() {
  const [distributors,setDistributors]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [exportFlash,setExportFlash]=useState(false);

  useEffect(()=>{
    const fetchData=async()=>{
      try {
        const response=await fetch(`${API_BASE}/api/distributors`);
        const data=await response.json();
        const list=Array.isArray(data)?data:(Array.isArray(data.data)?data.data:[]);
        setDistributors(list);
      } catch(err){setError('Could not load data');} finally{setLoading(false);}
    };
    fetchData();
  },[]);

  const totalDistributors=distributors.length;
  const activeCount=distributors.filter(d=>d.status==='active').length;
  const totalOfftake=distributors.reduce((s,d)=>s+(d.monthly_offtake||0),0);
  const avgCoverage=distributors.length
    ? (distributors.reduce((s,d)=>s+(parseFloat(d.coverage_metrics)||0),0)/distributors.length).toFixed(1) : 0;
  const topPerformer=distributors.find(d=>d.performance_ranking===1);
  const offtakeData=distributors.map(d=>({name:d.distributor_name.split(' ')[0],offtake:d.monthly_offtake,outlets:d.new_outlet_additions||0}));
  const coverageData=distributors.map(d=>({name:d.distributor_name.split(' ')[0],coverage:parseFloat(d.coverage_metrics)||0}));

  const exportCSV=()=>{
    const headers=['ID','Name','Territory','Monthly Offtake','New Outlets','Coverage %','Ranking','Status'];
    const rows=distributors.map(d=>[d.id,d.distributor_name,d.territory,d.monthly_offtake,d.new_outlet_additions||0,d.coverage_metrics||0,d.performance_ranking||'N/A',d.status]);
    const csv=[headers,...rows].map(r=>r.join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='arvi-edibles-distributors.csv'; a.click(); URL.revokeObjectURL(url);
    setExportFlash(true); setTimeout(()=>setExportFlash(false),2000);
  };

  if(loading) return <div style={{padding:'clamp(12px,4vw,32px)',background:T.bg,minHeight:'100vh'}}><p style={{color:T.textMuted}}>Loading...</p></div>;
  if(error) return <div style={{padding:'clamp(12px,4vw,32px)',background:T.bg,minHeight:'100vh'}}><p style={{color:'#f87171'}}>{error}</p></div>;

  const tooltipStyle={backgroundColor:'#1a2e1c',border:'1px solid rgba(255,255,255,0.12)',borderRadius:10,fontSize:11,color:T.text};

  return (
    <div style={{padding:'clamp(12px,4vw,32px)',minHeight:'100vh',background:T.bg}}>

      {/* Header */}
      <motion.div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:24,gap:12,flexWrap:'wrap'}}
        initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}>
        <div>
          <h2 style={{fontSize:'clamp(18px,4vw,24px)',fontWeight:700,color:T.text,margin:0}}>Reports & Analytics</h2>
          <p style={{color:T.textMuted,marginTop:4,fontSize:13}}>Performance overview for all distributors</p>
          <div style={{width:36,height:2,background:T.amber,borderRadius:2,marginTop:8}} />
        </div>
        <motion.button onClick={exportCSV} whileHover={{scale:1.04}} whileTap={{scale:0.96}}
          style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:10,
            border:`1px solid ${exportFlash?'rgba(74,222,128,0.4)':'rgba(22,163,74,0.3)'}`,
            background:exportFlash?'rgba(74,222,128,0.15)':'rgba(22,163,74,0.12)',
            color:'#4ade80',fontWeight:600,fontSize:12,cursor:'pointer',whiteSpace:'nowrap'}}>
          <AnimatePresence mode="wait">
            {exportFlash
              ? <motion.span key="c" initial={{opacity:0,scale:0.5}} animate={{opacity:1,scale:1}} exit={{opacity:0}}>✓ Exported!</motion.span>
              : <motion.span key="d" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>⬇ Export CSV</motion.span>}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* 📝 NOTE: 4 cards — 2 cols on mobile, 4 cols on desktop */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:14,marginBottom:24}}>
        <SummaryCard label="Total Distributors" rawValue={totalDistributors} accentColor={T.green} accentGlow={T.greenGlow} icon="🏪" delay={0.1} />
        <SummaryCard label="Active Distributors" rawValue={activeCount} accentColor={T.amber} accentGlow={T.amberGlow} icon="✅" delay={0.2} />
        <SummaryCard label="Total Offtake" rawValue={totalOfftake} accentColor={T.blue} accentGlow={T.blueGlow} icon="📦" delay={0.3} />
        <SummaryCard label="Avg Coverage" rawValue={avgCoverage} accentColor={T.purple} accentGlow={T.purpleGlow} icon="📊" delay={0.4} suffix="%" isDecimal />
      </div>

      {/* Top Performer */}
      {topPerformer && (
        <motion.div style={{borderRadius:16,padding:'1rem 1.25rem',marginBottom:24,display:'flex',
          alignItems:'center',gap:14,position:'relative',overflow:'hidden',flexWrap:'wrap',
          background:'linear-gradient(135deg,#14532d 0%,#166534 100%)',border:'1px solid rgba(74,222,128,0.2)'}}
          initial={{opacity:0,x:-30}} animate={{opacity:1,x:0}} transition={{duration:0.5,delay:0.45}}>
          <div style={{position:'relative',flexShrink:0}}>
            <div style={{width:44,height:44,background:'linear-gradient(135deg,#16a34a,#f59e0b)',borderRadius:12,
              display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:17}}>
              {topPerformer.distributor_name.charAt(0)}
            </div>
          </div>
          <div style={{position:'relative',zIndex:10,flex:1,minWidth:120}}>
            <p style={{color:'rgba(74,222,128,0.7)',fontSize:10,fontWeight:600,letterSpacing:'1px',textTransform:'uppercase',margin:0}}>🏆 Top Performer — Rank #1</p>
            <p style={{color:'#f8fafc',fontWeight:700,fontSize:16,margin:'2px 0'}}>{topPerformer.distributor_name}</p>
            <p style={{color:'rgba(248,250,252,0.55)',fontSize:12,margin:0}}>{topPerformer.territory} · {topPerformer.monthly_offtake?.toLocaleString()} units</p>
          </div>
          <motion.div style={{fontSize:28}} animate={{rotate:[-5,5,-5]}} transition={{duration:2,repeat:Infinity,ease:'easeInOut'}}>🏆</motion.div>
        </motion.div>
      )}

      {/* 📝 NOTE: Charts — stack to 1 col on mobile */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16,marginBottom:24}}>
        <motion.div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:20}}
          initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.5}}>
          <h3 style={{fontSize:13,fontWeight:600,color:T.text,margin:'0 0 4px'}}>Monthly Offtake vs New Outlets</h3>
          <p style={{color:T.textFaint,fontSize:10,margin:'0 0 14px'}}>Comparing offtake units and new outlet additions</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={offtakeData} margin={{top:5,right:5,left:-20,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{fontSize:10,fill:T.textMuted}} />
              <YAxis tick={{fontSize:10,fill:T.textMuted}} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend formatter={v=><span style={{fontSize:10,color:T.textMuted}}>{v}</span>} />
              <Bar dataKey="offtake" fill={T.green} radius={[3,3,0,0]} name="Offtake" isAnimationActive animationDuration={1200} />
              <Bar dataKey="outlets" fill={T.amber} radius={[3,3,0,0]} name="New Outlets" isAnimationActive animationDuration={1400} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:20}}
          initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.6}}>
          <h3 style={{fontSize:13,fontWeight:600,color:T.text,margin:'0 0 4px'}}>Coverage Metrics Trend</h3>
          <p style={{color:T.textFaint,fontSize:10,margin:'0 0 14px'}}>Territory coverage percentage per distributor</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={coverageData} margin={{top:5,right:5,left:-20,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{fontSize:10,fill:T.textMuted}} />
              <YAxis domain={[0,100]} tick={{fontSize:10,fill:T.textMuted}} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend formatter={v=><span style={{fontSize:10,color:T.textMuted}}>{v}</span>} />
              <Line type="monotone" dataKey="coverage" stroke={T.blue} strokeWidth={2} dot={{fill:T.blue,r:3}} activeDot={{r:5}} name="Coverage %" isAnimationActive animationDuration={1500} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Performance Table */}
      <motion.div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:'clamp(14px,3vw,24px)'}}
        initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.5,delay:0.7}}>
        <div style={{height:3,borderRadius:2,marginBottom:16,background:'linear-gradient(90deg,#16a34a,#f59e0b)'}} />
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14,flexWrap:'wrap',gap:8}}>
          <h3 style={{fontSize:13,fontWeight:600,color:T.text,margin:0}}>Detailed Performance Table</h3>
          <span style={{fontSize:10,color:T.textMuted,background:'rgba(255,255,255,0.05)',padding:'2px 8px',borderRadius:20,border:`1px solid ${T.border}`}}>{distributors.length} records</span>
        </div>
        <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch'}}>
          <table style={{width:'100%',fontSize:12,borderCollapse:'collapse',minWidth:480}}>
            <thead>
              <tr style={{borderBottom:`1px solid ${T.border}`}}>
                {['Rank','Name','Territory','Offtake','Outlets','Coverage','Status'].map(h=>(
                  <th key={h} style={{textAlign:'left',color:T.textFaint,fontWeight:500,paddingBottom:8,paddingRight:12,fontSize:10,letterSpacing:'0.6px',textTransform:'uppercase',whiteSpace:'nowrap'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {distributors.sort((a,b)=>(a.performance_ranking||99)-(b.performance_ranking||99)).map((d,i)=>(
                <motion.tr key={d.id} style={{borderBottom:`1px solid ${T.border}`,cursor:'default'}}
                  initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:0.8+i*0.05}}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(22,163,74,0.06)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}>
                  <td style={{padding:'10px 12px 10px 0'}}>
                    {d.performance_ranking===1
                      ? <span style={{display:'inline-flex',alignItems:'center',gap:3,padding:'1px 7px',background:'rgba(245,158,11,0.15)',color:'#fbbf24',borderRadius:20,fontSize:10,fontWeight:700,border:'1px solid rgba(245,158,11,0.3)'}}>🥇 #1</span>
                      : <span style={{fontWeight:700,color:'#4ade80',fontSize:11}}>#{d.performance_ranking||'N/A'}</span>}
                  </td>
                  <td style={{padding:'10px 12px 10px 0',fontWeight:600,color:T.text,whiteSpace:'nowrap'}}>{d.distributor_name}</td>
                  <td style={{padding:'10px 12px 10px 0',color:T.textMuted,whiteSpace:'nowrap'}}>{d.territory}</td>
                  <td style={{padding:'10px 12px 10px 0',fontWeight:500,color:T.text}}>{d.monthly_offtake?.toLocaleString()}</td>
                  <td style={{padding:'10px 12px 10px 0',color:T.textMuted}}>{d.new_outlet_additions||0}</td>
                  <td style={{padding:'10px 12px 10px 0'}}><TableProgressBar value={d.coverage_metrics||0} delay={0.9+i*0.05} /></td>
                  <td style={{padding:'10px 0'}}>
                    <span style={{padding:'2px 8px',borderRadius:20,fontSize:10,fontWeight:600,
                      background:d.status==='active'?'rgba(74,222,128,0.12)':d.status==='inactive'?'rgba(239,68,68,0.12)':'rgba(245,158,11,0.12)',
                      color:d.status==='active'?'#4ade80':d.status==='inactive'?'#f87171':'#fbbf24'}}>
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