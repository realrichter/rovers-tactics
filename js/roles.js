"use strict";

/* ================= ROLES ================= */
function job(m,slot){
 const F=FORM[m.formation], L=F.lab[slot], p=P(m.lineup[slot]);
 const n=s=>nameIn(m,s);
 const goes=s=>m.fb==='both'||m.fb===s;
 let ip='',oop='',extra=[];
 const partnerCB=slot==='LCB'?'RCB':'LCB';
 switch(L){
 case 'GK':
  ip='Start attacks. Play short to the centre backs only when they have split wide and are free. If the press is on, go long early to '+n('ST')+' or the channel behind their fullback.';
  oop='Organise the line: you see everything, so push it up when the ball goes back. Own the six-yard box on crosses and call early.';
  if(has(p,'Long passing')) extra.push('Your range is a weapon. Aim long balls into the channels for the wide players rather than only at the striker\'s head.');
  if(has(p,'Commands box')) extra.push('Dominate set pieces: claim anything inside the six-yard box.');
  break;
 case 'LB': case 'RB': {
  const w=slot==='LB'?'LW':'RW';
  if(!F.four){ break; }
  if(goes(slot)) ip='Overlap '+n(w)+'. When you go, he comes inside into the half-space to leave you the touchline. Get back the moment we lose it.';
  else if(m.fb!=='none') ip='Stay home. Tuck in next to the centre backs to make a back three; you are the rest defence when the other fullback is up.';
  else ip='Stay home and defend first. Give a simple outlet down the line to '+n(w)+' and support from behind.';
  oop='Move with the back four: squeeze in when the ball is on the far side. Show their winger down the line, never inside.';
  break; }
 case 'LWB': case 'RWB':
  ip='You are all the width on this side. Stay high and touchline-wide so the midfield can play inside; deliver early crosses.';
  oop='Drop into a back five when they are in our half. Jump out to their wide player only when the ball goes to him.';
  extra.push('The most demanding role on the pitch: a natural one to rotate with rolling subs.');
  break;
 case 'CB':
  if(slot==='DM1'){ ip='Middle of the back three. Stay central, recycle the ball and spread it to the wide centre backs.'; oop='The sweeper: cover behind both sides, attack every long ball and organise the line.'; }
  else if(!F.four){ ip='Wide centre back: carry the ball into midfield when no one closes you down.'; oop='Cover the channel behind your wing-back and step to their striker when he drops.'; }
  else{
   ip='Split wide when '+n('GK')+' has it. Pass into midfield only if the receiver is facing forward; otherwise to the fullback or long.';
   oop='One steps, one covers: if '+n(partnerCB)+' attacks the ball, drop in behind him. Hold the line together and talk constantly.';
  }
  if(has(p,'Short')) extra.push('Aerial note: let '+n(partnerCB)+' or the holding midfielder attack high balls; you read the knock-down and sweep.');
  if(has(p,'Carries forward')) extra.push('Step into midfield with the ball when the space is there, but only when the holding midfielder can drop in for you.');
  break;
 case 'DM':
  if(F.pivot){
   const hold=m.anchor==='both'||anchorSlot(m)===slot;
   ip=hold?'You hold. Stay in front of the centre backs, always available behind the ball, and switch play side to side.':'You are the free one of the two. Carry the ball forward and join '+n('AM')+' between the lines, but be back the moment we lose it.';
  } else {
   ip='Always available behind the ball. Against a front two, drop between the centre backs to make a back three so the fullbacks can push on.';
  }
  oop='Guard the space in front of the centre backs. Do not chase the ball wide; block passes into their striker and win the second balls.';
  if(has(p,'Stamina')) extra.push('Your engine covers the ground; use it to support both fullbacks.');
  break;
 case 'CM':
  if(F.pivot){ ip='Two in the middle: one goes, one stays. Never both forward at once.'; }
  else ip='Box-to-box. Support the attack from the half-space and arrive late at the edge of the box for cutbacks.';
  oop='Press their midfielder when he receives facing his own goal; otherwise hold your zone and stay connected to the holder.';
  if(has(p,'Stamina')) extra.push('Your stamina makes you the first-choice presser in midfield.');
  break;
 case 'AM':
  ip='Find the pocket between their midfield and defence. Receive half-turned, then play '+n('ST')+' or the wide players in.';
  oop='First screen behind the striker: mark their deepest midfielder so they cannot build through the middle.';
  if(has(p,'Creative')||has(p,'Technical')) extra.push('You are the creative hub. Demand the ball and take risks in the final third.');
  break;
 case 'LW': case 'RW': case 'LM': case 'RM': {
  const fbS=(slot==='LW')?'LB':'RB';
  const mid=L==='LM'||L==='RM';
  if(F.four&&goes(fbS)) ip='Come inside into the half-space when '+n(fbS)+' overlaps: two players in one lane is one too many. Attack the far post when the ball is on the other side.';
  else ip=mid?'Hold the width and support '+n('ST')+'. Cross early and arrive at the far post.':'Stay high and wide to pin their fullback. Go 1 v 1 when isolated; cut inside when there is a lane.';
  oop=mid?'Track their fullback all the way. You are the fourth man of the midfield line.':'Track their fullback and drop to the midfield line so we defend in a block of eight.';
  if(has(p,'Aerial threat')) extra.push('Your header is a weapon: arrive at the back post on crosses from the other flank.');
  if(has(p,'Runs in behind')) extra.push('Time runs behind their fullback for '+n('GK')+'\'s long balls.');
  if(has(p,'Technical')) extra.push('Keep it simple when outnumbered; release early so the attack stays quick.');
  break; }
 case 'ST': {
  const pair=['4-4-2','4-1-2-1-2','3-5-2'].includes(m.formation);
  if(pair){ const other=slot==='ST'?(m.formation==='4-4-2'?'AM':m.formation==='3-5-2'?'LW':'RW'):'ST'; ip='Split their centre backs with '+n(other)+': one drops short to link, the other runs in behind.'; }
  else ip='Pin their centre backs. Hold it up with your back to goal, lay it off to '+n('AM')+', and spin in behind when a winger has it facing forward.';
  oop='First defender. Curve your run to cut out one side and force them where we are strong. Sprint at backwards passes and heavy touches.';
  if(has(p,'Physical')) extra.push('Target player: '+n('GK')+'\'s long balls aim for you. Win the flick-on and the midfield runs onto it.');
  break; }
 }
 return {ip,oop,extra,label:L};
}

/* ================= CHECKS ================= */
function checks(m){
 const out=[]; const add=(lvl,txt)=>out.push({lvl,txt});
 const F=FORM[m.formation];
 SLOTS.forEach(s=>{
  const id=m.lineup[s]; const L=F.lab[s];
  if(!id){ add('err','No one at '+LABEL_FULL[L].toLowerCase()+' ('+L+').'); return; }
  const a=avail(m,id);
  if(a==='no') add('err',esc(nm(id))+' is marked out but is in the starting XI ('+L+').');
  else if(a==='maybe') add('warn',esc(nm(id))+' is not confirmed for this match.');
  const f=fitOf(m,s,id);
  if(f.tier==='out'){
   const best=squad.filter(p=>avail(m,p.id)==='yes'&&!slotOf(m,p.id)).map(p=>({p,f:fit(p,L)})).filter(x=>x.f.score>=2).sort((a,b)=>b.f.score-a.f.score)[0];
   add('warn',esc(nm(id))+' is out of position at '+L+' (listed: '+(P(id).pos.join(', ')||'none')+').'+(best?' '+esc(best.p.name)+' on the bench lists it.':''));
  }
 });
 const cap=m.captain, vc=m.vice;
 if(!cap) add('warn','No captain picked for this match.');
 else if(avail(m,cap)==='no') add('err',esc(nm(cap))+' is captain but is unavailable. Pick a new captain.');
 else if(!slotOf(m,cap)) add('info',esc(nm(cap))+' starts on the bench, so '+(vc&&slotOf(m,vc)?esc(nm(vc)):'the vice-captain')+' wears the armband at kick-off.');
 if(!vc) add('info','No vice-captain set. With rolling subs the armband changes hands often; pick one.');
 else if(vc===cap) add('warn','Captain and vice-captain are the same player.');
 else if(avail(m,vc)==='no') add('warn',esc(nm(vc))+' is vice-captain but unavailable.');
 const gk=m.lineup.GK;
 const backupGK=squad.filter(p=>p.id!==gk&&avail(m,p.id)==='yes'&&p.pos.includes('GK'));
 if(!backupGK.length){
  const tall=squad.filter(p=>p.id!==gk&&avail(m,p.id)==='yes'&&has(p,'Tall')).map(p=>esc(p.name));
  add('warn','No backup goalkeeper. Agree an emergency keeper before kick-off'+(tall.length?' (tall options: '+tall.join(', ')+')':'')+'.');
 }
 if(F.four){
  const cbs=['LCB','RCB'].map(s=>P(m.lineup[s])).filter(Boolean);
  const short=cbs.filter(p=>has(p,'Short'));
  if(short.length&&['direct','physical'].includes(m.style)){
   const opts=squad.filter(p=>avail(m,p.id)==='yes'&&!slotOf(m,p.id)&&(has(p,'Tall')||has(p,'Physical'))&&p.pos.some(c=>['CB','CDM','ANY'].includes(c))).map(p=>esc(p.name));
   add('warn','Aerial mismatch: '+short.map(p=>esc(p.name)).join(', ')+' at centre back against a '+(m.style==='direct'?'long-ball':'physical')+' side.'+(opts.length?' Consider '+opts.join(' or ')+'.':''));
  } else if(short.length) add('info',short.map(p=>esc(p.name)).join(', ')+' at centre back is short. Fine against a passing side; switch if they start going long.');
 }
 const bench=squad.filter(p=>avail(m,p.id)==='yes'&&!slotOf(m,p.id));
 if(bench.length<3) add('warn','Only '+bench.length+' available on the bench. Chase up the unconfirmed players.');
 const unconf=squad.filter(p=>avail(m,p.id)==='maybe').length;
 if(unconf) add('info',unconf+' player'+(unconf>1?'s are':' is')+' still unconfirmed for this match.');
 const sp=m.sp||{};
 if(!sp.pen||!onPitch(m).includes(sp.pen)) add('info','No penalty taker on the pitch. Set one under Set pieces.');
 return out;
}

/* ================= SET PIECES ================= */
const SP_ATT=[['cornerL','Corner taker, left'],['cornerR','Corner taker, right'],['fk','Free kicks'],['pen','Penalties'],['near','Attack near post'],['spot','Attack penalty spot'],['far','Attack far post'],['edge','Edge of box (second ball)'],['back1','Stay back'],['back2','Stay back']];
const SP_DEF=[['dNear','Near-post zone'],['dMark1','Mark their best header'],['dMark2','Mark second threat'],['dEdge','Edge of box'],['dOut','Counter outlet (stays up)']];
function autoSetPieces(m){
 const xi=SLOTS.filter(s=>s!=='GK'&&m.lineup[s]).map(s=>({s,p:P(m.lineup[s]),L:lab(m,s)}));
 const aer=x=>(has(x.p,'Tall')?2:0)+(has(x.p,'Aerial threat')?2:0)+(has(x.p,'Physical')?1.2:0)-(has(x.p,'Short')?2:0)+(['CB','ST'].includes(x.L)?0.5:0);
 const tech=x=>(has(x.p,'Technical')?2:0)+(has(x.p,'Creative')?1.5:0)+(['AM','LW','RW','CM'].includes(x.L)?0.6:0)+(x.p.pos.includes('CAM')?0.6:0);
 const used=new Set(); const pick=(arr,fn)=>{const c=arr.filter(x=>!used.has(x.p.id)).sort((a,b)=>fn(b)-fn(a))[0]; if(c){used.add(c.p.id); return c.p.id;} return null;};
 const sp={};
 const takers=xi.slice().sort((a,b)=>(tech(b)-aer(b)*0.6)-(tech(a)-aer(a)*0.6));
 sp.cornerL=takers[0]?takers[0].p.id:null; sp.cornerR=takers[1]?takers[1].p.id:sp.cornerL; sp.fk=sp.cornerL;
 const st=xi.find(x=>x.L==='ST'); sp.pen=st?st.p.id:sp.cornerL;
 [sp.cornerL,sp.cornerR].forEach(id=>id&&used.add(id));
 sp.spot=pick(xi,aer); sp.far=pick(xi,aer); sp.near=pick(xi,aer);
 const rest=x=>(['LB','RB','CB','DM'].includes(x.L)?1:0)-aer(x)*0.3+(has(x.p,'Pace')?1:0);
 sp.back1=pick(xi,rest); sp.back2=pick(xi,rest); sp.edge=pick(xi,tech);
 const used2=new Set(); const pick2=fn=>{const c=xi.filter(x=>!used2.has(x.p.id)).sort((a,b)=>fn(b)-fn(a))[0]; if(c){used2.add(c.p.id); return c.p.id;} return null;};
 const outlet=xi.filter(x=>['ST','LW','RW'].includes(x.L)).sort((a,b)=>(has(b.p,'Pace')+has(b.p,'Runs in behind'))-(has(a.p,'Pace')+has(a.p,'Runs in behind')))[0];
 if(outlet){ sp.dOut=outlet.p.id; used2.add(outlet.p.id); }
 sp.dMark1=pick2(aer); sp.dMark2=pick2(aer); sp.dNear=pick2(aer); sp.dEdge=pick2(tech);
 return sp;
}

/* ================= ROTATION ================= */
function rotGrid(m){
 const n=+m.rot.blocks||4; const g=[Object.assign({},m.lineup)];
 for(let b=1;b<n;b++) g.push(Object.assign({},(m.rot.grid||[])[b-1]||g[b-1]));
 // keep only valid ids (available)
 return g;
}
function generateRotation(m){
 const n=+m.rot.blocks||4, T=total(m), bl=T/n;
 const pool=squad.filter(p=>avail(m,p.id)==='yes').map(p=>p.id);
 SLOTS.forEach(s=>{const id=m.lineup[s]; if(id&&!pool.includes(id)) pool.push(id);});
 const outfield=pool.filter(id=>!(P(id).pos.length===1&&P(id).pos[0]==='GK'));
 const target=outfield.length?Math.min(T,(10*T)/outfield.length):T;
 const played={}; pool.forEach(id=>played[id]=0);
 const grid=[Object.assign({},m.lineup)];
 SLOTS.forEach(s=>{const id=m.lineup[s]; if(id) played[id]=(played[id]||0)+bl;});
 for(let b=1;b<n;b++){
  const prev=grid[b-1];
  const res=assign(m,pool,(s,pid)=>{
   const f=fitOf(m,s,pid).score;
   let sc=f*1.3;
   if(s!=='GK'){ const need=(target-played[pid])/bl; sc+=clamp(need,-2.5,2.5)*1.6; }
   if(prev[s]===pid){ sc+=(m.rot.spine&&SPINE.includes(s))?6:0.5; if(s==='GK') sc+=10; }
   return sc;
  });
  grid.push(res); SLOTS.forEach(s=>{const id=res[s]; if(id) played[id]=(played[id]||0)+bl;});
 }
 m.rot.grid=grid.slice(1);
}
function minutesPlan(m){
 const g=rotGrid(m), bl=total(m)/g.length, mins={};
 g.forEach(blk=>SLOTS.forEach(s=>{const id=blk[s]; if(id) mins[id]=(mins[id]||0)+bl;}));
 return mins;
}
function subCalls(m){
 const g=rotGrid(m), bl=total(m)/g.length, calls=[];
 for(let b=1;b<g.length;b++){
  const a=g[b-1], c=g[b]; const prevIds=SLOTS.map(s=>a[s]).filter(Boolean), curIds=SLOTS.map(s=>c[s]).filter(Boolean);
  const on=curIds.filter(id=>!prevIds.includes(id)), off=prevIds.filter(id=>!curIds.includes(id));
  const moves=SLOTS.filter(s=>c[s]&&prevIds.includes(c[s])&&a[s]!==c[s]).map(s=>({id:c[s],from:SLOTS.find(x=>a[x]===c[s]),to:s}));
  calls.push({min:Math.round(bl*b),on,off,moves,grid:c});
 }
 return calls;
}
function armband(m,blk){ if(m.captain&&SLOTS.some(s=>blk[s]===m.captain)) return m.captain; if(m.vice&&SLOTS.some(s=>blk[s]===m.vice)) return m.vice; return null; }

/* ================= TEAM SHEET ================= */
function teamSheet(m){
 const F=FORM[m.formation]; const L=[];
 L.push('CREAM FLOW ROVERS v '+(m.opp||'TBC'));
 L.push(fmtDate(m.date)+(m.time?', '+m.time:'')+(m.venue?', '+m.venue:''));
 L.push('');
 L.push('Shape: '+m.formation+' ('+BLOCK_TXT[m.block].toLowerCase()+')');
 const order=SLOTS.slice().sort((a,b)=>{const pa=F.oop[a],pb=F.oop[b]; const ya=Math.round(pa[1]/7),yb=Math.round(pb[1]/7); return yb-ya||pa[0]-pb[0];});
 order.forEach(s=>{ const id=m.lineup[s]; L.push(F.lab[s].padEnd(4,' ')+' '+(id?nm(id):'-')+(id&&id===m.captain?' (C)':id&&id===m.vice?' (VC)':'')); });
 const bench=squad.filter(p=>avail(m,p.id)==='yes'&&!slotOf(m,p.id)).map(p=>p.name);
 L.push(''); L.push('Subs: '+(bench.join(', ')||'none'));
 const unc=squad.filter(p=>avail(m,p.id)==='maybe').map(p=>p.name); if(unc.length) L.push('Unconfirmed: '+unc.join(', '));
 const calls=subCalls(m).filter(c=>c.on.length||c.moves.length);
 if(calls.length&&(m.rot.grid||[]).length){ L.push(''); L.push('Planned changes:'); calls.forEach(c=>{ const parts=c.on.map((id,i)=>nm(id)+' on'+(c.off[i]?' for '+nm(c.off[i]):'')); c.moves.forEach(x=>{ if(!c.on.includes(x.id)) parts.push(nm(x.id)+' to '+F.lab[x.to]); }); L.push(c.min+"'  "+parts.join('; ')); }); }
 const sp=m.sp||{}; if(sp.pen||sp.cornerL){ L.push(''); L.push('Set pieces: corners '+[sp.cornerL,sp.cornerR].filter(Boolean).map(nm).filter((v,i,a)=>a.indexOf(v)===i).join(' / ')+(sp.pen?', pens '+nm(sp.pen):'')); }
 if(m.notes){ L.push(''); L.push(m.notes); }
 return L.join('\n');
}
