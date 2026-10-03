"use strict";

/* ================= INSPECTOR ================= */
function renderPane(){
 const m=M();
 document.querySelectorAll('#tabs button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===ui.tab)));
 const ch=checks(m); const errs=ch.filter(c=>c.lvl!=='info').length;
 const cc=$('checkCount'); cc.textContent=errs||'✓'; cc.className='count'+(errs?'':' ok');
 const pane=$('pane');
 if(ui.tab==='plan') pane.innerHTML=planPane(m);
 else if(ui.tab==='roles') pane.innerHTML=rolesPane(m);
 else if(ui.tab==='setp') pane.innerHTML=spPane(m);
 else pane.innerHTML=checksPane(m,ch);
}
function planPane(m){
 const st=STYLES[m.style]||STYLES.unknown; const T=total(m); const r=suggest(m);
 let h='<h3>Opponent</h3>';
 h+='<label class="field"><span>Name</span><input type="text" data-ch="opp" value="'+esc(m.opp)+'" placeholder="Opponent name"></label>';
 h+='<div class="field"><span>How they play</span>'+chipRow('style',STYLE_ORDER.map(k=>[k,STYLES[k].label]),m.style)+'</div>';
 h+='<p class="small muted" style="margin:6px 0 0">'+esc(st.sum)+'</p>';
 h+='<div class="field"><span>Their shape</span>'+chipRow('oppShape',OPP_SHAPES.map(k=>[k,k==='unknown'?'Not sure':k]),m.oppShape)+'</div>';
 h+='<div class="field"><span>Conditions</span>'+chipRow('pitch',[['dry','Dry'],['wet','Wet'],['heavy','Heavy'],['wind','Windy']],m.pitch)+'</div>';
 h+='<h3>Game state</h3>';
 h+='<div class="score"><div class="team"><button type="button" class="step" data-act="score" data-k="gf" data-d="-1" aria-label="Rovers goal down">−</button><span class="num">'+m.live.gf+'</span><button type="button" class="step" data-act="score" data-k="gf" data-d="1" aria-label="Rovers goal up">+</button></div><span class="vs">Rovers v '+esc(m.opp||'TBC')+'</span><div class="team"><button type="button" class="step" data-act="score" data-k="ga" data-d="-1" aria-label="Opponent goal down">−</button><span class="num">'+m.live.ga+'</span><button type="button" class="step" data-act="score" data-k="ga" data-d="1" aria-label="Opponent goal up">+</button></div></div>';
 h+='<div class="clock"><input type="range" min="0" max="'+T+'" step="1" value="'+Math.min(m.live.minute,T)+'" data-ch="minute" aria-label="Minute"><output id="minOut">'+Math.min(m.live.minute,T)+'′</output></div>';
 h+=chipRow('clock',[[0,'Kick-off'],[Math.round(T/2),'Half-time'],[Math.round(T*0.75),'Last quarter'],[T-5,'Final minutes']],-1);
 const same=sameAsSuggestion(m,r);
 h+='<div class="suggest"><div class="s-h"><div class="s-title">'+(same?'On plan: ':'Suggested: ')+esc(r.formation)+', '+BLOCK_TXT[r.block].toLowerCase()+'</div>'+(same?'<span class="same">Board matches</span>':'<button type="button" class="btn primary" data-act="applySuggest">Apply</button>')+'</div><ul>';
 if(FORM[r.formation].four) h+='<li>In possession, '+esc(fbTxt(m,r.fb))+'.</li>';
 const at=anchorTxt(m,r.anchor==='both'?'both':r.anchorRes,r.formation); if(at) h+='<li>Midfield: '+esc(at)+'.</li>';
 h+='<li>'+WIDTH_TXT[r.width]+' shape. '+esc(FORM[r.formation].desc.split('. ')[0])+'.</li></ul></div>';
 h+='<h3>Principles for this match</h3><ul class="tips">';
 st.tips.forEach(t=>h+='<li>'+tpl(m,t)+'</li>');
 h+='<li>'+tpl(m,SHAPE_TIPS[m.oppShape]||SHAPE_TIPS.unknown)+'</li>';
 r.stTips.forEach(t=>h+='<li>'+tpl(m,t)+'</li>');
 h+='<li>'+tpl(m,subTip(m))+'</li></ul>';
 h+='<h3>Match notes</h3><textarea data-ch="notes" rows="4" placeholder="Their danger men, our key match-ups, team talk points">'+esc(m.notes)+'</textarea>';
 return h;
}
function playerCard(m,p,slot){
 const L=slot?lab(m,slot):null; const f=slot?fit(p,L):null;
 let h='<div class="pcard"><div class="pc-top"><div class="pc-disc">'+(L||'SUB')+'</div><div><div class="pc-name">'+esc(p.name)+(p.id===m.captain?' <span class="armband">C</span>':p.id===m.vice?' <span class="armband vc">VC</span>':'')+'</div><div class="small muted">'+(L?esc(LABEL_FULL[L]):({yes:'On the bench',maybe:'Unconfirmed',no:'Unavailable'}[avail(m,p.id)]))+'</div></div></div>';
 h+='<dl><dt>Positions</dt><dd>'+(esc((p.pos||[]).map(c=>c==='ANY'?'Anywhere':c).join(', '))||'<span class="muted">Not listed</span>')+'</dd>';
 if(f) h+='<dt>Fit here</dt><dd>'+fitPill(f)+'</dd>';
 if((p.traits||[]).length) h+='<dt>Profile</dt><dd>'+esc(p.traits.join(', '))+'</dd>';
 if(p.notes) h+='<dt>Notes</dt><dd>'+esc(p.notes)+'</dd>';
 h+='</dl>';
 if(slot){
  const j=job(m,slot);
  h+='<div class="duty"><h4>With the ball</h4><p>'+j.ip+'</p><h4>Without the ball</h4><p>'+j.oop+'</p>'+(j.extra.length?'<h4>For '+esc(p.name)+'</h4><p>'+j.extra.join(' ')+'</p>':'')+'</div>';
 }
 h+='<div class="pc-acts">';
 if(p.id!==m.captain&&avail(m,p.id)!=='no') h+='<button type="button" class="btn" data-act="mkCap" data-id="'+p.id+'">Make captain</button>';
 if(p.id!==m.vice&&p.id!==m.captain&&avail(m,p.id)!=='no') h+='<button type="button" class="btn" data-act="mkVice" data-id="'+p.id+'">Make vice-captain</button>';
 if(slot) h+='<button type="button" class="btn" data-act="toBench" data-slot="'+slot+'">Move to bench</button>';
 h+='</div></div>';
 return h;
}
function rolesPane(m){
 let h='';
 const sel=ui.sel;
 if(sel&&sel.kind==='slot'&&m.lineup[sel.id]){
  const slot=sel.id, L=lab(m,slot);
  h+=playerCard(m,P(m.lineup[slot]),slot);
  const alts=squad.filter(p=>avail(m,p.id)!=='no'&&p.id!==m.lineup[slot]).map(p=>({p,f:fit(p,L),s:slotOf(m,p.id)})).filter(x=>x.f.score>=1.4).sort((a,b)=>(a.s?1:0)-(b.s?1:0)||b.f.score-a.f.score).slice(0,6);
  h+='<h3>Options at '+L+'</h3>';
  h+=alts.length?'<ul class="alts">'+alts.map(x=>'<li><span>'+esc(x.p.name)+(x.s?' <span class="small muted">(now '+lab(m,x.s)+')</span>':avail(m,x.p.id)==='maybe'?' <span class="small muted">(unconfirmed)</span>':'')+'</span>'+fitPill(x.f)+'<button type="button" class="btn" data-act="putIn" data-slot="'+slot+'" data-id="'+x.p.id+'">'+(x.s?'Swap':'Bring on')+'</button></li>').join('')+'</ul>':'<p class="small muted">No one else lists this position.</p>';
 } else if(sel&&sel.kind==='slot'){
  h+='<p class="muted">This slot is empty. Pick a player from the bench, or use Best XI.</p>';
 } else if(sel&&sel.kind==='player'&&P(sel.id)){
  const p=P(sel.id);
  h+=playerCard(m,p,slotOf(m,p.id));
  const opts=SLOTS.map(s=>({s,f:fit(p,lab(m,s))})).filter(x=>x.f.score>=1.4).sort((a,b)=>b.f.score-a.f.score).slice(0,5);
  h+='<h3>Where he fits in this shape</h3>'+(opts.length?'<ul class="alts">'+opts.map(x=>'<li><span>'+lab(m,x.s)+' <span class="small muted">for '+esc(nm(m.lineup[x.s])||'empty')+'</span></span>'+fitPill(x.f)+'<button type="button" class="btn" data-act="putIn" data-slot="'+x.s+'" data-id="'+p.id+'">Put in</button></li>').join('')+'</ul>':'<p class="small muted">No natural slot in this formation.</p>');
 } else {
  h+='<p class="muted" style="margin-top:0">Tap a shirt on the pitch for that player\'s brief and the best options at his position. Tap a bench player to see where he fits.</p>';
 }
 h+='<h3>Every player\'s job '+(ui.phase==='ip'?'with the ball':'without the ball')+'</h3><ul class="jobs">';
 const F=FORM[M().formation];
 SLOTS.slice().sort((a,b)=>{const pa=F.oop[a],pb=F.oop[b]; const ya=Math.round(pa[1]/7),yb=Math.round(pb[1]/7); return yb-ya||pa[0]-pb[0];}).forEach(s=>{ if(!m.lineup[s]) return; const j=job(m,s); h+='<li><span><b>'+esc(nm(m.lineup[s]))+'</b><small>'+j.label+'</small></span><span>'+(ui.phase==='ip'?j.ip:j.oop)+'</span></li>'; });
 h+='</ul>';
 return h;
}
function spPane(m){
 const xi=onPitch(m); const sp=m.sp||{};
 const sel=(k)=>'<select data-ch="sp" data-k="'+k+'"><option value="">Not set</option>'+xi.map(id=>'<option value="'+id+'"'+(sp[k]===id?' selected':'')+'>'+esc(nm(id))+'</option>').join('')+'</select>';
 let h='<div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><h3 style="margin:0">Attacking</h3><button type="button" class="btn" data-act="autoSP">Auto-assign</button></div>';
 h+='<p class="small muted">Auto-assign picks aerial targets from height and heading ability, and keeps two players back as rest defence.</p>';
 h+='<div class="sp-grid">'+SP_ATT.map(([k,l])=>'<label>'+l+'</label>'+sel(k)).join('')+'</div>';
 h+='<ul class="tips" style="margin-top:8px"><li><b>Two plus the keeper stay back</b> on every corner. A cheap counter from our own set piece is the most avoidable goal in rec football.</li><li><b>Near post flicks it, spot and far post attack it.</b> Start runs from deep and arrive late; a static header loses to a marker.</li><li><b>Edge of the box</b> wins the clearance and either shoots or recycles wide.</li></ul>';
 h+='<h3>Defending corners</h3><div class="sp-grid">'+SP_DEF.map(([k,l])=>'<label>'+l+'</label>'+sel(k)).join('')+'</div>';
 h+='<ul class="tips" style="margin-top:8px"><li><b>Hybrid marking.</b> Zonal across the six-yard box, plus man-markers on their two best headers. Zones attack the ball; markers stop runs.</li><li><b>Keep an outlet up.</b> One forward stays on the halfway line to pin two of their defenders and launch the counter.</li><li><b>'+esc(nm(m.lineup.GK)||'The keeper')+' owns the six-yard box.</b> Anything inside it is his; call early.</li><li><b>Step out together</b> after the first clearance so their second ball is offside.</li></ul>';
 return h;
}
function checksPane(m,ch){
 if(!ch.length) return '<p class="muted">All clear: full XI, everyone available and in position, captaincy set.</p>';
 const ic={err:'Fix',warn:'Check',info:'Note'};
 return '<p class="small muted" style="margin-top:0">Run through these before kick-off.</p>'+ch.sort((a,b)=>({err:0,warn:1,info:2}[a.lvl]-{err:0,warn:1,info:2}[b.lvl])).map(c=>'<div class="check '+c.lvl+'"><span class="ic">'+ic[c.lvl]+'</span><span>'+c.txt+'</span></div>').join('');
}

/* ================= ROTATION VIEW ================= */
function renderRotation(){
 const m=M(); const F=FORM[m.formation]; const T=total(m); const g=rotGrid(m); const n=g.length; const bl=T/n;
 const pool=squad.filter(p=>avail(m,p.id)==='yes'||slotOf(m,p.id));
 const generated=(m.rot.grid||[]).length>0;
 let h='<div class="view-head"><div><h1>Rotation plan</h1><p>Superleague subs are unlimited and rolling. Plan who plays when, so pressing roles stay fresh and everyone gets fair minutes. Block 1 is your starting XI from the board.</p></div>';
 h+='<div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end"><div class="ctl"><span>Match</span><div style="display:flex;gap:6px;align-items:center"><select data-ch="halves" style="width:auto">'+[1,2].map(v=>'<option value="'+v+'"'+(+m.halves===v?' selected':'')+'>'+(v===1?'One period':'Two halves')+'</option>').join('')+'</select><span class="small muted">of</span><input type="number" min="5" max="60" data-ch="halfLen" value="'+m.halfLen+'" style="width:64px"><span class="small muted">min</span></div></div>';
 h+='<div class="ctl"><span>Sub windows</span>'+seg('blocks',[[2,'2'],[3,'3'],[4,'4'],[6,'6']],n)+'</div>';
 h+='<div class="ctl"><span>Keep the spine</span>'+seg('spine',[['1','On'],['0','Off']],m.rot.spine?'1':'0')+'</div>';
 h+='<button type="button" class="btn primary" data-act="genRot">'+(generated?'Regenerate':'Generate plan')+'</button></div></div>';
 h+='<div class="rot-layout"><div class="card" style="padding:12px"><div class="tablewrap"><table class="rot"><thead><tr><th>Pos</th>';
 for(let b=0;b<n;b++) h+='<th>'+Math.round(bl*b)+'′ to '+Math.round(bl*(b+1))+'′'+(b===0?' <span class="muted">(XI)</span>':'')+'</th>';
 h+='</tr></thead><tbody>';
 const order=SLOTS.slice().sort((a,b)=>{const pa=F.oop[a],pb=F.oop[b]; const ya=Math.round(pa[1]/7),yb=Math.round(pb[1]/7); return yb-ya||pa[0]-pb[0];});
 order.forEach(s=>{
  h+='<tr><td class="pos">'+F.lab[s]+'</td>';
  for(let b=0;b<n;b++){
   const id=g[b][s]; const chg=b>0&&g[b-1][s]!==id; const f=id?fitOf(m,s,id):{tier:'unknown'};
   if(b===0) h+='<td><strong>'+esc(nm(id)||'Empty')+'</strong></td>';
   else h+='<td class="'+(chg?'chg':'')+'"><select data-ch="rotCell" data-b="'+b+'" data-slot="'+s+'" class="f-'+f.tier+'" aria-label="'+F.lab[s]+', block '+(b+1)+'"><option value="">Empty</option>'+pool.map(p=>'<option value="'+p.id+'"'+(p.id===id?' selected':'')+'>'+esc(p.name)+'</option>').join('')+'</select></td>';
  }
  h+='</tr>';
 });
 h+='<tr><td class="pos"><span class="armband" title="Armband">C</span></td>'; for(let b=0;b<n;b++){ const a=armband(m,g[b]); h+='<td class="small">'+(a?esc(nm(a)):'<span class="muted">Not set</span>')+'</td>'; } h+='</tr>';
 h+='</tbody></table></div>';
 if(!generated) h+='<p class="small muted" style="margin:10px 0 0">Press Generate plan to rotate the bench in. You can then change any cell by hand; highlighted cells are changes.</p>';
 h+='</div><div style="display:flex;flex-direction:column;gap:14px">';
 const mins=minutesPlan(m); const list=pool.map(p=>({p,v:Math.round(mins[p.id]||0)})).sort((a,b)=>b.v-a.v);
 h+='<div class="card" style="padding:12px"><h2 style="font-size:19px">Planned minutes</h2><ul class="plist mins" style="margin-top:6px">'+list.map(x=>'<li><span>'+esc(x.p.name)+'</span><span class="bar"><i style="width:'+(100*x.v/T)+'%"></i></span><span class="small" style="text-align:right">'+x.v+'′</span></li>').join('')+'</ul></div>';
 const calls=subCalls(m).filter(c=>c.on.length||c.moves.length);
 h+='<div class="card" style="padding:12px"><h2 style="font-size:19px">Calls from the touchline</h2>'+(calls.length?'<ul class="calls">'+calls.map(c=>{ const parts=c.on.map((id,i)=>esc(nm(id))+' on'+(c.off[i]?' for '+esc(nm(c.off[i])):'')+' ('+F.lab[SLOTS.find(s=>c.grid[s]===id)]+')'); c.moves.forEach(x=>{ if(!c.on.includes(x.id)) parts.push(esc(nm(x.id))+' moves '+F.lab[x.from]+' to '+F.lab[x.to]); }); return '<li><b>'+c.min+'′</b>'+parts.join('. ')+'.</li>'; }).join('')+'</ul>':'<p class="small muted">No changes planned yet.</p>')+'</div>';
 h+='<div class="card" style="padding:12px"><h2 style="font-size:19px">Why rotate like this</h2><ul class="tips"><li><b>Pressing roles burn out first.</b> Wingers, the striker and fullbacks make the most high-intensity runs, so they rotate most.</li><li><b>Keep the spine.</b> Keeper, centre backs and the holding midfielder organise everyone else. Changing them breaks communication, so the plan keeps them on longer.</li><li><b>Sub in windows.</b> Changing two or three at once, at a dead ball, keeps the shape stable rather than drip-feeding changes.</li><li><b>Armband follows the plan.</b> When the captain comes off, the vice-captain takes over.</li></ul></div>';
 h+='</div></div>';
 $('view-rotation').innerHTML=h;
}

/* ================= SQUAD VIEW ================= */
function renderSquad(){
 const m=M();
 let h='<div class="view-head"><div><h1>Squad</h1><p>The whole season squad. Edit positions in order of preference (for example <em>CB, CDM</em>); the board uses them to rate every player in every slot. Availability is for the selected match: vs '+esc(m.opp||'TBC')+', '+esc(fmtDate(m.date))+'.</p></div><button type="button" class="btn primary" data-act="addPlayer">Add player</button></div>';
 h+='<div class="card" style="padding:6px 12px 12px"><div class="tablewrap"><table class="sq"><thead><tr><th>Name</th><th>Positions</th><th>Profile</th><th>Notes</th><th>This match</th><th></th></tr></thead><tbody>';
 squad.slice().sort((a,b)=>a.name.localeCompare(b.name)).forEach(p=>{
  const a=avail(m,p.id);
  h+='<tr><td class="nm"><input type="text" data-ch="pName" data-id="'+p.id+'" value="'+esc(p.name)+'" aria-label="Name" style="min-width:110px"></td>';
  h+='<td><input type="text" data-ch="pPos" data-id="'+p.id+'" value="'+esc((p.pos||[]).join(', '))+'" placeholder="e.g. CB, CDM" aria-label="Positions for '+esc(p.name)+'" style="min-width:130px"></td>';
  h+='<td><button type="button" class="traitbtn" data-act="traitPick" data-id="'+p.id+'" aria-haspopup="true" aria-expanded="false" aria-label="Profile for '+esc(p.name)+'"><span>'+(esc((p.traits||[]).join(', '))||'<span class="muted">Add profile</span>')+'</span><svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 5l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button></td>';
  h+='<td><input type="text" data-ch="pNotes" data-id="'+p.id+'" value="'+esc(p.notes||'')+'" aria-label="Notes for '+esc(p.name)+'" style="min-width:200px"></td>';
  h+='<td>'+seg('avail',[['yes','In'],['maybe','?'],['no','Out']],a,' data-id="'+p.id+'"')+'</td>';
  h+='<td><button type="button" class="btn ghost danger" data-act="delPlayer" data-id="'+p.id+'" aria-label="Remove '+esc(p.name)+'">Remove</button></td></tr>';
 });
 h+='</tbody></table></div>';
 h+='<p class="small muted" style="margin:8px 0 0">Position codes: '+POS_CODES.join(', ')+'. Profile: tick as many as apply; the board uses them for roles, set pieces and match-up warnings.</p></div>';
 h+='<h2 style="font-size:22px;margin:22px 0 10px">Depth chart</h2><div class="depth">';
 ['GK','CB','LB','RB','CDM','CM','CAM','LW','RW','ST'].forEach(c=>{
  const list=squad.filter(p=>(p.pos||[]).includes(c)||(p.pos||[]).includes('ANY')&&c!=='GK').map(p=>({p,i:p.pos.includes('ANY')?9:p.pos.indexOf(c)})).sort((a,b)=>a.i-b.i);
  const av=list.filter(x=>avail(m,x.p.id)==='yes').length;
  h+='<div class="'+(av<2?'thin':'')+'"><h3><span>'+c+'</span><span class="small muted" style="font-family:var(--body);font-weight:500">'+av+' in</span></h3><ol>'+list.map(x=>'<li class="'+(avail(m,x.p.id)==='yes'?'':'muted')+'">'+(x.i===0?'<b>'+esc(x.p.name)+'</b>':esc(x.p.name))+'</li>').join('')+'</ol></div>';
 });
 h+='</div><p class="small muted">Bold: first-listed position. Red outline: fewer than two available for this match.</p>';
 $('view-squad').innerHTML=h;
}

/* ================= DIALOGS ================= */
function openDlg(html){ const d=$('dlg'); d.innerHTML=html; if(!d.open) d.showModal(); }
function closeDlg(){ const d=$('dlg'); if(d.open) d.close(); }
function matchesDlg(){
 const list=sortedMatches();
 let h='<div class="dlg-h"><h2>Season fixtures</h2><button type="button" class="btn ghost" data-act="closeDlg" aria-label="Close">Close</button></div><div class="dlg-b"><ul class="mlist">';
 list.forEach((m,i)=>{ const r=m.result&&m.result.gf!==''&&m.result.ga!==''?m.result.gf+' – '+m.result.ga:''; h+='<li><button type="button" data-act="pickMatch" data-id="'+m.id+'" aria-current="'+(m.id===curId)+'"><span><b>Matchday '+(i+1)+': vs '+esc(m.opp||'TBC')+'</b><br><span class="small muted">'+esc(fmtDate(m.date))+(m.time?', '+esc(m.time):'')+'</span></span><span class="r">'+esc(r)+'</span></button></li>'; });
 h+='</ul></div><div class="dlg-f"><button type="button" class="btn" data-act="editMatch">Edit this match</button><button type="button" class="btn primary" data-act="newMatch">Add match</button></div>';
 openDlg(h);
}
function editDlg(){
 const m=M();
 let h='<div class="dlg-h"><h2>Match details</h2><button type="button" class="btn ghost" data-act="closeDlg">Close</button></div><div class="dlg-b">';
 h+='<label class="field"><span>Opponent</span><input type="text" id="eOpp" value="'+esc(m.opp)+'"></label>';
 h+='<div class="grid2"><label class="field"><span>Date</span><input type="date" id="eDate" value="'+esc(m.date)+'"></label><label class="field"><span>Kick-off</span><input type="time" id="eTime" value="'+esc(m.time)+'"></label></div>';
 h+='<label class="field"><span>Pitch or venue</span><input type="text" id="eVenue" value="'+esc(m.venue)+'" placeholder="e.g. UCD Pitch 3"></label>';
 h+='<div class="grid2"><label class="field"><span>Periods</span><select id="eHalves"><option value="2"'+(+m.halves===2?' selected':'')+'>Two halves</option><option value="1"'+(+m.halves===1?' selected':'')+'>One period</option></select></label><label class="field"><span>Minutes per period</span><input type="number" id="eLen" min="5" max="60" value="'+m.halfLen+'"></label></div>';
 h+='<div class="grid2"><label class="field"><span>Final score, Rovers</span><input type="number" id="eGf" min="0" value="'+esc(m.result.gf)+'"></label><label class="field"><span>Final score, opponent</span><input type="number" id="eGa" min="0" value="'+esc(m.result.ga)+'"></label></div>';
 h+='</div><div class="dlg-f">'+(Object.keys(matches).length>1?'<button type="button" class="btn danger" data-act="delMatch" style="margin-right:auto">Delete match</button>':'')+'<button type="button" class="btn" data-act="closeDlg">Cancel</button><button type="button" class="btn primary" data-act="saveEdit">Save details</button></div>';
 openDlg(h);
}
function sheetDlg(){
 const t=teamSheet(M());
 openDlg('<div class="dlg-h"><h2>Team sheet</h2><button type="button" class="btn ghost" data-act="closeDlg">Close</button></div><div class="dlg-b"><p class="small muted" style="margin-top:0">Ready to paste into the team group chat.</p><pre class="sheet" id="sheetTxt">'+esc(t)+'</pre></div><div class="dlg-f"><button type="button" class="btn primary" data-act="copySheet">Copy text</button></div>');
}
