/* shell.js: layout (sidebar / bottom bar), views with one activity at a time, home, settings, boot */
const ACT=jget('act',{});
const TABIC={'rev-today':'📅','rev-srs':'🧠','fam-tree':'🌳','fam-yo':'🧒','fam-what':'🤔','rop-scene':'👗','rop-dress':'🧥','rop-bag':'🧳','rop-swatch':'🎨','rop-parts':'🚪','rop-words':'✍️','com-market':'🛒','com-class':'🧺','com-cats':'🧠','com-words':'✍️','cue-out':'🧍','cue-in':'🫀','cue-words':'✍️','ciu-map':'🗺️','ciu-street':'🚦','ciu-defs':'🔎','ciu-words':'✍️','viv-plan':'🏠','viv-room':'🛋️','viv-defs':'🔎','viv-words':'✍️','rev-new':'✨','rev-listen':'🎧','rev-gender':'⚖️'};const saveAct=()=>store.set('act',JSON.stringify(ACT));
const VIEWDEF=()=>[{id:'inicio',t:'Inicio',en:'Home',ic:'🏡',g:'hoy'},{id:'repaso',t:'Repaso',en:'Review',ic:'🔁',g:'hoy',blocks:S.nolisten?['rev-today','rev-srs','rev-new']:['rev-today','rev-srs','rev-new','rev-listen'],desc:S.nolisten?'Tu memoria: repasa y aprende':'Tu memoria: repasa, aprende y escucha'},{id:'progreso',t:'Mi progreso',en:'My progress',ic:'📈',g:'hoy',blocks:['prog']},
 ...VIEWS.map(v=>({...v,g:'uni'})),{id:'unidades',t:'Unidades',en:'Units',ic:'📚',g:'hub'},{id:'practicar',t:'Practicar',en:'Practice',ic:'🎯',g:'hub'},
 {id:'expresiones',t:'Expresiones',en:'Idioms',ic:'💬',g:'pra',blocks:['expr']},{id:'examen',t:'Examen',en:'Practice test',ic:'📝',g:'pra',blocks:['exam']},{id:'tarjetas',t:'Tarjetas',en:'Flashcards',ic:'🃏',g:'pra',blocks:['fcards']},{id:'lista',t:'Lista de palabras',en:'Word list',ic:'📖',g:'pra',blocks:['wlist']},...GVIEWS()];
let CUR='inicio';const DIRTY=new Set();
const lvlSeg=()=>`<div class="lvseg" role="group" aria-label="Nivel (level)">${[1,2,3].map(l=>`<button data-set="lvl" data-v="${l}" aria-pressed="${S.lvl==l}"><span>${['','🌱','🌿','🌳'][l]}</span>${LV[l]}</button>`).join('')}</div>`;
function sideHTML(){const nav=g=>VIEWDEF().filter(v=>v.g==g&&v.id!='gramatica').map(v=>`<button class="nv${v.th?' '+v.th:''}" data-view="${v.id}"><span class="ni">${v.ic}</span><span class="nt">${v.t}</span>${v.id=='repaso'?`<span class="badge" data-due></span>`:''}</button>`).join('');
return `<a class="brand" href="#inicio">${owl(42)}<span><b>Laboratorio</b><small>de vocabulario</small></span></a>
<button class="sessbtn" data-sess>⏱️ Sesión de 10 min</button>
<nav aria-label="Menú"><p class="ng">Hoy</p>${nav('hoy')}<p class="ng">Unidades</p>${nav('uni')}<button class="ng gramh" data-view="gramatica">📐 Gramática <span>⭐</span></button><div class="gside">${nav('gra')}</div><p class="ng">Practicar</p>${nav('pra')}</nav>
<div class="sidefoot"><p class="ng">Nivel ${tEn('level')}</p>${lvlSeg()}<div class="sfrow"><span class="starbox">⭐ <span class="starsn">${+store.get('stars')||0}</span></span><button class="btn ghost" data-cfg>⚙️ Ajustes</button></div></div>`}
function mtopHTML(){return `<a class="brand" href="#inicio">${owl(34)}<b>Laboratorio</b></a><button class="lvpill" data-cfg>${['','🌱','🌿','🌳'][S.lvl]} ${LV[S.lvl]}</button><span class="starbox">⭐ <span class="starsn">${+store.get('stars')||0}</span></span><button class="iconb" data-cfg aria-label="Ajustes (settings)">⚙️</button>`}
function bnavHTML(){return [['inicio','🏡','Inicio'],['repaso','🔁','Repaso'],['unidades','📚','Unidades'],['practicar','🎯','Practicar'],['gramatica','📐','Gramática']].map(([v,i,t])=>`<button data-view="${v}"><span>${i}</span>${t}${v=='repaso'?'<span class="badge" data-due></span>':''}</button>`).join('')}
function cfgHTML(){const opt=(k,v,t,e)=>`<button data-set="${k}" data-v="${v}" aria-pressed="${String(S[k])==String(v)}">${t}${e?`<small>${e}</small>`:''}</button>`;
 const tg=(k,t,d)=>`<div class="crow"><div><b>${t}</b><p>${d}</p></div><button class="tog" data-tog="${k}" aria-pressed="${!!S[k]}" aria-label="${t}"><span class="sw"></span></button></div>`;
return `<div class="mbox" role="dialog" aria-modal="true" aria-labelledby="cfgt"><div class="mhead"><h2 id="cfgt">⚙️ Ajustes</h2><button class="btn pri" data-cfgclose>Listo<small>Done</small></button></div>
<section><h3>Nivel <span class="en">(level)</span></h3><div class="lvcards">${[1,2,3].map(l=>`<button class="lvcard" data-set="lvl" data-v="${l}" aria-pressed="${S.lvl==l}"><b>${['','🌱','🌿','🌳'][l]} ${LV[l]}</b><span>${['','Las palabras más comunes de tu libro.','Las palabras más difíciles de tu libro.','Palabras útiles que no están en el libro.'][l]}</span></button>`).join('')}</div></section>
<section><h3>Cómo aprendo <span class="en">(how I learn)</span></h3>
${tg('nolisten','No puedo escuchar','Quita el audio y los ejercicios de escuchar; todo se hace leyendo y escribiendo. (Turns off sound and listening exercises.)')}
${tg('instant','Corregir al momento','Cada respuesta se corrige al pasar a la siguiente. Si fallas, ves una pista y tienes otra oportunidad. (Instant check with a hint and a second try.)')}
${tg('bank','Banco de palabras','Muestra las palabras para elegir en vez de escribirlas. (Show a word bank.)')}
${tg('strict','Exigir tildes','Las tildes cuentan: «árbol», no «arbol». (Accents count.)')}
${tg('art','El artículo cuenta','Hay que escribir el artículo: «la farmacia», no solo «farmacia». (You must write el / la.)')}
<div class="crow col"><div><b>Ayuda en inglés</b><p>Automática: en inglés en Básico, solo cuando fallas en Avanzado y nada en Más vocabulario. (English hints fade as you level up.)</p></div><div class="seg">${opt('enMode','auto','Automática')}${opt('enMode','on','Siempre')}${opt('enMode','off','Nunca')}</div></div></section>
<section><h3>Pantalla y aspecto <span class="en">(screen and look)</span></h3>
<div class="crow col"><div><b>Respuestas</b><p>Ordenador: las casillas están en el dibujo. Móvil: lista debajo del dibujo. (Where the answer boxes go.)</p></div><div class="seg">${opt('dev','auto','Automático')}${opt('dev','pc','💻 En el dibujo')}${opt('dev','phone','📱 En lista')}</div></div>
<div class="crow col"><div><b>Colores</b></div><div class="opt">${[['menta','#2A9183','Menta'],['cielo','#3E7CCB','Cielo'],['lavanda','#7A67C2','Lavanda'],['melocoton','#D9714E','Melocotón']].map(([k,c,n])=>`<button class="swatch" style="background:${c}" data-set="pal" data-v="${k}" aria-pressed="${S.pal==k}" title="${n}" aria-label="${n}"></button>`).join('')}</div></div>
<div class="crow col"><div><b>Tamaño de letra</b></div><div class="seg">${[[.9,'A−'],[1,'A'],[1.12,'A+'],[1.25,'A++']].map(([v,t])=>opt('fs',v,t)).join('')}</div></div>
<div class="crow col"><div><b>Tu personaje en la ciudad</b></div><div class="opt">${['🧒','👧','👦','🧑','👩','👨','🐶','🐱','🦊','🐼'].map(a=>`<button class="avbtn" data-set="av" data-v="${a}" aria-pressed="${S.av==a}">${a}</button>`).join('')}</div></div>
<div class="crow col"><div><b>Tu nombre</b></div><input type="text" class="fld" id="pname" value="${esc(S.name)}" placeholder="Escribe tu nombre" autocomplete="off"></div></section></div>`}
/* ---------- views ---------- */
function curAct(v){const bs=v.blocks||[];return bs.includes(ACT[v.id])?ACT[v.id]:bs[0]}
function renderView(id){const v=VIEWDEF().find(x=>x.id==id)||VIEWDEF()[0];const box=$('#v-'+v.id);
 if(v.id=='inicio'){box.innerHTML=`<div class="phead end"><span class="pbtns">${enBtn()}${lisBtn()}</span></div>`+home();DIRTY.delete(v.id);return}
 if(v.id=='unidades'){box.innerHTML=`<div class="phead"><h2 class="ptitle">📚 Unidades</h2>${enBtn()}</div>${unitGrid()}`;DIRTY.delete(v.id);return}
 if(GHUB[v.id]){box.className='view th-gram';box.innerHTML=GHUB[v.id]();DIRTY.delete(v.id);return}
 if(v.id=='practicar'){box.innerHTML=`<div class="phead"><h2 class="ptitle">🎯 Practicar</h2><span class="pbtns">${enBtn()}${lisBtn()}</span></div>${practiceGrid()}`;DIRTY.delete(v.id);return}
 const a=curAct(v);const multi=(v.blocks||[]).length>1;const n=v.u?ALL.filter(c=>c.u==v.u&&c.lvl==S.lvl).length:0;
 box.className='view'+(v.th?' th-'+v.th:'');const par=v.par&&VIEWDEF().find(x=>x.id==v.par);
 box.innerHTML=(par?`<div class="phead"><button class="back" data-view="${par.id}">← ${par.t}</button></div>`:'')+(multi||v.u||v.th?`<header class="vhead"><span class="vi" aria-hidden="true">${v.ic}</span><div><h2>${v.t}</h2><p><span class="en">${v.en} · </span>${v.u?`${LV[S.lvl]} · ${n} palabras${v.desc?' · '+v.desc:''}`:(v.desc||'')}</p></div></header>`:'')+`
 ${multi?`<div class="acts" role="tablist">${v.blocks.map(b=>`<button role="tab" data-act="${b}" data-v="${v.id}" aria-selected="${a==b}"><span>${TABIC[b]||''}</span>${BL[b].label||b}</button>`).join('')}</div>`:''}
 <div class="actbox">${blockHTML(a)}</div>`;
 post(a);DIRTY.delete(v.id)}
function fixTabIcons(v){$$(`#v-${v.id} .acts button`).forEach(bt=>{const b=bt.dataset.act;const ic=RUN[b]&&RUN[b].o&&RUN[b].o.icon;if(ic&&!bt.firstChild.textContent)bt.firstChild.textContent=ic})}
function switchAct(vid,b){ACT[vid]=b;saveAct();const v=VIEWDEF().find(x=>x.id==vid);$$(`#v-${vid} .acts button`).forEach(x=>x.setAttribute('aria-selected',x.dataset.act==b));const box=$(`#v-${vid} .actbox`);if(box){box.innerHTML=blockHTML(b);post(b)}}
function go(id,push=true){if(!VIEWDEF().some(v=>v.id==id))id='inicio';CUR=id;$$('.view').forEach(x=>x.hidden=x.id!='v-'+id);
 $$('[data-view]').forEach(b=>{if(b.closest('.side,.bnav')){const cv=VIEWDEF().find(x=>x.id==id)||{};const bv=b.dataset.view;b.setAttribute('aria-current',bv==id||(id!='inicio'&&bv=='unidades'&&VIEWS.some(v=>v.id==id))||(cv.par&&cv.par==bv)||(b.closest('.bnav')&&bv=='gramatica'&&cv.th)?'page':'false')}});
 if(DIRTY.has(id)||!$('#v-'+id).innerHTML)renderView(id);if(id=='inicio'||id=='progreso')renderView(id);
 if(push&&location.hash!='#'+id){try{history.replaceState(null,'','#'+id)}catch(e){}}dueBadges()}
function dueBadges(){const n=dueList().length;$$('[data-due]').forEach(b=>{b.textContent=n||'';b.hidden=!n})}
function rerenderAll(){VIEWDEF().forEach(v=>DIRTY.add(v.id));renderView(CUR);$('#side').innerHTML=sideHTML();$('#mtop').innerHTML=mtopHTML();go(CUR,false)}
function applyS(){document.body.dataset.pal=S.pal;document.documentElement.style.setProperty('--fs',S.fs);document.body.classList.toggle('noen',!showEn());document.body.classList.toggle('nolisten',!!S.nolisten);
 $$('[data-set]').forEach(b=>b.setAttribute('aria-pressed',String(S[b.dataset.set])==b.dataset.v));$$('[data-tog]').forEach(b=>b.setAttribute('aria-pressed',!!S[b.dataset.tog]));
 const on=showEn();$$('[data-entog]').forEach(b=>{b.setAttribute('aria-pressed',on);const l=$('.enl',b);if(l)l.textContent=on?'Inglés: sí':'Inglés: no'});
 $$('input[data-en]').forEach(i=>{i.placeholder=i.dataset.ph0+(on?' · '+i.dataset.en:'')})}
/* ---------- home and hubs ---------- */
const unitPct=v=>{const ws=ALL.filter(c=>c.u==v.u&&c.lvl==S.lvl);return ws.length?Math.round(ws.filter(mastered).length/ws.length*100):0};
function unitGrid(){return `<div class="ugrid">${VIEWS.map(v=>{const p=unitPct(v);return `<button class="ucard" data-view="${v.id}"><span class="ui" aria-hidden="true">${v.ic}</span><b>${v.t}</b><small><span class="en">${v.en} · </span>${v.desc||''}</small><span class="pbar sm"><span class="pm" style="width:${p}%"></span></span><small>${p}% dominado ${tEn('mastered')}</small></button>`}).join('')}</div>`}
function practiceGrid(){const it=[['rev-today','📅','Repaso de hoy','20 new words a day'],['rev-srs','🧠','Mis repasos','Spaced review'],['rev-new','✨','Palabras nuevas','New words'],...(S.nolisten?[]:[['rev-listen','🎧','¿Qué oyes?','Listening']]),['rev-gender','⚖️','¿El o la?','Articles'],['exam','📝','Examen','Practice test'],['fcards','🃏','Tarjetas','Flashcards'],['expr','💬','Expresiones','Idioms'],['wlist','📖','Lista de palabras','Word list']];
 return `<div class="pgrid">${it.map(([b,i,t,e])=>`<button class="pcard" data-act-go="${b}"><span>${i}</span><b>${t}</b><small class="en">${e}</small></button>`).join('')}</div>`}
function home(){const nm=S.name?`, ${esc(S.name)}`:'';const due=dueList().length,st=streak();
return `<section class="hello"><div class="hmain"><h2>¡Hola${nm}! 👋</h2><p class="hsub">${st?`🔥 ${st} ${st==1?'día':'días'} seguidos · `:''}⭐ <span class="starsn">${+store.get('stars')||0}</span> estrellas · Nivel ${LV[S.lvl]}</p>
<div class="ctas"><button class="cta pri" data-sess><span>⏱️</span><b>Mi sesión de 10 minutos</b><small>Repaso, un dibujo, palabras nuevas${S.nolisten?'':' y escuchar'}</small></button><button class="cta" data-act-go="rev-today"><span>📅</span><b>Repaso de hoy</b><small>${dlStatus()}</small></button>${due?`<button class="cta" data-act-go="rev-srs"><span>🧠</span><b>Mis repasos</b><small>${due} palabras te esperan</small></button>`:''}</div></div>
<div class="howl">${owl(150)}</div></section>
<h3 class="sec">Unidades ${tEn('units')}</h3>${unitGrid()}
<h3 class="sec">Practicar ${tEn('practice')}</h3>${practiceGrid()}
<h3 class="sec">📐 Gramática ${tEn('grammar')}</h3><div class="ggrid"><button class="gcard verb" data-view="verbos"><span>🔤</span><b>Verbos</b><small>12 tiempos ${tEn('12 tenses')}</small></button><button class="gcard prac" data-view="gram"><span>🧩</span><b>Práctica de gramática</b><small>${GTOP.length+1} temas ${tEn('topics')}</small></button><button class="gcard list" data-view="vlista"><span>📋</span><b>Lista de verbos</b><small>${verbList().all.length} verbos</small></button></div>`}
/* ---------- boot ---------- */
function boot(){
document.body.insertAdjacentHTML('afterbegin',`<div class="app"><aside class="side" id="side">${sideHTML()}</aside><div class="mainw"><header class="mtop" id="mtop">${mtopHTML()}</header><main id="main">${VIEWDEF().map(v=>`<div class="view" id="v-${v.id}" hidden></div>`).join('')}</main></div></div><nav class="bnav" id="bnav" aria-label="Menú">${bnavHTML()}</nav><div id="sessbar" class="sessbar" hidden></div><div class="modal" id="cfg" hidden></div>`);
applyS();
const openCfg=()=>{const m=$('#cfg');m.innerHTML=cfgHTML();m.hidden=false;applyS();const b=m.querySelector('[data-cfgclose]');if(b)b.focus()};
document.addEventListener('click',e=>{const t=e.target.closest('[data-entog],[data-set],[data-tog],[data-view],[data-cfg],[data-cfgclose],[data-act],[data-act-go],#cfg');if(!t)return;
 if(t.id=='cfg'){if(e.target.id=='cfg')$('#cfg').hidden=true;else return}
 if(t.dataset.cfg!=null){openCfg();return}if(t.dataset.cfgclose!=null){$('#cfg').hidden=true;return}
 if(t.dataset.actGo){const b=t.dataset.actGo,v=viewOfBlock(b);ACT[v]=b;saveAct();DIRTY.add(v);go(v);window.scrollTo({top:0});return}
 if(t.dataset.act&&t.dataset.v){switchAct(t.dataset.v,t.dataset.act);return}
 if(t.dataset.view){go(t.dataset.view);window.scrollTo({top:0});return}
 if(t.dataset.entog!=null){S.enMode=showEn()?'off':'on';saveS();applyS();if($('#cfg')&&!$('#cfg').hidden){$('#cfg').innerHTML=cfgHTML();applyS()}return}
 if(t.dataset.set){const k=t.dataset.set;let v=t.dataset.v;if(k=='lvl'||k=='fs')v=+v;S[k]=v;saveS();applyS();if(['lvl','dev','av','enMode'].includes(k)){FC.deck=[];rerenderAll()}if(!$('#cfg').hidden&&k=='lvl'){$('#cfg').innerHTML=cfgHTML();applyS()}return}
 if(t.dataset.tog){const k=t.dataset.tog;S[k]=!S[k];saveS();applyS();if(k=='bank')Object.keys(RUN).forEach(id=>{if($('#b-'+id))bank(id)});if(k=='art'||k=='nolisten')rerenderAll();return}});
document.addEventListener('keydown',e=>{if(e.key=='Escape'&&!$('#cfg').hidden)$('#cfg').hidden=true});
document.addEventListener('change',e=>{if(e.target.id=='pname'){S.name=e.target.value.trim().slice(0,30);saveS();DIRTY.add('inicio');if(CUR=='inicio')renderView('inicio')}});
addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(h&&h!=CUR)go(h,false)});
let wasPh=isPhone();addEventListener('resize',()=>{clearTimeout(window._rz);window._rz=setTimeout(()=>{if(isPhone()!=wasPh){wasPh=isPhone();rerenderAll()}},300)});
go(location.hash.slice(1)||'inicio',false)}
