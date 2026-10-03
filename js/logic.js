"use strict";

/* ================= STATE ================= */
let squad=SQUAD_DEFAULT.map(p=>Object.assign({},p));
let matches={};
let curId=null;
const ui={view:'board',tab:'plan',phase:'ip',tool:'move',sel:null,ov:{zones:false,opp:true,net:false},readOnly:false,showOut:false};

/* ================= HELPERS ================= */
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const M=()=>matches[curId];
const P=id=>squad.find(p=>p.id===id);
const nm=id=>{const p=P(id);return p?p.name:'';};
const has=(p,t)=>!!p&&(p.traits||[]).some(x=>x.toLowerCase()===t.toLowerCase());
const total=m=>(+m.halfLen||30)*(+m.halves||2);
const lab=(m,slot)=>FORM[m.formation].lab[slot];
const avail=(m,id)=>m.avail[id]||'maybe';
const uid=()=>Math.random().toString(36).slice(2,9);
function fmtDate(d){ if(!d) return 'Date to be set'; const x=new Date(d+'T12:00:00'); if(isNaN(x)) return d; return x.toLocaleDateString('en-IE',{weekday:'short',day:'numeric',month:'short'}); }
function slotOf(m,pid){ return SLOTS.find(s=>m.lineup[s]===pid)||null; }
function onPitch(m){ return SLOTS.map(s=>m.lineup[s]).filter(Boolean); }

/* ================= FIT ================= */
function fit(p,label){
 if(!p) return {score:0,tier:'unknown'};
 const code=CODE_OF[label]; const pos=p.pos||[];
 if(code==='GK'){ if(pos.includes('GK')) return {score:3,tier:'natural'}; return {score:-4,tier:'out'}; }
 if(pos.length===1&&pos[0]==='GK') return {score:-2,tier:'out'};
 if(pos.includes('ANY')) return {score:2.4,tier:'listed'};
 if(!pos.length) return {score:1,tier:'unknown'};
 const i=pos.indexOf(code);
 if(i===0) return {score:3,tier:'natural'};
 if(i>0) return {score:2.9-0.15*i,tier:'listed'};
 let adj=ADJ[code].slice(); if(label==='LWB') adj.push('LW'); if(label==='RWB') adj.push('RW'); if(label==='LM') adj.push('LB'); if(label==='RM') adj.push('RB');
 if(pos.some(c=>adj.includes(c))) return {score:1.4,tier:'cover'};
 return {score:0,tier:'out'};
}
const fitOf=(m,slot,pid)=>fit(P(pid),lab(m,slot));

/* Hungarian algorithm (rows <= cols), minimises cost */
function hungarian(cost){
 const n=cost.length,m=cost[0].length,INF=1e12;
 const u=new Array(n+1).fill(0),v=new Array(m+1).fill(0),p=new Array(m+1).fill(0),way=new Array(m+1).fill(0);
 for(let i=1;i<=n;i++){
  p[0]=i; let j0=0; const minv=new Array(m+1).fill(INF), used=new Array(m+1).fill(false);
  do{ used[j0]=true; const i0=p[j0]; let delta=INF,j1=0;
   for(let j=1;j<=m;j++) if(!used[j]){ const cur=cost[i0-1][j-1]-u[i0]-v[j]; if(cur<minv[j]){minv[j]=cur;way[j]=j0;} if(minv[j]<delta){delta=minv[j];j1=j;} }
   for(let j=0;j<=m;j++){ if(used[j]){u[p[j]]+=delta;v[j]-=delta;} else minv[j]-=delta; }
   j0=j1; }while(p[j0]!==0);
  do{ const j1=way[j0]; p[j0]=p[j1]; j0=j1; }while(j0);
 }
 const ans=new Array(n).fill(-1); for(let j=1;j<=m;j++) if(p[j]) ans[p[j]-1]=j-1; return ans;
}
function assign(m,pool,scoreFn){
 const cols=pool.slice(); while(cols.length<SLOTS.length) cols.push(null);
 const cost=SLOTS.map(s=>cols.map(pid=>pid?-scoreFn(s,pid):5));
 const a=hungarian(cost); const out={}; SLOTS.forEach((s,i)=>{out[s]=cols[a[i]]||null;}); return out;
}
function bestXI(m){
 const pool=squad.filter(p=>avail(m,p.id)!=='no').map(p=>p.id);
 return assign(m,pool,(s,pid)=>fitOf(m,s,pid).score-(avail(m,pid)==='maybe'?1.5:0)+(m.lineup[s]===pid?0.25:0));
}
function refitXI(m){
 const pool=onPitch(m);
 return assign(m,pool,(s,pid)=>fitOf(m,s,pid).score+(m.lineup[s]===pid?0.2:0));
}

/* ================= SHAPE ================= */
function anchorSlot(m){
 const F=FORM[m.formation];
 if(!F.pivot) return 'DM1';
 if(m.anchor==='DM1'||m.anchor==='DM2') return m.anchor;
 const a=fitOf(m,'DM1',m.lineup.DM1).score, b=fitOf(m,'DM2',m.lineup.DM2).score;
 const ca=P(m.lineup.DM1), cb=P(m.lineup.DM2);
 const sa=a+((ca&&ca.pos.includes('CDM'))?1:0), sb=b+((cb&&cb.pos.includes('CDM'))?1:0);
 return sb>sa?'DM2':'DM1';
}
function resolveFb(m,fb){
 if(fb!=='one') return fb;
 const att=pid=>{const p=P(pid); if(!p) return 0; return (p.pos.includes('LW')||p.pos.includes('RW')?1:0)+(has(p,'Stamina')?1:0)+(has(p,'Pace')?1:0);};
 return att(m.lineup.LB)>att(m.lineup.RB)?'LB':'RB';
}
function resolveAnchor(m,a,formation){
 if(a!=='one') return a;
 const F=FORM[formation||m.formation]; if(!F.pivot) return 'DM1';
 const t=Object.assign({},m,{anchor:'auto',formation:formation||m.formation}); return anchorSlot(t);
}
function computePos(m,slot,phase){
 const F=FORM[m.formation]; let [x,y]=F[phase][slot];
 if(slot==='GK') return [x,y];
 const shift={deep:-7,mid:0,high:8}[m.block]||0;
 const front=y<=30;
 y-=shift*(phase==='oop'?1:0.6)*(front?0.55:1);
 const w=({narrow:0.86,normal:1,wide:1.1}[m.width]||1)*(phase==='oop'?0.94:1);
 x=50+(x-50)*w;
 if(phase==='ip'&&F.four){
  const goes=s=>m.fb==='both'||m.fb===s;
  if(slot==='LB'||slot==='RB'){
   if(goes(slot)){ y-=26; x+=slot==='LB'?-4:4; }
   else if(m.fb!=='none'){ y+=5; x=50+(x-50)*0.74; }
  }
  if(m.fb==='LB'&&slot==='LCB') x-=3;
  if(m.fb==='RB'&&slot==='RCB') x+=3;
  const wing=F.lab[slot];
  if(((slot==='LW'&&goes('LB'))||(slot==='RW'&&goes('RB')))&&['LW','RW','LM','RM'].includes(wing)){ x=slot==='LW'?31:69; y+=3; }
  if(F.pivot&&(slot==='DM1'||slot==='DM2')&&m.anchor!=='both'){ if(slot===anchorSlot(m)) y+=4; else y-=11; }
  if(m.fb==='both'){
   const hold=F.pivot?(m.anchor==='both'?null:anchorSlot(m)):'DM1';
   if(!F.pivot&&slot==='DM1'){ y=Math.max(y,F.ip.LCB[1]-3); x=50; }
   if(!F.pivot&&(slot==='LCB'||slot==='RCB')) x+=slot==='LCB'?-8:8;
   if(F.pivot&&hold&&slot===hold) y+=6;
  }
 }
 const o=(m.offsets[phase]||{})[slot]; if(o){x+=o[0];y+=o[1];}
 return [clamp(x,3,97),clamp(y,3,97)];
}
function oppPos(shape,phase){
 if(!FORM[shape]) return [];
 const F=FORM[shape]; const ph=phase==='ip'?'oop':'ip';
 return SLOTS.filter(s=>s!=='GK').map(s=>{const [x,y]=F[ph][s]; return [100-x,100-y];}).concat([[50,100-F[ph].GK[1]]]);
}
function zoneOf(x,y){ return [x<33?0:x<67?1:2, y<33.3?0:y<66.6?1:2]; }
function overloads(m,phase){
 if(m.oppShape==='unknown') return null;
 const us=Array.from({length:3},()=>[0,0,0]), them=Array.from({length:3},()=>[0,0,0]);
 SLOTS.forEach(s=>{ if(s==='GK') return; const [x,y]=computePos(m,s,phase); const [c,r]=zoneOf(x,y); us[r][c]++; });
 const op=oppPos(m.oppShape,phase); op.slice(0,10).forEach(([x,y])=>{const [c,r]=zoneOf(x,y); them[r][c]++;});
 return {us,them};
}

/* ================= TEXT ================= */
function nameIn(m,slot){ const id=m.lineup[slot]; return id?esc(nm(id)):'<i>empty</i>'; }
function tpl(m,s){
 return s.replace(/\{([A-Za-z0-9]+)\}/g,(x,k)=>{
  if(k==='HOLD') return nameIn(m,anchorSlot(m));
  if(k==='fbGo'){ const f=resolveFb(m,m.fb==='none'||m.fb==='both'?'one':m.fb); return nameIn(m,f); }
  return SLOTS.includes(k)?nameIn(m,k):x;
 });
}
const plain=html=>html.replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
const BLOCK_TXT={deep:'Low block',mid:'Mid block',high:'High press'};
const WIDTH_TXT={narrow:'Narrow',normal:'Normal width',wide:'Wide'};
function fbTxt(m,fb){ fb=resolveFb(m,fb); if(fb==='none') return 'both fullbacks stay home'; if(fb==='both') return 'both fullbacks push on'; return (m.lineup[fb]?nm(m.lineup[fb]):fb)+' pushes on, the other fullback tucks in'; }
function anchorTxt(m,a,f){ if(!FORM[f].pivot) return ''; if(a==='both') return 'both holding midfielders sit'; const s=a==='one'?resolveAnchor(m,'one',f):a; return (m.lineup[s]?nm(m.lineup[s]):'one')+' holds, the other joins attacks'; }

/* ================= SUGGESTION ENGINE ================= */
function suggest(m){
 const st=STYLES[m.style]||STYLES.unknown;
 const r={formation:st.f,block:st.block,width:st.width,fb:st.fb,anchor:st.anchor,why:[]};
 const d=(+m.live.gf||0)-(+m.live.ga||0), T=total(m), t=(+m.live.minute||0)/T;
 const down=b=>({high:'mid',mid:'deep',deep:'deep'}[b]), up=b=>({deep:'mid',mid:'high',high:'high'}[b]);
 const stTips=[];
 if(d>=1){
  r.block=down(r.block); r.fb='none'; r.anchor='both';
  if(d===1&&t>=0.8){ r.formation='5-4-1'; r.block='deep'; stTips.push('<b>See it out.</b> Late with a one-goal lead: five at the back, everyone behind the ball. Clear your lines high and wide, win second balls, and take the ball into the corners.'); }
  else if(d>=2&&t>=0.6){ r.formation='4-1-4-1'; stTips.push('<b>Two up: control, do not chase.</b> Stay compact and make them play around us. Keep the ball when we have it; there is no need to force anything.'); }
  else stTips.push('<b>Protect the lead.</b> Fullbacks stay home and both holding midfielders sit. Slow restarts down and avoid risky passes in our own third.');
 } else if(d===0){
  if(t>=0.75){ r.block=up(r.block); if(r.fb==='none') r.fb='one'; stTips.push('<b>Level and late: one more push.</b> One fullback goes, wingers stay high, and two centre backs plus a holder stay back so a counter cannot kill us.'); }
 } else if(d===-1){
  if(t<0.3) stTips.push('<b>Plenty of time.</b> One goal down early changes nothing. Stick to the plan and keep the shape.');
  else{
   if(!['4-3-3','4-1-2-1-2','3-5-2'].includes(r.formation)){ r.formation='4-4-2'; stTips.push('<b>Second striker on.</b> Go to two up front so their centre backs cannot both cover. Push the line up to keep the team short.'); }
   else stTips.push('<b>Push up.</b> Keep three high and squeeze the pitch so we win the ball closer to their goal.');
   r.block=up(r.block); r.anchor='one';
   if(t>=0.7){ r.fb='both'; r.block='high'; stTips.push('<b>Final push.</b> Both fullbacks go, one holder stays as the safety. Get the ball into the box early and follow up every knock-down.'); }
  }
 } else {
  r.formation='4-3-3'; r.block='high'; r.width='wide'; r.fb='both'; r.anchor='one';
  stTips.push('<b>Two or more down: go for it.</b> Three up front, both fullbacks forward, a single holder in front of the centre backs.');
 }
 if(m.pitch==='heavy'){ if(r.block==='high') r.block='mid'; stTips.push('<b>Heavy pitch.</b> The ball holds up and short passes die. Play into the channels, win the second ball, and never pass across our own box.'); }
 if(m.pitch==='wet'){ stTips.push('<b>Wet and quick.</b> Shoot early and low: keepers spill on a slick surface. Follow every shot in.'); }
 if(m.pitch==='wind'){ stTips.push('<b>Windy.</b> With the wind: go long, shoot from distance, push the line up. Against it: keep the ball on the floor and drop five yards.'); }
 r.fb=resolveFb(m,r.fb);
 r.anchorRes=resolveAnchor(m,r.anchor,r.formation);
 r.stTips=stTips;
 return r;
}
function sameAsSuggestion(m,r){
 const fbm=m.fb, anc=FORM[m.formation].pivot?m.anchor:'x', anr=FORM[r.formation].pivot?(r.anchor==='both'?'both':r.anchorRes):'x';
 return m.formation===r.formation&&m.block===r.block&&m.width===r.width&&(!FORM[r.formation].four||fbm===r.fb)&&anc===anr;
}
function subTip(m){
 const bench=squad.filter(p=>avail(m,p.id)==='yes'&&!slotOf(m,p.id)).length;
 if(!bench) return '<b>No bench.</b> With no subs available, manage energy: a mid block rather than a high press, and walk when the ball is dead.';
 return '<b>Rolling subs are a weapon.</b> '+bench+' fresh players are available. Rotate the pressing roles (wingers, striker, fullbacks) every 15 to 20 minutes; keep {GK}, the centre backs and {HOLD} on for organisation. The Rotation tab plans it.';
}
