"use strict";

/* ================= ACTIONS ================= */
function commit(){ saveMatch(); render(); }
let animT;
function commitAnimated(){
 saveMatch();
 const toks=document.querySelectorAll('#pitch .tok');
 if(!toks.length||ui.view!=='board'||matchMedia('(prefers-reduced-motion: reduce)').matches){ render(); return; }
 const m=M();
 toks.forEach(g=>{ const [x,y]=computePos(m,g.dataset.slot,ui.phase); g.style.transform='translate('+SX(x).toFixed(1)+'px,'+SY(y).toFixed(1)+'px)'; });
 const tmp=document.querySelector('#pitch svg'); if(tmp) tmp.querySelectorAll('path[marker-end], path[d^="M"][fill="#C8443C"]').forEach(n=>n.style.opacity='0');
 renderToolbar(); renderShape(); renderPane(); renderLegend();
 clearTimeout(animT); animT=setTimeout(()=>{ if(!drag) renderPitch(); },420);
}
function setSlot(slot,pid){
 const m=M(); const from=slotOf(m,pid);
 if(from&&from!==slot){ m.lineup[from]=m.lineup[slot]||null; }
 m.lineup[slot]=pid;
}
function tapSlot(slot){
 const m=M(); const s=ui.sel;
 if(s&&s.kind==='slot'&&s.id!==slot){ const a=m.lineup[s.id]; m.lineup[s.id]=m.lineup[slot]; m.lineup[slot]=a; ui.sel=null; toast('Swapped '+(nm(m.lineup[slot])||'empty')+' and '+(nm(m.lineup[s.id])||'empty')+'.'); commit(); return; }
 if(s&&s.kind==='player'){ const prev=m.lineup[slot]; setSlot(slot,s.id); ui.sel={kind:'slot',id:slot}; toast(nm(s.id)+' in at '+lab(m,slot)+(prev&&!slotOf(m,prev)?', '+nm(prev)+' to the bench':'')+'.'); commit(); return; }
 ui.sel=(s&&s.kind==='slot'&&s.id===slot)?null:{kind:'slot',id:slot};
 if(ui.sel) ui.tab='roles';
 render();
}
function tapPlayer(pid){
 const m=M(); const s=ui.sel; const inSlot=slotOf(m,pid);
 if(inSlot){ tapSlot(inSlot); return; }
 if(s&&s.kind==='slot'){ if(avail(m,pid)==='no'){ toast(nm(pid)+' is marked out for this match.'); return; } const prev=m.lineup[s.id]; setSlot(s.id,pid); toast(nm(pid)+' on for '+(nm(prev)||'empty slot')+' at '+lab(m,s.id)+'.'); commit(); return; }
 ui.sel=(s&&s.kind==='player'&&s.id===pid)?null:{kind:'player',id:pid};
 if(ui.sel) ui.tab='roles';
 render();
}
function applySuggestion(){
 const m=M(); const r=suggest(m);
 const changed=m.formation!==r.formation;
 m.formation=r.formation; m.block=r.block; m.width=r.width; m.fb=r.fb; m.anchor=r.anchor==='both'?'both':resolveAnchor(m,'one',r.formation);
 if(changed){ m.offsets={ip:{},oop:{}}; }
 toast('Applied '+r.formation+', '+BLOCK_TXT[r.block].toLowerCase()+'.');
 if(changed) commit(); else commitAnimated();
}
function newMatch(){
 const cur=M(); const nm_=defaultMatch(); const d=new Date((cur.date||'2026-10-03')+'T12:00:00'); d.setDate(d.getDate()+7);
 const id='m'+Date.now().toString(36);
 const m=normMatch(Object.assign(nm_,{id,opp:'TBC',date:d.toISOString().slice(0,10),time:cur.time,halfLen:cur.halfLen,halves:cur.halves,
  formation:cur.formation,lineup:Object.assign({},cur.lineup),captain:cur.captain,vice:cur.vice,block:cur.block,width:cur.width,fb:cur.fb,anchor:cur.anchor,
  sp:Object.assign({},cur.sp),avail:{},rot:{blocks:cur.rot.blocks,spine:cur.rot.spine,grid:[]},live:{gf:0,ga:0,minute:0},notes:'',result:{gf:'',ga:''},created:Date.now()}));
 squad.forEach(p=>m.avail[p.id]='maybe');
 matches[id]=m; curId=id; rememberCur(); saveMatch(m);
 closeDlg(); ui.sel=null; render(); toast('Match added. Confirm who is available.');
}
async function copyText(t){
 try{ await navigator.clipboard.writeText(t); toast('Team sheet copied.'); return; }catch(e){}
 const ta=document.createElement('textarea'); ta.value=t; ta.style.position='fixed'; ta.style.opacity='0'; $('dlg').appendChild(ta); ta.select();
 let ok=false; try{ ok=document.execCommand('copy'); }catch(e){} ta.remove();
 if(ok) toast('Team sheet copied.'); else { const pre=$('sheetTxt'); if(pre){ const r=document.createRange(); r.selectNodeContents(pre); const s=getSelection(); s.removeAllRanges(); s.addRange(r); } toast('Text selected. Copy it with your keyboard or long-press.'); }
}
async function savePng(){
 const m=M();
 const svg=buildPitch({exp:true});
 const img=new Image();
 const url='data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svg)));
 await new Promise((res,rej)=>{ img.onload=res; img.onerror=rej; img.src=url; }).catch(()=>{});
 const c=document.createElement('canvas'); const W=VW*2, H=(VH+190)*2; c.width=W; c.height=H;
 c.getContext('2d').drawImage(img,0,0,W,H);
 const blob=await new Promise(r=>c.toBlob(r,'image/png'));
 if(!blob){ toast('Could not create the image.'); return; }
 const fname='Rovers-v-'+(m.opp||'TBC').replace(/[^A-Za-z0-9]+/g,'-')+'-'+m.formation+'.png';
 const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=fname; document.body.appendChild(a); a.click();
 setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },1000);
}

document.addEventListener('click',e=>{
 const t=e.target.closest('[data-act]');
 if(!t){
  const row=e.target.closest('.prow');
  if(row){ if(!suppressClick) tapPlayer(row.dataset.pid); return; }
  // click anywhere that is not a shirt, a player row, the player card or a control clears the selection
  if(ui.sel&&!e.target.closest('.tok,#pitch,.pcard,.alts,dialog,select,input,textarea,button,a,label')){ ui.sel=null; render(); }
  return;
 }
 const m=M(); const a=t.dataset.act, v=t.dataset.v;
 switch(a){
  case 'phase': ui.phase=v; commitAnimated(); break;
  case 'tool': ui.tool=v; render(); break;
  case 'ov': ui.ov[v]=!ui.ov[v]; render(); break;
  case 'block': case 'width': m[a]=v; commitAnimated(); break;
  case 'fb': m.fb=v; commitAnimated(); break;
  case 'anchor': m.anchor=v; commitAnimated(); break;
  case 'style': m.style=v; commit(); break;
  case 'oppShape': m.oppShape=v; if(v!=='unknown') ui.ov.opp=true; commit(); break;
  case 'pitch': m.pitch=v; commit(); break;
  case 'clock': m.live.minute=+v; commit(); break;
  case 'score': { const k=t.dataset.k; m.live[k]=Math.max(0,(+m.live[k]||0)+(+t.dataset.d)); commit(); break; }
  case 'applySuggest': applySuggestion(); break;
  case 'cycleAvail': { e.stopPropagation(); const id=t.dataset.id; const nx={yes:'maybe',maybe:'no',no:'yes'}[avail(m,id)]; m.avail[id]=nx; if(ui.sel&&ui.sel.kind==='player'&&ui.sel.id===id) ui.sel=null; commit(); break; }
  case 'avail': m.avail[t.dataset.id]=v; commit(); break;
  case 'allAvail': squad.forEach(p=>{ if(avail(m,p.id)==='maybe') m.avail[p.id]='yes'; }); commit(); break;
  case 'toggleOut': ui.showOut=!ui.showOut; render(); break;
  case 'bestXI': { const x=bestXI(m); const before=JSON.stringify(m.lineup); m.lineup=x; ui.sel=null; toast(before===JSON.stringify(x)?'Already the best fit from available players.':'Picked the best fit XI from available players.'); commit(); break; }
  case 'refit': { m.lineup=refitXI(m); ui.sel=null; toast('Same eleven, each in his best slot for '+m.formation+'.'); commit(); break; }
  case 'sheet': sheetDlg(); break;
  case 'copySheet': copyText(teamSheet(m)); break;
  case 'png': savePng(); break;
  case 'undoArrow': (m.arrows[ui.phase]||[]).pop(); commit(); break;
  case 'clearArrows': m.arrows[ui.phase]=[]; commit(); break;
  case 'resetPos': m.offsets={ip:{},oop:{}}; commit(); break;
  case 'mkCap': if(m.vice===t.dataset.id) m.vice=m.captain; m.captain=t.dataset.id; toast(nm(t.dataset.id)+' is captain.'); commit(); break;
  case 'mkVice': m.vice=t.dataset.id; toast(nm(t.dataset.id)+' is vice-captain.'); commit(); break;
  case 'toBench': m.lineup[t.dataset.slot]=null; commit(); break;
  case 'putIn': { const pid=t.dataset.id, slot=t.dataset.slot; setSlot(slot,pid); ui.sel={kind:'slot',id:slot}; commit(); break; }
  case 'autoSP': m.sp=autoSetPieces(m); toast('Set pieces assigned from the current XI.'); commit(); break;
  case 'genRot': generateRotation(m); toast('Rotation planned for '+(+m.rot.blocks)+' windows.'); commit(); break;
  case 'blocks': m.rot.blocks=+v; m.rot.grid=[]; commit(); break;
  case 'spine': m.rot.spine=v==='1'; commit(); break;
  case 'addPlayer': { const id='p'+uid(); squad.push({id,name:'New player',pos:[],traits:[],notes:''}); m.avail[id]='maybe'; saveSquad(); commit(); setTimeout(()=>{ const el=document.querySelector('[data-ch="pName"][data-id="'+id+'"]'); if(el){ el.focus(); el.select(); } },30); break; }
  case 'delPlayer': { const id=t.dataset.id; if(!confirm('Remove '+nm(id)+' from the squad for the whole season?')) return; squad=squad.filter(p=>p.id!==id); Object.values(matches).forEach(mm=>{ SLOTS.forEach(s=>{ if(mm.lineup[s]===id) mm.lineup[s]=null; }); if(mm.captain===id) mm.captain=null; if(mm.vice===id) mm.vice=null; saveMatch(mm); }); saveSquad(); render(); break; }
  case 'closeDlg': closeDlg(); break;
  case 'signIn': signInDlg(); break;
  case 'sendLink': sendLink(); break;
  case 'traitPick': openTraitPop(t); break;
  case 'traitClose': closeTraitPop(); break;
  case 'pickMatch': curId=t.dataset.id; rememberCur(); ui.sel=null; closeDlg(); render(); break;
  case 'editMatch': editDlg(); break;
  case 'newMatch': newMatch(); break;
  case 'saveEdit': {
   m.opp=$('eOpp').value.trim()||'TBC'; m.date=$('eDate').value; m.time=$('eTime').value; m.venue=$('eVenue').value.trim();
   m.halves=+$('eHalves').value||2; m.halfLen=clamp(+$('eLen').value||30,5,60); m.result={gf:$('eGf').value,ga:$('eGa').value};
   m.live.minute=Math.min(m.live.minute,total(m)); closeDlg(); commit(); break; }
  case 'delMatch': { if(!confirm('Delete the match vs '+(m.opp||'TBC')+'? This cannot be undone.')) return; const id=m.id; delete matches[id]; deleteMatchDoc(id); curId=latestMatchId(); rememberCur(); closeDlg(); render(); break; }
 }
});
$('matchBtn').addEventListener('click',matchesDlg);
$('authBtn').addEventListener('click',()=>{ if(Store.session) signOut(); else signInDlg(); });
document.addEventListener('keydown',e=>{ if(e.key==='Enter'&&e.target&&e.target.id==='authEmail'){ e.preventDefault(); sendLink(); } });
document.querySelectorAll('.views button').forEach(b=>b.addEventListener('click',()=>{ ui.view=b.dataset.view; render(); window.scrollTo(0,0); }));
$('tabs').addEventListener('click',e=>{ const b=e.target.closest('[data-tab]'); if(b){ ui.tab=b.dataset.tab; renderPane(); } });
$('dlg').addEventListener('click',e=>{ if(e.target===$('dlg')) closeDlg(); });

document.addEventListener('change',e=>{
 const t=e.target.closest('[data-ch]'); if(!t) return; const m=M(); const k=t.dataset.ch;
 const parseList=s=>s.split(/[,;/]+/).map(x=>x.trim()).filter(Boolean);
 switch(k){
  case 'captain': if(t.value&&t.value===m.vice) m.vice=m.captain; m.captain=t.value||null; commit(); break;
  case 'vice': m.vice=t.value||null; if(m.vice===m.captain) m.captain=null; commit(); break;
  case 'formation': { const old=m.formation; m.formation=t.value; m.offsets={ip:{},oop:{}}; if(m.anchor==='one') m.anchor='DM1'; ui.sel=null; toast(old+' to '+t.value+'. Use Re-fit to shape if players look out of place.'); commit(); break; }
  case 'opp': m.opp=t.value.trim()||'TBC'; commit(); break;
  case 'notes': m.notes=t.value; saveMatch(); break;
  case 'sp': m.sp=Object.assign({},m.sp,{[t.dataset.k]:t.value||null}); commit(); break;
  case 'rotCell': {
   const b=+t.dataset.b, s=t.dataset.slot; const g=rotGrid(m); const blk=g[b]; const pid=t.value||null;
   if(pid){ const other=SLOTS.find(x=>x!==s&&blk[x]===pid); if(other) blk[other]=blk[s]; }
   blk[s]=pid; m.rot.grid=g.slice(1); commit(); break; }
  case 'halves': m.halves=+t.value; m.live.minute=Math.min(m.live.minute,total(m)); commit(); break;
  case 'halfLen': m.halfLen=clamp(+t.value||30,5,60); m.live.minute=Math.min(m.live.minute,total(m)); commit(); break;
  case 'pName': { const p=P(t.dataset.id); if(p){ p.name=t.value.trim().slice(0,24)||p.name; saveSquad(); render(); } break; }
  case 'pPos': { const p=P(t.dataset.id); if(p){ const raw=parseList(t.value.toUpperCase()).map(x=>({ANYWHERE:'ANY',DM:'CDM',AM:'CAM',LM:'LW',RM:'RW',CF:'ST',LWB:'LB',RWB:'RB'}[x]||x)); const ok=raw.filter(x=>POS_CODES.includes(x)); const bad=raw.filter(x=>!POS_CODES.includes(x)); p.pos=ok.filter((x,i)=>ok.indexOf(x)===i); if(bad.length) toast('Ignored '+bad.join(', ')+'. Use '+POS_CODES.join(', ')+'.'); saveSquad(); render(); } break; }
  case 'traitToggle': { const p=P(t.dataset.id); if(p){ const v=t.value; const cur=(p.traits||[]).filter(x=>x!==v); if(t.checked) cur.push(v); p.traits=TRAITS.filter(x=>cur.includes(x)).concat(cur.filter(x=>!TRAITS.includes(x))).slice(0,12); saveSquad(); updateTraitBtn(p); traitDirty=true; } break; }
  case 'pNotes': { const p=P(t.dataset.id); if(p){ p.notes=t.value.slice(0,300); saveSquad(); } break; }
 }
});
document.addEventListener('input',e=>{
 const t=e.target; if(t.dataset&&t.dataset.ch==='minute'){ const m=M(); m.live.minute=+t.value; const o=$('minOut'); if(o) o.textContent=t.value+'′'; clearTimeout(minT); minT=setTimeout(()=>{ saveMatch(); renderPane(); renderShape(); const r=document.querySelector('[data-ch="minute"]'); if(r) r.focus(); },350); }
});
let minT;
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'&&ui.sel){ ui.sel=null; render(); return; }
 const tok=e.target.closest&&e.target.closest('.tok');
 if(tok&&(e.key==='Enter'||e.key===' ')){ e.preventDefault(); tapSlot(tok.dataset.slot); setTimeout(()=>{ const n=document.querySelector('.tok[data-slot="'+tok.dataset.slot+'"]'); if(n) n.focus(); },0); }
 const row=e.target.closest&&e.target.closest('.prow');
 if(row&&!e.target.closest('[data-act]')&&(e.key==='Enter'||e.key===' ')){ e.preventDefault(); tapPlayer(row.dataset.pid); }
});

/* ================= PROFILE PICKER ================= */
let traitOpen=null, traitDirty=false;
function traitPopHTML(p){
 const extra=(p.traits||[]).filter(x=>!TRAITS.includes(x));
 const all=TRAITS.concat(extra);
 return '<div class="tp-h">Profile for '+esc(p.name)+'</div><div class="tp-list">'+all.map(t=>'<label><input type="checkbox" data-ch="traitToggle" data-id="'+p.id+'" value="'+esc(t)+'"'+((p.traits||[]).includes(t)?' checked':'')+'> '+esc(t)+'</label>').join('')+'</div><div class="tp-add"><input type="text" id="traitNew" placeholder="Add your own, press Enter" maxlength="24" data-id="'+p.id+'"></div><div class="tp-f"><button type="button" class="btn primary" data-act="traitClose">Done</button></div>';
}
function placeTraitPop(btn){
 const pop=$('traitPop'); const r=btn.getBoundingClientRect(); const w=Math.min(260,window.innerWidth-16);
 pop.style.width=w+'px';
 let left=Math.min(Math.max(8,r.left),window.innerWidth-w-8);
 const h=pop.offsetHeight; let top=r.bottom+4; if(top+h>window.innerHeight-8) top=Math.max(8,r.top-h-4);
 pop.style.left=left+'px'; pop.style.top=top+'px';
}
function openTraitPop(btn){
 const p=P(btn.dataset.id); if(!p) return;
 if(traitOpen===p.id){ closeTraitPop(); return; }
 closeTraitPop(true);
 const pop=$('traitPop'); pop.innerHTML=traitPopHTML(p); pop.hidden=false; traitOpen=p.id; btn.setAttribute('aria-expanded','true');
 placeTraitPop(btn);
 const first=pop.querySelector('input[type=checkbox]'); if(first) first.focus();
}
function closeTraitPop(silent){
 if(!traitOpen) return;
 const id=traitOpen; traitOpen=null; $('traitPop').hidden=true;
 const btn=document.querySelector('.traitbtn[data-id="'+id+'"]');
 if(btn){ btn.setAttribute('aria-expanded','false'); if(!silent) btn.focus(); }
 if(traitDirty){ traitDirty=false; renderDeferred=false; if(!silent) render(); else setTimeout(()=>{ if(!traitOpen) safeRender(); },300); }
}
function updateTraitBtn(p){ const b=document.querySelector('.traitbtn[data-id="'+p.id+'"] > span'); if(b) b.innerHTML=esc((p.traits||[]).join(', '))||'<span class="muted">Add profile</span>'; }
document.addEventListener('pointerdown',e=>{ if(traitOpen&&!e.target.closest('#traitPop,.traitbtn')) closeTraitPop(true); },true);
window.addEventListener('resize',()=>closeTraitPop(true));
document.addEventListener('scroll',e=>{ if(traitOpen&&!(e.target&&e.target.closest&&e.target.closest('#traitPop'))){ const b=document.querySelector('.traitbtn[data-id="'+traitOpen+'"]'); if(b) placeTraitPop(b); } },true);
document.addEventListener('keydown',e=>{
 if(!traitOpen) return;
 if(e.key==='Escape'){ e.stopImmediatePropagation(); closeTraitPop(); return; }
 if(e.key==='Enter'&&e.target.id==='traitNew'){
  e.preventDefault(); const v=e.target.value.trim().slice(0,24); if(!v) return; const p=P(e.target.dataset.id); if(!p) return;
  const known=TRAITS.find(t=>t.toLowerCase()===v.toLowerCase())||v;
  if(!(p.traits||[]).includes(known)){ p.traits=(p.traits||[]).concat([known]).slice(0,12); saveSquad(); updateTraitBtn(p); traitDirty=true; }
  $('traitPop').innerHTML=traitPopHTML(p); const b=document.querySelector('.traitbtn[data-id="'+p.id+'"]'); if(b) placeTraitPop(b); const n=$('traitNew'); if(n) n.focus();
 }
},true);

/* ================= POINTER: pitch drag, arrows, bench drag ================= */
let drag=null, suppressClick=false;
function svgPt(svg,cx,cy){ const pt=svg.createSVGPoint(); pt.x=cx; pt.y=cy; const r=pt.matrixTransform(svg.getScreenCTM().inverse()); return [(r.x-X0)/PW*100,(r.y-Y0)/PH*100]; }
$('pitch').addEventListener('pointerdown',e=>{
 const svg=$('pitch').querySelector('svg'); if(!svg||e.button>0) return;
 const tok=e.target.closest('.tok');
 if(ui.tool==='move'){
  if(!tok){ drag={kind:'bg',sx:e.clientX,sy:e.clientY,pid:e.pointerId}; return; }
  const slot=tok.dataset.slot; const m=M(); const [x,y]=computePos(m,slot,ui.phase);
  drag={kind:'tok',slot,sx:e.clientX,sy:e.clientY,x,y,moved:false,svg,el:tok,pid:e.pointerId};
  tok.setPointerCapture(e.pointerId);
 } else {
  e.preventDefault();
  const [x,y]=svgPt(svg,e.clientX,e.clientY);
  drag={kind:'arrow',x1:x,y1:y,x2:x,y2:y,svg,pid:e.pointerId};
  svg.setPointerCapture(e.pointerId);
 }
});
$('pitch').addEventListener('pointermove',e=>{
 if(!drag||drag.pid!==e.pointerId) return;
 if(drag.kind==='tok'){
  const d=Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy);
  if(!drag.moved&&d<6) return;
  drag.moved=true; drag.el.classList.add('dragging');
  const [x,y]=svgPt(drag.svg,e.clientX,e.clientY); drag.nx=clamp(x,3,97); drag.ny=clamp(y,3,97);
  drag.el.style.transform='translate('+SX(drag.nx)+'px,'+SY(drag.ny)+'px)';
 } else if(drag.kind==='arrow'){
  const [x,y]=svgPt(drag.svg,e.clientX,e.clientY); drag.x2=clamp(x,0,100); drag.y2=clamp(y,0,100);
  const g=drag.svg.querySelector('#tmpArrow'); if(g) g.innerHTML=arrowSVG({k:ui.tool,x1:drag.x1,y1:drag.y1,x2:drag.x2,y2:drag.y2});
 }
});
function endPitch(e){
 if(!drag||drag.pid!==e.pointerId||drag.kind==='bench') return;
 const d=drag; drag=null; const m=M();
 if(d.kind==='bg'){ if(ui.sel&&Math.hypot(e.clientX-d.sx,e.clientY-d.sy)<8){ ui.sel=null; render(); } return; }
 if(d.kind==='tok'){
  if(!d.moved){ tapSlot(d.slot); return; }
  const off=m.offsets[ui.phase]||(m.offsets[ui.phase]={}); const o=off[d.slot]||[0,0];
  off[d.slot]=[+(o[0]+d.nx-d.x).toFixed(1),+(o[1]+d.ny-d.y).toFixed(1)];
  commit();
 } else if(d.kind==='arrow'){
  if(Math.hypot((d.x2-d.x1)*0.68,(d.y2-d.y1)*1.05)>4){ (m.arrows[ui.phase]||(m.arrows[ui.phase]=[])).push({k:ui.tool,x1:+d.x1.toFixed(1),y1:+d.y1.toFixed(1),x2:+d.x2.toFixed(1),y2:+d.y2.toFixed(1)}); if(m.arrows[ui.phase].length>40) m.arrows[ui.phase].shift(); commit(); }
  else render();
 }
 if(renderDeferred){ renderDeferred=false; }
}
$('pitch').addEventListener('pointerup',endPitch);
$('pitch').addEventListener('pointercancel',e=>{ if(drag&&drag.pid===e.pointerId&&drag.kind!=='bench'){ drag=null; render(); } });

// drag a squad row onto a shirt
document.addEventListener('pointerdown',e=>{
 const row=e.target.closest('.prow'); if(!row||e.target.closest('[data-act]')||e.button>0) return;
 drag={kind:'bench',pid:e.pointerId,id:row.dataset.pid,sx:e.clientX,sy:e.clientY,moved:false};
});
document.addEventListener('pointermove',e=>{
 if(!drag||drag.kind!=='bench'||drag.pid!==e.pointerId) return;
 if(!drag.moved&&Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)<8) return;
 if(!drag.moved){ drag.moved=true; const g=$('ghost'); g.textContent=nm(drag.id); g.hidden=false; }
 const g=$('ghost'); g.style.left=e.clientX+'px'; g.style.top=e.clientY+'px';
 document.querySelectorAll('.tok').forEach(t=>t.style.opacity='');
 const el=document.elementFromPoint(e.clientX,e.clientY); const tok=el&&el.closest&&el.closest('.tok'); if(tok) tok.style.opacity='.6';
});
function endBench(e){
 if(!drag||drag.kind!=='bench'||drag.pid!==e.pointerId) return;
 const d=drag; drag=null; $('ghost').hidden=true; document.querySelectorAll('.tok').forEach(t=>t.style.opacity='');
 if(!d.moved) return;
 suppressClick=true; setTimeout(()=>{suppressClick=false;},50);
 if(e.type==='pointercancel'){ if(renderDeferred){renderDeferred=false; render();} return; }
 const el=document.elementFromPoint(e.clientX,e.clientY); const tok=el&&el.closest&&el.closest('.tok');
 if(tok){ const m=M(); if(avail(m,d.id)==='no'){ toast(nm(d.id)+' is marked out for this match.'); return; } const s=tok.dataset.slot; const prev=m.lineup[s]; setSlot(s,d.id); ui.sel=null; toast(nm(d.id)+' in at '+lab(m,s)+(prev&&!slotOf(m,prev)?', '+nm(prev)+' to the bench':'')+'.'); commit(); }
 else if(renderDeferred){ renderDeferred=false; render(); }
}
document.addEventListener('pointerup',endBench);
document.addEventListener('pointercancel',endBench);

/* ================= BOOT ================= */
initStore();
