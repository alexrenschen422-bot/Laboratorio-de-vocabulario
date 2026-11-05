/* grammar.js: Gramática = Verbos (12 tenses x 5 activities), Práctica de gramática (topics), Lista de verbos */
const TK=Object.fromEntries(TENSES.map(([k,t,e])=>[k,{t,e}]));
const TGROUP=[['Presente','Present',['pres','prog','perf']],['Pasado','Past',['pret','impf','plus']],['Futuro y condicional','Future and conditional',['ira','fut','cond']],['Subjuntivo e imperativo','Subjunctive and commands',['subj','imp','isubj']]];
const TIC={pres:'🌞',prog:'🏃',perf:'✅',pret:'📸',impf:'🎞️',plus:'⏪',ira:'🚀',fut:'🔮',cond:'💭',subj:'🙏',imp:'📣',isubj:'🌈'};
const IMPP=['','tú','usted','nosotros','vosotros','ustedes'];
const REFLPOOL='levantarse ducharse acostarse vestirse despertarse sentarse quedarse divertirse lavarse peinarse'.split(' ');
/* verbs: vocab + common */
let VERBS=null;
function verbList(){if(VERBS)return VERBS;const seen=new Map();
 ALL.forEach(c=>{alts(c.es).forEach(x=>{const w=x.trim().toLowerCase();if(/^[a-záéíóúñü]+(ar|er|ir|ír)(se)?$/.test(w)&&/^to /i.test(c.en)&&!seen.has(w))seen.set(w,{v:w,en:c.en,src:c.u})})});
 const voc=[...seen.values()];let n=0;const com=[];
 COMMONV.split(';').forEach(s=>{const [v,en]=s.split('=');if(!v||seen.has(v)||n>=300)return;seen.set(v,1);com.push({v,en,src:'común'});n++});
 VERBS={voc,com,all:voc.concat(com).sort((a,b)=>a.v.localeCompare(b.v,'es'))};return VERBS}
const vEn=v=>{const x=verbList().all.find(o=>o.v==v);return x?x.en:''};
/* ---------- typed practice engine ---------- */
const GX={};
const gN=s=>(s||'').toLowerCase().replace(/[¡!¿?.,;:"«»]/g,'').replace(/\s+/g,' ').trim();
const PRON=/^(yo|tú|tu|él|el|ella|usted|nosotros|nosotras|vosotros|vosotras|ellos|ellas|ustedes) /;
function gxJudge(v,ans){const n=gN(v),n2=n.replace(PRON,'');for(const a of ans){const g=gN(a);if(n==g||n2==g)return 'ok'}for(const a of ans){const g=deacc(gN(a));if(deacc(n)==g||deacc(n2)==g)return 'tilde'}return 'no'}
const ACCBAR=`<div class="accbar" aria-label="Letras con tilde">${['á','é','í','ó','ú','ñ','ü'].map(c=>`<button type="button" class="btn ghost" data-acc="${c}" tabindex="-1">${c}</button>`).join('')}</div>`;
function gxCard(id){const q=GX[id];if(!q)return '';const n=q.items.length;
 if(q.i>=n){const pct=Math.round(q.ok/n*100);if(!q.done){q.done=true;if(pct>=80)confetti();markDay()}
  return `<div class="qcard done"><p class="qw">${q.ok} / ${n} ${pct>=80?'🎉':'💪'}</p><p class="qk">a la primera ${tEn('right on the first try')}</p><div class="row"><button class="btn pri" data-do="new" data-b="${id}">↻ Otra vez<small>Again</small></button></div></div>`}
 const it=q.items[q.i];
 return `<div class="qtop"><div class="qbar"><span style="width:${q.i/n*100}%"></span></div><span class="qcount">${q.i+1} / ${n}</span></div>
 <div class="qcard gx"><div class="gxq">${it.q}</div>
 <input class="fld gxi" data-gx="${id}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Escribe aquí…" aria-label="Respuesta">${ACCBAR}
 <div class="row"><button class="btn pri" data-gxc="${id}">✓ Comprobar<small>Check</small></button></div>
 <div class="qfb" id="gxfb-${id}" aria-live="polite"></div><div class="row"><button class="btn pri" id="gxnx-${id}" data-gxn="${id}" hidden>Siguiente ▶<small>Next</small></button></div></div>`}
function gxShow(id){const b=$(`#b-${id} .bb`);if(b){b.innerHTML=gxCard(id);const i=b.querySelector('.gxi');if(i)i.focus({preventScroll:true})}}
function gxCheck(id){const q=GX[id];if(!q||q.ans)return;const i=$(`#b-${id} .gxi`),fb=$('#gxfb-'+id);if(!i||!i.value.trim())return;const it=q.items[q.i];const r=gxJudge(i.value,it.a);
 const full=`<b>${esc(it.a[0])}</b>${it.en?` ${tEn(it.en)}`:''}`;
 if(r=='ok'){if(q.t==0){q.ok++;addStars(1)}q.ans=true;setState(i,'ok');i.readOnly=true;fb.innerHTML=`<span class="okc">✅ ${q.t==0?'¡Muy bien!':'¡Bien!'}</span> ${full}`}
 else if(q.t==0){q.t=1;setState(i,'try');shake(i);i.select();fb.innerHTML=r=='tilde'?`<span class="tryc">✋ ¡Casi! Revisa la tilde.</span> ${tEn('Check the accent mark.')}`:`<span class="tryc">✋ Todavía no.</span> Pista: <b>${esc(hintOf(it.a[0]))}</b>`}
 else{q.ans=true;setState(i,r=='tilde'?'almost':'bad');i.readOnly=true;fb.innerHTML=`<span class="badc">✗ La respuesta es</span> ${full}`}
 if(q.ans){const n=$('#gxnx-'+id);n.hidden=false;n.focus()}}
/* ---------- multiple-choice engine ---------- */
const GM={};
function gmCard(id){const q=GM[id];const n=q.items.length;
 if(q.i>=n){const pct=Math.round(q.ok/n*100);if(!q.done){q.done=true;if(pct>=80)confetti();markDay()}
  return `<div class="qcard done"><p class="qw">${q.ok} / ${n} ${pct>=80?'🎉':'💪'}</p><div class="row"><button class="btn pri" data-do="new" data-b="${id}">↻ Otra vez<small>Again</small></button></div></div>`}
 const it=q.items[q.i],a=q.ans;
 return `<div class="qtop"><div class="qbar"><span style="width:${q.i/n*100}%"></span></div><span class="qcount">${q.i+1} / ${n}</span></div>
 <div class="qcard gm"><p class="gmq">${esc(it.q).replace('___',`<span class="gblank">${a==null?'___':esc(it.opts[a==null?0:it.right])}</span>`)}</p>
 <div class="gmopts">${it.opts.map((o,k)=>`<button class="btn gmo${a==null?'':k==it.right?' ok':k==a?' bad':' dim'}" data-gm="${id}" data-o="${k}"${a==null?'':' disabled'}>${esc(o)}</button>`).join('')}</div>
 ${a==null?'':`<div class="qfb"><span class="${a==it.right?'okc':'badc'}">${a==it.right?'✅ ¡Correcto!':'✗ No es correcto.'}</span> 💡 ${esc(it.why)}<br><span class="sub">${esc(it.en)}</span></div><div class="row"><button class="btn pri" data-gmn="${id}">Siguiente ▶<small>Next</small></button></div>`}</div>`}
function gmShow(id){const b=$(`#gmbox-${id}`);if(b)b.innerHTML=gmCard(id)}
/* ---------- tense blocks ---------- */
function persOf(k){return k=='imp'?[1,2,3,4,5]:[0,1,2,3,4,5]}
function cjTable(v,k){const f=cj(v,k),P=k=='imp'?IMPP:PERS;return `<table class="cjt"><tbody>${f.map((x,i)=>x==null?'':`<tr><td>${P[i]}</td><td><b>${esc(x)}</b></td></tr>`).join('')}</tbody></table>`}
function tenseInfo(k){const d=TD[k],T=TK[k];const models=['hablar','comer','vivir'];const P=k=='imp'?IMPP:PERS;
 const irrs=(k=='ira'?['levantarse']:IRRPOOL.filter(v=>v!='haber'||k!='imp').filter(v=>isIrr(v,k))).slice(0,4);
 return `<div class="tinfo"><div class="tcols"><section><h4>🤔 ¿Cuándo se usa? ${tEn('when do you use it?')}</h4><ul>${d.use.map(u=>`<li>${esc(u)}</li>`).join('')}</ul><p class="sub">🇬🇧 ${esc(d.useEn)}</p>
 <h4>🔑 Palabras clave ${tEn('key words')}</h4><p class="chips">${d.mk.split(', ').map(m=>`<span class="chip">${esc(m)}</span>`).join('')}</p></section>
 <section><h4>💬 Ejemplos ${tEn('examples')}</h4><ul class="exs">${d.ex.map(([e,n])=>`<li><b>${esc(e)}</b> ${spk(e)}<br><span class="sub">${esc(n)}</span></li>`).join('')}</ul></section></div>
 <h4>🧱 Cómo se forma ${tEn('how to form it')}</h4><div class="pan tscroll"><table class="cjt big"><thead><tr><th></th>${models.map(m=>`<th>${m}</th>`).join('')}</tr></thead><tbody>${P.map((p,i)=>k=='imp'&&i==0?'':`<tr><td>${p}</td>${models.map(m=>`<td>${esc(cj(m,k)[i])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
 <p class="note">⚠️ ${esc(d.irrNote)}</p>
 ${irrs.length?`<h4>🔴 Irregulares importantes ${tEn('key irregular verbs')}</h4><div class="irrgrid">${irrs.map(v=>`<div><p class="ivh">${v} <span class="sub">${esc(vEn(v))}</span></p>${cjTable(v,k)}</div>`).join('')}</div>`:''}
 <h4>🔍 Conjugador ${tEn('type any verb')}</h4><div class="row cjrow"><input class="fld" id="cjin-${k}" placeholder="p. ej. dormir" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn pri" data-cjgo="${k}">Ver<small>Show</small></button></div><div id="cjout-${k}"></div></div>`}
function tItems(k,mode){const items=[];const P=persOf(k);const Pl=k=='imp'?IMPP:PERS_S;
 if(mode=='reg'||mode=='irr'){let pool=mode=='reg'?REGPOOL.filter(v=>!isIrr(v,k)):(k=='ira'?REFLPOOL:IRRPOOL.filter(v=>isIrr(v,k)&&!(k=='imp'&&v=='haber')));
  const sp=shuf(pool);for(let n=0;n<10;n++){const v=sp[n%sp.length],p=pick(P);let a=[cj(v,k)[p]];
   if(k=='ira'&&isRefl(v))a.push(VOY[p]+' a '+v.slice(0,-2)+REFP[p]);
   items.push({q:`<p class="gxv"><b>${v}</b> <span class="en">(${esc(vEn(v))})</span></p><p class="gxp">${Pl[p]}</p>`,a})}}
 if(mode=='fra'){const fr=TD[k].fr;const pool=(k=='imp'?IMPVC:VC).filter(([v])=>!(k=='prog'&&/^(tener|saber|poder|querer|ser)$/.test(v)));
  for(let n=0;n<10;n++){const [v,c]=pick(pool);let f=pick(fr),p,s;if(k=='imp'){[s,p]=pick(VOC);f=f.replace('{P}',s)}else{[s,p]=pick(SUBJ);f=f.replace('{S}',s)}
   const a=cj(v,k)[p];f=f.replace('{C}',c);f=f.charAt(0).toUpperCase()+f.slice(1);
   items.push({q:`<p class="gxs">${esc(f).replace('___','<span class="gblank">___</span>')}</p><p class="gxp">(${v})</p>`,a:[a]})}}
 if(mode=='com'){shuf(TD[k].ph).forEach(([s,en,inf,per])=>{const m=s.match(/\*([^*]+)\*/);items.push({q:`<p class="gxs">${esc(s.replace(/\*[^*]+\*/,'___')).replace('___','<span class="gblank">___</span>')}</p><p class="gxp">(${inf} · ${per})</p><p class="sub">🇬🇧 ${esc(en)}</p>`,a:[m[1]],en})})}
 return items}
const TMODES=[['info','📘','Cómo se forma','How it works'],['reg','🟢','Regulares','Regular verbs'],['irr','🔴','Irregulares','Irregular verbs'],['fra','💬','En una frase','In a sentence'],['com','⭐','Frases comunes','Common phrases']];
TENSES.forEach(([k,t,e])=>{TMODES.forEach(([m,ic,lab,len])=>{const id=`tv-${k}-${m}`;TABIC[id]=ic;
 BL[id]={label:k=='ira'&&m=='irr'?'Verbos con «se»':lab,noUnit:1,render(){
  if(m=='info')return {t:t,en:e,icon:TIC[k],noCheck:1,noBank:1,noNew:1,body:tenseInfo(k)};
  GX[id]={items:tItems(k,m),i:0,t:0,ok:0,ans:false,done:false};
  const sub={reg:'Escribe la forma correcta del verbo regular.',irr:k=='ira'?'Verbos con «se»: me voy a levantar (o voy a levantarme).':'Escribe la forma correcta del verbo irregular.',fra:'Completa la frase con el verbo entre paréntesis.',com:'Frases que se usan mucho. Escribe el verbo que falta.'}[m];
  return {t:`${t}: ${k=='ira'&&m=='irr'?'verbos con «se»':lab.toLowerCase()}`,en:`${e}: ${len.toLowerCase()}`,icon:ic,noCheck:1,noBank:1,sub,subEn:'Use the accent buttons for á, é, í, ó, ú, ñ.',body:gxCard(id)}},
  after(){const i=$(`#b-${id} .gxi`);if(i)i.focus({preventScroll:true})}}})});
/* ---------- grammar topic blocks ---------- */
GTOP.forEach(g=>{const id='gt-'+g.id;TABIC[id]=g.ic;
 BL[id]={label:g.t,noUnit:1,render(){GM[id]={items:shuf(g.q).slice(0,10).map(([q,o,en,why])=>{const opts=shuf(o);return {q,opts,right:opts.indexOf(o[0]),en,why}}),i:0,ok:0,ans:null,done:false};
  return {t:g.t,en:g.en,icon:g.ic,noCheck:1,noBank:1,body:`<details class="grule" open><summary>📘 La regla ${tEn('the rule')}</summary>${g.rule}</details><div id="gmbox-${id}">${gmCard(id)}</div>`}}}});
/* ---------- verb list ---------- */
let VLF={q:'',f:'all'};
function vlRows(){const V=verbList();let L=VLF.f=='voc'?V.voc:VLF.f=='com'?V.com:V.all;if(VLF.f=='voc'||VLF.f=='com')L=[...L].sort((a,b)=>a.v.localeCompare(b.v,'es'));
 if(VLF.f=='irr')L=V.all.filter(o=>vType(o.v)!='reg');
 const q=deacc(VLF.q.toLowerCase().trim());if(q)L=L.filter(o=>deacc(o.v).includes(q)||deacc(o.en.toLowerCase()).includes(q));
 const tb={reg:['regular','vreg'],irr:['irregular','virr'],orto:['ortografía','vorto']};
 return `<p class="sub">${L.length} verbos</p><div class="vlist">${L.map(o=>{const ty=vType(o.v);const [tl,tc]=tb[ty]||[ty,'vsc'];return `<details class="vrow" data-v="${esc(o.v)}"><summary><b>${esc(o.v)}</b><span class="ven">${esc(o.en)}</span><span class="vtags"><span class="vt ${tc}">${tl}</span><span class="vt ${o.src=='común'?'vcom':'vvoc'}">${o.src=='común'?'común':esc(o.src)}</span></span></summary><div class="vconj"></div></details>`}).join('')}</div>`}
function vlConj(v){return `<div class="vgrid">${TENSES.map(([k,t])=>`<div><p class="ivh">${TIC[k]} ${t}</p>${cjTable(v,k)}</div>`).join('')}</div>`}
BL['verb-list']={label:'Lista de verbos',noUnit:1,render(){const V=verbList();
 return {t:'Lista de verbos',en:'All the verbs',icon:'📋',noCheck:1,noBank:1,noNew:1,sub:`${V.voc.length} verbos de tus unidades + ${V.com.length} verbos muy comunes. Toca un verbo para ver todas sus formas.`,subEn:'Tap a verb to see all its forms.',
  body:`<div class="vlbar"><input class="fld" id="vlq" placeholder="🔍 Buscar (español o inglés)…" autocomplete="off" value="${esc(VLF.q)}"><div class="seg">${[['all','Todos'],['voc','De mis unidades'],['com','Comunes'],['irr','Irregulares']].map(([f,t])=>`<button data-vlf="${f}" aria-pressed="${VLF.f==f}">${t}</button>`).join('')}</div></div><div id="vlbody">${vlRows()}</div>`}}};
TABIC['verb-list']='📋';
/* ---------- hubs ---------- */
function gramHub(){return `<section class="ghero"><div><p class="gtag">⭐ Muy importante ${tEn('very important')}</p><h2>📐 Gramática</h2><p>La gramática es la base de todo: con ella puedes usar todas tus palabras. Hay más que aprender aquí, así que ve paso a paso. ${tEn('Grammar is the base for everything. There is more to learn here, so go step by step.')}</p></div></section>
 <div class="ggrid"><button class="gcard verb" data-view="verbos"><span>🔤</span><b>Verbos</b><small>12 tiempos: cómo se forman, regulares, irregulares, frases ${tEn('12 tenses')}</small></button>
 <button class="gcard prac" data-view="gram"><span>🧩</span><b>Práctica de gramática</b><small>Ser o estar, por o para, ¿el o la?, gustar... ${tEn('grammar topics')}</small></button>
 <button class="gcard list" data-view="vlista"><span>📋</span><b>Lista de verbos</b><small>${verbList().all.length} verbos con todas sus formas ${tEn('every verb, every form')}</small></button></div>`}
function verbHub(){return `<div class="phead"><button class="back" data-view="gramatica">← Gramática</button>${enBtn()}</div><section class="ghero sm"><h2>🔤 Verbos</h2><p>Elige un tiempo. En cada uno: cómo se forma, verbos regulares, irregulares, frases y expresiones comunes. ${tEn('Pick a tense.')}</p></section>
 ${TGROUP.map(([g,ge,ks])=>`<h3 class="sec">${g} ${tEn(ge)}</h3><div class="tgrid">${ks.map(k=>`<button class="tcard" data-view="t-${k}"><span>${TIC[k]}</span><b>${TK[k].t}</b><small>${esc(TK[k].e)}</small><i>${esc(cj('hablar',k)[k=='imp'?1:0])}</i></button>`).join('')}</div>`).join('')}
 <button class="gcard list wide1" data-view="vlista"><span>📋</span><b>Lista de verbos</b><small>Todos los verbos con todas sus formas ${tEn('every verb, every form')}</small></button>`}
function gramPracHub(){return `<div class="phead"><button class="back" data-view="gramatica">← Gramática</button>${enBtn()}</div><section class="ghero sm"><h2>🧩 Práctica de gramática</h2><p>Cada tema tiene la regla y 10 preguntas. ${tEn('Each topic has the rule and 10 questions.')}</p></section>
 <div class="tgrid">${[{id:'genero',ic:'⚖️',t:'¿El o la?',en:'Masculine or feminine'}].concat(GTOP).map(g=>`<button class="tcard" data-view="g-${g.id}"><span>${g.ic}</span><b>${g.t}</b><small>${esc(g.en)}</small></button>`).join('')}</div>`}
const GHUB={gramatica:gramHub,verbos:verbHub,gram:gramPracHub};
const GVIEWS=()=>[{id:'gramatica',t:'Gramática',en:'Grammar',ic:'📐',g:'gra',th:'gram'},{id:'verbos',t:'Verbos',en:'Verbs',ic:'🔤',g:'gra',th:'gram'},{id:'gram',t:'Práctica de gramática',en:'Grammar practice',ic:'🧩',g:'gra',th:'gram'},{id:'vlista',t:'Lista de verbos',en:'Verb list',ic:'📋',g:'gra',th:'vlist',blocks:['verb-list'],par:'verbos'},
 ...TENSES.map(([k,t,e])=>({id:'t-'+k,t,en:e,ic:TIC[k],g:'hid',th:'gram',par:'verbos',blocks:TMODES.map(([m])=>`tv-${k}-${m}`),desc:'Verbos'})),
 {id:'g-genero',t:'¿El o la?',en:'Masculine or feminine',ic:'⚖️',g:'hid',th:'gram',par:'gram',blocks:['rev-gender'],desc:'Gramática'},
 ...GTOP.map(g=>({id:'g-'+g.id,t:g.t,en:g.en,ic:g.ic,g:'hid',th:'gram',par:'gram',blocks:['gt-'+g.id],desc:'Gramática'}))];
/* ---------- events ---------- */
document.addEventListener('click',e=>{const t=e.target.closest('[data-gxc],[data-gxn],[data-gm],[data-gmn],[data-acc],[data-cjgo],[data-vlf]');if(!t)return;
 if(t.dataset.gxc){gxCheck(t.dataset.gxc);return}
 if(t.dataset.gxn){const q=GX[t.dataset.gxn];q.i++;q.t=0;q.ans=false;gxShow(t.dataset.gxn);return}
 if(t.dataset.gm){const id=t.dataset.gm,q=GM[id];if(q.ans!=null)return;q.ans=+t.dataset.o;const it=q.items[q.i];if(q.ans==it.right){q.ok++;addStars(1)}gmShow(id);const n=$(`#gmbox-${id} [data-gmn]`);if(n)n.focus({preventScroll:true});return}
 if(t.dataset.gmn){const q=GM[t.dataset.gmn];q.i++;q.ans=null;gmShow(t.dataset.gmn);return}
 if(t.dataset.acc){const i=t.closest('.qcard,.blk').querySelector('.gxi:not([readonly])');if(i){const s=i.selectionStart??i.value.length,en=i.selectionEnd??s;i.value=i.value.slice(0,s)+t.dataset.acc+i.value.slice(en);i.focus();i.setSelectionRange(s+1,s+1)}return}
 if(t.dataset.cjgo){const k=t.dataset.cjgo,v=($('#cjin-'+k).value||'').trim().toLowerCase();const o=$('#cjout-'+k);if(!/^[a-záéíóúñü]+(ar|er|ir|ír)(se)?$/.test(v)){o.innerHTML='<p class="sub">Escribe un infinitivo: hablar, comer, vivir... (Type an infinitive.)</p>';return}
  o.innerHTML=`<p class="ivh">${esc(v)} <span class="sub">${esc(vEn(v))}</span></p>${cjTable(v,k)}`;return}
 if(t.dataset.vlf){VLF.f=t.dataset.vlf;$$('[data-vlf]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.vlf==VLF.f));$('#vlbody').innerHTML=vlRows();return}});
document.addEventListener('toggle',e=>{const d=e.target;if(d.classList&&d.classList.contains('vrow')&&d.open){const c=d.querySelector('.vconj');if(!c.innerHTML)c.innerHTML=vlConj(d.dataset.v)}},true);
document.addEventListener('input',e=>{if(e.target.id=='vlq'){VLF.q=e.target.value;$('#vlbody').innerHTML=vlRows()}});
document.addEventListener('keydown',e=>{if(e.key!='Enter')return;const i=e.target.closest&&e.target.closest('.gxi');if(i){e.preventDefault();const id=i.dataset.gx;if(GX[id]&&GX[id].ans){const n=$('#gxnx-'+id);if(n)n.click()}else gxCheck(id);return}
 const c=e.target.id&&e.target.id.startsWith('cjin-');if(c){e.preventDefault();const b=$(`[data-cjgo="${e.target.id.slice(5)}"]`);if(b)b.click()}});
