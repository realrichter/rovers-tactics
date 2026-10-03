"use strict";
/* =====================================================================
   STORAGE: Supabase (shared, realtime) with a localStorage fallback.
   Every document lives in one table, public.board_docs:
     path 'season/squad'   -> { players: [...] }
     path 'matches/<id>'   -> one match object (see defaultMatch in data.js)
   ===================================================================== */
const LKEY='cfr-tactics-v1';
const Store={mode:'local',sb:null,dirty:{},timers:{},busy:{},again:{},err:false,session:null,canEdit:false,retry:{}};

function normMatch(d){
 const base=defaultMatch(); const m=Object.assign(base,d||{});
 ['offsets','arrows'].forEach(k=>{ m[k]=Object.assign({ip:k==='arrows'?[]:{},oop:k==='arrows'?[]:{}},m[k]||{}); });
 m.live=Object.assign({gf:0,ga:0,minute:0},m.live||{});
 m.rot=Object.assign({blocks:4,spine:true,grid:[]},m.rot||{});
 m.sp=m.sp||{}; m.result=m.result||{gf:'',ga:''}; m.avail=m.avail||{}; m.lineup=Object.assign({},m.lineup||{});
 SLOTS.forEach(s=>{ if(!(s in m.lineup)) m.lineup[s]=null; });
 if(!FORM[m.formation]) m.formation='4-2-3-1';
 return m;
}

/* ---------- status pill + banner ---------- */
function setSync(s,txt){ const el=$('sync'); el.dataset.s=s; el.querySelector('span').textContent=txt; }
function refreshSync(){
 if(Store.mode==='local') return setSync('local','This browser only');
 if(!Store.canEdit) return setSync('local','View only');
 if(Store.err) return setSync('error','Not saved');
 const pending=Object.keys(Store.dirty).length||Object.values(Store.busy).some(Boolean);
 setSync(pending?'saving':'ok',pending?'Saving':'Saved');
}
function updateAccessUI(){
 const b=$('authBtn');
 if(Store.mode==='local'){
  b.hidden=true;
  showBanner('Not connected to a database: changes are saved in this browser only. Add your Supabase URL and key in <code>js/config.js</code> to share the board with the team.');
 } else if(!Store.session){
  b.hidden=false; b.textContent='Sign in';
  showBanner('View only. <button type="button" class="linkbtn" data-act="signIn">Sign in</button> with an editor email to make changes.');
 } else if(!Store.canEdit){
  b.hidden=false; b.textContent='Sign out';
  showBanner('Signed in as '+esc(Store.session.user.email)+', but this email is not on the editors list. Add it to the <code>editors</code> table in Supabase.');
 } else {
  b.hidden=false; b.textContent='Sign out';
  hideBanner();
 }
 ui.readOnly=Store.mode==='db'&&!Store.canEdit;
 refreshSync();
}

/* ---------- local persistence (fallback + remembered match) ---------- */
function saveLocal(){ try{ localStorage.setItem(LKEY,JSON.stringify({squad,matches,curId})); }catch(e){} }
function loadLocal(){
 try{ const d=JSON.parse(localStorage.getItem(LKEY)||'null'); if(d){ if(Array.isArray(d.squad)&&d.squad.length) squad=d.squad; if(d.matches&&Object.keys(d.matches).length){ matches={}; Object.values(d.matches).forEach(m=>{matches[m.id]=normMatch(m);}); } if(d.curId) curId=d.curId; } }catch(e){}
}
function rememberCur(){ try{ localStorage.setItem(LKEY+'-cur',curId); }catch(e){} }

/* ---------- writes (debounced per document) ---------- */
function persist(path,getter){
 if(Store.mode==='local'){ clearTimeout(Store.timers.local); Store.timers.local=setTimeout(saveLocal,250); return; }
 if(!Store.canEdit) return;
 Store.dirty[path]=getter; clearTimeout(Store.timers[path]);
 Store.timers[path]=setTimeout(()=>flush(path),550); refreshSync();
}
async function flush(path){
 if(Store.busy[path]){ Store.again[path]=true; return; }
 const g=Store.dirty[path]; if(!g){ refreshSync(); return; }
 delete Store.dirty[path]; Store.busy[path]=true; refreshSync();
 const row={path,data:JSON.parse(JSON.stringify(g())),updated_by:Store.session?Store.session.user.id:null};
 const {error}=await Store.sb.from('board_docs').upsert(row,{onConflict:'path'});
 Store.busy[path]=false;
 if(error){
  if(error.code==='42501'||/row-level security|permission/i.test(error.message||'')){ Store.canEdit=false; updateAccessUI(); }
  else if(!Store.retry[path]){ Store.retry[path]=true; Store.dirty[path]=Store.dirty[path]||g; setTimeout(()=>{ Store.retry[path]=false; flush(path); },1500); }
  else { Store.err=true; toast('Could not save: '+(error.message||'network error')); }
 } else Store.err=false;
 if(Store.again[path]||Store.dirty[path]){ Store.again[path]=false; flush(path); } else refreshSync();
}
const isPending=path=>!!(Store.dirty[path]||Store.busy[path]);
function saveMatch(m){ m=m||M(); persist('matches/'+m.id,()=>m); }
function saveSquad(){ persist('season/squad',()=>({players:squad})); }
function deleteMatchDoc(id){
 if(Store.mode==='db'){ if(Store.canEdit) Store.sb.from('board_docs').delete().eq('path','matches/'+id).then(({error})=>{ if(error) toast('Could not delete: '+error.message); }); }
 else saveLocal();
}

/* ---------- render guard: never re-render under the user's cursor ---------- */
let renderDeferred=false;
function safeRender(){
 const a=document.activeElement;
 if(a&&(a.tagName==='TEXTAREA'||(a.tagName==='INPUT'&&a.type==='text'))&&!a.closest('dialog')){ renderDeferred=true; return; }
 if(drag){ renderDeferred=true; return; }
 render();
}
document.addEventListener('focusout',()=>{ if(renderDeferred){ setTimeout(()=>{ if(renderDeferred&&!drag){ renderDeferred=false; render(); } },0); } });

/* ---------- reads ---------- */
function applyDoc(path,data){
 if(!data) return;
 if(path==='season/squad'){ if(Array.isArray(data.players)&&data.players.length) squad=JSON.parse(JSON.stringify(data.players)); }
 else if(path.startsWith('matches/')){ const id=path.slice(8); matches[id]=normMatch(Object.assign({},JSON.parse(JSON.stringify(data)),{id})); }
}
async function loadAll(){
 const {data,error}=await Store.sb.from('board_docs').select('path,data');
 if(error){ setSync('error','Offline'); return; }
 const keepPending={}; Object.keys(matches).forEach(id=>{ if(isPending('matches/'+id)) keepPending[id]=matches[id]; });
 const sq=data.find(r=>r.path==='season/squad');
 if(sq&&!isPending('season/squad')) applyDoc(sq.path,sq.data);
 const rows=data.filter(r=>r.path.startsWith('matches/'));
 if(rows.length){ matches={}; rows.forEach(r=>applyDoc(r.path,r.data)); Object.assign(matches,keepPending); }
 else if(!Object.keys(matches).length){ const m=defaultMatch(); matches[m.id]=m; }
 if(!matches[curId]) curId=latestMatchId();
 safeRender();
}
function subscribe(){
 Store.sb.channel('board_docs_changes')
  .on('postgres_changes',{event:'*',schema:'public',table:'board_docs'},payload=>{
   const path=(payload.new&&payload.new.path)||(payload.old&&payload.old.path); if(!path||isPending(path)) return;
   if(payload.eventType==='DELETE'){ if(path.startsWith('matches/')){ delete matches[path.slice(8)]; if(!matches[curId]) curId=latestMatchId(); } }
   else applyDoc(path,payload.new.data);
   safeRender();
  })
  .subscribe(status=>{ if(status==='CHANNEL_ERROR'||status==='TIMED_OUT') setSync('error','Live sync lost'); else if(status==='SUBSCRIBED') refreshSync(); });
 // phones sleep: refresh everything when the tab comes back
 document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible') loadAll(); });
}

/* ---------- auth (email magic link) ---------- */
async function setSession(session){
 Store.session=session||null; Store.canEdit=false;
 if(session){ const {data,error}=await Store.sb.rpc('is_editor'); Store.canEdit=!error&&data===true; }
 updateAccessUI();
}
function signInDlg(){
 openDlg('<div class="dlg-h"><h2>Sign in to edit</h2><button type="button" class="btn ghost" data-act="closeDlg">Close</button></div><div class="dlg-b"><p class="small muted" style="margin-top:0">We\'ll email you a one-time sign-in link. Only emails on the editors list can change the board; everyone else can view it.</p><label class="field"><span>Email</span><input type="email" id="authEmail" autocomplete="email" placeholder="you@ucdconnect.ie"></label><p class="small" id="authMsg" role="status"></p></div><div class="dlg-f"><button type="button" class="btn primary" data-act="sendLink">Send sign-in link</button></div>');
 setTimeout(()=>{ const i=$('authEmail'); if(i) i.focus(); },30);
}
async function sendLink(){
 const email=($('authEmail').value||'').trim(); const msg=$('authMsg');
 if(!/^\S+@\S+\.\S+$/.test(email)){ msg.textContent='Enter a valid email address.'; return; }
 msg.textContent='Sending...';
 const {error}=await Store.sb.auth.signInWithOtp({email,options:{emailRedirectTo:location.origin+location.pathname}});
 msg.textContent=error?('Could not send the link: '+error.message):'Check your inbox and open the link on this device.';
}
async function signOut(){ await Store.sb.auth.signOut(); }

/* ---------- boot ---------- */
async function initStore(){
 loadLocal();
 try{ const c=localStorage.getItem(LKEY+'-cur'); if(c) curId=c; }catch(e){}
 if(!Object.keys(matches).length){ const m=defaultMatch(); matches[m.id]=m; }
 if(!matches[curId]) curId=latestMatchId();
 const cfg=window.APP_CONFIG||{};
 if(!cfg.SUPABASE_URL||!cfg.SUPABASE_KEY||/YOUR-/.test(cfg.SUPABASE_URL+cfg.SUPABASE_KEY)||!window.supabase){ render(); updateAccessUI(); return; }
 Store.sb=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 Store.mode='db';
 render();
 const {data:{session}}=await Store.sb.auth.getSession();
 await setSession(session);
 Store.sb.auth.onAuthStateChange((event,s)=>{ if(event==='SIGNED_IN'||event==='SIGNED_OUT'||event==='USER_UPDATED'){ setTimeout(()=>setSession(s).then(()=>{ if(event==='SIGNED_IN'){ closeDlg(); toast('Signed in as '+s.user.email+'.'); } }),0); } });
 await loadAll();
 subscribe();
}
function latestMatchId(){
 const list=Object.values(matches).sort((a,b)=>(a.date||'').localeCompare(b.date||''));
 const today=new Date().toISOString().slice(0,10);
 const next=list.find(m=>(m.date||'')>=today);
 return (next||list[list.length-1]||{}).id;
}
function sortedMatches(){ return Object.values(matches).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')); }
