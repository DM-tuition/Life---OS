import { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

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

// ============ DAY TYPE TEMPLATES — Daniel's real 12GH A-level timetable (Week A/B) ============
// Normal day (Mon/Tue/Wed/Fri): Form 8:40, P1 9:00, P2 10:00, break, P3 11:20, lunch 12:20-13:20, P4 13:20, P5 14:20-15:20
// Thursday (no form): starts 9:20, 55-min lessons, 20-min break, lunch 12:30-13:30
const FORM=[8+40/60, 9];
const NP=[null,[9,10],[10,11],[11+20/60,12+20/60],[13+20/60,14+20/60],[14+20/60,15+20/60]];
const TP=[null,[9+20/60,10+15/60],[10+15/60,11+10/60],[11.5,12+25/60],[13.5,14+25/60],[14+25/60,15+20/60]];
const form=()=>({ t:FORM[0], e:FORM[1], label:"Form · S14", cat:"School" });
const lesson=(p,label)=>({ t:p[0], e:p[1], label, cat:"School" });
const study=(p)=>({ t:p[0], e:p[1], label:"Private Study", cat:"Revision" });
const games=(p)=>({ t:p[0], e:p[1], label:"Games · Field", cat:"Sport" });
const SEED_DAYTYPES = {
  "school-a-mon": { name:"Week A · Mon", color:C.pink, blocks:[
    form(), lesson(NP[1],"F. Maths · S15"), lesson(NP[2],"Physics · PC1"), lesson(NP[3],"F. Maths · S14"), study(NP[4]), lesson(NP[5],"F. Maths · M6") ]},
  "school-a-tue": { name:"Week A · Tue", color:C.pink, blocks:[
    form(), lesson(NP[1],"Economics · S18"), study(NP[2]), lesson(NP[3],"Economics · S18"), lesson(NP[4],"Physics · PC3"), lesson(NP[5],"F. Maths · S15") ]},
  "school-a-wed": { name:"Week A · Wed", color:C.pink, blocks:[
    form(), lesson(NP[1],"Economics · S20"), lesson(NP[2],"Physics · PC3"), study(NP[3]), lesson(NP[4],"Economics · S20"), games(NP[5]) ]},
  "school-a-thu": { name:"Week A · Thu", color:C.pink, blocks:[
    study(TP[1]), lesson(TP[2],"Physics · PC1"), study(TP[3]), lesson(TP[4],"Physics · PC3"), lesson(TP[5],"F. Maths · M6") ]},
  "school-a-fri": { name:"Week A · Fri", color:C.pink, blocks:[
    form(), lesson(NP[1],"F. Maths · S14"), study(NP[2]), lesson(NP[3],"Physics · PC3"), lesson(NP[4],"Economics · S20") ]},
  "school-b-mon": { name:"Week B · Mon", color:C.cyan, blocks:[
    form(), lesson(NP[1],"F. Maths · S15"), lesson(NP[2],"Physics · PC1"), lesson(NP[3],"F. Maths · S15"), lesson(NP[4],"F. Maths · S14"), lesson(NP[5],"Physics · PC3") ]},
  "school-b-tue": { name:"Week B · Tue", color:C.cyan, blocks:[
    form(), lesson(NP[1],"Economics · S18"), study(NP[2]), lesson(NP[3],"Economics · S18"), lesson(NP[4],"Physics · PC1"), lesson(NP[5],"F. Maths · S14") ]},
  "school-b-wed": { name:"Week B · Wed", color:C.cyan, blocks:[
    form(), lesson(NP[1],"Economics · S20"), lesson(NP[2],"F. Maths · M6"), study(NP[3]), lesson(NP[4],"Economics · S20"), games(NP[5]) ]},
  "school-b-thu": { name:"Week B · Thu", color:C.cyan, blocks:[
    study(TP[1]), study(TP[2]), study(TP[3]), study(TP[4]), lesson(TP[5],"F. Maths · S14") ]},
  "school-b-fri": { name:"Week B · Fri", color:C.cyan, blocks:[
    form(), lesson(NP[1],"Economics · S18"), lesson(NP[2],"F. Maths · S15"), lesson(NP[3],"Physics · PC3"), lesson(NP[4],"F. Maths · M6") ]},
  "weekend": { name:"Weekend", color:C.green, blocks:[
    { t:10,e:12,label:"Revision",cat:"Revision" }, { t:15,e:16.5,label:"Gym",cat:"Gym" } ]},
  "holiday": { name:"Holiday / Half-term", color:C.gold, blocks:[
    { t:10,e:12,label:"Deep work / revision",cat:"Revision" }, { t:16,e:18,label:"Gym",cat:"Gym" } ]},
  "rest": { name:"Rest Day", color:C.purple, blocks:[] },
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
  Monday:"school-b-mon", Tuesday:"school-b-tue", Wednesday:"school-b-wed",
  Thursday:"school-b-thu", Friday:"school-b-fri", Saturday:"weekend", Sunday:"weekend",
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
async function sSet(key,v){ try{ localStorage.setItem("lifeos:"+key, JSON.stringify(v)); }catch(e){ console.error(e); } schedulePush(); }

// ============ CLOUD SYNC (optional Supabase backup + cross-device sync) ============
// The whole local state is stored as one JSON blob per user. Last-write-wins by updated_at.
let SB=null, SBuser=null, pushTimer=null;
const SYNC_KEYS_SKIP = new Set(["lifeos:syncCfg","lifeos:lastSync"]);
function syncCfg(){ try{ return JSON.parse(localStorage.getItem("lifeos:syncCfg")||"null"); }catch{ return null; } }
function setSyncCfg(c){ localStorage.setItem("lifeos:syncCfg", JSON.stringify(c)); }
function initSupabase(){ const c=syncCfg(); if(c&&c.url&&c.key){ try{ SB=createClient(c.url,c.key,{auth:{persistSession:true,autoRefreshToken:true}}); }catch{ SB=null; } } else SB=null; return SB; }
function collectState(){ const data={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k&&k.startsWith("lifeos:")&&!SYNC_KEYS_SKIP.has(k)) data[k]=localStorage.getItem(k); } return data; }
function applyState(data){ for(const k in data){ if(k.startsWith("lifeos:")&&!SYNC_KEYS_SKIP.has(k)) localStorage.setItem(k, data[k]); } }
async function pushState(){ if(!SB||!SBuser) return; try{ const updated_at=new Date().toISOString();
  const { error }=await SB.from("lifeos_state").upsert({ user_id:SBuser.id, data:collectState(), updated_at });
  if(!error) localStorage.setItem("lifeos:lastSync", updated_at); }catch(e){ console.error(e); } }
function schedulePush(){ if(!SB||!SBuser) return; clearTimeout(pushTimer); pushTimer=setTimeout(()=>{ pushState(); }, 1500); }
async function pullState(){ if(!SB||!SBuser) return "no";
  try{ const { data, error }=await SB.from("lifeos_state").select("data,updated_at").eq("user_id",SBuser.id).maybeSingle();
    if(error) return "err";
    if(!data){ await pushState(); return "seeded"; }
    const local=localStorage.getItem("lifeos:lastSync")||"";
    if((data.updated_at||"")>local){ applyState(data.data||{}); localStorage.setItem("lifeos:lastSync", data.updated_at); return "pulled"; }
    await pushState(); return "pushed";
  }catch{ return "err"; } }
async function syncBootstrap(){ // called before the app reads localStorage
  if(!initSupabase()) return;
  try{ const { data:{ session } }=await SB.auth.getSession(); if(session){ SBuser=session.user; await pullState(); } }catch{} }

// subtle haptic tick on key actions (no-op where unsupported)
const buzz = (ms=8)=>{ try{ if(navigator.vibrate) navigator.vibrate(ms); }catch{} };
const confirmDel = (what)=>{ try{ return window.confirm(`Delete ${what}? This can't be undone.`); }catch{ return true; } };

// one-time seed of calendar events onto the Month tab (existing entries always win)
const SEED_EVENTS = {
  "2026-06": {
    "2026-06-03":"Lancaster", "2026-06-06":"Canal", "2026-06-07":"D of E",
    "2026-06-13":"Dragon boat", "2026-06-17":"Picture day", "2026-06-20":"Gym vs One (league)",
    "2026-06-22":"Edinburgh", "2026-06-23":"FHS Football", "2026-06-24":"Uni open days",
    "2026-06-25":"Uni open days", "2026-06-26":"Uni open days",
  },
};
// confirmed family-calendar events (only the ones Daniel said he's doing)
const SEED_EVENTS_FAMILY = {
  "2026-06": { "2026-06-01":"Half term" },
  "2026-07": { "2026-07-04":"Canal working party",
    "2026-07-20":"Dan work experience","2026-07-21":"Dan work experience","2026-07-22":"Dan work experience","2026-07-23":"Dan work experience","2026-07-24":"Dan work experience" },
  "2026-08": { "2026-08-01":"Annecy","2026-08-02":"Annecy","2026-08-03":"Annecy","2026-08-07":"Canal working party" },
  "2026-09": { "2026-09-11":"Canal working party" },
  "2026-10": { "2026-10-04":"Half marathon" },
};
function mergeMonths(seed){ for(const mk in seed){ const key="lifeos:monthEvents:"+mk; let ex={}; try{ ex=JSON.parse(localStorage.getItem(key)||"{}"); }catch{} localStorage.setItem(key, JSON.stringify({ ...seed[mk], ...ex })); } }
function seedEvents(){ try{
  if(!localStorage.getItem("lifeos:seededEvents:v1")){ mergeMonths(SEED_EVENTS); localStorage.setItem("lifeos:seededEvents:v1","1"); }
  if(!localStorage.getItem("lifeos:seededEvents:v2")){ mergeMonths(SEED_EVENTS_FAMILY); localStorage.setItem("lifeos:seededEvents:v2","1"); }
}catch{} }

const blankDay = (iso)=>({
  date:iso, dayTypeId:null, blocks:[], bs:false, frozen:false, bin:[],
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
// a habit counts as done if ticked manually OR auto-satisfied by a kept timeline block of its linked category
const habitDone = (day,key,links)=> !!(day && ((day.habits&&day.habits[key]) || (links && links[key] && (day.blocks||[]).some(b=>b.cat===links[key] && b.status!=="missed"))));

// ============ HABIT ENGINE (quotas · freezes · strength) ============
const DEFAULT_HCFG = { per:7, type:"build" }; // per: 7 = daily, 1-6 = times per week
function habitStatsFor(sorted,key,links,cfg){
  const c={ ...DEFAULT_HCFG, ...(cfg||{}) };
  const active=sorted.filter(d=>!d.frozen); // frozen days neither count nor break anything
  if(c.per>=7){
    let cur=0; for(let i=sorted.length-1;i>=0;i--){ const d=sorted[i]; if(d.frozen) continue; if(habitDone(d,key,links)) cur++; else break; }
    let lng=0,run=0; for(const d of sorted){ if(d.frozen) continue; if(habitDone(d,key,links)){ run++; lng=Math.max(lng,run); } else run=0; }
    const done=active.filter(d=>habitDone(d,key,links)).length;
    return { mode:"daily", cur, lng, rate:active.length?Math.round(done/active.length*100):0 };
  }
  const byWk={}; for(const d of sorted){ const wk=weekKeyOf(d.date); (byWk[wk]=byWk[wk]||[]).push(d); }
  const wks=Object.keys(byWk).sort(); const thisWk=weekKeyOf(todayISO());
  const countWk=(wk)=> byWk[wk].filter(d=>habitDone(d,key,links)).length;
  let cur=0; for(let i=wks.length-1;i>=0;i--){ const wk=wks[i];
    if(wk===thisWk){ if(countWk(wk)>=c.per) cur++; continue; } // current week counts if hit, never breaks
    if(countWk(wk)>=c.per) cur++; else break; }
  let lng=0,run=0; for(const wk of wks){ if(wk===thisWk) continue; if(countWk(wk)>=c.per){ run++; lng=Math.max(lng,run); } else run=0; }
  const past=wks.filter(wk=>wk!==thisWk);
  return { mode:"weekly", cur, lng, rate:past.length?Math.round(past.filter(wk=>countWk(wk)>=c.per).length/past.length*100):0, now:countWk(thisWk), per:c.per };
}
// Loop-style habit strength: exponential moving average — decays gently on a miss, rebuilds with consistency
function habitStrength(sorted,key,links){
  let s=0; const a=0.05;
  for(const d of sorted){ if(d.frozen) continue; s=s*(1-a)+(habitDone(d,key,links)?1:0)*a; }
  return Math.round(s*100);
}

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
  <button onClick={(e)=>{ buzz(); onClick&&onClick(e); }} style={{ width:size,height:size,borderRadius:6,cursor:"pointer",flexShrink:0,
    border:`2px solid ${on?color:C.faint}`, background:on?color:"transparent", display:"flex",
    alignItems:"center", justifyContent:"center", color:"#fff", fontSize:size*0.6, fontWeight:700, padding:0 }}>{on?"✓":""}</button>
);
const Ring = ({ pct,color,value,label,size=68 })=>{
  const r=(size-8)/2, circ=2*Math.PI*r;
  return <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} stroke={C.panel2} strokeWidth={6} fill="none"/>
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-Math.min(1,Math.max(0,pct)))} transform={`rotate(-90 ${size/2} ${size/2})`}/>
    </svg>
    <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontSize:20, fontWeight:700, color }}>{value}</span>
      <span style={{ fontSize:8, color:C.faint, textTransform:"uppercase", letterSpacing:0.5 }}>{label}</span>
    </div>
  </div>;
};
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
  const [tab,setTabRaw] = useState(()=>{ try{ return localStorage.getItem("lifeos:lastTab")||"today"; }catch{ return "today"; } });
  const setTab = (t)=>{ setTabRaw(t); try{ localStorage.setItem("lifeos:lastTab", t); }catch{} };
  const [date,setDate] = useState(todayISO());
  const [day,setDay] = useState(null);
  const [loading,setLoading] = useState(true);
  const [dayTypes,setDayTypes] = useState({});
  const [weekMap,setWeekMap] = useState(DEFAULT_WEEK);      // Week A
  const [weekMapB,setWeekMapB] = useState(DEFAULT_WEEK_B);  // Week B
  const [weekAnchorA,setWeekAnchorA] = useState(todayISO());// Monday of a week designated "Week A"
  const [habitLinks,setHabitLinks] = useState({});         // habit key -> block category (auto-complete)
  const [habitCfg,setHabitCfg] = useState({});             // habit key -> { per, type }
  const [allDays,setAllDays] = useState({});
  const [finance,setFinance] = useState(null);
  const [toast,setToast] = useState("");
  const [showBackup,setShowBackup] = useState(false);
  const [showSync,setShowSync] = useState(false);
  const [showMore,setShowMore] = useState(false);
  const [canUndo,setCanUndo] = useState(false);
  const undoStack = useRef([]);
  const isMobile = useIsMobile();

  useEffect(()=>{ (async()=>{
    await syncBootstrap();   // pull newest cloud state before reading local (no-op if sync isn't set up)
    seedEvents();            // add June calendar events to the Month tab once
    setDayTypes(await sGet("dayTypes:v2", SEED_DAYTYPES));
    setWeekMap(await sGet("weekMap:v2", DEFAULT_WEEK));
    setWeekMapB(await sGet("weekMapB:v1", DEFAULT_WEEK_B));
    setWeekAnchorA(await sGet("weekAnchorA:v1", todayISO()));
    setHabitLinks(await sGet("habitLinks:v1", {}));
    setHabitCfg(await sGet("habitCfg:v1", {}));
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
    if(d.frozen===undefined) d.frozen = false;
    if(!d.bin) d.bin = [];
    if(!d.breakdownAdj) d.breakdownAdj = { Sleep:0,Lessons:0,Revision:0,Gym:0,Activity:0 };
    // breakdown = auto from timeline + the day's manual adjustments
    d.breakdown = withAdj(computeBreakdown(d.blocks), d.breakdownAdj);
    setDay(d);
  })(); },[date, loading, weekAnchorA]); // eslint-disable-line

  const flash = (m)=>{ buzz(); setToast(m); setTimeout(()=>setToast(""),1600); };
  const persistDay = async (d)=>{
    if(day && day.date===d.date){ undoStack.current.push(day); if(undoStack.current.length>50) undoStack.current.shift(); setCanUndo(true); }
    setDay(d); await sSet(`day:${d.date}`, d);
    const idx=await sGet("index:days",[]); if(!idx.includes(d.date)){ idx.push(d.date); await sSet("index:days",idx); }
    setAllDays(prev=>({ ...prev, [d.date]:d })); };
  const upd = (patch)=> persistDay({ ...day, ...patch });
  const undo = async ()=>{ const prev=undoStack.current.pop(); setCanUndo(undoStack.current.length>0); if(!prev) return;
    await sSet(`day:${prev.date}`, prev); setAllDays(p=>({ ...p, [prev.date]:prev }));
    if(prev.date!==date) setDate(prev.date); setDay(prev); buzz(); setToast("Undid last change"); setTimeout(()=>setToast(""),1400); };
  const persistFinance = async (f)=>{ setFinance(f); await sSet("finance:v2", f); };
  const persistDayTypes = async (dt)=>{ setDayTypes(dt); await sSet("dayTypes:v2", dt); };
  const persistWeekMap = async (wm)=>{ setWeekMap(wm); await sSet("weekMap:v2", wm); };
  const persistWeekMapB = async (wm)=>{ setWeekMapB(wm); await sSet("weekMapB:v1", wm); };
  const persistWeekAnchor = async (iso)=>{ setWeekAnchorA(iso); await sSet("weekAnchorA:v1", iso); };
  const persistHabitLinks = async (l)=>{ setHabitLinks(l); await sSet("habitLinks:v1", l); };
  const persistHabitCfg = async (c)=>{ setHabitCfg(c); await sSet("habitCfg:v1", c); };
  const applyDayType = (typeId)=>{ const dt=dayTypes[typeId]; if(!dt) return;
    persistDay({ ...day, dayTypeId:typeId, blocks:cloneBlocks(dt.blocks) }); flash(`Applied: ${dt.name}`); };

  if(loading || !day || !finance) return (
    <div style={{ background:C.bg, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:C.dim, fontFamily:"system-ui" }}>Loading your system…</div>
  );

  return (
    <div style={{ background:C.bg, minHeight:"100vh", fontFamily:"'Inter',system-ui,sans-serif", color:C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box; -webkit-tap-highlight-color:transparent;} input,textarea,select{font-family:inherit;}
        ::-webkit-scrollbar{width:8px;height:8px;} ::-webkit-scrollbar-thumb{background:${C.line};border-radius:4px;}
        button{ transition: background .15s ease, border-color .15s ease, color .15s ease, transform .06s ease; }
        button:active{ transform: scale(0.96); }
        .lo-scroll{ -webkit-overflow-scrolling:touch; }
        .lo-tabs{ scrollbar-width:none; -webkit-overflow-scrolling:touch; } .lo-tabs::-webkit-scrollbar{ display:none; }
        @keyframes lo-pop{ from{ opacity:0; transform:translateX(-50%) translateY(8px) scale(.96);} to{ opacity:1; transform:translateX(-50%) translateY(0) scale(1);} }
      `}</style>

      <div style={{ borderBottom:`1px solid ${C.line}`, padding:isMobile?"14px 16px":"18px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, background:C.bg, zIndex:50, gap:10 }}>
        <div style={{ display:"flex", alignItems:"baseline", gap:12, minWidth:0 }}>
          <span style={{ fontFamily:"'Caveat',cursive", fontSize:isMobile?28:34, color:C.teal, lineHeight:1 }}>Life OS</span>
          {!isMobile && <span style={{ fontSize:11, color:C.faint, letterSpacing:2, textTransform:"uppercase" }}>Plan · Track · Compound</span>}
        </div>
        <div style={{ display:"flex", gap:8, flexShrink:0 }}>
          <button onClick={()=>setShowSync(true)} style={{ ...addBtn, width:"auto", padding:"7px 12px", fontSize:12 }}>☁ Sync</button>
          <button onClick={()=>setShowBackup(true)} style={{ ...addBtn, width:"auto", padding:"7px 12px", fontSize:12 }}>Backup</button>
          <button onClick={()=>{ setDate(todayISO()); setTab("today"); }} style={{ ...addBtn, width:"auto", padding:"7px 14px", fontSize:12 }}>{isMobile?"Today":"Jump to Today"}</button>
        </div>
      </div>

      {showBackup && <BackupModal close={()=>setShowBackup(false)} flash={flash} />}
      {showSync && <CloudSyncModal close={()=>setShowSync(false)} flash={flash} />}

      <div className="lo-tabs" style={{ display:"flex", gap:4, padding:"12px 24px 0", borderBottom:`1px solid ${C.line}`, overflowX:"auto", position:"relative" }}>
        {[["today","Today"],["month","Month"],["habits","Habits"],["finance","Finance"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{ padding:"10px 18px", cursor:"pointer", border:"none", background:"transparent",
            color:tab===k?C.ink:C.faint, fontWeight:600, fontSize:14, borderBottom:`2px solid ${tab===k?C.teal:"transparent"}`, marginBottom:-1, whiteSpace:"nowrap" }}>{l}</button>
        ))}
        {(()=>{ const MORE=[["week","Weekly Review"],["trends","Reports"],["journal","Journal"],["types","Day Types"]]; const onMore=MORE.some(m=>m[0]===tab); const cur=MORE.find(m=>m[0]===tab);
          return <div style={{ position:"relative" }}>
            <button onClick={()=>setShowMore(s=>!s)} style={{ padding:"10px 18px", cursor:"pointer", border:"none", background:"transparent", color:onMore?C.ink:C.faint, fontWeight:600, fontSize:14, borderBottom:`2px solid ${onMore?C.teal:"transparent"}`, marginBottom:-1, whiteSpace:"nowrap" }}>{onMore?cur[1]:"More"} ▾</button>
            {showMore && <div style={{ position:"absolute", top:"100%", right:0, marginTop:4, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:6, zIndex:60, minWidth:160, boxShadow:"0 8px 30px rgba(0,0,0,.6)" }}>
              {MORE.map(([k,l])=> <button key={k} onClick={()=>{ setTab(k); setShowMore(false); }} style={{ display:"block", width:"100%", textAlign:"left", padding:"9px 12px", borderRadius:8, border:"none", background:tab===k?C.panel:"transparent", color:tab===k?C.ink:C.dim, cursor:"pointer", fontSize:13 }}>{l}</button>)}
            </div>}
          </div>; })()}
      </div>

      <div style={{ maxWidth:1180, margin:"0 auto", padding:isMobile?"16px 12px":"24px" }}>
        {tab==="today" && <TodayView day={day} date={date} setDate={setDate} upd={upd} dayTypes={dayTypes} applyDayType={applyDayType} links={habitLinks} allDays={allDays} flash={flash} />}
        {tab==="month" && <MonthView date={date} setDate={setDate} setTab={setTab} allDays={allDays} dayTypes={dayTypes} flash={flash} />}
        {tab==="habits" && <HabitsView allDays={allDays} links={habitLinks} saveLinks={persistHabitLinks} cfg={habitCfg} saveCfg={persistHabitCfg} />}
        {tab==="week" && <WeekView allDays={allDays} date={date} setDate={setDate} links={habitLinks} />}
        {tab==="trends" && <TrendsView allDays={allDays} links={habitLinks} cfg={habitCfg} />}
        {tab==="journal" && <JournalView allDays={allDays} setDate={setDate} setTab={setTab} />}
        {tab==="finance" && <FinanceView finance={finance} save={persistFinance} flash={flash} />}
        {tab==="types" && <DayTypesView dayTypes={dayTypes} save={persistDayTypes} weekMap={weekMap} saveWeekMap={persistWeekMap} weekMapB={weekMapB} saveWeekMapB={persistWeekMapB} weekAnchorA={weekAnchorA} saveWeekAnchor={persistWeekAnchor} flash={flash} />}
      </div>

      {toast && <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:C.teal, color:"#001014", padding:"10px 22px", borderRadius:30, fontWeight:600, fontSize:14, zIndex:100, boxShadow:"0 8px 30px rgba(0,0,0,.5)", animation:"lo-pop .18s ease" }}>{toast}</div>}
      {canUndo && <button onClick={undo} style={{ position:"fixed", bottom:24, left:20, background:C.panel2, color:C.ink, border:`1px solid ${C.line}`, padding:"9px 16px", borderRadius:30, fontWeight:600, fontSize:13, zIndex:100, boxShadow:"0 8px 30px rgba(0,0,0,.5)", cursor:"pointer" }}>↶ Undo</button>}
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

// ============ CLOUD SYNC MODAL ============
function CloudSyncModal({ close,flash }){
  const cfg=syncCfg();
  const [url,setUrl]=useState(cfg?cfg.url:"");
  const [key,setKey]=useState(cfg?cfg.key:"");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [session,setSession]=useState(null);
  const [busy,setBusy]=useState(false);
  const [msg,setMsg]=useState("");
  const connected=!!(cfg&&cfg.url&&cfg.key);

  useEffect(()=>{ (async()=>{ if(initSupabase()){ try{ const { data:{ session } }=await SB.auth.getSession(); setSession(session); }catch{} } })(); },[]);

  const connect=()=>{ if(!url.trim()||!key.trim()){ setMsg("Paste both the URL and the anon key."); return; }
    setSyncCfg({ url:url.trim(), key:key.trim() }); initSupabase(); setMsg("Connected ✓ — now sign in or create an account below."); flash("Project connected"); };
  const auth=async(mode)=>{ if(!initSupabase()){ setMsg("Connect your project first."); return; }
    setBusy(true); setMsg("");
    try{ const fn = mode==="up" ? SB.auth.signUp({ email:email.trim(), password:pass }) : SB.auth.signInWithPassword({ email:email.trim(), password:pass });
      const { data, error }=await fn;
      if(error){ setMsg(error.message); setBusy(false); return; }
      if(!data.session){ setMsg("Check your email to confirm, then sign in. (Or disable email confirmation in Supabase → Authentication → Sign In/Providers.)"); setBusy(false); return; }
      SBuser=data.session.user; setSession(data.session);
      const r=await pullState(); flash(r==="pulled"?"Synced from cloud":"Backed up to cloud");
      setTimeout(()=>location.reload(),700);
    }catch(e){ setMsg(String(e&&e.message||e)); setBusy(false); } };
  const signOut=async()=>{ try{ await SB.auth.signOut(); }catch{} SBuser=null; setSession(null); flash("Signed out"); };
  const syncNow=async()=>{ setBusy(true); SBuser=session.user; const r=await pullState(); await pushState(); setBusy(false); flash(r==="pulled"?"Pulled latest + synced":"Synced ✓"); setTimeout(()=>location.reload(),500); };

  return (
    <div onClick={close} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:22, width:"100%", maxWidth:420, maxHeight:"88vh", overflowY:"auto" }}>
        <div style={{ fontFamily:"'Caveat',cursive", fontSize:28, color:C.teal, marginBottom:6 }}>Cloud Sync</div>
        <div style={{ fontSize:12, color:C.dim, lineHeight:1.6, marginBottom:16 }}>
          Free auto-backup + sync across your phone and laptop, powered by Supabase. Set it up once (~10 min) — I gave you a step-by-step guide. Until you do, the app keeps working offline on this device.
        </div>

        {session ? (
          <>
            <div style={{ padding:14, background:C.panel2, borderRadius:10, marginBottom:14 }}>
              <div style={{ fontSize:12, color:C.green, fontWeight:600 }}>● Synced &amp; backing up automatically</div>
              <div style={{ fontSize:12, color:C.dim, marginTop:4 }}>Signed in as {session.user.email}</div>
              <div style={{ fontSize:11, color:C.faint, marginTop:2 }}>Last sync: {localStorage.getItem("lifeos:lastSync")?fmt(localStorage.getItem("lifeos:lastSync").slice(0,10)):"—"}</div>
            </div>
            <button onClick={syncNow} disabled={busy} style={{ ...addBtn, borderColor:C.teal, color:C.teal, marginBottom:10 }}>{busy?"Syncing…":"↻ Sync now"}</button>
            <button onClick={signOut} style={{ ...addBtn, marginBottom:10 }}>Sign out</button>
          </>
        ) : (
          <>
            <Label>1 · Supabase Project URL</Label>
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://xxxx.supabase.co" style={{ ...inp, width:"100%", marginBottom:10 }}/>
            <Label>2 · Anon public key</Label>
            <input value={key} onChange={e=>setKey(e.target.value)} placeholder="eyJhbGci…" style={{ ...inp, width:"100%", marginBottom:10 }}/>
            <button onClick={connect} style={{ ...addBtn, borderColor:C.blue, color:C.blue, marginBottom:16 }}>{connected?"Update connection":"Connect project"}</button>

            <Label>3 · Your account</Label>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" autoComplete="email" style={{ ...inp, width:"100%", marginBottom:8 }}/>
            <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="password" type="password" autoComplete="current-password" style={{ ...inp, width:"100%", marginBottom:10 }}/>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>auth("up")} disabled={busy} style={{ ...addBtn, flex:1, borderColor:C.green, color:C.green }}>Create account</button>
              <button onClick={()=>auth("in")} disabled={busy} style={{ ...addBtn, flex:1, borderColor:C.teal, color:C.teal }}>Sign in</button>
            </div>
          </>
        )}
        {msg && <div style={{ fontSize:11, color:C.gold, marginTop:12, lineHeight:1.5 }}>{msg}</div>}
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
// quick-pick labels — realistically a block is only ever a few things, drawn from your schedule
const QUICK_LABELS = Array.from(new Set(Object.values(SEED_DAYTYPES).flatMap(t=>(t.blocks||[]).map(b=>b.label))));

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

function Timeline({ blocks,onChange,isToday=false,isPast=false,sketch,onSketch,onDeleteId }){
  const railRef = useRef(null);
  const scrollRef = useRef(null);
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
  useEffect(()=>{ if(scrollRef.current){ scrollRef.current.scrollTop = timeToY(isToday ? Math.max(DAY_START, nowDec()-1.5) : 7.5); } },[]); // open near the relevant time

  const updBlock=(id,patch)=> onChange(prev=>prev.map(b=>b.id===id?{...b,...patch}:b));
  const delBlock=(id)=>{ if(onDeleteId) onDeleteId(id); else onChange(prev=>prev.filter(b=>b.id!==id)); setEditing(null); };
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

  // ----- tap empty space to add a block (no drag, so the page never scrolls out from under you) -----
  const startCreate=(e)=>{ if(pen) return; if(e.target!==railRef.current) return;
    const rect=railRef.current.getBoundingClientRect(); const p=e.touches?e.touches[0]:e;
    const sx=p.clientX, sy=p.clientY; let moved=false;
    const move=(ev)=>{ const q=ev.touches?ev.touches[0]:ev; if(Math.hypot(q.clientX-sx,q.clientY-sy)>8) moved=true; };
    const up=()=>{ window.removeEventListener("mousemove",move); window.removeEventListener("touchmove",move); window.removeEventListener("mouseup",up); window.removeEventListener("touchend",up);
      if(moved) return;                              // it was a scroll, not a tap — leave it alone
      let t=snap(yToTime(sy-rect.top)); const dur=1; t=Math.min(DAY_END-dur,t); const id=Date.now();
      onChange(prev=>[...prev,{ id,t,e:t+dur,label:"",cat:"Other" }]); setEditing(id); rerender(); };
    window.addEventListener("mousemove",move); window.addEventListener("touchmove",move); window.addEventListener("mouseup",up); window.addEventListener("touchend",up);
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
      <div ref={scrollRef} className="lo-scroll" style={{ position:"relative", ...(isMobile?{ maxHeight:"68vh", overflowY:"auto", overflowX:"hidden", overscrollBehavior:"contain" }:{}) }}>
      <div style={{ display:"flex", position:"relative" }}>
        <div style={{ width:46, position:"relative", height, flexShrink:0 }}>
          {hours.map(h=> <div key={h} style={{ position:"absolute", top:timeToY(h)-7, right:8, fontSize:10, color:C.faint, fontVariantNumeric:"tabular-nums" }}>{hhmm(h)}</div>)}
        </div>
        <div ref={railRef} onMouseDown={startCreate} onTouchStart={startCreate}
          style={{ flex:1, position:"relative", height, borderLeft:`1px solid ${C.line}`, cursor:pen?"crosshair":"copy", touchAction:pen?"none":"pan-y" }}>
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
                    ? { position:"fixed", left:"50%", top:"50%", transform:"translate(-50%,-50%)", width:"min(340px,92vw)", maxHeight:"86vh", overflowY:"auto", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:14, padding:16, zIndex:200, boxShadow:"0 8px 30px rgba(0,0,0,.6)" }
                    : { position:"absolute", top:0, left:"calc(100% + 8px)", width:260, maxHeight:520, overflowY:"auto", background:C.panel2, border:`1px solid ${C.line}`, borderRadius:12, padding:14, zIndex:20, boxShadow:"0 8px 30px rgba(0,0,0,.6)" } }>
                    {elapsed(b) && <button onClick={()=>updBlock(b.id,{status:b.status==="missed"?undefined:"missed"})} style={{ ...addBtn, marginBottom:12, borderColor:b.status==="missed"?C.red:C.green, color:b.status==="missed"?C.red:C.green }}>{b.status==="missed"?"✗ Didn't happen (tap to undo)":"✓ Did it — tap if you didn't"}</button>}
                    <Label>Pick a label</Label>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
                      {QUICK_LABELS.map(l=> <button key={l} onClick={()=>updBlock(b.id,{label:l})} style={{ fontSize:12, padding:"6px 10px", borderRadius:14, cursor:"pointer", border:`1px solid ${b.label===l?C.teal:C.line}`, background:b.label===l?C.teal:"transparent", color:b.label===l?"#001014":C.dim, fontWeight:b.label===l?700:400 }}>{l}</button>)}
                    </div>
                    <input value={b.label} onChange={e=>updBlock(b.id,{label:e.target.value})} style={{ ...inp, width:"100%", marginBottom:12 }} placeholder="…or type a custom label"/>
                    <Label>Category</Label>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:12 }}>
                      {CAT_KEYS.map(c=> <button key={c} onClick={()=>updBlock(b.id,{cat:c})} style={{ fontSize:12, padding:"6px 10px", borderRadius:14, cursor:"pointer", border:`1px solid ${b.cat===c?CATS[c]:C.line}`, background:b.cat===c?CATS[c]:"transparent", color:b.cat===c?"#0b0b0b":C.dim, fontWeight:b.cat===c?700:400 }}>{c}</button>)}
                    </div>
                    <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                      <div style={{ flex:1 }}><Label>Start</Label><input type="time" value={hhmm(b.t)} onChange={e=>{ const [H,M]=e.target.value.split(":").map(Number); updBlock(b.id,{t:H+M/60}); }} style={{ ...inp, width:"100%" }}/></div>
                      <div style={{ flex:1 }}><Label>End</Label><input type="time" value={hhmm(b.e)} onChange={e=>{ const [H,M]=e.target.value.split(":").map(Number); updBlock(b.id,{e:H+M/60}); }} style={{ ...inp, width:"100%" }}/></div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={()=>delBlock(b.id)} style={{ ...delBtn, flex:1, width:"auto" }}>Delete</button>
                      <button onClick={()=>setEditing(null)} style={{ ...addBtn, flex:2, borderColor:C.teal, color:C.teal }}>Done</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

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

          {blocks.length===0 && !pen && <div style={{ position:"absolute", top:40, left:0, right:0, textAlign:"center", color:C.faint, fontSize:12, pointerEvents:"none" }}>Tap the grid to add a block · drag to move · drag the bottom edge to resize</div>}
        </div>
      </div>
      </div>
    </div>
  );
}

// ============ TODAY ============
function TodayView({ day,date,setDate,upd,dayTypes,applyDayType,links,allDays,flash }){
  const [newTask,setNewTask] = useState("");
  const [showApply,setShowApply] = useState(false);
  const isMobile = useIsMobile();
  const dateRef = useRef(null);
  const [showLog,setShowLog] = useState(false);
  const [showActions,setShowActions] = useState(false);
  const dn = dayNameOf(date);
  const isToday = date===todayISO();
  const isPast = date<todayISO();
  const [showBin,setShowBin] = useState(false);
  const setBlocks = (updater)=>{ const next=typeof updater==="function"?updater(day.blocks):updater; upd({ blocks:next, breakdown:withAdj(computeBreakdown(next), day.breakdownAdj) }); };
  const setSketch = (s)=> upd({ sketch:s });
  const bin = day.bin||[];
  const deleteToBin=(id)=>{ const b=day.blocks.find(x=>x.id===id); const blocks=day.blocks.filter(x=>x.id!==id);
    const nb=[...bin, ...(b?[{ t:b.t,e:b.e,label:b.label,cat:b.cat }]:[])].slice(-40);
    upd({ blocks, bin:nb, breakdown:withAdj(computeBreakdown(blocks), day.breakdownAdj) }); flash&&flash("Moved to bin"); };
  const restoreBin=(i)=>{ const b=bin[i]; if(!b) return; const blocks=[...day.blocks,{ ...b, id:Date.now() }]; const nb=bin.filter((_,j)=>j!==i);
    upd({ blocks, bin:nb, breakdown:withAdj(computeBreakdown(blocks), day.breakdownAdj) }); flash&&flash("Restored"); };
  const clearBin=()=> upd({ bin:[] });
  const adjustBd = (k,delta)=>{ const adj={ ...(day.breakdownAdj||{}), [k]:((day.breakdownAdj&&day.breakdownAdj[k])||0)+delta }; upd({ breakdownAdj:adj, breakdown:withAdj(computeBreakdown(day.blocks), adj) }); };
  const addTask=(b)=>{ if(!newTask.trim())return; upd({ todos:{ ...day.todos,[b]:[...day.todos[b],{text:newTask.trim(),done:false}] } }); setNewTask(""); };
  const toggleTask=(b,i)=>{ const a=[...day.todos[b]]; a[i]={...a[i],done:!a[i].done}; upd({ todos:{ ...day.todos,[b]:a } }); };
  const delTask=(b,i)=> upd({ todos:{ ...day.todos,[b]:day.todos[b].filter((_,j)=>j!==i) } });
  const toggleHabit=(k)=> upd({ habits:{ ...day.habits,[k]:!day.habits[k] } });
  const currentType = day.dayTypeId && dayTypes[day.dayTypeId];

  const copyYesterday=()=>{ const y=(allDays||{})[addDays(date,-1)];
    if(!y||!(y.blocks&&y.blocks.length)){ flash&&flash("Nothing to copy from yesterday"); return; }
    if(day.blocks.length && !window.confirm("Replace today's timeline with yesterday's?")) return;
    setBlocks(cloneBlocks(y.blocks.map(({t,e,label,cat})=>({t,e,label,cat})))); flash&&flash("Copied yesterday"); };
  const pullTodos=()=>{ const y=(allDays||{})[addDays(date,-1)]; if(!y||!y.todos){ flash&&flash("Nothing to carry over"); return; }
    const nt={ ...day.todos }; let n=0;
    for(const b of ["shortImp","longImp","shortUnimp","longUnimp"]){ const have=new Set((nt[b]||[]).map(t=>t.text));
      for(const t of (y.todos[b]||[])){ if(!t.done && !have.has(t.text)){ nt[b]=[...(nt[b]||[]),{ text:t.text, done:false }]; n++; } } }
    if(n){ upd({ todos:nt }); flash&&flash(`Carried over ${n} task${n>1?"s":""}`); } else flash&&flash("Nothing unfinished to carry"); };

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
        <div style={{ textAlign:"center", minWidth:200, position:"relative" }}>
          <div style={{ fontFamily:"'Caveat',cursive", fontSize:44, color:C.teal, lineHeight:0.9 }}>{dn}</div>
          <button onClick={()=>{ const el=dateRef.current; if(!el) return; try{ el.showPicker(); }catch{ el.focus(); el.click(); } }} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:C.dim, padding:0 }}>{fmt(date)} {isToday && <span style={{color:C.green}}>• today</span>} <span style={{ color:C.faint }}>▾</span></button>
          <input ref={dateRef} type="date" value={date} onChange={e=>e.target.value&&setDate(e.target.value)} style={{ position:"absolute", left:"50%", bottom:0, width:1, height:1, opacity:0, pointerEvents:"none" }}/>
        </div>
        <Nav onClick={()=>setDate(addDays(date,1))}>›</Nav>
      </div>

      <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:10, marginBottom:16, position:"relative", flexWrap:"wrap" }}>
        <button onClick={()=>setShowApply(s=>!s)} style={{ padding:"6px 14px", borderRadius:20, cursor:"pointer", fontSize:13, fontWeight:600, border:`1px solid ${currentType?currentType.color:C.line}`, background:"transparent", color:currentType?currentType.color:C.dim }}>{currentType?currentType.name:"Blank"} ▾</button>
        {(day.bs||day.frozen) && <span style={{ fontSize:11, fontWeight:700, padding:"4px 8px", borderRadius:8, background:day.bs?C.red:C.blue, color:"#fff" }}>{day.bs?"BS day":"❄ Frozen"}</span>}
        <div style={{ position:"relative" }}>
          <button onClick={()=>setShowActions(s=>!s)} style={{ padding:"6px 12px", borderRadius:20, cursor:"pointer", fontSize:13, fontWeight:600, border:`1px solid ${C.line}`, background:"transparent", color:C.dim }}>⋯</button>
          {showActions && (
            <div style={{ position:"absolute", top:"100%", marginTop:6, right:0, background:C.panel2, border:`1px solid ${C.line}`, borderRadius:10, padding:6, zIndex:30, width:190, boxShadow:"0 8px 30px rgba(0,0,0,.6)" }}>
              <button onClick={()=>{ copyYesterday(); setShowActions(false); }} style={{ display:"block", width:"100%", textAlign:"left", padding:"8px 10px", borderRadius:8, border:"none", background:"transparent", color:C.ink, cursor:"pointer", fontSize:13 }}>⧉ Copy yesterday</button>
              <button onClick={()=>{ upd({ bs:!day.bs }); setShowActions(false); }} style={{ display:"block", width:"100%", textAlign:"left", padding:"8px 10px", borderRadius:8, border:"none", background:"transparent", color:day.bs?C.red:C.ink, cursor:"pointer", fontSize:13 }}>{day.bs?"✓ Unmark BS day":"Mark BS day"}</button>
              <button onClick={()=>{ upd({ frozen:!day.frozen }); setShowActions(false); }} style={{ display:"block", width:"100%", textAlign:"left", padding:"8px 10px", borderRadius:8, border:"none", background:"transparent", color:day.frozen?C.blue:C.ink, cursor:"pointer", fontSize:13 }}>{day.frozen?"❄ Unfreeze day":"❄ Freeze day (ill/away)"}</button>
            </div>
          )}
        </div>
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

      <Panel accent={C.pink} title="Day" right={
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {bin.length>0 && <button onClick={()=>setShowBin(true)} style={{ background:"none", border:`1px solid ${C.line}`, borderRadius:8, padding:"3px 9px", color:C.dim, cursor:"pointer", fontSize:11 }}>🗑 {bin.length}</button>}
          <span style={{ fontSize:11, color:C.faint }}>tap to add · swipe to skip</span>
        </div>}>
        <div data-timeline>
          <Timeline blocks={day.blocks} onChange={setBlocks} isToday={isToday} isPast={isPast} sketch={day.sketch} onSketch={setSketch} onDeleteId={deleteToBin} />
        </div>
      </Panel>

      {showBin && (
        <div onClick={()=>setShowBin(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:14, padding:20, width:"100%", maxWidth:380, maxHeight:"80vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontFamily:"'Caveat',cursive", fontSize:26, color:C.teal }}>Bin · {fmt(date)}</div>
              {bin.length>0 && <button onClick={()=>{ if(confirmDel("everything in the bin")){ clearBin(); setShowBin(false); } }} style={{ background:"none", border:"none", color:C.red, cursor:"pointer", fontSize:12 }}>Empty bin</button>}
            </div>
            {bin.length===0 ? <Empty>Deleted blocks land here so you can put them back.</Empty> :
              bin.map((b,i)=>{ const col=CATS[b.cat]||C.dim; return (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0", borderBottom:`1px solid ${C.line}` }}>
                  <span style={{ width:8,height:8,borderRadius:"50%",background:col,flexShrink:0 }}/>
                  <div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:13, color:C.ink }}>{b.label||"(untitled)"}</div><div style={{ fontSize:10, color:C.faint }}>{hhmm(b.t)}–{hhmm(b.e)} · {b.cat}</div></div>
                  <button onClick={()=>restoreBin(i)} style={{ ...addBtn, width:"auto", padding:"5px 12px", borderColor:C.green, color:C.green, fontSize:12 }}>Restore</button>
                </div>
              ); })}
            <button onClick={()=>setShowBin(false)} style={{ ...addBtn, marginTop:14 }}>Close</button>
          </div>
        </div>
      )}

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
              {HABITS.map(h=>{ const on=habitDone(day,h.key,links); const auto=on&&!(day.habits&&day.habits[h.key]); return <div key={h.key} style={{ display:"flex", alignItems:"center", gap:10 }}><Check on={on} color={h.color} onClick={()=>toggleHabit(h.key)} /><span style={{ fontSize:13, color:on?C.ink:C.dim }}>{h.label}{auto && <span style={{ fontSize:9, color:h.color, marginLeft:4 }}>auto</span>}</span></div>; })}
            </div>
          </Panel>

          <Panel accent={C.green} title="To Do" style={{ gridColumn:isMobile?"auto":"1 / -1" }} right={<button onClick={pullTodos} style={{ background:"none", border:"none", color:C.dim, cursor:"pointer", fontSize:11 }}>↓ carry over unfinished</button>}>
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
function WeekView({ allDays,date,setDate,links }){
  const isMobile = useIsMobile();
  const wk = weekKeyOf(date);
  const weekDays = useMemo(()=>Array.from({length:7},(_,i)=> allDays[addDays(wk,i)]||null),[wk,allDays]);
  const filled = weekDays.filter(Boolean);
  const habitConsistency = HABITS.map(h=>({ ...h, count:filled.filter(d=>habitDone(d,h.key,links)).length, total:filled.length }));
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
function TrendsView({ allDays,links,cfg }){
  const isMobile = useIsMobile();
  const sorted = useMemo(()=>Object.values(allDays).filter(Boolean).sort((a,b)=>a.date.localeCompare(b.date)),[allDays]);
  if(sorted.length<2) return <Empty big>Log at least 2 days to see trends. Your behaviour patterns accumulate here over weeks and months — including your BS-day count, the metric to actually beat.</Empty>;
  const last30 = sorted.slice(-30);
  const Bars = ({ data,color,max })=> <div style={{ display:"flex", alignItems:"flex-end", gap:2, height:90, marginTop:8 }}>{data.map((v,i)=> <div key={i} style={{ flex:1, minWidth:3, height:`${(v/max*100)||2}%`, background:color, borderRadius:2, opacity:0.85 }}/>)}</div>;
  const ratings=last30.map(d=>d.rating||0), prod=last30.map(d=>+d.prodHours||0), sleepH=last30.map(d=>d.breakdown.Sleep||0);
  const maxProd=Math.max(8,...prod), maxSleep=Math.max(10,...sleepH);
  const streaks = HABITS.map(h=>{ const s=habitStatsFor(sorted,h.key,links,(cfg||{})[h.key]); return {...h,streak:s.cur,unit:s.mode==="weekly"?"wk":""}; });
  const habitRate = HABITS.map(h=>({ ...h, rate:habitStatsFor(sorted,h.key,links,(cfg||{})[h.key]).rate }));
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
          {streaks.map(s=> <div key={s.key} style={{ background:C.panel2, borderRadius:10, padding:"14px 10px", textAlign:"center" }}><div style={{ fontSize:30, fontWeight:700, color:s.streak>0?s.color:C.faint, lineHeight:1 }}>{s.streak}<span style={{ fontSize:12, color:C.faint }}>{s.unit}</span></div><div style={{ fontSize:11, color:C.dim, marginTop:6 }}>{s.label}</div></div>)}
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
  const loadReal=()=>{ if(!window.confirm("Replace your day-type formats and default A/B weeks with your real timetable? (Your logged days stay untouched.)")) return; save(SEED_DAYTYPES); saveWeekMap(DEFAULT_WEEK); saveWeekMapB(DEFAULT_WEEK_B); setSelId(Object.keys(SEED_DAYTYPES)[0]); flash("Loaded your timetable"); };
  const delType=()=>{ if(Object.keys(dayTypes).length<=1) return; if(!confirmDel(`the "${sel?.name||"day type"}" format`)) return; const copy={...dayTypes}; delete copy[selId]; save(copy); setSelId(Object.keys(copy)[0]); };
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
            <button onClick={loadReal} style={{ ...addBtn, marginTop:6, borderColor:C.pink, color:C.pink }}>↺ Load my real timetable</button>
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

// ============ HABITS (contribution grid + streak rings + block linking) ============
const GRID_WEEKS = 18;
function HabitsView({ allDays, links, saveLinks, cfg, saveCfg }){
  const today = todayISO();
  const start = addDays(weekKeyOf(today), -(GRID_WEEKS-1)*7);
  const weeks = useMemo(()=>{ const arr=[]; for(let w=0;w<GRID_WEEKS;w++){ const col=[]; for(let d=0;d<7;d++) col.push(addDays(start, w*7+d)); arr.push(col); } return arr; },[start]);
  const sorted = useMemo(()=> Object.values(allDays).filter(Boolean).sort((a,b)=>a.date.localeCompare(b.date)),[allDays]);
  const updCfg = (key,patch)=> saveCfg({ ...cfg, [key]:{ ...DEFAULT_HCFG, ...(cfg[key]||{}), ...patch } });

  return (
    <div>
      <div style={{ textAlign:"center", marginBottom:20 }}>
        <div style={{ fontFamily:"'Caveat',cursive", fontSize:40, color:C.teal }}>Habits</div>
        <div style={{ fontSize:12, color:C.dim }}>Don't break the chain · last {GRID_WEEKS} weeks · ❄ freeze a day from the Today tab</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
        {HABITS.map(h=>{
          const c={ ...DEFAULT_HCFG, ...(cfg[h.key]||{}) };
          const s=habitStatsFor(sorted,h.key,links,c);
          const str=habitStrength(sorted,h.key,links);
          const quit=c.type==="quit";
          const unit=s.mode==="weekly"?"wk":"d";
          const streakWord=quit?"clean":"streak";
          return (
            <Panel key={h.key} accent={h.color} title={quit?`${h.label} · QUIT`:h.label} right={
              <select value={links[h.key]||""} onChange={e=>saveLinks({ ...links, [h.key]: e.target.value })} style={{ ...inp, fontSize:11, padding:"5px 7px", cursor:"pointer" }}>
                <option value="">Manual tick</option>
                {CAT_KEYS.map(cat=> <option key={cat} value={cat} style={{ background:C.panel }}>Auto: {cat} block</option>)}
              </select>}>
              <div style={{ display:"flex", gap:18, alignItems:"center", flexWrap:"wrap", marginBottom:12 }}>
                {s.mode==="weekly"
                  ? <Ring pct={s.now/s.per} color={h.color} value={`${s.now}/${s.per}`} label="this wk"/>
                  : <Ring pct={s.cur/30} color={h.color} value={s.cur} label={streakWord}/>}
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  <Stat label={quit?"Days clean":"Current"} value={s.cur} sub={unit} color={h.color}/>
                  <Stat label={quit?"Longest clean":"Longest"} value={s.lng} sub={unit} color={C.gold}/>
                  <Stat label="All-time" value={s.rate} sub="%" color={C.dim}/>
                </div>
              </div>
              {/* habit strength — decays gently on a miss instead of resetting to zero */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <span style={{ fontSize:11, color:C.faint, width:56 }}>Strength</span>
                <div style={{ flex:1, height:7, background:C.panel2, borderRadius:4, overflow:"hidden" }}><div style={{ width:`${str}%`, height:"100%", background:h.color, opacity:0.8 }}/></div>
                <span style={{ fontSize:12, color:str>=70?C.green:str>=35?C.gold:C.dim, fontWeight:600, width:34, textAlign:"right" }}>{str}%</span>
              </div>
              <div style={{ display:"flex", gap:3, overflowX:"auto", paddingBottom:4, marginBottom:12 }}>
                {weeks.map((col,wi)=> <div key={wi} style={{ display:"flex", flexDirection:"column", gap:3, flexShrink:0 }}>
                  {col.map(iso=>{ const d=allDays[iso]; const future=iso>today; const done=habitDone(d,h.key,links);
                    return <div key={iso} title={iso} style={{ width:12, height:12, borderRadius:3, border:d&&d.frozen?`1px solid ${C.blue}`:"none", background: future?"transparent" : d&&d.frozen?"transparent" : done? h.color : d? `${h.color}22` : C.panel2 }}/>; })}
                </div>)}
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                <span style={{ fontSize:11, color:C.faint }}>Goal:</span>
                {[[7,"Daily"],[5,"5×/wk"],[4,"4×/wk"],[3,"3×/wk"],[2,"2×/wk"],[1,"1×/wk"]].map(([n,l])=>
                  <button key={n} onClick={()=>updCfg(h.key,{per:n})} style={{ fontSize:11, padding:"4px 9px", borderRadius:12, cursor:"pointer", border:`1px solid ${c.per===n?h.color:C.line}`, background:c.per===n?h.color:"transparent", color:c.per===n?"#0b0b0b":C.dim }}>{l}</button>)}
                <button onClick={()=>updCfg(h.key,{type:quit?"build":"quit"})} style={{ fontSize:11, padding:"4px 9px", borderRadius:12, cursor:"pointer", marginLeft:"auto", border:`1px solid ${quit?C.red:C.line}`, background:quit?C.red:"transparent", color:quit?"#fff":C.dim }}>{quit?"Quit habit ✓":"Make it a quit habit"}</button>
              </div>
            </Panel>
          );
        })}
      </div>
      <Mini>Quota habits (e.g. 3×/wk) streak by weeks hit, and this week can't break until it's over. Frozen days show as ❄ outlines — they never break a chain. Strength is the honest score: one miss dents it, consistency rebuilds it.</Mini>
    </div>
  );
}

// ============ JOURNAL (daily reflections + weekly reviews, newest first) ============
function JournalView({ allDays, setDate, setTab }){
  const [reviews,setReviews] = useState([]);
  useEffect(()=>{ const out=[]; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k&&k.startsWith("lifeos:review:")){ try{ const r=JSON.parse(localStorage.getItem(k)); if(r&&(r.feedback||r.adapt1||r.adapt2||r.target1||r.target2)) out.push({ wk:k.replace("lifeos:review:",""), ...r }); }catch{} } } setReviews(out); },[allDays]);
  const entries = useMemo(()=>{
    const days = Object.values(allDays).filter(d=>d&&(d.feedback||d.rating>0)).map(d=>({ type:"day", date:d.date, rating:d.rating, bs:d.bs, text:d.feedback }));
    const wks = reviews.map(r=>({ type:"week", date:r.wk, ...r }));
    return [...days,...wks].sort((a,b)=> b.date.localeCompare(a.date));
  },[allDays,reviews]);

  return (
    <div>
      <div style={{ textAlign:"center", marginBottom:20 }}>
        <div style={{ fontFamily:"'Caveat',cursive", fontSize:40, color:C.teal }}>Journal</div>
        <div style={{ fontSize:12, color:C.dim }}>{entries.length} entr{entries.length===1?"y":"ies"} · your year, written down</div>
      </div>
      {entries.length===0 && <Empty big>Rate a day or leave feedback on the Today tab, or write a Weekly Review — they collect here as a scrollable journal.</Empty>}
      <div style={{ display:"flex", flexDirection:"column", gap:12, maxWidth:760, margin:"0 auto" }}>
        {entries.map((e,i)=> e.type==="day" ? (
          <div key={"d"+i} onClick={()=>{ setDate(e.date); setTab("today"); }} style={{ background:C.panel, border:`1px solid ${C.line}`, borderRadius:12, padding:16, cursor:"pointer" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
              <span style={{ fontSize:13, color:C.teal, fontWeight:600 }}>{fmt(e.date)}</span>
              <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                {e.bs && <span style={{ fontSize:9, fontWeight:700, color:"#fff", background:C.red, borderRadius:4, padding:"1px 5px" }}>BS</span>}
                {e.rating>0 && <span style={{ fontSize:12, color:C.red, fontWeight:700 }}>{e.rating}/10</span>}
              </div>
            </div>
            {e.text && <div style={{ fontSize:13, color:C.dim, lineHeight:1.5, whiteSpace:"pre-wrap" }}>{e.text}</div>}
          </div>
        ) : (
          <div key={"w"+i} style={{ background:C.panel, border:`1px solid ${C.cyan}55`, borderRadius:12, padding:16 }}>
            <div style={{ fontSize:13, color:C.cyan, fontWeight:600, marginBottom:8 }}>Weekly Review · week of {fmt(e.date)}</div>
            {e.feedback && <div style={{ fontSize:13, color:C.dim, lineHeight:1.5, whiteSpace:"pre-wrap", marginBottom:8 }}>{e.feedback}</div>}
            {(e.adapt1||e.adapt2) && <div style={{ fontSize:12, color:C.faint, marginBottom:4 }}><b style={{ color:C.cyan }}>Adapt:</b> {[e.adapt1,e.adapt2].filter(Boolean).join(" · ")}</div>}
            {(e.target1||e.target2) && <div style={{ fontSize:12, color:C.faint }}><b style={{ color:C.pink }}>Targets:</b> {[e.target1,e.target2].filter(Boolean).join(" · ")}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ FINANCE ============
const FIN_OUT_CATS = ["Food","Transport","Fun","Shopping","Subscriptions","Business","Other"];
const FIN_IN_CATS = ["Tuition","Gift","Pocket","Other"];
const FIN_CAT_COLOR = { Food:C.gold, Transport:C.blue, Fun:C.pink, Shopping:C.purple, Subscriptions:C.cyan, Business:C.teal, Other:C.dim, Tuition:C.green, Gift:C.green, Pocket:C.green };
const NW_MILESTONES = [100,500,1000,2500,5000,10000,25000,50000,100000];
function FinanceView({ finance,save,flash }){
  const isMobile = useIsMobile();
  const [sub,setSub] = useState("networth");
  const [form,setForm] = useState({ dir:"out", amount:"", cat:"Food", label:"", recurring:false });
  const totalNW = finance.accounts.reduce((s,a)=>s+(+a.balance||0),0);
  const addAccount=()=> save({ ...finance, accounts:[...finance.accounts,{ id:Date.now(),name:"New account",balance:0 }] });
  const updAccount=(id,p)=> save({ ...finance, accounts:finance.accounts.map(a=>a.id===id?{...a,...p}:a) });
  const delAccount=(id)=>{ if(!confirmDel("this account")) return; save({ ...finance, accounts:finance.accounts.filter(a=>a.id!==id) }); };
  const snapshot=()=>{ save({ ...finance, netWorthLog:[...finance.netWorthLog,{ date:todayISO(),value:totalNW }] }); flash("Snapshot saved"); };
  const addClient=()=> save({ ...finance, clients:[...finance.clients,{ id:Date.now(),name:"New client",rate:25,lessonsThisMonth:0,status:"Active" }] });
  const updClient=(id,p)=> save({ ...finance, clients:finance.clients.map(c=>c.id===id?{...c,...p}:c) });
  const delClient=(id)=>{ if(!confirmDel("this client")) return; save({ ...finance, clients:finance.clients.filter(c=>c.id!==id) }); };
  const monthlyRevenue = finance.clients.reduce((s,c)=>s+(+c.rate||0)*(+c.lessonsThisMonth||0),0);
  const logMonth=()=>{ save({ ...finance, lessonLog:[...finance.lessonLog,{ month:new Date().toLocaleDateString("en-GB",{month:"short",year:"2-digit"}),revenue:monthlyRevenue }] }); flash("Month logged"); };
  const L=finance.lump;
  const updLump=(p)=> save({ ...finance, lump:{ ...L, ...p } });
  const updAlloc=(id,p)=> updLump({ allocations:L.allocations.map(a=>a.id===id?{...a,...p}:a) });
  const totalPct = L.allocations.reduce((s,a)=>s+(+a.pct||0),0);
  const fv=(L.amount*Math.pow(1+(+L.expectedReturn/100),+L.years)).toFixed(0);
  const isaAmount = L.allocations.filter(a=>/isa|index|invest/i.test(a.name)).reduce((s,a)=>s+L.amount*a.pct/100,0);

  // ----- money in/out + goals -----
  const tx = finance.transactions||[];
  const goals = finance.goals||[];
  const thisMonth = todayISO().slice(0,7);
  const monthTx = tx.filter(t=>String(t.date).slice(0,7)===thisMonth);
  const inSum = monthTx.filter(t=>t.dir==="in").reduce((s,t)=>s+(+t.amount||0),0);
  const outSum = monthTx.filter(t=>t.dir==="out").reduce((s,t)=>s+(+t.amount||0),0);
  const net = inSum-outSum;
  const byCat = {}; monthTx.filter(t=>t.dir==="out").forEach(t=>{ byCat[t.cat]=(byCat[t.cat]||0)+(+t.amount||0); });
  const catRows = Object.entries(byCat).sort((a,b)=>b[1]-a[1]);
  const maxCat = Math.max(1,...catRows.map(r=>r[1]));
  const recurring = tx.filter(t=>t.recurring);
  const recurringOut = recurring.filter(t=>t.dir==="out").reduce((s,t)=>s+(+t.amount||0),0);
  const addTx=(t)=> save({ ...finance, transactions:[...tx, { id:Date.now(), ...t }] });
  const delTx=(id)=> save({ ...finance, transactions:tx.filter(t=>t.id!==id) });
  const submitTx=()=>{ const amt=+form.amount; if(!amt){ flash("Enter an amount"); return; } addTx({ date:todayISO(), dir:form.dir, amount:amt, cat:form.cat, label:form.label.trim(), recurring:form.recurring }); setForm({ ...form, amount:"", label:"", recurring:false }); flash("Logged"); };
  const addGoal=()=> save({ ...finance, goals:[...goals, { id:Date.now(), name:"New goal", target:200, saved:0, color:C.gold }] });
  const updGoal=(id,p)=> save({ ...finance, goals:goals.map(g=>g.id===id?{...g,...p}:g) });
  const delGoal=(id)=>{ if(!confirmDel("this goal")) return; save({ ...finance, goals:goals.filter(g=>g.id!==id) }); };
  const nextMile = NW_MILESTONES.find(m=>m>totalNW) || (Math.ceil(totalNW/50000)*50000+50000);
  const prevMile = [...NW_MILESTONES].reverse().find(m=>m<=totalNW) || 0;
  const milePct = (totalNW-prevMile)/(nextMile-prevMile);

  return (
    <div>
      <div style={{ textAlign:"center", marginBottom:18 }}><div style={{ fontFamily:"'Caveat',cursive", fontSize:40, color:C.teal }}>Finance</div></div>
      <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:20, flexWrap:"wrap" }}>
        {[["networth","Net Worth"],["cashflow","Money In/Out"],["goals","Goals"],["business","Tuition"],["lump","£10k Plan"]].map(([k,l])=> <button key={k} onClick={()=>setSub(k)} style={{ padding:"8px 16px", borderRadius:20, cursor:"pointer", fontSize:13, fontWeight:600, border:`1px solid ${sub===k?C.teal:C.line}`, background:sub===k?C.teal:"transparent", color:sub===k?"#001014":C.dim }}>{l}</button>)}
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
          <Panel accent={C.gold} title="Next Milestone" style={{ gridColumn:isMobile?"auto":"1 / -1" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8 }}>
              <span style={{ fontSize:13, color:C.dim }}>£{totalNW.toLocaleString()} → next: <b style={{ color:C.gold }}>£{nextMile.toLocaleString()}</b></span>
              <span style={{ fontSize:12, color:C.faint }}>£{Math.max(0,nextMile-totalNW).toLocaleString()} to go</span>
            </div>
            <div style={{ height:12, background:C.panel2, borderRadius:6, overflow:"hidden" }}><div style={{ width:`${Math.min(100,Math.max(0,milePct*100))}%`, height:"100%", background:C.gold }}/></div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:12 }}>
              {NW_MILESTONES.map(m=> <span key={m} style={{ fontSize:11, padding:"3px 8px", borderRadius:10, background:totalNW>=m?C.gold:C.panel2, color:totalNW>=m?"#0b0b0b":C.faint, fontWeight:totalNW>=m?700:400 }}>{totalNW>=m?"✓ ":""}£{m>=1000?`${m/1000}k`:m}</span>)}
            </div>
          </Panel>
        </div>
      )}

      {sub==="cashflow" && (
        <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:18 }}>
          <Panel accent={C.green} title="Log money in / out">
            <div style={{ display:"flex", gap:6, marginBottom:12 }}>
              {[["out","Spent",C.red],["in","Received",C.green]].map(([d,l,col])=> <button key={d} onClick={()=>setForm({ ...form, dir:d, cat: d==="out"?"Food":"Tuition" })} style={{ flex:1, padding:"9px", borderRadius:8, cursor:"pointer", fontWeight:700, fontSize:13, border:`1px solid ${form.dir===d?col:C.line}`, background:form.dir===d?col:"transparent", color:form.dir===d?"#fff":C.dim }}>{l}</button>)}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
              <span style={{ fontSize:20, color:C.dim }}>£</span>
              <input type="number" inputMode="decimal" value={form.amount} onChange={e=>setForm({ ...form, amount:e.target.value })} placeholder="0" style={{ ...inp, flex:1, fontSize:22, fontWeight:700 }}/>
            </div>
            <Label>Category</Label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:12 }}>
              {(form.dir==="out"?FIN_OUT_CATS:FIN_IN_CATS).map(c=> <button key={c} onClick={()=>setForm({ ...form, cat:c })} style={{ fontSize:12, padding:"6px 10px", borderRadius:14, cursor:"pointer", border:`1px solid ${form.cat===c?(FIN_CAT_COLOR[c]||C.teal):C.line}`, background:form.cat===c?(FIN_CAT_COLOR[c]||C.teal):"transparent", color:form.cat===c?"#0b0b0b":C.dim, fontWeight:form.cat===c?700:400 }}>{c}</button>)}
            </div>
            <input value={form.label} onChange={e=>setForm({ ...form, label:e.target.value })} placeholder="Note (optional) e.g. Spotify, lesson w/ Sam" style={{ ...inp, width:"100%", marginBottom:12 }}/>
            <label style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:C.dim, marginBottom:12, cursor:"pointer" }}><Check on={form.recurring} color={C.cyan} onClick={()=>setForm({ ...form, recurring:!form.recurring })} size={18}/> Repeats every month (subscription / regular)</label>
            <button onClick={submitTx} style={{ ...addBtn, borderColor:C.green, color:C.green }}>+ Add to log</button>
          </Panel>

          <Panel accent={C.teal} title={`This month · ${MONTHS[new Date().getMonth()].slice(0,3)}`}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:16 }}>
              <Stat label="In" value={`£${inSum}`} color={C.green}/>
              <Stat label="Out" value={`£${outSum}`} color={C.red}/>
              <Stat label="Net" value={`${net<0?"-":""}£${Math.abs(net)}`} color={net>=0?C.green:C.red}/>
            </div>
            <Label>Where it went</Label>
            {catRows.length===0 ? <Empty>No spending logged this month yet.</Empty> : catRows.map(([c,v])=> <div key={c} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}><span style={{ width:84, fontSize:12, color:C.dim }}>{c}</span><div style={{ flex:1, height:9, background:C.panel2, borderRadius:5, overflow:"hidden" }}><div style={{ width:`${(v/maxCat)*100}%`, height:"100%", background:FIN_CAT_COLOR[c]||C.dim }}/></div><span style={{ width:48, textAlign:"right", fontSize:12, color:C.ink }}>£{v}</span></div>)}
          </Panel>

          <Panel accent={C.cyan} title="Monthly commitments" right={<span style={{ fontSize:13, fontWeight:700, color:C.cyan }}>£{recurringOut}/mo</span>}>
            {recurring.length===0 ? <Empty>Mark a payment as "repeats every month" to track subscriptions and regular costs here.</Empty> : recurring.map(t=> <div key={t.id} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}><span style={{ width:8,height:8,borderRadius:"50%",background:FIN_CAT_COLOR[t.cat]||C.dim }}/><span style={{ flex:1, fontSize:13, color:C.ink }}>{t.label||t.cat}</span><span style={{ fontSize:13, color:t.dir==="out"?C.red:C.green }}>{t.dir==="out"?"-":"+"}£{t.amount}</span><button onClick={()=>delTx(t.id)} style={{ background:"none", border:"none", color:C.faint, cursor:"pointer", fontSize:16 }}>×</button></div>)}
          </Panel>

          <Panel accent={C.gold} title="Recent" style={{ gridColumn:isMobile?"auto":"1 / -1" }}>
            {tx.length===0 ? <Empty big>Log your tuition income and your spending above. Seeing the flow — not just the balance — is how every money app starts.</Empty> :
              [...tx].sort((a,b)=>String(b.date).localeCompare(String(a.date))||b.id-a.id).slice(0,40).map(t=> <div key={t.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:`1px solid ${C.line}` }}><span style={{ width:8,height:8,borderRadius:"50%",background:FIN_CAT_COLOR[t.cat]||C.dim,flexShrink:0 }}/><div style={{ flex:1, minWidth:0 }}><div style={{ fontSize:13, color:C.ink, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.label||t.cat}{t.recurring?" ↻":""}</div><div style={{ fontSize:10, color:C.faint }}>{t.cat} · {fmt(t.date)}</div></div><span style={{ fontSize:14, fontWeight:600, color:t.dir==="out"?C.red:C.green }}>{t.dir==="out"?"-":"+"}£{t.amount}</span><button onClick={()=>delTx(t.id)} style={{ background:"none", border:"none", color:C.faint, cursor:"pointer", fontSize:16 }}>×</button></div>)}
          </Panel>
        </div>
      )}

      {sub==="goals" && (
        <div style={{ display:"grid", gridTemplateColumns:isMobile?"1fr":"1fr 1fr", gap:18 }}>
          {goals.length===0 && <Panel accent={C.gold} title="Savings goals" style={{ gridColumn:"1 / -1" }}><Empty big>Set goals like "First car", "Uni fund" or "New laptop" with a target — then watch the bar fill as your tuition income stacks up.</Empty></Panel>}
          {goals.map(g=>{ const pct=g.target>0?Math.min(100,(g.saved/g.target)*100):0; const eta = net>0 && g.saved<g.target ? Math.ceil((g.target-g.saved)/net) : null;
            return (
              <Panel key={g.id} accent={g.color} title={null}>
                <div style={{ display:"flex", gap:8, marginBottom:10, alignItems:"center" }}>
                  <input value={g.name} onChange={e=>updGoal(g.id,{name:e.target.value})} style={{ ...inp, flex:1, fontSize:15, fontWeight:600 }}/>
                  <div style={{ display:"flex", gap:4 }}>{[C.gold,C.green,C.blue,C.pink,C.purple,C.teal].map(col=> <button key={col} onClick={()=>updGoal(g.id,{color:col})} style={{ width:18,height:18,borderRadius:"50%",background:col,cursor:"pointer",border:g.color===col?"2px solid #fff":"2px solid transparent",padding:0 }}/>)}</div>
                  <button onClick={()=>delGoal(g.id)} style={delBtn}>×</button>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}>
                  <span style={{ fontSize:22, fontWeight:700, color:g.color }}>£{(+g.saved||0).toLocaleString()}</span>
                  <span style={{ fontSize:13, color:C.faint }}>of £{(+g.target||0).toLocaleString()} · {Math.round(pct)}%</span>
                </div>
                <div style={{ height:12, background:C.panel2, borderRadius:6, overflow:"hidden", marginBottom:12 }}><div style={{ width:`${pct}%`, height:"100%", background:g.color }}/></div>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                  <span style={{ fontSize:11, color:C.faint }}>Saved £</span>
                  <input type="number" value={g.saved} onChange={e=>updGoal(g.id,{saved:+e.target.value})} style={{ ...inp, width:80 }}/>
                  <span style={{ fontSize:11, color:C.faint }}>Target £</span>
                  <input type="number" value={g.target} onChange={e=>updGoal(g.id,{target:+e.target.value})} style={{ ...inp, width:80 }}/>
                  {[10,25,50].map(n=> <button key={n} onClick={()=>updGoal(g.id,{saved:(+g.saved||0)+n})} style={{ ...stepBtn, width:"auto", padding:"0 8px", fontSize:12 }}>+{n}</button>)}
                </div>
                {pct>=100 ? <div style={{ marginTop:10, fontSize:12, color:C.green, fontWeight:600 }}>🎉 Goal reached!</div> : eta!==null && <div style={{ marginTop:10, fontSize:11, color:C.faint }}>At this month's saving rate (£{net}/mo): ~{eta} month{eta!==1?"s":""} to go</div>}
              </Panel>
            );
          })}
          <button onClick={addGoal} style={{ ...addBtn, gridColumn:"1 / -1" }}>+ New savings goal</button>
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
