import { useState, useEffect, useMemo, useRef } from "react";

// ============ DESIGN TOKENS ============
const C = {
  bg: "#0E0F13", panel: "#15171D", panel2: "#1B1E26", line: "#262A34",
  ink: "#E9E6DC", dim: "#8C92A0", faint: "#565C68",
  teal: "#2BA8B8", sleep: "#9B5A3C", purple: "#7B4FB5", pink: "#E0529B",
  blue: "#3E6FD6", green: "#2F9E44", gold: "#E6B800", red: "#E0524A", cyan: "#4FC3E0",
};
const CATS = {
  School:C.pink, Gym:C.blue, Revision:C.gold, Sport:C.green,
  Activity:C.purple, Sleep:C.sleep, Work:C.teal, Social:C.cyan, Other:C.dim,
};
const CAT_KEYS = Object.keys(CATS);

// ============ DAY TYPE TEMPLATES (from your Week A/B planners; times = decimal hours) ============
const SEED_DAYTYPES = {
  "school-a-mon": { name:"School A · Mon", color:C.pink, blocks:[
    { t:8.5,e:9.5,label:"Volleyball + Form",cat:"Sport" }, { t:9.5,e:10.5,label:"Olney",cat:"School" },
    { t:10.5,e:11.5,label:"Speedy",cat:"School" }, { t:11.5,e:12.5,label:"Olney",cat:"School" },
    { t:12.5,e:13.5,label:"Gym: 3k + Workout",cat:"Gym" }, { t:13.5,e:14.5,label:"Gooch",cat:"School" },
    { t:14.5,e:15.5,label:"Squire",cat:"School" }, { t:16,e:18,label:"Gym + Pool",cat:"Gym" },
    { t:18,e:19,label:"Compos Call",cat:"Activity" } ]},
  "school-a-tue": { name:"School A · Tue", color:C.pink, blocks:[
    { t:9,e:10,label:"Stiles",cat:"School" }, { t:10,e:11,label:"Stiles",cat:"School" },
    { t:12,e:13,label:"Speedy",cat:"School" }, { t:14,e:15,label:"Gooch",cat:"School" } ]},
  "school-a-wed": { name:"School A · Wed", color:C.pink, blocks:[
    { t:8.5,e:9.5,label:"Smith",cat:"School" }, { t:9.5,e:10.5,label:"Short",cat:"School" },
    { t:11,e:12,label:"Kho training",cat:"Sport" }, { t:12,e:13,label:"Smith",cat:"School" },
    { t:13,e:14,label:"Football training",cat:"Sport" }, { t:15.5,e:17,label:"Football or KHO",cat:"Sport" } ]},
  "school-a-thu": { name:"School A · Thu", color:C.pink, blocks:[
    { t:14,e:15,label:"Gooch",cat:"School" }, { t:17,e:18.5,label:"Football",cat:"Sport" } ]},
  "school-a-fri": { name:"School A · Fri", color:C.pink, blocks:[
    { t:8.5,e:9.5,label:"Stiles",cat:"School" }, { t:9.5,e:10.5,label:"Olney",cat:"School" },
    { t:10.5,e:11.5,label:"Squire",cat:"School" }, { t:12,e:13,label:"Short",cat:"School" },
    { t:15,e:17,label:"Gym + Pool",cat:"Gym" }, { t:17,e:18.5,label:"Library",cat:"Revision" } ]},
  "school-b-mon": { name:"School B · Mon", color:C.cyan, blocks:[
    { t:8.5,e:9.5,label:"Volleyball + Form",cat:"Sport" }, { t:9.5,e:10.5,label:"Olney",cat:"School" },
    { t:10.5,e:11.5,label:"Speedy",cat:"School" }, { t:11.5,e:12.5,label:"Gooch",cat:"School" },
    { t:12.5,e:13.5,label:"Gym: 3k + Workout",cat:"Gym" }, { t:13.5,e:14.5,label:"Short",cat:"School" },
    { t:16,e:18,label:"Gym + Pool",cat:"Gym" } ]},
  "weekend": { name:"Weekend", color:C.green, blocks:[
    { t:8,e:8.5,label:"Cold plunge + reps",cat:"Activity" }, { t:10,e:12,label:"Football game",cat:"Sport" },
    { t:14,e:16,label:"Revision",cat:"Revision" } ]},
  "holiday": { name:"Holiday / Half-term", color:C.gold, blocks:[
    { t:8,e:8.5,label:"Cold plunge + reps",cat:"Activity" }, { t:10,e:12,label:"Deep work / revision",cat:"Revision" },
    { t:16,e:18,label:"Gym",cat:"Gym" } ]},
  "workexp": { name:"Work Experience", color:C.teal, blocks:[
    { t:9,e:17,label:"Work placement",cat:"Work" }, { t:18,e:19.5,label:"Gym",cat:"Gym" } ]},
  "rest": { name:"Rest Day", color:C.purple, blocks:[ { t:8,e:8.5,label:"Cold plunge + reps",cat:"Activity" } ]},
  "blank": { name:"Blank Day", color:C.dim, blocks:[] },
};

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const HABITS = [
  { key:"sleep8",label:"Sleep 8hrs+",color:C.purple }, { key:"eatwell",label:"Eat Well",color:C.purple },
  { key:"exercise",label:"Exercise",color:C.purple }, { key:"screen",label:"Screen < 3hrs",color:C.purple },
  { key:"icebath",label:"Ice Bath",color:C.cyan },
];
const BREAKDOWN = ["Sleep","Lessons","Revision","Gym","Activity"];
const DEFAULT_WEEK = {
  Monday:"school-a-mon", Tuesday:"school-a-tue", Wednesday:"school-a-wed",
  Thursday:"school-a-thu", Friday:"school-a-fri", Saturday:"weekend", Sunday:"weekend",
};
const DEFAULT_WEEK_B = {
  Monday:"school-b-mon", Tuesday:"school-a-tue", Wednesday:"school-a-wed",
  Thursday:"school-a-thu", Friday:"school-a-fri", Saturday:"weekend", Sunday:"weekend",
};

// ============ DATE HELPERS (all parse noon to dodge timezone/DST drift) ============
const pd = (iso)=> new Date(iso+"T12:00:00");
const isoOf = (d)=>{ const x=new Date(d); x.setHours(12,0,0,0); const y=x.getFullYear(),m=String(x.getMonth()+1).padStart(2,"0"),da=String(x.getDate()).padStart(2,"0"); return `${y}-${m}-${da}`; };
const todayISO = ()=> isoOf(new Date());
const addDays = (iso,n)=>{ const d=pd(iso); d.setDate(d.getDate()+n); return isoOf(d); };
const dayNameOf = (iso)=> DAYS[(pd(iso).getDay()+6)%7];
const weekKeyOf = (iso)=>{ const d=pd(iso); const off=(d.getDay()+6)%7; d.setDate(d.getDate()-off); return isoOf(d); };
const fmt = (iso)=> pd(iso).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"});
const dayOfYear = (iso)=>{ const d=pd(iso); const start=new Date(d.getFullYear(),0,0,12); return Math.floor((d-start)/86400000); };
const hhmm = (dec)=>{ const h=Math.floor(dec); const m=Math.round((dec-h)*60); return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`; };
const weeksBetween = (isoA,isoB)=> Math.round((pd(isoB)-pd(isoA))/(7*86400000));
// true if the week containing `iso` is a "Week B" given `anchorA` (a Monday designated Week A)
const weekIsB = (iso,anchorA)=> ((((weeksBetween(weekKeyOf(anchorA), weekKeyOf(iso)))%2)+2)%2)===1;

// localStorage-backed (works on any host; persists on the device)
async function sGet(key,fb){ try{ const r=localStorage.getItem("lifeos:"+key); return r!==null?JSON.parse(r):fb; }catch{ return fb; } }
async function sSet(key,v){ try{ localStorage.setItem("lifeos:"+key, JSON.stringify(v)); }catch(e){ console.error(e); } }

const blankDay = (iso)=>({
  date:iso, dayTypeId:null, blocks:[], bs:false,
  reps:{ target:dayOfYear(iso), done:false },
  breakdown:{ Sleep:0,Lessons:0,Revision:0,Gym:0,Activity:0 },
  breakdownAdj:{ Sleep:0,Lessons:0,Revision:0,Gym:0,Activity:0 },
  habits:{ sleep8:false,eatwell:false,exercise:false,screen:false,icebath:false },
  todos:{ shortImp:[],longImp:[],shortUnimp:[],longUnimp:[] },
  rating:0, feedback:"", prodHours:0, unprodHours:0,
});
const cloneBlocks = (blocks)=> blocks.map((b,i)=>({ id:Date.now()+i, done:false, ...b }));

// ============ RESPONSIVE HOOK ============
function useIsMobile(bp=760){
  const [m,setM] = useState(typeof window!=="undefined" && window.innerWidth<=bp);
  useEffect(()=>{ const on=()=>setM(window.innerWidth<=bp); window.addEventListener("resize",on); return ()=>window.removeEventListener("resize",on); },[bp]);
  return m;
}

// ============ AUTO BREAKDOWN (derive Hourly Breakdown from timeline blocks) ============
const BD_MAP = { Sleep:"Sleep", School:"Lessons", Revision:"Revision", Gym:"Gym", Sport:"Activity", Activity:"Activity" };
function computeBreakdown(blocks){
  const out = { Sleep:0,Lessons:0,Revision:0,Gym:0,Activity:0 };
  for(const b of (blocks||[])){ const k=BD_MAP[b.cat]; if(k) out[k]+=Math.max(0,(b.e-b.t)); }
  for(const k in out) out[k]=Math.round(out[k]*2)/2;
  if(out.Sleep===0) out.Sleep=8;   // auto-assume 8h sleep unless a Sleep block says otherwise
  return out;
}
// final breakdown = auto-from-timeline + manual ± adjustments, clamped at 0
function withAdj(auto,adj){ const o={}; for(const k in auto) o[k]=Math.max(0,(auto[k]||0)+((adj&&adj[k])||0)); return o; }

// ============ DATA BACKUP (export / import everything in localStorage) ============
function exportBackup(){
  const data={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k&&k.startsWith("lifeos:")) data[k]=localStorage.getItem(k); }
  const payload={ app:"life-os", version:1, exported:new Date().toISOString(), data };
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob); const a=document.createElement("a");
  a.href=url; a.download=`life-os-backup-${todayISO()}.json`; a.click(); URL.revokeObjectURL(url);
}
function importBackup(file,onDone){
  const reader=new FileReader();
  reader.onload=()=>{ try{
    const parsed=JSON.parse(reader.result); const data=parsed&&parsed.data?parsed.data:parsed;
    let n=0; for(const k in data){ if(k.startsWith("lifeos:")){ localStorage.setItem(k, data[k]); n++; } }
    onDone(n);
  }catch{ onDone(-1); } };
  reader.readAsText(file);
}

// ============ UI PRIMITIVES ============
const Panel = ({ accent,title,right,children,style })=>(
  <div style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:18, ...style }}>
    {title && <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:4,height:16,background:accent,borderRadius:2 }}/>
        <span style={{ fontSize:13, fontWeight:700, letterSpacing:0.5, textTransform:"uppercase", color:accent }}>{title}</span>
      </div>{right}
    </div>}
    {children}
  </div>
);
const Check = ({ on,color,onClick,size=22 })=>(
  <button onClick={onClick} style={{ width:size,height:size,borderRadius:6,cursor:"pointer",flexShrink:0,
    border:`2px solid ${on?color:C.faint}`, background:on?color:"transparent", display:"flex",
    alignItems:"center", justifyContent:"center", color:"#fff", fontSize:size*0.6, fontWeight:700, padding:0 }}>{on?"✓":""}</button>
);
const inp = { background:"#101218", border:`1px solid ${C.line}`, borderRadius:8, padding:"9px 11px", color:C.ink, fontSize:13, outline:"none" };
const addBtn = { width:"100%", padding:"9px", borderRadius:8, border:`1px dashed ${C.line}`, background:"transparent", color:C.dim, cursor:"pointer", fontSize:13 };
const delBtn = { width:28,height:28,borderRadius:6,border:`1px solid ${C.line}`,background:"transparent",color:C.faint,cursor:"pointer",fontSize:16,flexShrink:0 };
const stepBtn = { width:24,height:24,borderRadius:6,border:`1px solid ${C.line}`,background:C.panel2,color:C.dim,cursor:"pointer",fontSize:15,lineHeight:1,padding:0 };
const Nav = ({ children,onClick })=>(
  <button onClick={onClick} style={{ width:42,height:42,borderRadius:"50%",border:`1px solid ${C.line}`,background:C.panel,color:C.dim,fontSize:22,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,paddingBottom:3 }}>{children}</button>
);
const Empty = ({ children,big })=> <div style={{ textAlign:"center", color:C.faint, fontSize:big?15:12, padding:big?"60px 20px":"14px", lineHeight:1.6 }}>{children}</div>;
const Mini = ({ children })=> <div style={{ fontSize:11, color:C.faint, marginTop:8, textAlign:"center" }}>{children}</div>;
const Label = ({ children })=> <div style={{ fontSize:11, color:C.faint, marginBottom:8 }}>{children}</div>;
const Stat = ({ label,value,sub,color })=>(
  <div style={{ background:C.panel2, borderRadius:10, padding:"14px 12px", textAlign:"center" }}>
    <div style={{ fontSize:26, fontWeight:700, color }}>{value}<span style={{ fontSize:13, color:C.faint }}>{sub}</span></div>
    <div style={{ fontSize:11, color:C.dim, marginTop:4 }}>{label}</div>
  </div>
);
function Stepper({ v,set,big }){
  return <div style={{ display:"flex", alignItems:"center", gap:6 }}>
    <button onClick={()=>set((+v||0)-1)} style={stepBtn}>–</button>
    <span style={{ width:big?40:28, textAlign:"center", fontSize:big?22:14, fontWeight:600, color:C.ink }}>{v||0}</span>
    <button onClick={()=>set((+v||0)+1)} style={stepBtn}>+</button>
  </div>;
}

// ============ APP ============
export default function LifeOS(){
  const [tab,setTab] = useState("today");
  const [date,setDate] = useState(todayISO());
  const [day,setDay] = useState(null);
  const [loading,setLoading] = useState(true);
  const [dayTypes,setDayTypes] = useState({});
  const [weekMap,setWeekMap] = useState(DEFAULT_WEEK);      // Week A
  const [weekMapB,setWeekMapB] = useState(DEFAULT_WEEK_B);  // Week B
  const [weekAnchorA,setWeekAnchorA] = useState(todayISO());// Monday of a week designated "Week A"
  const [allDays,setAllDays] = useState({});
  const [finance,setFinance] = useState(null);
  const [toast,setToast] = useState("");
  const [showBackup,setShowBackup] = useState(false);
  const isMobile = useIsMobile();

  useEffect(()=>{ (async()=>{
    setDayTypes(await sGet("dayTypes:v2", SEED_DAYTYPES));
    setWeekMap(await sGet("weekMap:v2", DEFAULT_WEEK));
    setWeekMapB(await sGet("weekMapB:v1", DEFAULT_WEEK_B));
    setWeekAnchorA(await sGet("weekAnchorA:v1", todayISO()));
    const idx = await sGet("index:days", []);
    const map={}; for(const iso of idx) map[iso]=await sGet(`day:${iso}`, null);
    setAllDays(map);
    setFinance(await sGet("finance:v2", {
      accounts:[{ id:1,name:"Current Account",balance:200 }], netWorthLog:[],
      clients:[{ id:1,name:"First GCSE Client (w/ Mazin)",rate:0,lessonsThisMonth:0,status:"Free trial" }], lessonLog:[],
      lump:{ amount:10000, received:false, allocations:[
        { id:1,name:"S&S ISA — Index funds",pct:60 }, { id:2,name:"Emergency cash buffer",pct:15 },
        { id:3,name:"Tools (sleep tracker, electronics)",pct:10 }, { id:4,name:"Business reinvestment",pct:15 }],
        expectedReturn:7, years:3 },
    }));
    setLoading(false);
  })(); },[]);

  useEffect(()=>{ if(loading) return; (async()=>{
    let d = await sGet(`day:${date}`, null);
    if(!d){
      d = blankDay(date);
      const map = weekIsB(date, weekAnchorA) ? weekMapB : weekMap;
      const typeId = map[dayNameOf(date)] || "blank";
      d.dayTypeId = typeId;
      d.blocks = cloneBlocks((dayTypes[typeId]?.blocks)||[]);
    }
    // migrate older saved days lacking new fields
    if(!d.reps) d.reps = { target:dayOfYear(date), done:false };
    if(d.bs===undefined) d.bs = false;
    if(!d.breakdownAdj) d.breakdownAdj = { Sleep:0,Lessons:0,Revision:0,Gym:0,Activity:0 };
    // breakdown = auto from timeline + the day's manual adjustments
    d.breakdown = withAdj(computeBreakdown(d.blocks), d.breakdownAdj);
    setDay(d);
  })(); },[date, loading, weekAnchorA]); // eslint-disable-line

  const flash = (m)=>{ setToast(m); setTimeout(()=>setToast(""),1600); };
  const persistDay = async (d)=>{ setDay(d); await sSet(`day:${d.date}`, d);
    const idx=await sGet("index:days",[]); if(!idx.includes(d.date)){ idx.push(d.date); await sSet("index:days",idx); }
    setAllDays(prev=>({ ...prev, [d.date]:d })); };
  const upd = (patch)=> persistDay({ ...day, ...patch });
  const persistFinance = async (f)=>{ setFinance(f); await sSet("finance:v2", f); };
  const persistDayTypes = async (dt)=>{ setDayTypes(dt); await sSet("dayTypes:v2", dt); };
  const persistWeekMap = async (wm)=>{ setWeekMap(wm); await sSet("weekMap:v2", wm); };
  const persistWeekMapB = async (wm)=>{ setWeekMapB(wm); await sSet("weekMapB:v1", wm); };
  const persistWeekAnchor = async (iso)=>{ setWeekAnchorA(iso); await sSet("weekAnchorA:v1", iso); };
  const applyDayType = (typeId)=>{ const dt=dayTypes[typeId]; if(!dt) return;
    persistDay({ ...day, dayTypeId:typeId, blocks:cloneBlocks(dt.blocks) }); flash(`Applied: ${dt.name}`); };

  if(loading || !day || !finance) return (
    <div style={{ background:C.bg, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:C.dim, fontFamily:"system-ui" }}>Loading your system…</div>
  );

  return (
    <div style={{ background:C.bg, minHeight:"100vh", fontFamily:"'Inter',system-ui,sans-serif", color:C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;} input,textarea,select{font-family:inherit;}
        ::-webkit-scrollbar{width:8px;height:8px;} ::-webkit-scrollbar-thumb{background:${C.line};border-radius:4px;}
      `}</style>

      <div style={{ borderBottom:`1px solid ${C.line}`, padding:isMobile?"14px 16px":"18px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:C.bg, zIndex:50, gap:10 }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:12, minWidth:0 }}>
          <span style={{ fontFamily:"'Caveat',cursive", fontSize:isMobile?28:34, color:C.teal, lineHeight:1 }}>Life OS</span>
          {!isMobile && <span style={{ fontSize:11, color:C.faint, letterSpacing:2, textTransform:"uppercase" }}>Plan · Track · Compound</span>}
        </div>
        <div style={{ display:"flex", gap:8, flexShrink:0 }}>
          <button onClick={()=>setShowBackup(true)} style={{ ...addBtn, width:"auto", padding:"7px 12px", fontSize:12 }}>Backup</button>
          <button onClick={()=>{ setDate(todayISO()); setTab("today"); }} style={{ ...addBtn, width:"auto", padding:"7px 14px", fontSize:12 }}>{isMobile?"Today":"Jump to Today"}</button>
        </div>
      </div>

      {showBackup && <BackupModal close={()=>setShowBackup(false)} flash={flash} />}

      <div style={{ display:"flex", gap:4, padding:"12px 24px 0", borderBottom:`1px solid ${C.line}`, overflowX:"auto" }}>
        {[["today","Today"],["month","Month"],["week","Weekly Review"],["trends","Trends"],["finance","Finance"],["types","Day Types"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{ padding:"10px 18px", cursor:"pointer", border:"none", background:"transparent",
            color:tab===k?C.ink:C.faint, fontWeight:600, fontSize:14, borderBottom:`2px solid ${tab===k?C.teal:"transparent"}`, marginBottom:-1, whiteSpace:"nowrap" }}>{l}</button>
        ))}
      </div>

      <div style={{ maxWidth:1180, margin:"0 auto", padding:isMobile?"16px 12px":"24px" }}>
        {tab==="today" && <TodayView day={day} date={date} setDate={setDate} upd={upd} dayTypes={dayTypes} applyDayType={applyDayType} />}
        {tab==="month" && <MonthView date={date} setDate={setDate} setTab={setTab} allDays={allDays} dayTypes={dayTypes} flash={flash} />}
        {tab==="week" && <WeekView allDays={allDays} date={date} setDate={setDate} />}
        {tab==="trends" && <TrendsView allDays={allDays} />}
        {tab==="finance" && <FinanceView finance={finance} save={persistFinance} flash={flash} />}
        {tab==="types" && <DayTypesView dayTypes={dayTypes} save={persistDayTypes} weekMap={weekMap} saveWeekMap={persistWeekMap} weekMapB={weekMapB} saveWeekMapB={persistWeekMapB} weekAnchorA={weekAnchorA} saveWeekAnchor={persistWeekAnchor} flash={flash} />}
      </div>

      {toast && <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:C.teal, color:"#001014", padding:"10px 22px", borderRadius:30, fontWeight:600, fontSize:14, zIndex:100, boxShadow:"0 8px 30px rgba(0,0,0,.5)" }}>{toast}</div>}
    </div>
  );
}

// ============ BACKUP MODAL ============
function BackupModal({ close,flash }){
  const fileRef = useRef(null);
  const onFile = (e)=>{ const f=e.target.files&&e.target.files[0]; if(!f) return;
    importBackup(f,(n)=>{ if(n<0){ flash("Couldn't read that file"); return; }
      flash(`Restored ${n} items — reloading…`); setTimeout(()=>location.reload(),900); }); };
  return (
    <div onClick={close} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:22, width:"100%", maxWidth:380 }}>
        <div style={{ fontFamily:"'Caveat',cursive", fontSize:28, color:C.teal, marginBottom:6 }}>Backup & Restore</div>
        <div style={{ fontSize:12, color:C.dim, lineHeight:1.6, marginBottom:18 }}>
          Your data lives only on this device. Export a backup file regularly and keep it somewhere safe (email it to yourself, save to cloud). You can restore it here or on a new phone.
        </div>
        <button onClick={()=>{ exportBackup(); flash("Backup downloaded"); }} style={{ ...addBtn, borderColor:C.green, color:C.green, marginBottom:10 }}>⬇  Export backup file</button>
        <button onClick={()=>fileRef.current&&fileRef.current.click()} style={{ ...addBtn, borderColor:C.blue, color:C.blue }}>⬆  Restore from a backup file</button>
        <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} style={{ display:"none" }}/>
        <div style={{ fontSize:11, color:C.faint, marginTop:14, lineHeight:1.5 }}>Restoring merges the backup into this device and reloads the app.</div>
        <button onClick={close} style={{ ...addBtn, marginTop:16 }}>Close</button>
      </div>
    </div>
  );
}

// ============ VERTICAL TIMELINE (draw-to-plan canvas) ============
const DAY_START=6, DAY_END=24, PX_PER_HOUR=56;
const timeToY = (t)=> (t-DAY_START)*PX_PER_HOUR;
const yToTime = (y)=> Math.max(DAY_START, Math.min(DAY_END, DAY_START + y/PX_PER_HOUR));
const snap = (t)=> Math.round(t*4)/4;
const nowDec = ()=>{ const d=new Date(); return d.getHours()+d.getMinutes()/60; };
const PENS = [C.cyan, C.gold, C.pink, C.ink];

// snap a freehand stroke to a clean straight line or rectangle (shape-builder)
function _bounds(P){ let a=Infinity,b=Infinity,c=-Infinity,d=-Infinity; for(const p of P){ a=Math.min(a,p.x); b=Math.min(b,p.y); c=Math.max(c,p.x); d=Math.max(d,p.y); } return {x:a,y:b,w:c-a,h:d-b}; }
function _perim(P){ let s=0; for(let i=1;i<P.length;i++) s+=Math.hypot(P[i].x-P[i-1].x,P[i].y-P[i-1].y); return s; }
function _lineDist(p,a,b){ const dx=b.x-a.x, dy=b.y-a.y; const L=Math.hypot(dx,dy)||1; return Math.abs((p.x-a.x)*dy-(p.y-a.y)*dx)/L; }
function snapStroke(pts,w,held){
  if(pts.length<3 || !w) return pts;
  const P=pts.map(p=>({x:p.x*w,y:p.y})); const a=P[0], b=P[P.length-1];
  const len=Math.hypot(b.x-a.x,b.y-a.y); let maxDev=0; for(const p of P){ const dv=_lineDist(p,a,b); if(dv>maxDev)maxDev=dv; }
  const bb=_bounds(P); const closed = Math.hypot(b.x-a.x,b.y-a.y) < 0.30*_perim(P);
  if(len>28 && (held || maxDev<14)) return [a,b].map(q=>({x:q.x/w,y:q.y}));               // straight line
  if(closed && bb.w>26 && bb.h>26){ const r=[[bb.x,bb.y],[bb.x+bb.w,bb.y],[bb.x+bb.w,bb.y+bb.h],[bb.x,bb.y+bb.h],[bb.x,bb.y]]; return r.map(([x,y])=>({x:x/w,y})); } // rectangle
  return pts;
}

function Timeline({ blocks,onChange,isToday=false,isPast=false,sketch,onSketch }){
  const railRef = useRef(null);
  const dragRef = useRef(null);      // moving / resizing / wiping an existing block
  const createRef = useRef(null);    // drawing a new block on empty space
  const strokeRef = useRef(null);    // current freehand stroke
  const suppressRef = useRef(false); // swallow the click that follows a drag
  const isMobile = useIsMobile();
  const [, force] = useState(0); const rerender = ()=> force(n=>n+1);
  const [editing,setEditing] = useState(null);
  const [pen,setPen] = useState(false);
  const [penColor,setPenColor] = useState(PENS[0]);
  const [now,setNow] = useState(nowDec());
  const [railW,setRailW] = useState(1);
  const hours=[]; for(let h=DAY_START;h<=DAY_END;h++) hours.push(h);
  const height=(DAY_END-DAY_START)*PX_PER_HOUR;
  const canSketch = !!onSketch;
  const strokes = sketch||[];

  useEffect(()=>{ if(!isToday) return; const id=setInterval(()=>setNow(nowDec()),60000); return ()=>clearInterval(id); },[isToday]);
  useEffect(()=>{ const m=()=>setRailW(railRef.current?railRef.current.clientWidth:1); m(); window.addEventListener("resize",m); return ()=>window.removeEventListener("resize",m); },[]);

  const updBlock=(id,patch)=> onChange(prev=>prev.map(b=>b.id===id?{...b,...patch}:b));
  const delBlock=(id)=>{ onChange(prev=>prev.filter(b=>b.id!==id)); setEditing(null); };
  const elapsed=(b)=> isPast || (isToday && b.e<=now);
  const effState=(b)=> b.status==="missed" ? "missed" : (elapsed(b) ? "done" : "plan");
  const pathD=(pts)=> pts.map((p,i)=> (i?"L":"M")+(p.x*railW).toFixed(1)+" "+p.y.toFixed(1)).join(" ");

  // ----- drag an existing block: vertical = move, bottom edge = resize, horizontal = wipe/skip -----
  const startBlock=(e,blk,mode)=>{ e.stopPropagation(); if(pen) return;
    const p=e.touches?e.touches[0]:e;
    const d={ id:blk.id,mode,axis:mode==="resize"?"v":null,sx:p.clientX,sy:p.clientY,oT:blk.t,oE:blk.e,oStatus:blk.status,dx:0,moved:false };
    dragRef.current=d;
    const move=(ev)=>{ const q=ev.touches?ev.touches[0]:ev; const dx=q.clientX-d.sx, dy=q.clientY-d.sy;
      if(!d.axis && Math.hypot(dx,dy)>7) d.axis=Math.abs(dx)>Math.abs(dy)?"h":"v";
      if(!d.axis) return; d.moved=true; if(ev.cancelable&&ev.touches) ev.preventDefault();
      if(d.mode==="resize"){ let ne=snap(d.oE+dy/PX_PER_HOUR); ne=Math.max(d.oT+0.25,Math.min(DAY_END,ne)); updBlock(d.id,{e:ne}); }
      else if(d.axis==="h"){ d.dx=dx; rerender(); }
      else { const dur=d.oE-d.oT; let nt=snap(d.oT+dy/PX_PER_HOUR); nt=Math.max(DAY_START,Math.min(DAY_END-dur,nt)); updBlock(d.id,{t:nt,e:nt+dur}); } };
    const up=()=>{ if(d.axis==="h" && Math.abs(d.dx)>70) updBlock(d.id,{status: d.oStatus==="missed"?undefined:"missed"});
      if(d.moved) suppressRef.current=true; dragRef.current=null; rerender();
      window.removeEventListener("mousemove",move); window.removeEventListener("touchmove",move); window.removeEventListener("mouseup",up); window.removeEventListener("touchend",up); };
    window.addEventListener("mousemove",move); window.addEventListener("touchmove",move,{passive:false}); window.addEventListener("mouseup",up); window.addEventListener("touchend",up);
  };

  // ----- draw a new block on empty space -----
  const startCreate=(e)=>{ if(pen) return; if(e.target!==railRef.current) return;
    const rect=railRef.current.getBoundingClientRect(); const p=e.touches?e.touches[0]:e;
    const c={ t0:snap(yToTime(p.clientY-rect.top)), t1:snap(yToTime(p.clientY-rect.top)) }; createRef.current=c; rerender();
    const move=(ev)=>{ const q=ev.touches?ev.touches[0]:ev; if(ev.cancelable&&ev.touches) ev.preventDefault();
      c.t1=snap(yToTime(q.clientY-rect.top)); rerender(); };
    const up=()=>{ const a=Math.min(c.t0,c.t1), b=Math.max(c.t0,c.t1); createRef.current=null;
      const dur=b-a>=0.25?b-a:1; const t=Math.min(DAY_END-dur,a); const id=Date.now();
      onChange(prev=>[...prev,{ id,t,e:t+dur,label:"New",cat:"Other" }]); setEditing(id); rerender();
      window.removeEventListener("mousemove",move); window.removeEventListener("touchmove",move); window.removeEventListener("mouseup",up); window.removeEventListener("touchend",up); };
    window.addEventListener("mousemove",move); window.addEventListener("touchmove",move,{passive:false}); window.addEventListener("mouseup",up); window.addEventListener("touchend",up);
  };

  // ----- freehand pencil layer -----
  const startStroke=(e)=>{ if(!pen) return; e.stopPropagation();
    const rect=railRef.current.getBoundingClientRect(); const W=rect.width;
    const pt=(ev)=>{ const q=ev.touches?ev.touches[0]:ev; return { x:(q.clientX-rect.left)/W, y:Math.max(0,Math.min(height,q.clientY-rect.top)) }; };
    const p0=pt(e); strokeRef.current={ color:penColor, w:2.5, pts:[p0], lastT:performance.now(), lastP:p0 }; rerender();
    const move=(ev)=>{ if(ev.cancelable&&ev.touches) ev.preventDefault(); const s=strokeRef.current; const np=pt(ev); s.pts.push(np);
      if(Math.hypot((np.x-s.lastP.x)*W, np.y-s.lastP.y)>3){ s.lastT=performance.now(); s.lastP=np; } rerender(); };
    const up=()=>{ const s=strokeRef.current; strokeRef.current=null;
      if(s&&s.pts.length>1){ const held=(performance.now()-s.lastT)>300 && s.pts.length>4; s.pts=snapStroke(s.pts,W,held); onSketch([...(sketch||[]),s]); } rerender();
      window.removeEventListener("mousemove",move); window.removeEventListener("touchmove",move); window.removeEventListener("mouseup",up); window.removeEventListener("touchend",up); };
    window.addEventListener("mousemove",move); window.addEventListener("touchmove",move,{passive:false}); window.addEventListener("mouseup",up); window.addEventListener("touchend",up);
  };

  const cr=createRef.current, cA=cr&&Math.min(cr.t0,cr.t1), cB=cr&&Math.max(cr.t0,cr.t1);

  return (
    <div>
      {canSketch && (
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, flexWrap:"wrap" }}>
          <button onClick={()=>setPen(p=>!p)} style={{ ...addBtn, width:"auto", padding:"6px 12px", borderColor:pen?C.cyan:C.line, color:pen?C.cyan:C.dim }}>{pen?"✏️ Sketching — tap to stop":"✏️ Sketch"}</button>
          {pen && PENS.map(c=> <button key={c} onClick={()=>setPenColor(c)} style={{ width:24,height:24,borderRadius:"50%",background:c,border:penColor===c?"2px solid #fff":`2px solid ${C.line}`,cursor:"pointer",padding:0 }}/>)}
          {pen && <button onClick={()=>onSketch(strokes.slice(0,-1))} style={{ ...addBtn, width:"auto", padding:"6px 10px" }}>Undo</button>}
          {pen && <button onClick={()=>onSketch([])} style={{ ...addBtn, width:"auto", padding:"6px 10px", borderColor:C.red, color:C.red }}>Clear</button>}
        </div>
      )}
      <div style={{ display:"flex", position:"relative" }}>
        <div style={{ width:46, position:"relative", height, flexShrink:0 }}>
          {hours.map(h=> <div key={h} style={{ position:"absolute", top:timeToY(h)-7, right:8, fontSize:10, color:C.faint, fontVariantNumeric:"tabular-nums" }}>{hhmm(h)}</div>)}
        </div>
        <div ref={railRef} onMouseDown={startCreate} onTouchStart={startCreate}
          style={{ flex:1, position:"relative", height, borderLeft:`1px solid ${C.line}`, cursor:pen?"crosshair":"copy", touchAction:pen?"none":"auto" }}>
          {hours.map(h=> <div key={h} style={{ position:"absolute", top:timeToY(h), left:0, right:0, height:1, background:C.line, opacity:0.5, pointerEvents:"none" }}/>)}

          {blocks.map(b=>{ const top=timeToY(b.t); const h=Math.max(20,(b.e-b.t)*PX_PER_HOUR); const col=CATS[b.cat]||C.dim;
            const st=effState(b); const dd=dragRef.current; const dx=(dd&&dd.id===b.id&&dd.axis==="h")?dd.dx:0;
            const missed=st==="missed", plan=st==="plan";
            return (
              <div key={b.id} onMouseDown={(e)=>startBlock(e,b,"move")} onTouchStart={(e)=>startBlock(e,b,"move")}
                onClick={(e)=>{ e.stopPropagation(); if(suppressRef.current){ suppressRef.current=false; return; } setEditing(editing===b.id?null:b.id); }}
                style={{ position:"absolute", top, left:6, right:6, height:h, transform:`translateX(${dx}px)`,
                  background: plan? "transparent" : `${col}22`, border:`${plan?"1.5px dashed":"1px solid"} ${col}`, borderLeft:`3px solid ${col}`,
                  borderRadius:8, padding:"5px 9px", cursor:"grab", overflow:"hidden", touchAction:"none", userSelect:"none",
                  opacity: missed? 0.32 : (1 - Math.min(0.65, Math.abs(dx)/170)), transition: dx?"none":"opacity .15s", zIndex:5 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ width:7,height:7,borderRadius:"50%",background:col,flexShrink:0,opacity:plan?0.5:1 }}/>
                  <span style={{ fontSize:12.5, fontWeight:600, color:missed?C.faint:C.ink, textDecoration:missed?"line-through":"none", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{b.label}</span>
                </div>
                {h>34 && <div style={{ fontSize:10, color:C.dim, marginTop:2 }}>{hhmm(b.t)}–{hhmm(b.e)} · {b.cat}{missed?" · skipped":""}</div>}
                <div onMouseDown={(e)=>startBlock(e,b,"resize")} onTouchStart={(e)=>startBlock(e,b,"resize")} onClick={(e)=>e.stopPropagation()}
                  style={{ position:"absolute", bottom:0, left:0, right:0, height:10, cursor:"ns-resize" }}/>
                {editing===b.id && isMobile && <div onMouseDown={e=>{e.stopPropagation();setEditing(null);}} onClick={e=>{e.stopPropagation();setEditing(null);}} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:190 }}/>}
                {editing===b.id && (
                  <div onMouseDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()} style={ isMobile
                    ? { position:"fixed", left:"50%", top:"50%", transform:"translate(-50%,-50%)", width:"min(300px,90vw)", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:14, zIndex:200, boxShadow:"0 8px 30px rgba(0,0,0,.6)" }
                    : { position:"absolute", top:0, left:"calc(100% + 8px)", width:210, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:12, zIndex:20, boxShadow:"0 8px 30px rgba(0,0,0,.6)" } }>
                    <input autoFocus value={b.label} onChange={e=>updBlock(b.id,{label:e.target.value})} style={{ ...inp, width:"100%", marginBottom:8 }} placeholder="What is it?"/>
                    {elapsed(b) && <button onClick={()=>updBlock(b.id,{status:b.status==="missed"?undefined:"missed"})} style={{ ...addBtn, marginBottom:8, borderColor:b.status==="missed"?C.red:C.green, color:b.status==="missed"?C.red:C.green }}>{b.status==="missed"?"✗ Didn't happen (tap to undo)":"✓ Did it — tap if you didn't"}</button>}
                    <div style={{ display:"flex", gap:6, marginBottom:8 }}>
                      <div style={{ flex:1 }}><Label>Start</Label><input type="time" value={hhmm(b.t)} onChange={e=>{ const [H,M]=e.target.value.split(":").map(Number); updBlock(b.id,{t:H+M/60}); }} style={{ ...inp, width:"100%" }}/></div>
                      <div style={{ flex:1 }}><Label>End</Label><input type="time" value={hhmm(b.e)} onChange={e=>{ const [H,M]=e.target.value.split(":").map(Number); updBlock(b.id,{e:H+M/60}); }} style={{ ...inp, width:"100%" }}/></div>
                    </div>
                    <Label>Category</Label>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:10 }}>
                      {CAT_KEYS.map(c=> <button key={c} onClick={()=>updBlock(b.id,{cat:c})} style={{ fontSize:10, padding:"4px 7px", borderRadius:12, cursor:"pointer", border:`1px solid ${b.cat===c?CATS[c]:C.line}`, background:b.cat===c?CATS[c]:"transparent", color:b.cat===c?"#0b0b0b":C.dim }}>{c}</button>)}
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={()=>delBlock(b.id)} style={{ ...delBtn, flex:1, width:"auto" }}>Delete</button>
                      <button onClick={()=>setEditing(null)} style={{ ...addBtn, flex:1 }}>Done</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {cr && cB-cA>0 && <div style={{ position:"absolute", top:timeToY(cA), left:6, right:6, height:Math.max(2,(cB-cA)*PX_PER_HOUR), background:`${C.teal}22`, border:`1.5px dashed ${C.teal}`, borderRadius:8, pointerEvents:"none", zIndex:6, display:"flex", alignItems:"center", justifyContent:"center" }}><span style={{ fontSize:12, fontWeight:700, color:C.teal }}>{hhmm(cA)}–{hhmm(cB)}</span></div>}

          {isToday && now>=DAY_START && now<=DAY_END && (
            <div style={{ position:"absolute", top:timeToY(now), left:0, right:0, borderTop:`2px solid ${C.red}`, zIndex:7, pointerEvents:"none" }}>
              <div style={{ position:"absolute", left:-4, top:-4, width:8, height:8, borderRadius:"50%", background:C.red }}/>
            </div>
          )}

          <svg onMouseDown={startStroke} onTouchStart={startStroke}
            style={{ position:"absolute", inset:0, width:"100%", height, zIndex: pen?12:3, pointerEvents:pen?"auto":"none", touchAction:"none" }}>
            {strokes.map((s,i)=> <path key={i} d={pathD(s.pts)} stroke={s.color} strokeWidth={s.w||2.5} fill="none" strokeLinecap="round" strokeLinejoin="round"/>)}
            {strokeRef.current && <path d={pathD(strokeRef.current.pts)} stroke={strokeRef.current.color} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round"/>}
          </svg>

          {blocks.length===0 && !pen && <div style={{ position:"absolute", top:40, left:0, right:0, textAlign:"center", color:C.faint, fontSize:12, pointerEvents:"none" }}>Tap or drag down the grid to draw a block</div>}
        </div>
      </div>
    </div>
  );
}

// ============ TODAY ============
function TodayView({ day,date,setDate,upd,dayTypes,applyDayType }){
  const [newTask,setNewTask] = useState("");
  const [showApply,setShowApply] = useState(false);
  const isMobile = useIsMobile();
  const [showLog,setShowLog] = useState(typeof window!=="undefined" && window.innerWidth>760);
  const dn = dayNameOf(date);
  const isToday = date===todayISO();
  const isPast = date<todayISO();
  const setBlocks = (updater)=>{ const next=typeof updater==="function"?updater(day.blocks):updater; upd({ blocks:next, breakdown:withAdj(computeBreakdown(next), day.breakdownAdj) }); };
  const setSketch = (s)=> upd({ sketch:s });
  const adjustBd = (k,delta)=>{ const adj={ ...(day.breakdownAdj||{}), [k]:((day.breakdownAdj&&day.breakdownAdj[k])||0)+delta }; upd({ breakdownAdj:adj, breakdown:withAdj(computeBreakdown(day.blocks), adj) }); };
  const addTask=(b)=>{ if(!newTask.trim())return; upd({ todos:{ ...day.todos,[b]:[...day.todos[b],{text:newTask.trim(),done:false}] } }); setNewTask(""); };
  const toggleTask=(b,i)=>{ const a=[...day.todos[b]]; a[i]={...a[i],done:!a[i].done}; upd({ todos:{ ...day.todos,[b]:a } }); };
  const delTask=(b,i)=> upd({ todos:{ ...day.todos,[b]:day.todos[b].filter((_,j)=>j!==i) } });
  const toggleHabit=(k)=> upd({ habits:{ ...day.habits,[k]:!day.habits[k] } });
  const currentType = day.dayTypeId && dayTypes[day.dayTypeId];

  const adh = (()=>{ if(!day.blocks.length) return null;
    const el=day.blocks.filter(b=> isPast || (isToday && b.e<=nowDec())); if(!el.length) return null;
    const done=el.filter(b=>b.status!=="missed").length; return { done, total:el.length, pct:Math.round(done/el.length*100) }; })();

  const sw=useRef(null);
  const onTS=(e)=>{ const t=e.touches[0]; sw.current={ x:t.clientX, y:t.clientY, tl:!!(e.target.closest && e.target.closest("[data-timeline]")) }; };
  const onTE=(e)=>{ const s=sw.current; if(!s||s.tl) return; const t=e.changedTouches[0]; const dx=t.clientX-s.x, dy=t.clientY-s.y;
    if(Math.abs(dx)>70 && Math.abs(dx)>Math.abs(dy)*1.6) setDate(addDays(date, dx<0?1:-1)); sw.current=null; };

  return (
    <div onTouchStart={onTS} onTouchEnd={onTE}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:18, marginBottom:10 }}>
        <Nav onClick={()=>setDate(addDays(date,-1))}>‹</Nav>
        <div style={{ textAlign:"center", minWidth:200 }}>
          <div style={{ fontFamily:"'Caveat',cursive", fontSize:44, color:C.teal, lineHeight:0.9 }}>{dn}</div>
          <div style={{ fontSize:12, color:C.dim }}>{fmt(date)} {isToday && <span style={{color:C.green}}>• today</span>}</div>
        </div>
        <Nav onClick={()=>setDate(addDays(date,1))}>›</Nav>
      </div>

      <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:10, marginBottom:16, position:"relative", flexWrap:"wrap" }}>
        <span style={{ fontSize:12, color:C.faint }}>Format:</span>
        <button onClick={()=>setShowApply(s=>!s)} style={{ padding:"6px 14px", borderRadius:20, cursor:"pointer", fontSize:13, fontWeight:600, border:`1px solid ${currentType?currentType.color:C.line}`, background:"transparent", color:currentType?currentType.color:C.dim }}>{currentType?currentType.name:"Blank"} ▾</button>
        <button onClick={()=>upd({ bs:!day.bs })} style={{ padding:"6px 14px", borderRadius:20, cursor:"pointer", fontSize:13, fontWeight:700, border:`1px solid ${day.bs?C.red:C.line}`, background:day.bs?C.red:"transparent", color:day.bs?"#fff":C.dim }}>
          {day.bs?"✓ BS day":"Mark BS"}
        </button>
        {showApply && (
          <div style={{ position:"absolute", top:"100%", marginTop:8, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:12, padding:8, zIndex:30, width:240, maxHeight:300, overflowY:"auto", boxShadow:"0 8px 30px rgba(0,0,0,.6)", left:"50%", transform:"translateX(-50%)" }}>
            <div style={{ fontSize:10, color:C.faint, padding:"4px 8px 8px" }}>Apply a format to this day (replaces blocks)</div>
            {Object.entries(dayTypes).map(([id,t])=> <button key={id} onClick={()=>{ applyDayType(id); setShowApply(false); }} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"8px 10px", borderRadius:8, border:"none", background:"transparent", color:C.ink, cursor:"pointer", fontSize:13, textAlign:"left" }}><span style={{ width:8,height:8,borderRadius:"50%",background:t.color }}/>{t.name}</button>)}
          </div>
        )}
      </div>

      <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:16, flexWrap:"wrap" }}>
        {[
          { l:"Plan adherence", v: adh?`${adh.pct}%`:"—", c: adh?(adh.pct>=70?C.green:adh.pct>=40?C.gold:C.red):C.faint, on:()=>setShowLog(true) },
          { l:"Daily reps", v: day.reps.done?"✓":"○", c: day.reps.done?C.green:C.faint, on:()=>upd({ reps:{ ...day.reps, done:!day.reps.done } }) },
          { l:"Day score", v: day.rating?`${day.rating}/10`:"—", c:C.red, on:()=>setShowLog(true) },
        ].map(s=> <button key={s.l} onClick={s.on} style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:12, padding:"8px 16px", cursor:"pointer", textAlign:"center", minWidth:96 }}><div style={{ fontSize:18, fontWeight:700, color:s.c }}>{s.v}</div><div style={{ fontSize:10, color:C.dim, marginTop:3 }}>{s.l}</div></button>)}
      </div>

      <Panel accent={C.pink} title="Day" right={<span style={{ fontSize:11, color:C.faint }}>draw · swipe a block to skip</span>}>
        <div data-timeline>
          <Timeline blocks={day.blocks} onChange={setBlocks} isToday={isToday} isPast={isPast} sketch={day.sketch} onSketch={setSketch} />
        </div>
      </Panel>

      <button onClick={()=>setShowLog(s=>!s)} style={{ ...addBtn, marginTop:16 }}>{showLog?"Hide day log ▴":"Open day log (reps · habits · to-dos · review) ▾"}</button>

      {showLog && (
        <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:18, marginTop:16 }}>
          <Panel accent={C.green} title="Daily Reps">
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <Check on={day.reps.done} color={C.green} onClick={()=>upd({ reps:{ ...day.reps, done:!day.reps.done } })} size={28}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:C.ink }}>Push-ups + pull-ups</div>
                <div style={{ fontSize:11, color:C.faint }}>Target scales with day of year</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <input type="number" value={day.reps.target} onChange={e=>upd({ reps:{ ...day.reps, target:+e.target.value } })} style={{ ...inp, width:64, textAlign:"center", fontSize:18, fontWeight:700, color:C.green }}/>
                <span style={{ fontSize:12, color:C.faint }}>reps</span>
              </div>
            </div>
          </Panel>

          <Panel accent={C.purple} title="Habit Tracker">
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 14px" }}>
              {HABITS.map(h=> <div key={h.key} style={{ display:"flex", alignItems:"center", gap:10 }}><Check on={day.habits[h.key]} color={h.color} onClick={()=>toggleHabit(h.key)} /><span style={{ fontSize:13, color:day.habits[h.key]?C.ink:C.dim }}>{h.label}</span></div>)}
            </div>
          </Panel>

          <Panel accent={C.green} title="To Do" style={{ gridColumn:isMobile?"auto":"1 / -1" }}>
            <input value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTask("shortImp")} placeholder="Add task + Enter (→ Short/Important)…" style={{ ...inp, width:"100%", marginBottom:14 }}/>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <TodoBucket label="Short · Important" color={C.gold} items={day.todos.shortImp} bucket="shortImp" toggle={toggleTask} del={delTask}/>
              <TodoBucket label="Long · Important" color={C.blue} items={day.todos.longImp} bucket="longImp" toggle={toggleTask} del={delTask}/>
              <TodoBucket label="Short · Unimportant" color={C.faint} items={day.todos.shortUnimp} bucket="shortUnimp" toggle={toggleTask} del={delTask}/>
              <TodoBucket label="Long · Unimportant" color={C.faint} items={day.todos.longUnimp} bucket="longUnimp" toggle={toggleTask} del={delTask}/>
            </div>
          </Panel>

          <Panel accent={C.sleep} title="Hourly Breakdown" right={<span style={{ fontSize:11, color:C.faint }}>auto · adjust ±</span>}>
            {BREAKDOWN.map(k=>{ const adj=(day.breakdownAdj&&day.breakdownAdj[k])||0; return (
              <div key={k} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:9 }}>
                <span style={{ width:70, fontSize:13, color:C.dim }}>{k}</span>
                <div style={{ flex:1, height:8, background:C.panel2, borderRadius:4, overflow:"hidden" }}><div style={{ width:`${Math.min(100,(day.breakdown[k]/12)*100)}%`, height:"100%", background:C.sleep }}/></div>
                <span style={{ width:34, textAlign:"right", fontSize:13, color:C.ink, fontVariantNumeric:"tabular-nums" }}>{day.breakdown[k]}h</span>
                <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <button onClick={()=>adjustBd(k,-1)} style={stepBtn}>–</button>
                  <button onClick={()=>adjustBd(k,1)} style={stepBtn}>+</button>
                </div>
                {adj!==0 && <span style={{ fontSize:10, color:adj>0?C.green:C.red, width:24 }}>{adj>0?`+${adj}`:adj}</span>}
              </div>
            ); })}
            <Mini>Auto-filled from your timeline (sleep defaults to 8h). Tap ± to tweak any day.</Mini>
          </Panel>

          <Panel accent={C.teal} title="Productive Hours">
            <div style={{ display:"flex", gap:14 }}>
              <div style={{ flex:1, background:C.panel2, borderRadius:10, padding:14, textAlign:"center" }}><div style={{ fontSize:11, color:C.green, marginBottom:6 }}>PRODUCTIVE</div><Stepper v={day.prodHours} set={(v)=>upd({prodHours:Math.max(0,v)})} big/></div>
              <div style={{ flex:1, background:C.panel2, borderRadius:10, padding:14, textAlign:"center" }}><div style={{ fontSize:11, color:C.red, marginBottom:6 }}>UNPRODUCTIVE</div><Stepper v={day.unprodHours} set={(v)=>upd({unprodHours:Math.max(0,v)})} big/></div>
            </div>
          </Panel>

          <Panel accent={C.red} title="Day Assessment" style={{ gridColumn:isMobile?"auto":"1 / -1" }}>
            <div style={{ display:"flex", gap:6, marginBottom:14, flexWrap:"wrap" }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n=> <button key={n} onClick={()=>upd({rating:n})} style={{ width:32,height:36,borderRadius:7,cursor:"pointer",fontWeight:700,fontSize:14, border:`1px solid ${day.rating>=n?C.red:C.line}`, background:day.rating>=n?`rgba(224,82,74,${0.25+0.05*n})`:"transparent", color:day.rating>=n?"#fff":C.faint }}>{n}</button>)}
              <div style={{ display:"flex", alignItems:"center", fontFamily:"'Caveat',cursive", fontSize:26, color:C.red, marginLeft:4 }}>/10</div>
            </div>
            <textarea value={day.feedback} onChange={e=>upd({feedback:e.target.value})} placeholder="Feedback: how did today actually go?" style={{ ...inp, minHeight:70, resize:"vertical", width:"100%" }}/>
          </Panel>
        </div>
      )}
    </div>
  );
}

function TodoBucket({ label,color,items,bucket,toggle,del }){
  return (
    <div style={{ background:C.panel2, borderRadius:10, padding:12, minHeight:90 }}>
      <div style={{ fontSize:11, color, fontWeight:600, marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>{label}</div>
      {items.length===0 && <div style={{ fontSize:11, color:C.faint }}>—</div>}
      {items.map((t,i)=> <div key={i} style={{ display:"flex", alignItems:"center", gap:7, marginBottom:6 }}><Check on={t.done} color={color} onClick={()=>toggle(bucket,i)} size={15}/><span style={{ flex:1, fontSize:12, color:t.done?C.faint:C.ink, textDecoration:t.done?"line-through":"none" }}>{t.text}</span><button onClick={()=>del(bucket,i)} style={{ background:"none", border:"none", color:C.faint, cursor:"pointer", fontSize:14, padding:0 }}>×</button></div>)}
    </div>
  );
}

// ============ MONTH VIEW ============
function MonthView({ date,setDate,setTab,allDays,dayTypes,flash }){
  const isMobile = useIsMobile();
  const d = pd(date);
  const [viewY,setViewY] = useState(d.getFullYear());
  const [viewM,setViewM] = useState(d.getMonth());
  const [events,setEvents] = useState({});
  const monthKey = `${viewY}-${String(viewM+1).padStart(2,"0")}`;

  useEffect(()=>{ (async()=>{ setEvents(await sGet(`monthEvents:${monthKey}`, {})); })(); },[monthKey]);
  const saveEvents = async (e)=>{ setEvents(e); await sSet(`monthEvents:${monthKey}`, e); };

  const firstDow = (new Date(viewY,viewM,1).getDay()+6)%7; // Mon=0
  const daysInMonth = new Date(viewY,viewM+1,0).getDate();
  const cells=[]; for(let i=0;i<firstDow;i++) cells.push(null);
  for(let dd=1; dd<=daysInMonth; dd++) cells.push(dd);

  const prevM=()=>{ if(viewM===0){ setViewM(11); setViewY(viewY-1); } else setViewM(viewM-1); };
  const nextM=()=>{ if(viewM===11){ setViewM(0); setViewY(viewY+1); } else setViewM(viewM+1); };

  const cellISO = (dd)=> `${viewY}-${String(viewM+1).padStart(2,"0")}-${String(dd).padStart(2,"0")}`;
  const [editCell,setEditCell] = useState(null);

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:18, marginBottom:18 }}>
        <Nav onClick={prevM}>‹</Nav>
        <div style={{ fontFamily:"'Caveat',cursive", fontSize:40, color:C.teal, minWidth:220, textAlign:"center" }}>{MONTHS[viewM]} {viewY}</div>
        <Nav onClick={nextM}>›</Nav>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6 }}>
        {DAYS.map(d=> <div key={d} style={{ textAlign:"center", fontSize:11, color:C.dim, fontWeight:600, padding:"4px 0" }}>{d.slice(0,3)}</div>)}
        {cells.map((dd,i)=>{
          if(dd===null) return <div key={"e"+i}/>;
          const iso=cellISO(dd); const isToday=iso===todayISO();
          const logged=allDays[iso]; const ev=events[iso];
          const rating=logged?.rating; const bs=logged?.bs;
          return (
            <div key={dd} onClick={()=>{ setDate(iso); setTab("today"); }}
              style={{ minHeight:isMobile?58:84, background:isToday?C.panel2:C.panel, border:`1px solid ${isToday?C.teal:C.line}`, borderRadius:isMobile?8:10, padding:isMobile?4:8, cursor:"pointer", position:"relative", display:"flex", flexDirection:"column", gap:3 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:13, fontWeight:700, color:isToday?C.teal:C.dim }}>{dd}</span>
                <div style={{ display:"flex", gap:3 }}>
                  {bs && <span style={{ fontSize:8, fontWeight:700, color:"#fff", background:C.red, borderRadius:4, padding:"1px 4px" }}>BS</span>}
                  {rating>0 && <span style={{ fontSize:9, color:C.faint }}>{rating}/10</span>}
                </div>
              </div>
              {ev && <div style={{ fontSize:11, color:C.pink, fontWeight:600, lineHeight:1.2 }}>{ev}</div>}
              {logged?.blocks?.length>0 && !ev && <div style={{ fontSize:9, color:C.faint }}>{logged.blocks.length} blocks</div>}
              <button onClick={(e)=>{ e.stopPropagation(); setEditCell(editCell===iso?null:iso); }} style={{ position:"absolute", bottom:4, right:4, width:18, height:18, borderRadius:5, border:`1px solid ${C.line}`, background:C.panel2, color:C.faint, fontSize:11, cursor:"pointer", lineHeight:1, padding:0 }}>+</button>
              {editCell===iso && (
                <div onClick={e=>e.stopPropagation()} style={{ position:"absolute", top:"100%", left:0, marginTop:4, width:180, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:10, zIndex:40, boxShadow:"0 8px 30px rgba(0,0,0,.6)" }}>
                  <Label>Event label for {dd} {MONTHS[viewM].slice(0,3)}</Label>
                  <input autoFocus value={ev||""} onChange={e=>saveEvents({ ...events, [iso]:e.target.value })} placeholder="e.g. Uni open day" style={{ ...inp, width:"100%", marginBottom:8 }}/>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={()=>{ const c={...events}; delete c[iso]; saveEvents(c); setEditCell(null); }} style={{ ...delBtn, flex:1, width:"auto" }}>Clear</button>
                    <button onClick={()=>setEditCell(null)} style={{ ...addBtn, flex:1 }}>Done</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Mini>Tap a day to open & plan it · use + to add an event label · BS and day-score show once logged</Mini>
    </div>
  );
}

// ============ WEEKLY REVIEW ============
function WeekView({ allDays,date,setDate }){
  const isMobile = useIsMobile();
  const wk = weekKeyOf(date);
  const weekDays = useMemo(()=>Array.from({length:7},(_,i)=> allDays[addDays(wk,i)]||null),[wk,allDays]);
  const filled = weekDays.filter(Boolean);
  const habitConsistency = HABITS.map(h=>({ ...h, count:filled.filter(d=>d.habits[h.key]).length, total:filled.length }));
  const avgRating = filled.length ? (filled.reduce((s,d)=>s+d.rating,0)/filled.length).toFixed(1) : "—";
  const totalProd = filled.reduce((s,d)=>s+(+d.prodHours||0),0);
  const totalUnprod = filled.reduce((s,d)=>s+(+d.unprodHours||0),0);
  const bsCount = filled.filter(d=>d.bs).length;
  const repsHit = filled.filter(d=>d.reps?.done).length;
  const adhDays = filled.map(d=>({ total:(d.blocks||[]).length, done:(d.blocks||[]).filter(b=>b.status!=="missed").length })).filter(x=>x.total>0);
  const adhT = adhDays.reduce((s,x)=>s+x.total,0), adhD = adhDays.reduce((s,x)=>s+x.done,0);
  const adhPct = adhT ? Math.round(adhD/adhT*100) : "—";
  const bdTotals = BREAKDOWN.map(k=>({ k, hrs:filled.reduce((s,d)=>s+(d.breakdown[k]||0),0) }));
  const maxBd = Math.max(1, ...bdTotals.map(b=>b.hrs));

  const [review,setReview] = useState({ feedback:"",adapt1:"",adapt2:"",target1:"",target2:"" });
  useEffect(()=>{ (async()=>{ setReview(await sGet(`review:${wk}`, { feedback:"",adapt1:"",adapt2:"",target1:"",target2:"" })); })(); },[wk]);
  const saveReview = async (patch)=>{ const r={...review,...patch}; setReview(r); await sSet(`review:${wk}`, r); };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:18, marginBottom:22 }}>
        <Nav onClick={()=>setDate(addDays(wk,-7))}>‹</Nav>
        <div style={{ textAlign:"center", minWidth:220 }}>
          <div style={{ fontFamily:"'Caveat',cursive", fontSize:40, color:C.teal, lineHeight:0.9 }}>Weekly Review</div>
          <div style={{ fontSize:12, color:C.dim }}>Week of {fmt(wk)} · {filled.length}/7 days logged</div>
        </div>
        <Nav onClick={()=>setDate(addDays(wk,7))}>›</Nav>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:18 }}>
        <Panel accent={C.teal} title="At a Glance" style={{ gridColumn:"1 / -1" }}>
          <div style={{ display:"grid", gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(3,1fr)", gap:14 }}>
            <Stat label="Plan adherence" value={adhPct} sub={adhPct==="—"?"":"%"} color={C.teal}/>
            <Stat label="Avg day score" value={avgRating} sub="/10" color={C.red}/>
            <Stat label="Reps hit" value={repsHit} sub={`/${filled.length||7}`} color={C.green}/>
            <Stat label="BS days" value={bsCount} sub="/7" color={C.red}/>
            <Stat label="Productive hrs" value={totalProd} color={C.green}/>
            <Stat label="Unproductive hrs" value={totalUnprod} color={C.red}/>
          </div>
        </Panel>
        <Panel accent={C.purple} title="Habit Consistency">
          {habitConsistency.map(h=> <div key={h.key} style={{ marginBottom:12 }}><div style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:5 }}><span style={{ color:C.dim }}>{h.label}</span><span style={{ color:h.color, fontWeight:600 }}>{h.count}/{h.total||7}</span></div><div style={{ height:8, background:C.panel2, borderRadius:4, overflow:"hidden" }}><div style={{ width:`${h.total?(h.count/h.total)*100:0}%`, height:"100%", background:h.color }}/></div></div>)}
        </Panel>
        <Panel accent={C.sleep} title="Where Time Went">
          {bdTotals.map(b=> <div key={b.k} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:11 }}><span style={{ width:70, fontSize:13, color:C.dim }}>{b.k}</span><div style={{ flex:1, height:10, background:C.panel2, borderRadius:5, overflow:"hidden" }}><div style={{ width:`${(b.hrs/maxBd)*100}%`, height:"100%", background:C.sleep }}/></div><span style={{ width:42, textAlign:"right", fontSize:13, color:C.ink }}>{b.hrs}h</span></div>)}
        </Panel>
        <Panel accent={C.cyan} title="Events / Learned / Thoughts" style={{ gridColumn:"1 / -1" }}>
          <textarea value={review.feedback} onChange={e=>saveReview({feedback:e.target.value})} placeholder="What happened this week? What did you learn?" style={{ ...inp, width:"100%", minHeight:80, resize:"vertical" }}/>
        </Panel>
        <Panel accent={C.cyan} title="Adaptations">
          <Label>Changes I'm going to make to improve</Label>
          <input value={review.adapt1} onChange={e=>saveReview({adapt1:e.target.value})} placeholder="1." style={{ ...inp, width:"100%", marginBottom:8 }}/>
          <input value={review.adapt2} onChange={e=>saveReview({adapt2:e.target.value})} placeholder="2." style={{ ...inp, width:"100%" }}/>
        </Panel>
        <Panel accent={C.pink} title="Next Targets">
          <Label>Focus for next week</Label>
          <input value={review.target1} onChange={e=>saveReview({target1:e.target.value})} placeholder="1." style={{ ...inp, width:"100%", marginBottom:8 }}/>
          <input value={review.target2} onChange={e=>saveReview({target2:e.target.value})} placeholder="2." style={{ ...inp, width:"100%" }}/>
        </Panel>
      </div>
    </div>
  );
}

// ============ TRENDS ============
function TrendsView({ allDays }){
  const isMobile = useIsMobile();
  const sorted = useMemo(()=>Object.values(allDays).filter(Boolean).sort((a,b)=>a.date.localeCompare(b.date)),[allDays]);
  if(sorted.length<2) return <Empty big>Log at least 2 days to see trends. Your behaviour patterns accumulate here over weeks and months — including your BS-day count, the metric to actually beat.</Empty>;
  const last30 = sorted.slice(-30);
  const Bars = ({ data,color,max })=> <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:90, marginTop:8 }}>{data.map((v,i)=> <div key={i} style={{ flex:1, minWidth:3, height:`${(v/max*100)||2}%`, background:color, borderRadius:2, opacity:0.85 }}/>)}</div>;
  const ratings=last30.map(d=>d.rating||0), prod=last30.map(d=>+d.prodHours||0), sleepH=last30.map(d=>d.breakdown.Sleep||0);
  const maxProd=Math.max(8,...prod), maxSleep=Math.max(10,...sleepH);
  const streaks = HABITS.map(h=>{ let s=0; for(let i=sorted.length-1;i>=0;i--){ if(sorted[i].habits[h.key]) s++; else break; } return {...h,streak:s}; });
  const habitRate = HABITS.map(h=>({ ...h, rate:Math.round(sorted.filter(d=>d.habits[h.key]).length/sorted.length*100) }));
  const bsTotal = sorted.filter(d=>d.bs).length;
  const bsRate = Math.round(bsTotal/sorted.length*100);
  const repsRate = Math.round(sorted.filter(d=>d.reps?.done).length/sorted.length*100);
  const allAdh = sorted.map(d=>({ total:(d.blocks||[]).length, done:(d.blocks||[]).filter(b=>b.status!=="missed").length })).filter(x=>x.total>0);
  const adhT = allAdh.reduce((s,x)=>s+x.total,0), adhD = allAdh.reduce((s,x)=>s+x.done,0);
  const adhPct = adhT ? Math.round(adhD/adhT*100) : 0;
  const adhDaysCount = allAdh.length;
  // BS-free streak (consecutive recent days without BS)
  let bsFreeStreak=0; for(let i=sorted.length-1;i>=0;i--){ if(!sorted[i].bs) bsFreeStreak++; else break; }

  return (
    <div>
      <div style={{ textAlign:"center", marginBottom:22 }}>
        <div style={{ fontFamily:"'Caveat',cursive", fontSize:40, color:C.teal }}>Trends</div>
        <div style={{ fontSize:12, color:C.dim }}>{sorted.length} days logged · the long game</div>
      </div>

      <Panel accent={C.teal} title="Plan Adherence" style={{ marginBottom:18 }} right={<span style={{ fontSize:11, color:C.faint }}>of what you drew, how much you did — drive this up</span>}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
          <Stat label="Adherence" value={adhPct} sub="%" color={adhPct>=70?C.green:adhPct>=40?C.gold:C.red}/>
          <Stat label="Blocks kept" value={adhD} sub={`/${adhT}`} color={C.teal}/>
          <Stat label="Days planned" value={adhDaysCount} color={C.dim}/>
        </div>
      </Panel>

      <Panel accent={C.red} title="The BS Metric" style={{ marginBottom:18 }} right={<span style={{ fontSize:11, color:C.faint }}>wasted mornings — drive this down</span>}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
          <Stat label="BS days total" value={bsTotal} color={C.red}/>
          <Stat label="BS rate" value={bsRate} sub="%" color={C.red}/>
          <Stat label="Current BS-free streak" value={bsFreeStreak} color={C.green}/>
        </div>
      </Panel>

      <Panel accent={C.gold} title="Current Streaks" style={{ marginBottom:18 }}>
        <div style={{ display:"grid", gridTemplateColumns:isMobile?"repeat(3,1fr)":"repeat(5,1fr)", gap:12 }}>
          {streaks.map(s=> <div key={s.key} style={{ background:C.panel2, borderRadius:10, padding:"14px 10px", textAlign:"center" }}><div style={{ fontSize:30, fontWeight:700, color:s.streak>0?s.color:C.faint, lineHeight:1 }}>{s.streak}</div><div style={{ fontSize:11, color:C.dim, marginTop:6 }}>{s.label}</div></div>)}
        </div>
      </Panel>

      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:18 }}>
        <Panel accent={C.red} title="Day Score (last 30)"><Bars data={ratings} color={C.red} max={10}/><Mini>Avg {(ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(1)}/10</Mini></Panel>
        <Panel accent={C.green} title="Productive Hours (last 30)"><Bars data={prod} color={C.green} max={maxProd}/><Mini>Total {prod.reduce((a,b)=>a+b,0)}h · avg {(prod.reduce((a,b)=>a+b,0)/prod.length).toFixed(1)}h/day</Mini></Panel>
        <Panel accent={C.sleep} title="Sleep Hours (last 30)"><Bars data={sleepH} color={C.sleep} max={maxSleep}/><Mini>Avg {(sleepH.reduce((a,b)=>a+b,0)/sleepH.length).toFixed(1)}h — target 8h+</Mini></Panel>
        <Panel accent={C.purple} title="Consistency (all time)">
          {habitRate.map(h=> <div key={h.key} style={{ marginBottom:9 }}><div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}><span style={{ color:C.dim }}>{h.label}</span><span style={{ color:h.color }}>{h.rate}%</span></div><div style={{ height:7, background:C.panel2, borderRadius:4, overflow:"hidden" }}><div style={{ width:`${h.rate}%`, height:"100%", background:h.color }}/></div></div>)}
          <div style={{ marginBottom:2 }}><div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}><span style={{ color:C.dim }}>Daily reps</span><span style={{ color:C.green }}>{repsRate}%</span></div><div style={{ height:7, background:C.panel2, borderRadius:4, overflow:"hidden" }}><div style={{ width:`${repsRate}%`, height:"100%", background:C.green }}/></div></div>
        </Panel>
      </div>
    </div>
  );
}

// ============ DAY TYPES EDITOR ============
function DayTypesView({ dayTypes,save,weekMap,saveWeekMap,weekMapB,saveWeekMapB,weekAnchorA,saveWeekAnchor,flash }){
  const isMobile = useIsMobile();
  const [selId,setSelId] = useState(Object.keys(dayTypes)[0]);
  const [wkTab,setWkTab] = useState("A");
  const currentIsB = weekIsB(todayISO(), weekAnchorA);
  const sel = dayTypes[selId];
  const updType=(patch)=> save({ ...dayTypes, [selId]:{ ...sel, ...patch } });
  const newType=()=>{ const id="type-"+Date.now(); save({ ...dayTypes, [id]:{ name:"New Day Type", color:C.teal, blocks:[] } }); setSelId(id); flash("Day type created"); };
  const delType=()=>{ if(Object.keys(dayTypes).length<=1) return; const copy={...dayTypes}; delete copy[selId]; save(copy); setSelId(Object.keys(copy)[0]); };
  const blocksWithIds = useMemo(()=> (sel?.blocks||[]).map((b,i)=>({ id:b.id||1000+i, done:false, ...b })),[sel]);
  const saveTimelineBlocks=(updater)=>{ const cur=blocksWithIds; const next=typeof updater==="function"?updater(cur):updater; updType({ blocks: next.map(({id,done,...rest})=>rest) }); };

  return (
    <div>
      <div style={{ textAlign:"center", marginBottom:8 }}>
        <div style={{ fontFamily:"'Caveat',cursive", fontSize:40, color:C.teal }}>Day Types</div>
        <div style={{ fontSize:12, color:C.dim }}>Build a format once · apply it to any day from the Today tab</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"260px 1fr", gap:18 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <Panel accent={C.teal} title="Your Formats">
            {Object.entries(dayTypes).map(([id,t])=> <button key={id} onClick={()=>setSelId(id)} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"9px 10px", borderRadius:8, marginBottom:4, cursor:"pointer", textAlign:"left", border:`1px solid ${selId===id?t.color:"transparent"}`, background:selId===id?C.panel2:"transparent", color:C.ink, fontSize:13 }}><span style={{ width:9,height:9,borderRadius:"50%",background:t.color,flexShrink:0 }}/><span style={{ flex:1 }}>{t.name}</span><span style={{ fontSize:10, color:C.faint }}>{(t.blocks||[]).length}</span></button>)}
            <button onClick={newType} style={{ ...addBtn, marginTop:8 }}>+ New day type</button>
          </Panel>
          <Panel accent={C.gold} title="Default Week (A / B)">
            <Label>This week is currently</Label>
            <div style={{ display:"flex", gap:6, marginBottom:14 }}>
              {["A","B"].map(w=>{ const active=(w==="B")===currentIsB; return (
                <button key={w} onClick={()=>{ const thisMon=weekKeyOf(todayISO()); saveWeekAnchor(w==="A"?thisMon:addDays(thisMon,-7)); flash(`This week set to Week ${w}`); }}
                  style={{ flex:1, padding:"9px", borderRadius:8, cursor:"pointer", fontWeight:700, border:`1px solid ${active?C.gold:C.line}`, background:active?C.gold:"transparent", color:active?"#0b0b0b":C.dim }}>Week {w}{active?" ✓":""}</button>
              ); })}
            </div>
            <div style={{ display:"flex", gap:6, marginBottom:10 }}>
              {["A","B"].map(w=> <button key={w} onClick={()=>setWkTab(w)} style={{ flex:1, padding:"7px", cursor:"pointer", fontSize:12, fontWeight:600, border:"none", background:"transparent", color:wkTab===w?C.ink:C.faint, borderBottom:`2px solid ${wkTab===w?C.gold:C.line}` }}>Editing Week {w}</button>)}
            </div>
            <Label>Format that auto-loads each weekday on a fresh Week {wkTab} day</Label>
            {DAYS.map(d=>{ const map=wkTab==="A"?weekMap:weekMapB; const saver=wkTab==="A"?saveWeekMap:saveWeekMapB;
              return <div key={d} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}><span style={{ width:42, fontSize:12, color:C.dim }}>{d.slice(0,3)}</span><select value={map[d]||"blank"} onChange={e=>saver({ ...map, [d]:e.target.value })} style={{ ...inp, flex:1, fontSize:12, cursor:"pointer" }}>{Object.entries(dayTypes).map(([id,t])=><option key={id} value={id} style={{ background:C.panel }}>{t.name}</option>)}</select></div>;
            })}
            <Mini>Weeks alternate A → B → A automatically. Just tell it which letter this week is.</Mini>
          </Panel>
        </div>
        <div>
          {sel && (
            <Panel accent={sel.color} title={null}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, flexWrap:"wrap" }}>
                <input value={sel.name} onChange={e=>updType({name:e.target.value})} style={{ ...inp, flex:1, minWidth:160, fontSize:16, fontWeight:600 }}/>
                <div style={{ display:"flex", gap:5 }}>{[C.pink,C.cyan,C.blue,C.green,C.gold,C.purple,C.teal,C.sleep,C.red].map(col=> <button key={col} onClick={()=>updType({color:col})} style={{ width:22,height:22,borderRadius:"50%",background:col,cursor:"pointer",border:sel.color===col?"2px solid #fff":"2px solid transparent" }}/>)}</div>
                <button onClick={delType} style={delBtn}>×</button>
              </div>
              <div style={{ fontSize:11, color:C.faint, marginBottom:10 }}>Edit this format's blocks — same controls as the day timeline. This becomes the starting layout whenever you apply this type.</div>
              <Timeline blocks={blocksWithIds} onChange={saveTimelineBlocks} />
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ FINANCE ============
function FinanceView({ finance,save,flash }){
  const isMobile = useIsMobile();
  const [sub,setSub] = useState("networth");
  const totalNW = finance.accounts.reduce((s,a)=>s+(+a.balance||0),0);
  const addAccount=()=> save({ ...finance, accounts:[...finance.accounts,{ id:Date.now(),name:"New account",balance:0 }] });
  const updAccount=(id,p)=> save({ ...finance, accounts:finance.accounts.map(a=>a.id===id?{...a,...p}:a) });
  const delAccount=(id)=> save({ ...finance, accounts:finance.accounts.filter(a=>a.id!==id) });
  const snapshot=()=>{ save({ ...finance, netWorthLog:[...finance.netWorthLog,{ date:todayISO(),value:totalNW }] }); flash("Snapshot saved"); };
  const addClient=()=> save({ ...finance, clients:[...finance.clients,{ id:Date.now(),name:"New client",rate:25,lessonsThisMonth:0,status:"Active" }] });
  const updClient=(id,p)=> save({ ...finance, clients:finance.clients.map(c=>c.id===id?{...c,...p}:c) });
  const delClient=(id)=> save({ ...finance, clients:finance.clients.filter(c=>c.id!==id) });
  const monthlyRevenue = finance.clients.reduce((s,c)=>s+(+c.rate||0)*(+c.lessonsThisMonth||0),0);
  const logMonth=()=>{ save({ ...finance, lessonLog:[...finance.lessonLog,{ month:new Date().toLocaleDateString("en-GB",{month:"short",year:"2-digit"}),revenue:monthlyRevenue }] }); flash("Month logged"); };
  const L=finance.lump;
  const updLump=(p)=> save({ ...finance, lump:{ ...L, ...p } });
  const updAlloc=(id,p)=> updLump({ allocations:L.allocations.map(a=>a.id===id?{...a,...p}:a) });
  const totalPct = L.allocations.reduce((s,a)=>s+(+a.pct||0),0);
  const fv=(L.amount*Math.pow(1+(+L.expectedReturn/100),+L.years)).toFixed(0);
  const isaAmount = L.allocations.filter(a=>/isa|index|invest/i.test(a.name)).reduce((s,a)=>s+L.amount*a.pct/100,0);

  return (
    <div>
      <div style={{ textAlign:"center", marginBottom:18 }}><div style={{ fontFamily:"'Caveat',cursive", fontSize:40, color:C.teal }}>Finance</div></div>
      <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:20, flexWrap:"wrap" }}>
        {[["networth","Net Worth"],["business","Tuition Business"],["lump","£10k Plan"]].map(([k,l])=> <button key={k} onClick={()=>setSub(k)} style={{ padding:"8px 16px", borderRadius:20, cursor:"pointer", fontSize:13, fontWeight:600, border:`1px solid ${sub===k?C.teal:C.line}`, background:sub===k?C.teal:"transparent", color:sub===k?"#001014":C.dim }}>{l}</button>)}
      </div>

      {sub==="networth" && (
        <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:18 }}>
          <Panel accent={C.green} title="Accounts & Balances">
            {finance.accounts.map(a=> <div key={a.id} style={{ display:"flex", gap:8, marginBottom:10, alignItems:"center" }}><input value={a.name} onChange={e=>updAccount(a.id,{name:e.target.value})} style={{ ...inp, flex:1 }}/><span style={{ color:C.faint }}>£</span><input type="number" value={a.balance} onChange={e=>updAccount(a.id,{balance:e.target.value})} style={{ ...inp, width:90 }}/><button onClick={()=>delAccount(a.id)} style={delBtn}>×</button></div>)}
            <button onClick={addAccount} style={addBtn}>+ Add account</button>
            <div style={{ marginTop:16, padding:14, background:C.panel2, borderRadius:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}><span style={{ color:C.dim, fontSize:13 }}>Total net worth</span><span style={{ fontSize:24, fontWeight:700, color:C.green }}>£{totalNW.toLocaleString()}</span></div>
            <button onClick={snapshot} style={{ ...addBtn, marginTop:12, borderColor:C.green, color:C.green }}>📸 Save snapshot to history</button>
          </Panel>
          <Panel accent={C.teal} title="Net Worth Over Time">
            {finance.netWorthLog.length<2 ? <Empty>Save snapshots over time to track growth. The £10k at 18 will show here.</Empty> : <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:160, marginTop:10 }}>{finance.netWorthLog.map((p,i)=>{ const max=Math.max(...finance.netWorthLog.map(x=>x.value)); return <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}><div style={{ fontSize:9, color:C.dim }}>£{(p.value/1000).toFixed(1)}k</div><div style={{ width:"100%", height:`${p.value/max*120}px`, background:C.teal, borderRadius:"4px 4px 0 0" }}/><div style={{ fontSize:9, color:C.faint }}>{p.date.slice(5)}</div></div>; })}</div>}
          </Panel>
        </div>
      )}

      {sub==="business" && (
        <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:18 }}>
          <Panel accent={C.pink} title="DM Tuition — Clients">
            <div style={{ fontSize:11, color:C.faint, marginBottom:12 }}>With Mazin · rate × lessons this month</div>
            {finance.clients.map(c=> <div key={c.id} style={{ background:C.panel2, borderRadius:10, padding:12, marginBottom:10 }}><div style={{ display:"flex", gap:8, marginBottom:8 }}><input value={c.name} onChange={e=>updClient(c.id,{name:e.target.value})} style={{ ...inp, flex:1 }}/><button onClick={()=>delClient(c.id)} style={delBtn}>×</button></div><div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}><span style={{ fontSize:11, color:C.faint }}>£/lesson</span><input type="number" value={c.rate} onChange={e=>updClient(c.id,{rate:e.target.value})} style={{ ...inp, width:64 }}/><span style={{ fontSize:11, color:C.faint }}>lessons/mo</span><input type="number" value={c.lessonsThisMonth} onChange={e=>updClient(c.id,{lessonsThisMonth:e.target.value})} style={{ ...inp, width:54 }}/><input value={c.status} onChange={e=>updClient(c.id,{status:e.target.value})} style={{ ...inp, flex:1, minWidth:90, fontSize:12 }}/></div><div style={{ textAlign:"right", marginTop:6, fontSize:13, color:C.green }}>£{((+c.rate||0)*(+c.lessonsThisMonth||0)).toFixed(0)}/mo</div></div>)}
            <button onClick={addClient} style={addBtn}>+ Add client</button>
          </Panel>
          <Panel accent={C.green} title="Revenue">
            <div style={{ padding:18, background:C.panel2, borderRadius:12, textAlign:"center", marginBottom:14 }}><div style={{ fontSize:12, color:C.dim }}>Projected this month</div><div style={{ fontSize:34, fontWeight:700, color:C.green }}>£{monthlyRevenue.toFixed(0)}</div><div style={{ fontSize:11, color:C.faint }}>{finance.clients.length} client{finance.clients.length!==1?"s":""} · annualised ≈ £{(monthlyRevenue*12).toFixed(0)}</div></div>
            <button onClick={logMonth} style={{ ...addBtn, borderColor:C.green, color:C.green, marginBottom:14 }}>Log this month to history</button>
            {finance.lessonLog.length>0 && <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:110 }}>{finance.lessonLog.map((m,i)=>{ const max=Math.max(...finance.lessonLog.map(x=>x.revenue),1); return <div key={i} style={{ flex:1, textAlign:"center" }}><div style={{ fontSize:9, color:C.dim, marginBottom:3 }}>£{m.revenue}</div><div style={{ width:"100%", height:`${m.revenue/max*70}px`, background:C.green, borderRadius:"3px 3px 0 0" }}/><div style={{ fontSize:9, color:C.faint, marginTop:3 }}>{m.month}</div></div>; })}</div>}
          </Panel>
        </div>
      )}

      {sub==="lump" && (
        <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:18 }}>
          <Panel accent={C.gold} title="£10k Allocation Plan">
            <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:14 }}><span style={{ fontSize:13, color:C.dim }}>Lump sum £</span><input type="number" value={L.amount} onChange={e=>updLump({amount:+e.target.value})} style={{ ...inp, width:110 }}/><label style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:C.dim, marginLeft:"auto" }}><Check on={L.received} color={C.green} onClick={()=>updLump({received:!L.received})} size={18}/> Received</label></div>
            {L.allocations.map(a=> <div key={a.id} style={{ marginBottom:12 }}><div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:5 }}><input value={a.name} onChange={e=>updAlloc(a.id,{name:e.target.value})} style={{ ...inp, flex:1, fontSize:13 }}/><input type="number" value={a.pct} onChange={e=>updAlloc(a.id,{pct:+e.target.value})} style={{ ...inp, width:54 }}/><span style={{ color:C.faint, fontSize:13 }}>%</span></div><div style={{ display:"flex", alignItems:"center", gap:8 }}><div style={{ flex:1, height:7, background:C.panel2, borderRadius:4, overflow:"hidden" }}><div style={{ width:`${a.pct}%`, height:"100%", background:C.gold }}/></div><span style={{ fontSize:12, color:C.ink, width:64, textAlign:"right" }}>£{(L.amount*a.pct/100).toFixed(0)}</span></div></div>)}
            <div style={{ marginTop:10, fontSize:12, color:totalPct===100?C.green:C.red, textAlign:"right" }}>Allocated: {totalPct}% {totalPct!==100 && `(${totalPct>100?"over":"under"} by ${Math.abs(100-totalPct)}%)`}</div>
          </Panel>
          <Panel accent={C.blue} title="Growth Projection">
            <div style={{ fontSize:11, color:C.faint, marginBottom:12 }}>If invested portion compounds (illustrative, not advice)</div>
            <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:10 }}><span style={{ fontSize:12, color:C.dim, width:90 }}>Return %/yr</span><input type="number" value={L.expectedReturn} onChange={e=>updLump({expectedReturn:+e.target.value})} style={{ ...inp, width:64 }}/></div>
            <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:16 }}><span style={{ fontSize:12, color:C.dim, width:90 }}>Years</span><input type="number" value={L.years} onChange={e=>updLump({years:+e.target.value})} style={{ ...inp, width:64 }}/></div>
            <div style={{ padding:16, background:C.panel2, borderRadius:12, marginBottom:12 }}><div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}><span style={{ fontSize:13, color:C.dim }}>Full £{L.amount.toLocaleString()} in {L.years}y</span><span style={{ fontSize:18, fontWeight:700, color:C.blue }}>£{(+fv).toLocaleString()}</span></div><div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:13, color:C.dim }}>Invested portion (£{isaAmount.toFixed(0)})</span><span style={{ fontSize:18, fontWeight:700, color:C.green }}>£{(isaAmount*Math.pow(1+L.expectedReturn/100,L.years)).toFixed(0)}</span></div></div>
            <div style={{ fontSize:11, color:C.faint, lineHeight:1.6, background:"rgba(224,184,0,0.06)", border:`1px solid rgba(224,184,0,0.2)`, borderRadius:8, padding:12 }}><b style={{ color:C.gold }}>Note:</b> A Stocks & Shares ISA shelters gains from tax (£20k/yr allowance). Low-cost global index funds are the standard starting point. This models maths only — not financial advice. Do your own research before committing the £10k.</div>
          </Panel>
        </div>
      )}
    </div>
  );
}
