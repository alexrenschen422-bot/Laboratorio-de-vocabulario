/* daily.js: "Repaso de hoy" = 20 new words a day in 3 steps:
   1) flashcards rated 1-4 until all 20 are "¡Me la sé!", 2) write each word in Spanish, 3) read a text with all 20 words + 5 questions */
const dlNorm=s=>deacc(base(s)).replace(DEF,'').trim();
const dlLoad=()=>jget('daily',{done:[]});
const dlSave=st=>store.set('daily',JSON.stringify(st));
const range=n=>[...Array(n).keys()];
function dlNew(st){const N=DAILY.length;let li=range(N).find(i=>!st.done.includes(i));
 if(li==null)li=st.cur?(st.cur.li+1)%N:0;
 const L=DAILY[li];st.cur={li,day:today(),ph:'cards',q:shuf(range(L.w.length)),show:false,wq:shuf(range(L.w.length)),wt:0,wa:false,wok:[],wmiss:[],ans:L.q.map(()=>null),qord:L.q.map(()=>shuf([0,1,2]))};dlSave(st);return st}
function dlState(){let st=dlLoad();if(!st.done)st.done=[];if(!st.cur||!DAILY[st.cur.li]||(st.cur.ph=='done'&&st.cur.day!=today()))st=dlNew(st);return st}
const dlWord=(L,i)=>L.w[i][0];
function dlStatus(){const st=dlLoad();const c=st.cur;if(c&&c.ph=='done'&&c.day==today())return '✅ ¡Hecho hoy! Vuelve mañana';
 const L=c&&DAILY[c.li]&&!(c.ph=='done')?DAILY[c.li]:DAILY[range(DAILY.length).find(i=>!(st.done||[]).includes(i))??0];return `20 palabras nuevas: ${L.ic} ${L.t}`}

/* ---------- drawing ---------- */
function dlSteps(ph){const s=[['cards','🃏','Tarjetas','Flashcards'],['write','✏️','Escribir','Write'],['read','📖','Leer','Read']];const at=ph=='done'?3:s.findIndex(x=>x[0]==ph);
 return `<ol class="dlsteps">${s.map((x,i)=>`<li class="${i<at?'done':i==at?'now':''}"><span>${i<at?'✓':x[1]}</span><b>${i+1}. ${x[2]}</b><small class="en">${x[3]}</small></li>`).join('')}</ol>`}
function dlBody(){const st=dlState(),c=st.cur,L=DAILY[c.li],n=L.w.length;
 let h=`<p class="dltheme">${L.ic} <b>${esc(L.t)}</b> ${tEn(L.en)}</p>`+dlSteps(c.ph);
 if(c.ph=='cards'){const i=c.q[0],k=n-c.q.length;
  h+=`<div class="qtop"><div class="qbar"><span style="width:${k/n*100}%"></span></div><span class="qcount">Ya sabes ${k} de ${n}</span></div>
  <div class="qcard dlcard${c.show?' flip':''}"><p class="qk">¿Sabes qué significa? ${tEn('do you know what it means?')}</p><p class="qw">${esc(dlWord(L,i))} ${spk(dlWord(L,i))}</p>
  ${c.show?`<p class="dlen">${esc(L.w[i][1])}</p><p class="qk">¿La sabías? ${tEn('did you know it?')}</p><div class="dlrate">
   <button class="btn r0" data-dlr="0">😶 No la sé<small>I don't know it</small></button>
   <button class="btn r1" data-dlr="1">👀 Me suena<small>I've seen it, but not well</small></button>
   <button class="btn r2" data-dlr="2">🤔 Más o menos<small>I kind of know it</small></button>
   <button class="btn r3" data-dlr="3">😎 ¡Me la sé!<small>I know it</small></button></div>`
  :`<div class="row"><button class="btn pri big" data-dl="flip">👀 Ver en inglés<small>Show the English</small></button></div>`}</div>
  <p class="sub dlnote">Las palabras que no sabes vuelven a salir hasta que te las sepas. ${tEn('Words you don\'t know come back until you know them.')}</p>`}
 else if(c.ph=='write'){const i=c.wq[0],left=new Set(c.wq).size;
  h+=`<div class="qtop"><div class="qbar"><span style="width:${(n-left)/n*100}%"></span></div><span class="qcount">${n-left} de ${n}</span></div>
  <div class="qcard"><p class="qk">Escríbela en español ${tEn('write it in Spanish')}</p><p class="qw">${esc(L.w[i][1])}</p>
  ${inp(dlWord(L,i),{noinst:1,cls:'dlin',label:'Escribe en español',ph:'Escribe aquí…'})}
  <div class="row"><button class="btn pri" data-dl="check">✓ Comprobar<small>Check</small></button></div>
  <div class="qfb" id="dlfb" aria-live="polite"></div><div class="row"><button class="btn pri" id="dlnx" data-dl="next" hidden>Siguiente ▶<small>Next</small></button></div></div>
  <p class="sub dlnote">Si fallas dos veces, la palabra vuelve al final. ${tEn('Miss it twice and it comes back at the end.')}</p>`}
 else if(c.ph=='read'){const plain=L.p.replace(/\[([^\]=]+)(?:=[^\]]+)?\]/g,'$1');const lem=L.w.map(x=>dlNorm(x[0]));
  const txt=esc(L.p).replace(/\[([^\]=]+)(?:=([^\]]+))?\]/g,(m,a,b)=>{const j=lem.indexOf(dlNorm(b||a));return `<span class="dw" tabindex="0" role="button">${a}<span class="dwen">${j>=0?esc(L.w[j][1]):''}</span></span>`});
  const nA=c.ans.filter(x=>x!=null).length,nOk=c.ans.filter(x=>x===0).length;
  h+=`<div class="dlread"><div class="row" style="justify-content:space-between"><p class="qk" style="margin:0">Lee el texto. Toca una palabra en negrita para verla en inglés. ${tEn('Tap a bold word to see it in English.')}</p>${canListen()?`<button class="btn ghost" data-say="${esc(plain)}">🔊 Escuchar el texto</button>`:''}</div>
  <h4 class="dltt">${L.ic} ${esc(L.t)}</h4><p class="dltext">${txt}</p></div>
  <h4 class="sec">Preguntas ${tEn('questions')}</h4>${L.q.map((q,k)=>{const a=c.ans[k];return `<div class="dlq"><p><b>${k+1}.</b> ${esc(q[0])}</p><div class="dlopts">${c.qord[k].map(j=>`<button class="btn dlo${a==null?'':j===0?' ok':j===a?' bad':' dim'}" data-dlq="${k}" data-dlo="${j}"${a==null?'':' disabled'}>${esc(q[1][j])}</button>`).join('')}</div>${a==null?'':a===0?'<p class="okc">✅ ¡Correcto!</p>':`<p class="badc">✗ La respuesta es: <b>${esc(q[1][0])}</b></p>`}</div>`}).join('')}
  ${nA==L.q.length?`<div class="qcard done"><p class="qw">${nOk}/${L.q.length} ${nOk>=4?'🎉':'💪'}</p><div class="row"><button class="btn pri big" data-dl="finish">✓ Terminar la lección<small>Finish the lesson</small></button></div></div>`:''}`}
 else{const w=c.wok.length,r=c.ans.filter(x=>x===0).length;
  h+=`<div class="qcard done"><p class="qw">🏆 ¡Lección terminada!</p><p class="qk">Hoy has aprendido ${n} palabras nuevas. ${tEn(`You learned ${n} new words today.`)}</p>
  <p class="dlscore"><span>✏️ Escribir: <b>${w}/${n}</b> a la primera</span><span>📖 Lectura: <b>${r}/${L.q.length}</b></span></p>
  <p class="sub">Mañana tienes ${n} palabras nuevas. ${tEn(`Tomorrow you get ${n} new words.`)}</p>
  <div class="row"><button class="btn ghost" data-dl="again">🔁 Repasar estas palabras<small>Practice these again</small></button><button class="btn pri" data-dl="more">➕ Otra lección ahora<small>Another lesson now</small></button></div></div>
  <div class="dlwords">${L.w.map(x=>`<span><b>${esc(x[0])}</b> <small>${esc(x[1])}</small></span>`).join('')}</div>`}
 return h}
function dlDraw(sayIt){const b=$('#dl');if(!b)return;const y=window.scrollY;b.innerHTML=dlBody();const i=b.querySelector('input.dlin');if(i)i.focus({preventScroll:true});window.scrollTo({top:y});
 if(sayIt){const st=dlLoad(),c=st.cur;if(c&&c.ph=='cards'&&!c.show)say(dlWord(DAILY[c.li],c.q[0]))}}
BL['rev-today']={label:'Repaso de hoy',noUnit:1,render(){return {t:'Repaso de hoy',en:"Today's 20 words",icon:'📅',noCheck:1,noBank:1,noNew:1,body:`<div id="dl">${dlBody()}</div>`}},after(){const i=$('#dl input.dlin');if(i)i.focus({preventScroll:true})}};

/* ---------- actions ---------- */
function dlCheck(){const st=dlLoad(),c=st.cur,L=DAILY[c.li];if(c.ph!='write'||c.wa)return;const el=$('#dl input.dlin');if(!el||!el.value.trim())return;
 const i=c.wq[0],ans=dlWord(L,i),fb=$('#dlfb'),ce=entry(ans);
 if(match(el.value,ans)){if(!c.wmiss)c.wmiss=[];if(c.wt==0&&!c.wmiss.includes(i)){c.wok.push(i);addStars(1)}if(ce)srsUpd(ce,c.wt==0?true:'hint');c.wa=true;setState(el,'ok');el.readOnly=true;
  fb.innerHTML=`<span class="okc">✅ ${c.wt==0?'¡Muy bien!':'¡Bien!'}</span> <b>${esc(ans)}</b> ${spk(ans)}`;say(ans)}
 else if(c.wt==0){c.wt=1;if(!c.wmiss)c.wmiss=[];if(!c.wmiss.includes(i))c.wmiss.push(i);setState(el,'try');shake(el);el.select();fb.innerHTML=`<span class="tryc">✋ ${almost(el.value,ans)?'Casi: revisa la tilde.':'Todavía no.'}</span> Pista: <b>${esc(hintOf(ans.replace(DEF,'')))}</b>`}
 else{c.wt=2;c.wa=true;c.wq.push(i);if(ce)srsUpd(ce,false);setState(el,'bad');el.readOnly=true;fb.innerHTML=`<span class="badc">✗ La respuesta es</span> <b>${esc(ans)}</b> ${spk(ans)} <span class="sub">Vuelve al final. ${tEn('It comes back at the end.')}</span>`;say(ans)}
 dlSave(st);if(c.wa){const n=$('#dlnx');n.hidden=false;n.focus()}}
document.addEventListener('click',e=>{const dw=e.target.closest('.dw');if(dw){dw.classList.toggle('open');return}
 const t=e.target.closest('[data-dl],[data-dlr],[data-dlq]');if(!t)return;const st=dlLoad();if(!st.cur)return;const c=st.cur,L=DAILY[c.li];
 if(t.dataset.dlr!=null){if(c.ph!='cards')return;const r=+t.dataset.dlr,i=c.q.shift();if(r<3)c.q.splice(Math.min([2,4,7][r],c.q.length),0,i);c.show=false;
  if(!c.q.length){c.ph='write';toast('🃏 ¡Ya te sabes las 20! Ahora, a escribir. <span class="en">(Now write them.)</span>',2600);addStars(3)}dlSave(st);dlDraw(true);return}
 if(t.dataset.dlq!=null){const k=+t.dataset.dlq,j=+t.dataset.dlo;if(c.ans[k]!=null)return;c.ans[k]=j;if(j===0){addStars(1);say(L.q[k][1][0])}dlSave(st);dlDraw();return}
 const a=t.dataset.dl;
 if(a=='flip'){c.show=true;dlSave(st);dlDraw();return}
 if(a=='check'){dlCheck();return}
 if(a=='next'){if(!c.wa)return;c.wq.shift();c.wt=0;c.wa=false;if(!c.wq.length){c.ph='read';toast('📖 ¡Muy bien! Ahora, a leer. <span class="en">(Now read.)</span>',2400);addStars(3)}dlSave(st);dlDraw();if(c.ph=='read')window.scrollTo({top:0});return}
 if(a=='finish'){c.ph='done';if(!st.done.includes(c.li))st.done.push(c.li);dlSave(st);addStars(10);markDay();confetti();toast('🏆 ¡Lección terminada! +10 ⭐',2600);dlDraw();window.scrollTo({top:0});dueBadges&&dueBadges();DIRTY.add('inicio');return}
 if(a=='again'){const n=L.w.length;Object.assign(c,{ph:'cards',q:shuf(range(n)),show:false,wq:shuf(range(n)),wt:0,wa:false,wok:[],wmiss:[],ans:L.q.map(()=>null),qord:L.q.map(()=>shuf([0,1,2]))});dlSave(st);dlDraw(true);window.scrollTo({top:0});return}
 if(a=='more'){dlNew(st);dlDraw(true);window.scrollTo({top:0});return}});
document.addEventListener('keydown',e=>{if(e.key!='Enter')return;const i=e.target.closest&&e.target.closest('input.dlin');if(!i)return;e.preventDefault();const st=dlLoad();if(st.cur&&st.cur.wa){const n=$('#dlnx');if(n)n.click()}else dlCheck()});
