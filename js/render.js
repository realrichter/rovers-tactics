"use strict";

/* ================= RENDER: SHELL ================= */
function showBanner(html){ const b=$('banner'); b.innerHTML=html; b.hidden=false; }
function hideBanner(){ $('banner').hidden=true; }
let toastT;
function toast(t){ const el=$('toast'); el.textContent=t; el.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>{el.hidden=true;},2600); }
function seg(act,items,cur,extra){ return '<div class="seg" role="group">'+items.map(([v,l,dis])=>'<button type="button" data-act="'+act+'" data-v="'+esc(v)+'" aria-pressed="'+(String(cur)===String(v))+'"'+(dis?' disabled':'')+(extra||'')+'>'+esc(l)+'</button>').join('')+'</div>'; }
function chipRow(act,items,cur){ return '<div class="chips">'+items.map(([v,l])=>'<button type="button" class="chip" data-act="'+act+'" data-v="'+esc(v)+'" aria-pressed="'+(String(cur)===String(v))+'">'+esc(l)+'</button>').join('')+'</div>'; }
const FIT_SHORT={natural:'Natural',listed:'Listed',cover:'Can cover',out:'No fit',unknown:'Unknown'};
function fitPill(f,short){ return '<span class="fitpill fit-'+f.tier+'">'+(short?FIT_SHORT:FIT_TXT)[f.tier]+'</span>'; }

function render(){
 const m=M(); if(!m) return;
 const idx=sortedMatches().findIndex(x=>x.id===m.id)+1;
 $('mbOpp').textContent='vs '+(m.opp||'TBC');
 $('mbDate').textContent=fmtDate(m.date)+(m.time?', '+m.time:'')+', matchday '+idx;
 document.querySelectorAll('.views button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.view===ui.view)));
 $('view-board').hidden=ui.view!=='board'; $('view-rotation').hidden=ui.view!=='rotation'; $('view-squad').hidden=ui.view!=='squad';
 if(ui.view==='board'){ renderRail(); renderToolbar(); renderPitch(); renderLegend(); renderShape(); renderPane(); }
 else if(ui.view==='rotation') renderRotation();
 else renderSquad();
 refreshSync();
}

/* ================= RAIL ================= */
function prow(m,p,slot,selSlotLabel){
 const a=avail(m,p.id);
 const pressed=ui.sel&&ui.sel.kind==='player'&&ui.sel.id===p.id;
 let right='';
 if(selSlotLabel) right=fitPill(fit(p,selSlotLabel),true);
 else if(p.id===m.captain) right='<span class="armband" title="Captain">C</span>';
 else if(p.id===m.vice) right='<span class="armband vc" title="Vice-captain">VC</span>';
 const lead=slot?'<span class="slotlab">'+lab(m,slot)+'</span>':'<button type="button" class="av" data-act="cycleAvail" data-id="'+p.id+'" data-a="'+a+'" aria-label="'+esc(p.name)+': '+({yes:'available',maybe:'unconfirmed',no:'out'}[a])+'. Change availability"></button>';
 return '<li class="prow" data-pid="'+p.id+'" role="button" tabindex="0" aria-pressed="'+pressed+'">'+lead+'<span><span class="nm">'+esc(p.name)+'</span><span class="ps">'+esc((p.pos||[]).map(c=>c==='ANY'?'Anywhere':c).join(', ')||'Positions to confirm')+'</span></span>'+right+'</li>';
}
function renderRail(){
 const m=M(); const F=FORM[m.formation];
 const selL=ui.sel&&ui.sel.kind==='slot'?F.lab[ui.sel.id]:null;
 const avOpts=squad.filter(p=>avail(m,p.id)!=='no');
 const opt=(cur)=>'<option value="">None</option>'+avOpts.map(p=>'<option value="'+p.id+'"'+(p.id===cur?' selected':'')+'>'+esc(p.name)+'</option>').join('');
 const xiOrder=SLOTS.slice().sort((a,b)=>{const pa=F.oop[a],pb=F.oop[b]; const ya=Math.round(pa[1]/7),yb=Math.round(pb[1]/7); return yb-ya||pa[0]-pb[0];});
 const xi=xiOrder.filter(s=>m.lineup[s]).map(s=>prow(m,P(m.lineup[s])||{id:m.lineup[s],name:'?',pos:[]},s,selL)).join('');
 const bench=squad.filter(p=>avail(m,p.id)==='yes'&&!slotOf(m,p.id));
 const unsure=squad.filter(p=>avail(m,p.id)==='maybe'&&!slotOf(m,p.id));
 const out=squad.filter(p=>avail(m,p.id)==='no'&&!slotOf(m,p.id));
 const availN=squad.filter(p=>avail(m,p.id)==='yes').length;
 let h='<h2>Matchday squad</h2><p class="small muted" style="margin:2px 0 0">'+availN+' available, '+unsure.length+' unconfirmed, '+out.length+' out</p>';
 h+='<div class="lead-grid"><span class="armband" aria-hidden="true">C</span><select data-ch="captain" aria-label="Captain">'+opt(m.captain)+'</select><span class="armband vc" aria-hidden="true">VC</span><select data-ch="vice" aria-label="Vice-captain">'+opt(m.vice)+'</select></div>';
 h+='<div class="sub-h">Starting XI <small>'+(selL?'fit for '+selL:'tap two to swap')+'</small></div><ul class="plist">'+xi+'</ul>';
 h+='<div class="sub-h">Bench <small>'+bench.length+' fresh legs</small></div><ul class="plist">'+(bench.map(p=>prow(m,p,null,selL)).join('')||'<li class="small muted" style="padding:4px 6px">No one available on the bench.</li>')+'</ul>';
 if(unsure.length) h+='<div class="sub-h">Unconfirmed <small>tap the circle to confirm</small></div><ul class="plist">'+unsure.map(p=>prow(m,p,null,selL)).join('')+'</ul>';
 h+='<div class="sub-h"><button type="button" class="btn ghost" style="padding:0;min-height:0" data-act="toggleOut" aria-expanded="'+ui.showOut+'">'+(ui.showOut?'Hide':'Show')+' unavailable ('+out.length+')</button></div>';
 if(ui.showOut) h+='<ul class="plist">'+out.map(p=>prow(m,p,null,selL)).join('')+'</ul>';
 h+='<div class="tools"><button type="button" class="btn" data-act="bestXI" title="Pick the strongest XI from available players for this shape">Best XI</button><button type="button" class="btn" data-act="refit" title="Keep these 11, put each in his best slot">Re-fit to shape</button><button type="button" class="btn" data-act="sheet">Team sheet</button></div>';
 if(unsure.length) h+='<div class="tools"><button type="button" class="btn ghost" data-act="allAvail">Mark all unconfirmed as available</button></div>';
 $('rail').innerHTML=h;
}

/* ================= TOOLBAR / SHAPE ================= */
function renderToolbar(){
 const m=M();
 let h='<select class="form-sel" data-ch="formation" aria-label="Formation">'+FORM_ORDER.map(f=>'<option'+(f===m.formation?' selected':'')+'>'+f+'</option>').join('')+'</select>';
 h+=seg('phase',[['ip','In possession'],['oop','Out of possession']],ui.phase);
 h+='<button type="button" class="btn" data-act="png" style="margin-left:auto">Save image</button>';
 $('toolbar').innerHTML=h;
 let t='<div class="ctl"><span>Pitch tool</span>'+seg('tool',[['move','Move players'],['run','Draw run'],['pass','Draw pass']],ui.tool)+'</div>';
 t+='<div class="ctl"><span>Overlays</span><div class="seg" role="group">'+[['opp','Opponent'],['zones','Overloads'],['net','Passing lanes']].map(([k,l])=>'<button type="button" data-act="ov" data-v="'+k+'" aria-pressed="'+ui.ov[k]+'">'+l+'</button>').join('')+'</div></div>';
 const na=(m.arrows[ui.phase]||[]).length;
 if(na) t+='<div class="ctl"><span>'+na+' line'+(na>1?'s':'')+' drawn</span><div style="display:flex;gap:6px"><button type="button" class="btn" data-act="undoArrow">Undo</button><button type="button" class="btn" data-act="clearArrows">Clear</button></div></div>';
 $('tools2').innerHTML=t;
 $('pitch').dataset.tool=ui.tool;
}
function renderShape(){
 const m=M(); const F=FORM[m.formation];
 let h='<div class="ctl"><span>Defensive block</span>'+seg('block',[['deep','Low'],['mid','Mid'],['high','High press']],m.block)+'</div>';
 h+='<div class="ctl"><span>Width</span>'+seg('width',[['narrow','Narrow'],['normal','Normal'],['wide','Wide']],m.width)+'</div>';
 if(F.four){
  const ln=nm(m.lineup.LB)||'LB', rn=nm(m.lineup.RB)||'RB';
  h+='<div class="ctl"><span>Fullbacks in possession</span>'+seg('fb',[['none','Both stay'],['LB',ln+' goes'],['RB',rn+' goes'],['both','Both go']],m.fb)+'</div>';
 }
 if(F.pivot){
  const a=nm(m.lineup.DM1)||'Left', b=nm(m.lineup.DM2)||'Right';
  h+='<div class="ctl"><span>Holding midfield</span>'+seg('anchor',[['DM1',a+' holds'],['DM2',b+' holds'],['both','Both hold']],m.anchor==='one'?anchorSlot(m):m.anchor)+'</div>';
 }
 const hasOff=Object.keys(m.offsets.ip||{}).length+Object.keys(m.offsets.oop||{}).length;
 if(hasOff) h+='<div class="ctl"><span>&nbsp;</span><button type="button" class="btn" data-act="resetPos">Reset dragged positions</button></div>';
 h+='<p class="small muted" style="margin:0;flex-basis:100%">'+esc(F.desc)+' Out of possession it becomes a '+esc(F.oopName)+'; in possession, '+esc(F.ipName)+'.</p>';
 $('shapeCtl').innerHTML=h;
}
function renderLegend(){
 const m=M();
 let h='<span><i style="background:#3FB37A"></i>Listed position</span><span><i style="background:#E3AE55"></i>Can cover</span><span><i style="background:#E5564B"></i>Out of position</span>';
 if(ui.ov.opp&&m.oppShape!=='unknown') h+='<span><svg width="12" height="11" aria-hidden="true"><path d="M1 1h10L6 10z" fill="#C8443C" stroke="#fff"/></svg>Opponent ('+esc(m.oppShape)+')</span>';
 if(ui.ov.zones) h+= m.oppShape==='unknown'?'<span>Set their shape under Game plan to see overloads</span>':'<span><i style="background:rgba(63,179,122,.6);border-radius:2px"></i>We outnumber them</span><span><i style="background:rgba(229,86,75,.6);border-radius:2px"></i>They outnumber us</span>';
 h+='<span>'+(ui.tool==='move'?'Drag a shirt to fine-tune. Tap two shirts to swap; tap the grass or press Esc to deselect. To sub, tap a bench player then a shirt, or drag him onto it.':'Drag on the pitch to draw a '+(ui.tool==='run'?'run':'pass')+'.')+'</span>';
 $('legend').innerHTML=h;
}

/* ================= PITCH SVG ================= */
const VW=680,VH=1000,X0=20,Y0=20,PW=640,PH=960;
const SX=x=>X0+x*PW/100, SY=y=>Y0+y*PH/100;
const FIT_COL={natural:'#3FB37A',listed:'#3FB37A',cover:'#E3AE55',out:'#E5564B',unknown:'#9AA5B1'};
function pitchMarkings(oy){
 oy=oy||0; const Y=v=>v+oy; const o=[];
 o.push('<rect x="0" y="'+Y(0)+'" width="'+VW+'" height="'+VH+'" fill="#245a3b"/>');
 for(let i=0;i<12;i++) o.push('<rect x="'+X0+'" y="'+Y(Y0+i*PH/12)+'" width="'+PW+'" height="'+(PH/12+0.5)+'" fill="'+(i%2?'#2a6644':'#2e6d49')+'"/>');
 const L='fill="none" stroke="#F4EAD3" stroke-opacity=".78" stroke-width="2.4"';
 const cx=X0+PW/2, mid=Y0+PH/2, bot=Y0+PH, bw=379, bd=151, sw=172, sd=50, spot=101, r=86;
 o.push('<rect x="'+X0+'" y="'+Y(Y0)+'" width="'+PW+'" height="'+PH+'" '+L+'/>');
 o.push('<line x1="'+X0+'" y1="'+Y(mid)+'" x2="'+(X0+PW)+'" y2="'+Y(mid)+'" '+L+'/>');
 o.push('<circle cx="'+cx+'" cy="'+Y(mid)+'" r="'+r+'" '+L+'/><circle cx="'+cx+'" cy="'+Y(mid)+'" r="3.5" fill="#F4EAD3" fill-opacity=".8"/>');
 [[Y0,1],[bot,-1]].forEach(([gy,dir])=>{
  const by=dir>0?gy:gy-bd, sy=dir>0?gy:gy-sd;
  o.push('<rect x="'+(cx-bw/2)+'" y="'+Y(by)+'" width="'+bw+'" height="'+bd+'" '+L+'/>');
  o.push('<rect x="'+(cx-sw/2)+'" y="'+Y(sy)+'" width="'+sw+'" height="'+sd+'" '+L+'/>');
  const py=gy+dir*spot; o.push('<circle cx="'+cx+'" cy="'+Y(py)+'" r="3" fill="#F4EAD3" fill-opacity=".8"/>');
  const ey=gy+dir*bd, dx=Math.sqrt(r*r-Math.pow(bd-spot,2));
  o.push('<path d="M'+(cx-dx)+' '+Y(ey)+' A'+r+' '+r+' 0 0 '+(dir>0?0:1)+' '+(cx+dx)+' '+Y(ey)+'" '+L+'/>');
  const gyy=dir>0?gy-9:gy; o.push('<rect x="'+(cx-37)+'" y="'+Y(gyy)+'" width="74" height="9" fill="#F4EAD3" fill-opacity=".25" stroke="#F4EAD3" stroke-opacity=".78" stroke-width="2"/>');
 });
 // thirds guides
 o.push('<line x1="'+X0+'" y1="'+Y(SY(33.33))+'" x2="'+(X0+PW)+'" y2="'+Y(SY(33.33))+'" stroke="#F4EAD3" stroke-opacity=".12" stroke-dasharray="6 8" stroke-width="1.5"/>');
 o.push('<line x1="'+X0+'" y1="'+Y(SY(66.66))+'" x2="'+(X0+PW)+'" y2="'+Y(SY(66.66))+'" stroke="#F4EAD3" stroke-opacity=".12" stroke-dasharray="6 8" stroke-width="1.5"/>');
 return o.join('');
}
function tokenSVG(m,slot,x,y,opts){
 const id=m.lineup[slot], p=P(id), L=lab(m,slot);
 const f=id?fitOf(m,slot,id):{tier:'unknown'};
 const sel=!opts.exp&&ui.sel&&ui.sel.kind==='slot'&&ui.sel.id===slot;
 const name=p?p.name:'Empty';
 let g='<g class="tok" data-slot="'+slot+'" '+(opts.exp?'transform="translate('+x.toFixed(1)+' '+y.toFixed(1)+')"':'style="transform:translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px)"')+(opts.exp?'':' tabindex="0" role="button" aria-label="'+esc(name)+', '+esc(LABEL_FULL[L])+(sel?', selected':'')+'"')+'>';
 g+='<circle r="38" fill="transparent"/>';
 if(sel) g+='<circle r="35" fill="none" stroke="#E39B2D" stroke-width="4"/>';
 g+='<circle class="disc" r="28" fill="'+(id?'#F4EAD3':'#2e6d49')+'" stroke="'+(id?'#7A4A10':'#F4EAD3')+'" stroke-width="3"'+(id?'':' stroke-dasharray="5 4"')+'/>';
 g+='<text y="7" text-anchor="middle" font-family="Barlow Condensed,Arial Narrow,Arial,sans-serif" font-weight="800" font-size="'+(L.length>2?17:20)+'" fill="'+(id?'#3A2A12':'#F4EAD3')+'">'+L+'</text>';
 if(id){
  g+='<circle cx="-20" cy="20" r="7" fill="'+FIT_COL[f.tier]+'" stroke="#1d3a28" stroke-width="2"/>';
  if(id===m.captain) g+='<rect x="12" y="-34" width="22" height="20" rx="4" fill="#E39B2D" stroke="#1d3a28" stroke-width="2"/><text x="23" y="-19" text-anchor="middle" font-family="Barlow Condensed,Arial Narrow,Arial,sans-serif" font-weight="800" font-size="15" fill="#2B1700">C</text>';
  else if(id===m.vice) g+='<rect x="10" y="-34" width="27" height="19" rx="4" fill="#1d3a28" stroke="#E39B2D" stroke-width="1.6"/><text x="23.5" y="-20" text-anchor="middle" font-family="Barlow Condensed,Arial Narrow,Arial,sans-serif" font-weight="800" font-size="12.5" fill="#E39B2D">VC</text>';
 }
 g+='<text y="52" text-anchor="middle" font-family="Barlow,Arial,sans-serif" font-weight="700" font-size="19" fill="#FFFFFF" stroke="#173322" stroke-width="4" stroke-linejoin="round" paint-order="stroke">'+esc(name)+'</text>';
 if(opts.benchFit){ const bf=opts.benchFit; g+='<g transform="translate(0 -50)"><rect x="-34" y="-11" width="68" height="20" rx="10" fill="'+FIT_COL[bf.tier]+'"/><text y="4" text-anchor="middle" font-family="Barlow,Arial,sans-serif" font-size="11.5" font-weight="700" fill="#10251a">'+({natural:'Natural',listed:'Listed',cover:'Cover',out:'No',unknown:'?'}[bf.tier])+'</text></g>'; }
 g+='</g>';
 return g;
}
function arrowSVG(a,i){
 const run=a.k==='run';
 const x1=SX(a.x1),y1=SY(a.y1),x2=SX(a.x2),y2=SY(a.y2);
 const mx=(x1+x2)/2, my=(y1+y2)/2, dx=x2-x1, dy=y2-y1, len=Math.hypot(dx,dy)||1;
 const bend=run?Math.min(40,len*0.18):0; const cx=mx-dy/len*bend, cy=my+dx/len*bend;
 return '<path d="M'+x1+' '+y1+' Q'+cx+' '+cy+' '+x2+' '+y2+'" fill="none" stroke="'+(run?'#E39B2D':'#F4EAD3')+'" stroke-width="'+(run?4:3)+'" '+(run?'':'stroke-dasharray="9 7" ')+'stroke-linecap="round" marker-end="url(#'+(run?'ahRun':'ahPass')+')" opacity=".95"/>';
}
function buildPitch(opts){
 opts=opts||{}; const m=M(); const ph=ui.phase;
 const o=[];
 const H=opts.exp?VH+190:VH, oy=opts.exp?120:0;
 o.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+VW+' '+H+'" width="'+VW+'" height="'+H+'" role="img" aria-label="'+esc(m.formation)+', '+(ph==='ip'?'in possession':'out of possession')+'">');
 o.push('<defs><marker id="ahRun" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#E39B2D"/></marker><marker id="ahPass" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#F4EAD3"/></marker></defs>');
 if(opts.exp){
  o.push('<rect width="'+VW+'" height="'+H+'" fill="#17251c"/>');
  o.push('<text x="24" y="48" font-family="Barlow Condensed,Arial Narrow,Arial,sans-serif" font-weight="800" font-size="34" fill="#F4EAD3">Cream Flow Rovers v '+esc(m.opp||'TBC')+'</text>');
  o.push('<text x="24" y="80" font-family="Barlow,Arial,sans-serif" font-size="18" fill="#C9D3CC">'+esc(fmtDate(m.date))+(m.time?', '+esc(m.time):'')+'. '+esc(m.formation)+', '+(ph==='ip'?'in possession':'out of possession')+'</text>');
  o.push('<g transform="translate(0 '+oy+')">');
 }
 o.push(pitchMarkings(0));
 // zones
 if(ui.ov.zones){ const ol=overloads(m,ph); if(ol){ for(let r=0;r<3;r++) for(let c=0;c<3;c++){ const d=ol.us[r][c]-ol.them[r][c]; if(!d) continue; const x=SX([0,33,67][c]), w=SX([33,67,100][c])-x, y=SY([0,33.33,66.66][r]), h=SY([33.33,66.66,100][r])-y; o.push('<rect x="'+(x+3)+'" y="'+(y+3)+'" width="'+(w-6)+'" height="'+(h-6)+'" rx="6" fill="'+(d>0?'#58D08F':'#FF6A5E')+'" fill-opacity="'+Math.min(.22,.1+.05*Math.abs(d))+'" stroke="'+(d>0?'#7BE0A8':'#FF8A80')+'" stroke-opacity=".75" stroke-width="2.5" stroke-dasharray="10 6"/><text x="'+(x+10)+'" y="'+(y+26)+'" font-family="Barlow Condensed,Arial Narrow,sans-serif" font-weight="800" font-size="22" fill="#fff" fill-opacity=".9">'+(d>0?'+':'−')+Math.abs(d)+'</text><text x="'+(x+10)+'" y="'+(y+44)+'" font-family="Barlow,Arial,sans-serif" font-size="12" fill="#fff" fill-opacity=".75">'+ol.us[r][c]+' v '+ol.them[r][c]+'</text>'); } } }
 o.push('<text x="'+(X0+PW-10)+'" y="'+(Y0+20)+'" text-anchor="end" font-family="Barlow,Arial,sans-serif" font-size="15" fill="#F4EAD3" fill-opacity=".65">Attacking this way ↑</text>');
 const pos={}; SLOTS.forEach(s=>{ pos[s]=computePos(m,s,ph); });
 if(ui.ov.net){
  const ids=SLOTS; for(let i=0;i<ids.length;i++) for(let j=i+1;j<ids.length;j++){ const a=pos[ids[i]],b=pos[ids[j]]; const d=Math.hypot((a[0]-b[0])*0.68,(a[1]-b[1])*1.05); if(d<21) o.push('<line x1="'+SX(a[0])+'" y1="'+SY(a[1])+'" x2="'+SX(b[0])+'" y2="'+SY(b[1])+'" stroke="#F4EAD3" stroke-opacity="'+(d<14?.55:.3)+'" stroke-width="2" stroke-dasharray="3 5"/>'); }
 }
 if(ui.ov.opp&&m.oppShape!=='unknown'){ oppPos(m.oppShape,ph).forEach(([x,y])=>{ const X=SX(x),Y=SY(y); o.push('<path d="M'+(X-10)+' '+(Y-8)+' h20 l-10 17 z" fill="#C8443C" stroke="#fff" stroke-width="1.6" opacity=".92"/>'); }); }
 (m.arrows[ph]||[]).forEach((a,i)=>o.push(arrowSVG(a,i)));
 o.push('<g id="tmpArrow"></g>');
 const selP=!opts.exp&&ui.sel&&ui.sel.kind==='player'?P(ui.sel.id):null;
 SLOTS.slice().sort((a,b)=>pos[a][1]-pos[b][1]).forEach(s=>{ o.push(tokenSVG(m,s,SX(pos[s][0]),SY(pos[s][1]),{exp:opts.exp,benchFit:selP&&m.lineup[s]!==selP.id?fit(selP,lab(m,s)):null})); });
 if(opts.exp){
  o.push('</g>');
  const bench=squad.filter(p=>avail(m,p.id)==='yes'&&!slotOf(m,p.id)).map(p=>p.name);
  o.push('<text x="24" y="'+(H-36)+'" font-family="Barlow,Arial,sans-serif" font-size="17" fill="#C9D3CC"><tspan font-weight="700" fill="#F4EAD3">Subs: </tspan>'+esc(bench.join(', ')||'none')+'</text>');
 }
 o.push('</svg>');
 return o.join('');
}
function renderPitch(){ $('pitch').innerHTML=buildPitch(); }
