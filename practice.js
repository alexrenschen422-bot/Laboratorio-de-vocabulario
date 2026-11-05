/* practice.js: flashcards, word list, idioms, exam */
/* ---------- flashcards ---------- */
let FC={u:'Todo',mode:'flip-es',n:20,deck:[],i:0,show:false,ok:0};
BL.fcards={label:'Tarjetas',render(){const m=getM().length,units=['Todo',...Object.keys(UNAMES),'Mis errores'];
let h=`<div class="tools"><label>Unidad <span class="en">(unit)</span> <select id="fcu">${units.map(u=>`<option value="${u}" ${u==FC.u?'selected':''}>${UNAMES[u]?UNAMES[u][0]:u}${u=='Mis errores'?` (${m})`:''}</option>`).join('')}</select></label>
<label>Modo <span class="en">(mode)</span> <select id="fcm">${[['flip-es','Voltear: español → inglés'],['flip-en','Voltear: inglés → español'],['type','Escribir: inglés → español']].map(([v,t])=>`<option value="${v}" ${v==FC.mode?'selected':''}>${t}</option>`).join('')}</select></label>
<label>Cuántas <span class="en">(how many)</span> <select id="fcn">${[10,20,40,9999].map(v=>`<option value="${v}" ${v==FC.n?'selected':''}>${v==9999?'Todas (all)':v}</option>`).join('')}</select></label>
<button class="btn pri" data-fc="start">Empezar<small>Start</small></button></div>`;
if(!FC.deck.length)h+=`<div class="fcard"><p class="w2">Elige y pulsa «Empezar»</p><p class="en">Choose a unit and press Start. Words you miss go to "Mis errores" (my mistakes).</p></div>`;
else if(FC.i>=FC.deck.length){h+=`<div class="fcard"><p class="w">¡Terminado! 🎉</p><p class="w2">${FC.ok} / ${FC.deck.length}</p><p class="en">Finished! The words you missed are in "Mis errores".</p></div>`}
else{const c=FC.deck[FC.i],es=c.es.replace(/\|/g,' / '),front=FC.mode=='flip-es'?es:c.en,back=FC.mode=='flip-es'?c.en:es;
 h+=`<div class="fcard"><p class="best">${FC.i+1} / ${FC.deck.length} · ${UNAMES[c.u]?UNAMES[c.u][0]:c.u} · ${LV[c.lvl]}</p><p class="w">${esc(front)} ${FC.mode=='flip-es'?spk(first(c.es)):''}</p>`+
 (FC.mode=='type'?`${inp(c.es,{label:'Escribe en español'})}<p class="w2" id="fcb"></p><div class="row"><button class="btn pri" data-fc="ans">Comprobar<small>Check</small></button></div>`:
 FC.show?`<p class="w2">${esc(back)} ${FC.mode=='flip-en'?spk(first(c.es)):''}</p><div class="row"><button class="btn pri" data-fc="yes">Lo sabía 👍<small>I knew it</small></button><button class="btn" data-fc="no">No lo sabía<small>I didn't know</small></button></div>`:`<div class="row"><button class="btn pri" data-fc="flip">Dar la vuelta<small>Flip</small></button></div>`)+`</div>`}
return {t:'Tarjetas',en:'Flashcards',icon:'🃏',noCheck:1,noBank:1,sub:'Repasa todas las palabras del nivel elegido.',subEn:'Review every word of the chosen level.',body:h}},
after(el){const i=$('#b-fcards input.ans');if(i)i.focus({preventScroll:true})}};
document.addEventListener('click',e=>{const t=e.target.closest('[data-fc]');if(!t)return;const a=t.dataset.fc;
 if(a=='start'){FC.u=$('#fcu').value;FC.mode=$('#fcm').value;FC.n=+$('#fcn').value;const m=getM();
  FC.deck=shuf(ALL.filter(c=>FC.u=='Mis errores'?m.includes(key(c)):(FC.u=='Todo'||c.u==FC.u)&&c.lvl==S.lvl)).slice(0,FC.n);FC.i=0;FC.show=false;FC.ok=0;mount('fcards');return}
 const c=FC.deck[FC.i];if(!c)return;
 if(a=='flip'){FC.show=true;mount('fcards')}
 if(a=='yes'){delM(c);FC.ok++;addStars(1);FC.i++;FC.show=false;mount('fcards')}
 if(a=='no'){addM(c);FC.i++;FC.show=false;mount('fcards')}
 if(a=='ans'){const i=$('#b-fcards input.ans'),g=match(i.value,c.es);i.classList.add(g?'ok':almost(i.value,c.es)?'almost':'bad');$('#fcb').innerHTML=esc(c.es.replace(/\|/g,' / '))+' '+spk(first(c.es));if(g){delM(c);FC.ok++;addStars(1)}else addM(c);t.dataset.fc='next';t.innerHTML='Siguiente<small>Next</small>'}
 else if(a=='next'){FC.i++;mount('fcards')}});

/* ---------- word list ---------- */
BL.wlist={label:'Lista',render(){return {t:'Lista de palabras',en:'Word list',icon:'📚',noCheck:1,noBank:1,noNew:1,
 tools:`<label>Unidad <span class="en">(unit)</span> <select id="lu"><option value="Todo">Todo</option>${Object.keys(UNAMES).map(u=>`<option value="${u}">${UNAMES[u][0]}</option>`).join('')}</select></label><label>Nivel <span class="en">(level)</span> <select id="ll"><option value="0">Todos (all)</option>${[1,2,3].map(l=>`<option value="${l}" ${l==S.lvl?'selected':''}>${LV[l]}</option>`).join('')}</select></label><input type="text" class="fld" id="ls" placeholder="Buscar… (search)" style="max-width:240px"><button class="tog" id="lh" aria-pressed="false"><span class="sw"></span><span>Ocultar inglés<small>Hide English</small></span></button>`,
 body:'<div id="lo"></div>'}},after(){lfill()}};
function lfill(){const u=$('#lu').value,l=+$('#ll').value,q=norm($('#ls').value),h=$('#lh').getAttribute('aria-pressed')=='true';
const rows=ALL.filter(c=>(u=='Todo'||c.u==u)&&(!l||c.lvl==l)&&(!q||norm(c.es).includes(q)||norm(c.en).includes(q)));
$('#lo').innerHTML=`<p class="best">${rows.length} palabras (words)</p>`+rows.map(c=>`<div class="lr"><span>${esc(c.es.replace(/\|/g,' / '))} ${spk(first(c.es))}</span><span class="en" style="${h?'visibility:hidden':''}">${esc(c.en)}</span><span class="lvtag">${LV[c.lvl]}</span></div>`).join('')}
document.addEventListener('input',e=>{if(['lu','ll','ls'].includes(e.target.id))lfill()});
document.addEventListener('change',e=>{if(['lu','ll'].includes(e.target.id))lfill()});
document.addEventListener('click',e=>{const t=e.target.closest('#lh');if(t){t.setAttribute('aria-pressed',t.getAttribute('aria-pressed')!='true');lfill()}});

/* ---------- expressions ---------- */
BL.expr={label:'Expresiones',render(){const list=S.lvl==3?EXPR3:EXPR;const groups=[...new Set(list.map(x=>x[0]))];
return {t:'Expresiones idiomáticas',en:'Idioms',icon:'💬',sub:S.lvl==3?'Expresiones nuevas que no están en tus hojas. Escribe una frase completa con cada una.':'Las expresiones de tus hojas. Escribe una frase completa (con sujeto y verbo) con cada una.',subEn:'Write a full sentence with each one. When you check, you will see a model sentence.',
body:groups.map(g=>`<h4>${UNAMES[g]?UNAMES[g][0]:g}</h4><div class="qs">${list.filter(x=>x[0]==g).map(([u,x,en,kw,m])=>`<div class="q"><p>${esc(x)} ${spk(x)} ${tEn(en)}</p><textarea class="ans" rows="2" data-kw="${esc(kw)}" data-m="${esc(m)}" placeholder="Escribe tu frase… (write your sentence)"></textarea><p class="model" hidden>Modelo: ${esc(m)}</p></div>`).join('')}</div>`).join('')}}};

/* ---------- exam ---------- */
let EXU=null;
BL.exam={label:'Examen',render(){const us=Object.keys(UNAMES).filter(u=>u!='Expresiones');if(!EXU)EXU=new Set(us);const L=S.lvl;
const sel=[...EXU];
const sents=shuf(sel.flatMap(u=>(XS[u]||[]).map(s=>[...s,u])).filter(s=>s[2]==L));
const sentsAll=sents.length>=10?sents:sents.concat(shuf(sel.flatMap(u=>(XS[u]||[]).map(s=>[...s,u])).filter(s=>s[2]!=L)));
const ss=sentsAll.slice(0,12);
const gs=shuf(sel.flatMap(u=>(XG[u]||[]).map(g=>[...g,u])).filter(g=>(g[3]||1)<=Math.max(L,1)&&(L<3||true))).slice(0,6);
const tr=[];const seen=new Set();shuf(ALL.filter(c=>EXU.has(c.u)&&c.lvl==L)).forEach(c=>{if(tr.length<10&&!seen.has(c.en)){seen.add(c.en);tr.push([c.en,ALL.filter(x=>x.en==c.en&&EXU.has(x.u)).map(x=>x.es).join('|')])}});
const ex=shuf(L==3?EXPR3:EXPR).slice(0,3);
return {t:'Examen de práctica',en:'Practice test',icon:'📝',wide:1,
tools:`<span class="tools"><b>Unidades <span class="en">(units)</span>:</b> ${us.map(u=>`<label><input type="checkbox" data-exu="${u}" ${EXU.has(u)?'checked':''}> ${UNAMES[u][0]}</label>`).join(' ')}</span>`,
sub:'Cuatro partes, como en tus quizzes. Elige las unidades y pulsa «Nuevo» para otro examen.',subEn:'Four parts, like your quizzes. Choose the units and press New for another test.',
body:`<h4>1. Completa la frase <span class="en">(complete the sentence)</span></h4><div class="qs">${ss.map(([q,a])=>`<div class="q"><p>${esc(q)}</p>${inp(a)}</div>`).join('')}</div>
<h4>2. Nombra palabras <span class="en">(name words)</span></h4>${gs.map(([l,n,w],g)=>`<div class="cat"><b>Nombra ${n} ${esc(l)}</b><div class="four">${Array(n).fill(0).map(()=>ginp(w,'x'+g)).join('')}</div></div>`).join('')}
<h4>3. Traduce al español <span class="en">(translate into Spanish)</span></h4><div class="qs">${tr.map(([en,a])=>`<div class="q"><p>${esc(en)}</p>${inp(a)}</div>`).join('')}</div>
<h4>4. Escribe una frase con la expresión <span class="en">(write a sentence)</span></h4><div class="qs">${ex.map(([u,x,en,kw,m])=>`<div class="q"><p>${esc(x)} ${tEn(en)}</p><textarea class="ans" rows="2" data-kw="${esc(kw)}" data-m="${esc(m)}"></textarea><p class="model" hidden>Modelo: ${esc(m)}</p></div>`).join('')}</div>`}}};
document.addEventListener('change',e=>{const u=e.target.dataset&&e.target.dataset.exu;if(!u)return;if(e.target.checked)EXU.add(u);else if(EXU.size>1)EXU.delete(u);else e.target.checked=true;mount('exam')});

