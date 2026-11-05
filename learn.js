/* learn.js: review (spaced repetition), new words, listening, el/la, progress, 10-minute session */
const QZ={};let REVANY=false,NEWU='Todas';
const nounOf=c=>{const f=alts(c.es).find(x=>DEF.test(base(x)));if(!f)return null;const m=base(f).match(DEF);return{art:m[1],w:f.replace(/^\S+ /,'')}};
function qType(c){if(c.u=='Expresiones')return'type';const r=Math.random();if(canSpeak()&&r<.25)return'listen';if(nounOf(c)&&r<.42)return'gender';return'type'}
function qzStart(id,cards){QZ[id]={deck:cards,i:0,ok:0,t:0,done:false,answered:false}}
function qzCard(id){const q=QZ[id];if(q.i>=q.deck.length){const pct=Math.round(q.ok/q.deck.length*100);if(!q.done){q.done=true;if(pct>=80)confetti();markDay();if(window.onBlockDone)onBlockDone(id,pct)}
 return `<div class="qcard done"><p class="qw">¡Terminado! ${pct>=80?'🎉':'💪'}</p><p class="qk">${q.ok} de ${q.deck.length} a la primera ${tEn('right on the first try')}</p><p class="sub">Las palabras que fallaste vuelven pronto a tu repaso. ${tEn('The words you missed come back soon.')}</p><div class="row"><button class="btn pri" data-do="new" data-b="${id}">↻ Otra vez<small>Again</small></button><button class="btn ghost" data-view="progreso">📈 Mi progreso<small>My progress</small></button></div></div>`}
const it=q.deck[q.i],c=it.c,word=first(c.es),nn=nounOf(c);
let h=`<div class="qtop"><div class="qbar"><span style="width:${q.i/q.deck.length*100}%"></span></div><span class="qcount">${q.i+1} / ${q.deck.length}</span></div><div class="qcard">`;
if(it.type=='gender')h+=`<p class="qk">¿el, la, los o las? ${tEn('which article?')}</p><p class="qw">${esc(nn.w)}</p><p class="qen">${esc(c.en)}</p><div class="row arts">${['el','la','los','las'].map(a=>`<button class="btn artb" data-qa="${id}" data-v="${a}">${a}</button>`).join('')}</div>`;
else if(it.type=='listen')h+=`<p class="qk">¿Qué oyes? ${tEn('listen and write the word')}</p><button class="btn huge" data-say="${esc(word.replace(DEF,''))}">🔊 Escuchar</button>${inp(c.es,{noinst:1,cls:'qi',label:'Escribe lo que oyes',ph:'Escribe aquí…'})}<div class="row"><button class="btn pri" data-qc="${id}">✓ Comprobar<small>Check</small></button></div>`;
else h+=`<p class="qk">Escribe en español ${tEn('write it in Spanish')}</p><p class="qw">${esc(c.en)}</p><p class="qen">${UNAMES[c.u]?UNAMES[c.u][2]+' '+UNAMES[c.u][0]:''}</p>${inp(c.es,{noinst:1,cls:'qi',label:'Escribe en español',ph:'Escribe aquí…'})}<div class="row"><button class="btn pri" data-qc="${id}">✓ Comprobar<small>Check</small></button></div>`;
h+=`<div class="qfb" id="qfb-${id}" aria-live="polite"></div><div class="row"><button class="btn pri" id="qnx-${id}" data-qn="${id}" hidden>Siguiente ▶<small>Next</small></button></div></div>`;return h}
function qzShow(id){const b=$(`#b-${id} .bb`);if(b){b.innerHTML=qzCard(id);const i=b.querySelector('input.qi');if(i)i.focus({preventScroll:true});const sb=b.querySelector('.huge[data-say]');if(sb&&QZ[id].autoSay)say(sb.dataset.say)}}
function qzAnswer(id,v){const q=QZ[id];if(!q||q.answered)return;const it=q.deck[q.i],c=it.c;q.t++;const nn=nounOf(c);const fb=$('#qfb-'+id),i=$(`#b-${id} input.qi`);
 const good=it.type=='gender'?v==nn.art:match(v,c.es);const full=artForm(c.es,c.u);
 if(good){if(q.t==1){q.ok++;addStars(1)}srsUpd(c,q.t==1?true:'hint');q.answered=true;fb.innerHTML=`<span class="okc">✅ ${q.t==1?'¡Muy bien!':'¡Bien!'}</span> <b>${esc(full)}</b> ${spk(full)} ${tEn(c.en)}`;if(i)setState(i,'ok');say(full);$('#qnx-'+id).hidden=false;$('#qnx-'+id).focus();return}
 if(q.t==1){fb.innerHTML=it.type=='gender'?`<span class="tryc">✋ No es «${esc(v)}». Inténtalo otra vez.</span> ${tEn('Try again.')}`:`<span class="tryc">✋ ${almost(v,c.es)?'Casi: revisa la tilde.':'Todavía no.'}</span> Pista: <b>${esc(hintOf(c.es.replace(/^\S+ /,'')))}</b>${it.type=='listen'||!showEn()?` <span class="enx">(${esc(c.en)})</span>`:''}`;if(i){setState(i,'try');shake(i);i.select()}return}
 srsUpd(c,false);q.answered=true;fb.innerHTML=`<span class="badc">✗ La respuesta es</span> <b>${esc(full)}</b> ${spk(full)} ${tEn(c.en)}`;if(i)setState(i,'bad');say(full);$('#qnx-'+id).hidden=false;$('#qnx-'+id).focus()}
document.addEventListener('click',e=>{const t=e.target.closest('[data-qa],[data-qc],[data-qn],[data-revany],[data-nwnext],[data-sess],[data-sessnext],[data-sessend],[data-reset],[data-hardgo]');if(!t)return;
 if(t.dataset.qa){qzAnswer(t.dataset.qa,t.dataset.v);return}
 if(t.dataset.qc){const i=$(`#b-${t.dataset.qc} input.qi`);if(i&&i.value.trim())qzAnswer(t.dataset.qc,i.value);return}
 if(t.dataset.qn){const q=QZ[t.dataset.qn];q.i++;q.t=0;q.answered=false;q.autoSay=true;qzShow(t.dataset.qn);return}
 if(t.dataset.revany!=null){REVANY=true;mount('rev-today');return}
 if(t.dataset.nwnext!=null){NW.i++;if(NW.i>=NW.words.length){qzStart('rev-new',shuf(NW.words).map(c=>({c,type:canSpeak()&&Math.random()<.4?'listen':'type'})));NW.phase='quiz'}nwRedraw();return}
 if(t.dataset.sess!=null){sessStart();return}if(t.dataset.sessnext!=null){sessNext();return}if(t.dataset.sessend!=null){sessStop();return}
 if(t.dataset.reset!=null){if(t.dataset.reset=='ask'){t.outerHTML=`<span class="sub">¿Seguro? Se borran tus estrellas y tu memoria. ${tEn('Sure? Stars and memory will be deleted.')}</span> <button class="btn" data-reset="yes" style="border-color:var(--bad);color:var(--bad)">Sí, borrar</button> <button class="btn ghost" data-reset="no">No</button>`}else if(t.dataset.reset=='yes'){['srs','stars','days','miss'].forEach(k=>store.set(k,k=='stars'?'0':'[]'));store.set('srs','{}');SRS={};addStars(0);mount('prog')}else mount('prog');return}
 if(t.dataset.hardgo!=null){HARD=true;ACT.repaso='rev-today';go('repaso');mount('rev-today')}});
document.addEventListener('keydown',e=>{if(e.key!='Enter')return;const i=e.target.closest&&e.target.closest('input.qi');if(i){e.preventDefault();const b=i.closest('.blk').dataset.b;if(QZ[b]&&QZ[b].answered){const n=$('#qnx-'+b);if(n)n.click()}else if(i.value.trim())qzAnswer(b,i.value)}});
/* ---------- today's review ---------- */
let HARD=false;
BL['rev-today']={label:'Repaso de hoy',noUnit:1,render(){const n=SESS?8:15;let cards=[];let msg='';
 if(HARD){HARD=false;cards=shuf(ALL.filter(c=>{const r=rec(c);return r&&r.w>0&&r.b<3})).slice(0,n)}
 else{cards=dueList().slice(0,n);if(!cards.length&&REVANY){REVANY=false;const seen=ALL.filter(c=>rec(c)&&c.lvl==S.lvl);cards=shuf(seen.length>=6?seen:ALL.filter(c=>c.lvl==S.lvl&&c.u!='Expresiones')).slice(0,10)}}
 qzStart('rev-today',cards.map(c=>({c,type:qType(c)})));
 const empty=`<div class="qcard done"><p class="qw">🎉 ¡Todo repasado!</p><p class="sub">No tienes palabras pendientes hoy. Las palabras que practicas en las unidades aparecen aquí cuando toca repasarlas. ${tEn('No words due today. Words you practice in the units come back here when it is time to review them.')}</p><div class="row"><button class="btn pri" data-act-go="rev-new">✨ Aprender palabras nuevas<small>Learn new words</small></button><button class="btn ghost" data-revany>Repasar igualmente<small>Practice anyway</small></button></div></div>`;
 return {t:'Repaso de hoy',en:"Today's review",icon:'🔁',noCheck:1,noBank:1,sub:cards.length?`Tienes <b>${cards.length}</b> palabras para repasar. Una a una: si fallas, tienes una pista y otra oportunidad.`:'',subEn:cards.length?'One at a time. If you miss, you get a hint and a second try.':'',body:cards.length?qzCard('rev-today'):empty}},
 after(){const i=$('#b-rev-today input.qi');if(i)i.focus({preventScroll:true})}};
/* ---------- new words ---------- */
const NW={words:[],i:0,phase:'learn'};
BL['rev-new']={label:'Palabras nuevas',noUnit:1,render(){const us=Object.keys(UNAMES).filter(u=>u!='Expresiones');
 const poolW=ALL.filter(c=>c.lvl==S.lvl&&!rec(c)&&c.u!='Expresiones'&&(NEWU=='Todas'||c.u==NEWU));NW.words=shuf(poolW).slice(0,5);NW.i=0;NW.phase='learn';
 const tools=`<label>Unidad ${tEn('unit')} <select data-newu><option ${NEWU=='Todas'?'selected':''}>Todas</option>${us.map(u=>`<option value="${u}" ${NEWU==u?'selected':''}>${UNAMES[u][0]}</option>`).join('')}</select></label>`;
 return {t:'Palabras nuevas',en:'New words',icon:'✨',noCheck:1,noBank:1,tools,sub:NW.words.length?'Primero mira y escucha 5 palabras. Después, escríbelas.':'',subEn:NW.words.length?'First look and listen to 5 words. Then write them.':'',body:nwBody()}}};
function nwBody(){if(!NW.words.length)return `<div class="qcard done"><p class="qw">🌟 ¡Ya conoces todas las palabras de este nivel!</p><p class="sub">Elige otra unidad o sube de nivel. ${tEn('Pick another unit or move up a level.')}</p></div>`;
 if(NW.phase=='quiz')return qzCard('rev-new');const c=NW.words[NW.i],w=artForm(c.es,c.u),e=FEMO[first(c.es).replace(DEF,'')]||'';
 return `<div class="qtop"><div class="qbar"><span style="width:${NW.i/NW.words.length*50}%"></span></div><span class="qcount">Palabra ${NW.i+1} / ${NW.words.length}</span></div><div class="qcard learn">${e?`<p class="qe">${e}</p>`:''}<p class="qw">${esc(w)}</p><p class="qen">${esc(c.en)}</p><p class="qk">${UNAMES[c.u][2]} ${UNAMES[c.u][0]}</p><div class="row"><button class="btn huge" data-say="${esc(w)}">🔊 Escuchar</button><button class="btn pri" data-nwnext>${NW.i==NW.words.length-1?'¡A practicar! ▶':'Siguiente ▶'}<small>${NW.i==NW.words.length-1?"Let's practice":'Next'}</small></button></div></div>`}
document.addEventListener('change',e=>{if(e.target.dataset&&e.target.dataset.newu!=null){NEWU=e.target.value;mount('rev-new')}});
function nwRedraw(){const b=$('#b-rev-new .bb');if(!b)return;b.innerHTML=nwBody();const sb=b.querySelector('[data-say]');if(sb&&NW.phase=='learn')say(sb.dataset.say);const i=b.querySelector('input.qi');if(i)i.focus({preventScroll:true})}
/* ---------- listening ---------- */
BL['rev-listen']={label:'¿Qué oyes?',noUnit:1,render(){if(!canSpeak())return {t:'¿Qué oyes?',en:'What do you hear?',icon:'🎧',noCheck:1,noBank:1,body:'<p class="sub">Este navegador no puede leer en voz alta. Prueba con Chrome, Safari o Edge.</p>'};
 const seen=ALL.filter(c=>rec(c)&&c.u!='Expresiones'),lvlW=ALL.filter(c=>c.lvl==S.lvl&&c.u!='Expresiones');const src=shuf(seen.length>=8?seen.concat(shuf(lvlW).slice(0,6)):lvlW).slice(0,8);
 qzStart('rev-listen',src.map(c=>({c,type:'listen'})));
 return {t:'¿Qué oyes?',en:'What do you hear?',icon:'🎧',noCheck:1,noBank:1,sub:'Pulsa 🔊, escucha y escribe la palabra. Puedes escucharla muchas veces.',subEn:'Press the speaker, listen and write the word. You can listen many times.',body:qzCard('rev-listen')}}};
/* ---------- el / la ---------- */
BL['rev-gender']={label:'¿El o la?',noUnit:1,render(){const ns=ALL.filter(c=>nounOf(c)&&c.u!='Expresiones'&&(c.lvl==S.lvl||S.lvl==1&&c.lvl==1));
 const tricky=ns.filter(c=>{const n=nounOf(c);return(/a$|as$/.test(n.w)&&/^(el|los)$/.test(n.art))||(/o$|os$/.test(n.w)&&/^(la|las)$/.test(n.art))||/(e|ión|or|z|l|r|d)$/.test(n.w)});
 const deck=shuf(shuf(tricky).slice(0,5).concat(shuf(ns).slice(0,6))).filter((c,i,a)=>a.findIndex(x=>x.es==c.es)==i).slice(0,10);
 qzStart('rev-gender',deck.map(c=>({c,type:'gender'})));
 return {t:'¿El o la?',en:'Which article?',icon:'⚖️',noCheck:1,noBank:1,sub:'Elige el artículo correcto. ¡Cuidado con las palabras difíciles como <i>el agua</i> o <i>la mano</i>!',subEn:'Choose the right article. Watch out for tricky words.',body:qzCard('rev-gender')}}};
/* ---------- progress ---------- */
BL.prog={label:'Mi progreso',noUnit:1,render(){const us=Object.keys(UNAMES);const tot=ALL.length,mt=ALL.filter(mastered).length,lr=ALL.filter(c=>{const r=rec(c);return r&&r.b>0&&r.b<3}).length,due=dueList().length;
 const cell=(u,l)=>{const ws=ALL.filter(c=>c.u==u&&c.lvl==l);if(!ws.length)return '<td class="na">—</td>';const m=ws.filter(mastered).length,g=ws.filter(c=>{const r=rec(c);return r&&r.b>0&&r.b<3}).length;const pm=Math.round(m/ws.length*100),pg=Math.round(g/ws.length*100);
  return `<td><div class="pbar" title="${m} dominadas, ${g} aprendiendo, ${ws.length-m-g} nuevas"><span class="pm" style="width:${pm}%"></span><span class="pg" style="width:${pg}%"></span></div><small>${m} / ${ws.length}</small></td>`};
 const hard=ALL.filter(c=>{const r=rec(c);return r&&r.w>0&&r.b<3}).sort((a,b)=>rec(b).w-rec(a).w).slice(0,14);
 const lvW=ALL.filter(c=>c.lvl==S.lvl),lvM=lvW.filter(mastered).length,lvP=lvW.length?Math.round(lvM/lvW.length*100):0;
 const weak=us.filter(u=>u!='Expresiones').map(u=>{const ws=ALL.filter(c=>c.u==u&&c.lvl==S.lvl);return[u,ws.length?ws.filter(mastered).length/ws.length:1]}).sort((a,b)=>a[1]-b[1])[0];
 const advice=lvP>=70&&S.lvl<3?`🚀 ¡Dominas el ${lvP}% del nivel ${LV[S.lvl]}! Ya puedes pasar a <b>${LV[S.lvl+1]}</b>. ${tEn('You are ready for the next level.')}`:`🎯 Para mejorar, practica <b>${UNAMES[weak[0]][0]}</b>: es la unidad que menos dominas. ${tEn('This is the unit you know least.')}`;
 return {t:'Mi progreso',en:'My progress',icon:'📈',noCheck:1,noBank:1,noNew:1,
 body:`<div class="tiles"><div class="tile"><b class="starsn">${+store.get('stars')||0}</b><span>⭐ estrellas</span></div><div class="tile"><b>${streak()}</b><span>🔥 días seguidos</span></div><div class="tile"><b>${mt}</b><span>✅ dominadas</span></div><div class="tile"><b>${due}</b><span>🔁 para repasar hoy</span></div></div>
 <p class="advice">${advice}</p>
 <h4>Por unidad ${tEn('by unit')}</h4><div class="tablew"><table class="ptab"><thead><tr><th>Unidad</th><th>Básico</th><th>Avanzado</th><th>Más vocabulario</th></tr></thead><tbody>${us.map(u=>`<tr><th>${UNAMES[u][2]} ${UNAMES[u][0]}</th>${[1,2,3].map(l=>cell(u,l)).join('')}</tr>`).join('')}</tbody></table></div>
 <p class="legend"><span class="lg pm"></span> dominada ${tEn('mastered')} <span class="lg pg"></span> aprendiendo ${tEn('learning')} <span class="lg pn"></span> nueva ${tEn('new')}</p>
 <h4>Tus palabras difíciles ${tEn('your tricky words')}</h4>${hard.length?`<div class="hard">${hard.map(c=>{const w=artForm(c.es,c.u);return `<span class="hw">${spk(w)} <b>${esc(w)}</b> <small>${esc(c.en)}</small></span>`}).join('')}</div><div class="row" style="justify-content:flex-start"><button class="btn pri" data-hardgo>Practicar estas palabras<small>Practice these words</small></button></div>`:`<p class="sub">Todavía no hay. Las palabras que fallas aparecerán aquí. ${tEn('None yet.')}</p>`}
 <h4>Empezar de cero ${tEn('start over')}</h4><button class="btn ghost" data-reset="ask">Borrar mi progreso<small>Reset progress</small></button>`}}};
/* ---------- 10-minute session ---------- */
let SESS=null,STM=null;
const DIAG=['fam-tree','rop-scene','rop-parts','com-market','cue-out','cue-in','ciu-street','ciu-map','viv-plan','viv-room'];
function viewOfBlock(b){const v=VIEWDEF().find(v=>(v.blocks||[]).includes(b));return v?v.id:'inicio'}
function sessStart(){const d=pick(DIAG),hasDue=dueList().length>0;SESS={t0:Date.now(),i:0,steps:[{b:hasDue?'rev-today':'rev-gender',t:hasDue?'Repaso':'¿El o la?',ic:hasDue?'🔁':'⚖️'},{b:d,t:'Un dibujo',ic:'🖼️'},{b:'rev-new',t:'Palabras nuevas',ic:'✨'},{b:'rev-listen',t:'¿Qué oyes?',ic:'🎧'}]};if(d=='ciu-map')CM.mode='label';sessGo();clearInterval(STM);STM=setInterval(sessBar,1000)}
function sessGo(){const s=SESS.steps[SESS.i],v=viewOfBlock(s.b);ACT[v]=s.b;saveAct();go(v);mount(s.b);window.scrollTo({top:0});sessBar()}
function sessNext(){if(!SESS)return;SESS.i++;if(SESS.i>=SESS.steps.length){sessDone();return}sessGo()}
function sessDone(){addStars(10);markDay();confetti();toast('🏆 ¡Sesión terminada! +10 ⭐ <span class="en">(Session complete!)</span>',3200);sessStop();go('inicio')}
function sessStop(){SESS=null;clearInterval(STM);sessBar()}
function sessBar(){const b=$('#sessbar');if(!b)return;if(!SESS){b.hidden=true;document.body.classList.remove('insess');return}b.hidden=false;document.body.classList.add('insess');
 const left=Math.max(0,600-Math.floor((Date.now()-SESS.t0)/1000));const mm=Math.floor(left/60),ss=String(left%60).padStart(2,'0');
 b.innerHTML=`<div class="sesin"><span class="stime" title="tiempo">${left?`⏱️ ${mm}:${ss}`:'⏰ ¡Tiempo!'}</span><ol class="ssteps">${SESS.steps.map((s,i)=>`<li class="${i<SESS.i?'done':i==SESS.i?'cur':''}">${i<SESS.i?'✓':s.ic} <span>${s.t}</span></li>`).join('')}</ol><button class="btn pri${SESS.ready?' pulse':''}" id="sessnext" data-sessnext>${SESS.i==SESS.steps.length-1?'Terminar 🏆':'Siguiente paso ▶'}</button><button class="btn ghost" data-sessend title="Salir (exit)">✕</button></div>`}
window.onBlockDone=(id,pct)=>{if(SESS&&SESS.steps[SESS.i].b==id){SESS.ready=true;sessBar();SESS.ready=false}};
