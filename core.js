/* core.js: settings, memory (spaced repetition), answer checking, hints, blocks, word bank, diagrams, stars */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const store={get(k){try{return localStorage.getItem('vl5-'+k)}catch(e){return null}},set(k,v){try{localStorage.setItem('vl5-'+k,v)}catch(e){}}};
const jget=(k,d)=>{try{const v=store.get(k);return v?JSON.parse(v):d}catch(e){return d}};
const S=Object.assign({lvl:1,bank:false,dev:'auto',strict:false,enMode:'auto',instant:true,art:false,pal:'menta',fs:1,av:'🧒',name:'',color:false},jget('cfg',{}));
if(S.dev==null)S.dev='auto';if(S.en===false&&!jget('cfg',{}).enMode)S.enMode='off';
const saveS=()=>store.set('cfg',JSON.stringify(S));
const isPhone=()=>S.dev=='phone'||(S.dev=='auto'&&window.innerWidth<760);
const showEn=()=>S.enMode=='on'||(S.enMode=='auto'&&S.lvl==1);
const R=n=>Math.random()*n|0,pick=a=>a[R(a.length)],rr=(a,b)=>a+Math.random()*(b-a);
const shuf=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=R(i+1);[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ART=/^(el|la|los|las|un|una|unos|unas|mi|mis|su|sus|tu|tus) /;
const DEF=/^(el|la|los|las) /;
const base=s=>(s||'').toLowerCase().trim().replace(/[.,;:!¡?¿"()]/g,'').replace(/\s+/g,' ');
const deacc=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'');
function norm(s,strict=S.strict){s=base(s);if(!strict)s=deacc(s);return s.replace(ART,'')}
const normKeep=s=>{s=base(s);if(!S.strict)s=deacc(s);return s};
const eq=(a,b)=>a===b||a+'s'===b||b+'s'===a||a+'es'===b||b+'es'===a;
const alts=a=>String(a).split('|');
const first=a=>alts(a)[0];
function matchArt(v,ans){const nv=normKeep(v);for(const x of alts(ans)){const c=entry(x);const forms=c?alts(c.es).filter(f=>DEF.test(base(f))):[];
 if(forms.length){if(forms.some(f=>eq(normKeep(f),nv)))return true;if(/^(mi|mis|su|sus|tu|tus) /.test(nv)&&eq(norm(x),norm(v)))return true}else if(eq(norm(x),norm(v)))return true}return false}
const match=(v,ans)=>{const n=norm(v);if(!n)return false;if(S.art)return matchArt(v,ans);return alts(ans).some(x=>eq(norm(x),n))};
const almost=(v,ans)=>S.strict&&!match(v,ans)&&alts(ans).some(x=>eq(norm(x,false),norm(v,false)));
const LV=['','Básico','Avanzado','Más vocabulario'],LVEN=['','Basic','Advanced','More vocabulary'];

/* ---------- vocabulary index ---------- */
let ALL=[],IDX=new Map();
function buildIndex(){IDX=new Map();ALL.forEach(c=>alts(c.es).forEach(x=>{const k=norm(x,false);if(!IDX.has(k))IDX.set(k,[]);IDX.get(k).push(c)}))}
function entry(ans,unit){for(const x of alts(ans)){const l=IDX.get(norm(x,false));if(l){return l.find(c=>!unit||c.u==unit)||l[0]}}return null}
function lvOf(ans,unit){for(const x of alts(ans)){const l=IDX.get(norm(x,false));if(l){const c=l.find(c=>c.u==unit);if(c)return c.lvl}}for(const x of alts(ans)){const l=IDX.get(norm(x,false));if(l)return Math.min(...l.map(c=>c.lvl))}return 3}
const enOf=(ans,unit)=>{const c=entry(ans,unit);return c?c.en:''};
/* the answer written with its article, e.g. "farmacia" -> "la farmacia" */
function artForm(a,unit){const w=first(a),c=entry(w,unit);if(!c)return w;const f=alts(c.es).find(x=>norm(x,false)==norm(w,false));return f||alts(c.es)[0]}
function pool(arr,lvF,need=0){const L=S.lvl;let p=arr.filter(x=>lvF(x)==L);if(p.length<need){const rest=shuf(arr.filter(x=>lvF(x)!=L)).sort((a,b)=>Math.abs(lvF(a)-L)-Math.abs(lvF(b)-L));p=p.concat(rest.slice(0,need-p.length))}return p}
const draw=(arr,lvF,n)=>shuf(pool(arr,lvF,n)).slice(0,n);

/* ---------- memory: spaced repetition ---------- */
const DAY=864e5,IV=[0,1,3,7,21,60];
let SRS=jget('srs',{});
const key=c=>c.u+'|'+c.es;
const saveSRS=()=>store.set('srs',JSON.stringify(SRS));
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
function markDay(){const d=jget('days',[]);const t=today();if(!d.includes(t)){d.push(t);store.set('days',JSON.stringify(d.slice(-400)))}}
function streak(){const d=new Set(jget('days',[]));const k=x=>x.getFullYear()+'-'+(x.getMonth()+1)+'-'+x.getDate();const x=new Date();if(!d.has(k(x)))x.setDate(x.getDate()-1);let n=0;while(d.has(k(x))){n++;x.setDate(x.getDate()-1)}return n}
/* res: true = right, false = wrong, 'hint' = right after a hint */
function srsUpd(c,res){if(!c)return;const k=key(c),now=Date.now();const r=SRS[k]||{b:0,d:0,r:0,w:0};
 if(res===true){r.r++;if(r.b==0||r.d<=now+DAY/2){r.b=Math.min(5,r.b+1);r.d=now+IV[r.b]*DAY}}
 else if(res==='hint'){r.b=Math.max(1,Math.min(r.b,2));r.d=now+DAY}
 else{r.w++;r.b=1;r.d=now}
 r.t=now;SRS[k]=r;saveSRS();markDay()}
const rec=c=>SRS[key(c)];
const isDue=c=>{const r=rec(c);return r&&r.b>0&&r.d<=Date.now()};
const dueList=()=>ALL.filter(isDue).sort((a,b)=>rec(a).d-rec(b).d);
const mastered=c=>{const r=rec(c);return r&&r.b>=3};
const getM=()=>{const m=jget('miss',[]);return [...new Set(m.concat(Object.entries(SRS).filter(([k,r])=>r.w>0&&r.b<3).map(([k])=>k)))]};
const setM=a=>store.set('miss',JSON.stringify([...new Set(a)].slice(-400)));
function miss(a,unit){const c=entry(a,unit);if(c)srsUpd(c,false)}
const addM=c=>srsUpd(c,false),delM=c=>{setM(jget('miss',[]).filter(k=>k!=key(c)));srsUpd(c,true)};

/* ---------- inputs ---------- */
function inp(a,o={}){return `<input type="text" class="ans${o.cls?' '+o.cls:''}" autocomplete="off" autocapitalize="off" spellcheck="false" data-a="${esc(a)}"${o.pin!=null?` data-pin="${o.pin}"`:''}${o.ph!=null?` placeholder="${esc(o.ph)}"`:''}${o.style?` style="${o.style}"`:''}${o.noinst?' data-noinst="1"':''} aria-label="${esc(o.label||'Respuesta (answer)')}">`}
function ginp(w,g,o={}){return `<input type="text" class="ans" autocomplete="off" autocapitalize="off" spellcheck="false" data-w="${esc(w)}" data-g="${g}"${o.ph?` placeholder="${esc(o.ph)}"`:''} aria-label="Palabra (word)">`}
const tEn=t=>showEn()&&t?`<span class="en">(${esc(t)})</span>`:'';

/* ---------- blocks ---------- */
const BL={},RUN={},LAST={};
function blockHTML(id){const b=BL[id];let o;try{o=b.render()}catch(e){console.error(id,e);o={t:'Error',en:'',body:`<p class="sub">${esc(e.message)}</p>`,noCheck:1}}
RUN[id]={aw:0,shown:false,o,unit:b.unit};
return `<section class="blk${o.wide?' wide':''}" id="b-${id}" data-b="${id}"><header class="bh"><div class="bt"><span class="bi" aria-hidden="true">${o.icon||'✏️'}</span><div class="btt"><h3>${o.t}</h3>${showEn()?`<p class="ten">${esc(o.en)}</p>`:''}</div></div>
<div class="bact"><span class="pill" id="sc-${id}" hidden></span>${o.noCheck?'':`<button class="btn pri" data-do="check" data-b="${id}">✓ Comprobar<small>Check</small></button><button class="btn ghost" data-do="show" data-b="${id}">Ver respuestas<small>Show answers</small></button>`}${o.noNew?'':`<button class="btn ghost" data-do="new" data-b="${id}" title="Nuevo (new)">↻ Nuevo<small>New</small></button>`}</div></header>
${o.tools?`<div class="tools">${o.tools}</div>`:''}${o.sub?`<p class="sub">${o.sub}${o.subEn?` ${tEn(o.subEn)}`:''}</p>`:''}<div class="bank" id="bk-${id}" hidden></div><div class="bb">${o.body}</div><p class="fb" id="fb-${id}" aria-live="polite"></p><p class="best" id="bs-${id}"></p></section>`}
function mount(id){const el=$('#b-'+id);if(!el)return;el.outerHTML=blockHTML(id);post(id)}
function post(id){bank(id);stats(id);const el=$('#b-'+id);if(el)requestAnimationFrame(()=>$$('.pan',el).forEach(p=>{if(p.id!='cmpan'){p.scrollLeft=(p.scrollWidth-p.clientWidth)/2;p.scrollTop=(p.scrollHeight-p.clientHeight)*.4}}));try{BL[id].after&&BL[id].after(el)}catch(e){console.error(id,e)}}
function stats(id){const b=store.get(`best-${id}-L${S.lvl}`),el=$('#bs-'+id);if(el)el.textContent=b?`Tu mejor resultado: ${b}%`:''}

/* ---------- word bank ---------- */
function bank(id){const r=$('#b-'+id),bk=$('#bk-'+id);if(!r||!bk)return;if(!S.bank||RUN[id].o.noBank){bk.hidden=true;return}
const words=[],groups={};
$$('.bb input[data-a]',r).forEach(el=>{if(!el.closest('[data-nobank]'))words.push(first(el.dataset.a))});
$$('.bb [data-w]',r).forEach(el=>{(groups[el.dataset.g]=groups[el.dataset.g]||{w:el.dataset.w,n:0}).n++});
Object.values(groups).forEach(g=>words.push(...shuf(alts(g.w)).slice(0,g.n)));
if(!words.length){bk.hidden=true;return}
bk.innerHTML=`<p class="bkl">Banco de palabras ${tEn('tap a box, then a word')}</p><div class="chips">${shuf(words).map(w=>`<button type="button" class="chip" data-chip="${esc(w)}">${esc(w)}</button>`).join('')}</div>`;bk.hidden=false;markChips(id)}
function markChips(id){const r=$('#b-'+id);if(!r)return;const vals=$$('.bb input.ans',r).map(i=>norm(i.value)).filter(Boolean);const cnt={};vals.forEach(v=>cnt[v]=(cnt[v]||0)+1);
$$('.chip',r).forEach(c=>{const k=norm(c.dataset.chip);if(cnt[k]){c.classList.add('used');cnt[k]--}else c.classList.remove('used')})}
function useChip(c){const r=c.closest('.blk'),id=r.dataset.b;let t=LAST[id];if(!t||!r.contains(t)||t.value.trim())t=$$('.bb input.ans',r).find(i=>!i.value.trim()&&!i.closest('[data-nobank]'));if(!t)return;
t.value=c.dataset.chip;t.classList.remove('ok','bad','almost','try');markChips(id);if(S.instant&&!t.dataset.noinst&&!BL[id].grade)checkOne(t,id);const nx=$$('.bb input.ans',r).find(i=>!i.value.trim());if(nx){nx.focus({preventScroll:true});LAST[id]=nx}}

/* ---------- hints ---------- */
const hintOf=a=>first(a).split(' ').map(w=>w[0]+' _'.repeat(Math.max(0,w.length-1))).join('   ');
function clearHint(el){if(el._hint){el._hint.remove();el._hint=null}}
function showHint(el,html,cls=''){clearHint(el);const h=document.createElement('span');h.className='hint '+cls;h.innerHTML=html;
 if(el.parentElement&&el.parentElement.classList.contains('ov')){h.classList.add('ovh');h.style.left=el.style.left;h.style.top=`calc(${el.style.top} + ${el.offsetHeight/2+3}px)`;el.parentElement.appendChild(h)}
 else el.insertAdjacentElement('afterend',h);el._hint=h}
function shake(el){el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake')}

/* ---------- checking ---------- */
function setState(el,st,id){el.classList.remove('ok','bad','almost','try');if(st)el.classList.add(st);el.title=st=='almost'?'Casi: revisa la tilde (almost: check the accent)':st=='ok'?'Toca para escuchar (tap to listen)':'';
if(el.dataset.pin!=null){const p=$(`#pin-${id}-${el.dataset.pin}`);if(p){p.classList.remove('ok','bad','almost','try');if(st)p.classList.add(st)}}}
const enLater=()=>S.enMode=='on'||(S.enMode=='auto'&&S.lvl<=2);
/* instant check of one box: 1st mistake -> hint, 2nd mistake -> answer */
function checkOne(el,id){if(!el.value.trim()||!RUN[id])return;const unit=RUN[id].unit;let g;
 if(el.dataset.w){const nv=norm(el.value),grp=$$(`.bb [data-g="${CSS.escape(el.dataset.g)}"]`,$('#b-'+id)).filter(x=>x!==el&&x.classList.contains('ok')).map(x=>norm(x.value));g=alts(el.dataset.w).some(w=>eq(norm(w),nv))&&!grp.some(x=>eq(x,nv))}
 else g=match(el.value,el.dataset.a);
 el._t=(el._t||0)+1;clearHint(el);
 if(g){setState(el,'ok',id);if(el._t==1&&!el._star&&!RUN[id].shown){el._star=1;addStars(1);RUN[id].aw++}const c=el.dataset.w?entry(el.value,unit):entry(el.dataset.a,unit);if(c&&!el._srs&&!RUN[id].shown){srsUpd(c,el._t==1?true:'hint');el._srs=1}return}
 if(el.dataset.w){setState(el,'try',id);shake(el);showHint(el,'Esa palabra no vale o ya está escrita. '+tEn('not in this group, or already used'));return}
 const al=almost(el.value,el.dataset.a),en=enOf(el.dataset.a,unit);
 if(el._t==1){setState(el,'try',id);shake(el);showHint(el,`${al?'Casi: revisa la tilde · ':S.art&&alts(el.dataset.a).some(x=>eq(norm(x),norm(el.value)))?'Revisa el artículo (el / la) · ':'Pista: '}<b>${esc(hintOf(el.dataset.a))}</b>${enLater()&&en&&!showEn()?` <span class="enx">(${esc(en)})</span>`:''}`)}
 else{setState(el,'bad',id);const w=artForm(el.dataset.a,unit);showHint(el,`✔ <b>${esc(w)}</b> ${spk(w)}`,'ans');const c=entry(el.dataset.a,unit);if(c&&!el._srs&&!RUN[id].shown){srsUpd(c,false);el._srs=1}}}
function descOk(el){const v=deacc(base(el.value));const words=v.split(' ').filter(Boolean);const ws=el.dataset.desc.split(';').filter(Boolean);let hit=0;ws.forEach(w=>{if(alts(w).some(x=>{const n=deacc(base(x).replace(ART,''));return n&&(' '+v+' ').includes(' '+n)}))hit++});return{ok:words.length>=6&&hit>=3,hit,n:words.length}}
function grade(id){const r=$('#b-'+id);if(!r)return;if(BL[id].grade)return BL[id].grade(r);let ok=0,n=0;const seen={},unit=RUN[id].unit;
$$('.bb [data-a],.bb [data-w],.bb [data-kw],.bb [data-desc]',r).forEach(el=>{let g=false,al=false;const v=el.value||'';
 if(el.dataset.kw){const raw=deacc(v.toLowerCase());g=raw.trim().split(/\s+/).length>=4&&new RegExp(el.dataset.kw).test(raw);const m=el.parentElement.querySelector('.model');if(m)m.hidden=false}
 else if(el.dataset.desc){const d=descOk(el);g=d.ok;const m=el.parentElement.querySelector('.model');if(m)m.hidden=false;const f=el.parentElement.querySelector('.dfb');if(f)f.innerHTML=g?'¡Muy bien! ✍️':`Has usado ${d.hit} palabras del dibujo y ${d.n} palabras en total. Necesitas 3 del dibujo y 6 en total. ${tEn('Use at least 3 words from the picture and 6 words in total.')}`}
 else if(el.dataset.w){const k=el.dataset.g,s=seen[k]=seen[k]||[];const nv=norm(v);g=!!nv&&alts(el.dataset.w).some(w=>eq(norm(w),nv))&&!s.some(x=>eq(x,nv));if(nv)s.push(nv);if(g&&!el._srs&&!RUN[id].shown){const c=entry(v,unit);if(c){srsUpd(c,true);el._srs=1}}}
 else{g=match(v,el.dataset.a);al=!g&&almost(v,el.dataset.a);if(!RUN[id].shown&&!el._srs&&v.trim()&&el.tagName=='INPUT'){const c=entry(el.dataset.a,unit);if(c){srsUpd(c,g);el._srs=1}}
  if(!g&&v.trim()&&el.tagName=='INPUT'&&!el._hint){const w=artForm(el.dataset.a,unit);showHint(el,`✔ <b>${esc(w)}</b> ${spk(w)}`,'ans')}}
 n++;if(g)ok++;setState(el,g?'ok':al?'almost':'bad',id)});
score(id,ok,n)}
function score(id,ok,n){const pct=n?Math.round(ok/n*100):0,pl=$('#sc-'+id);if(pl){pl.hidden=false;pl.textContent=`${ok} / ${n}`;pl.className='pill '+(pct==100?'p100':pct>=70?'p70':'plow')}
const fb=$('#fb-'+id);
if(!RUN[id].shown){const add=Math.max(0,ok-RUN[id].aw);if(add){RUN[id].aw=ok;addStars(add)}markDay();
 const k=`best-${id}-L${S.lvl}`;if(pct>(+store.get(k)||0))store.set(k,pct);stats(id);
 if(fb)fb.innerHTML=pct==100?'¡Perfecto! 🎉 '+tEn('Perfect!'):pct>=80?'¡Muy bien! '+tEn('Very good!'):pct>=50?'¡Bien! Sigue así. '+tEn('Good! Keep going.'):'¡Ánimo! Las palabras que fallas vuelven en tu repaso. '+tEn('Keep going! Missed words come back in your review.');
 if(pct==100&&n>0)confetti();if(window.onBlockDone)onBlockDone(id,pct)}
else if(fb)fb.innerHTML='Estas son las respuestas. Pulsa <b>↻ Nuevo</b> para practicar otra vez. '+tEn('Press New to practice again.')}
function showAns(id){RUN[id].shown=true;const r=$('#b-'+id);if(BL[id].show)return BL[id].show(r);const used={},unit=RUN[id].unit;
$$('.bb input[data-a]',r).forEach(el=>{clearHint(el);el.value=S.art?artForm(el.dataset.a,unit):first(el.dataset.a)});
$$('.bb select[data-a]',r).forEach(el=>el.value=el.dataset.a);
$$('.bb [data-w]',r).forEach(el=>{const k=el.dataset.g;if(!used[k]){const l=[];shuf(alts(el.dataset.w)).forEach(w=>{if(!l.some(x=>eq(norm(x),norm(w))))l.push(w)});used[k]=l}el.value=used[k].shift()||''});
$$('.bb [data-kw],.bb [data-desc]',r).forEach(el=>el.value=el.dataset.m||'');markChips(id);grade(id)}

/* ---------- stars, sound, confetti, toast ---------- */
function addStars(n){const t=(+store.get('stars')||0)+n;store.set('stars',t);$$('.starsn').forEach(el=>{el.textContent=t;const p=el.closest('.starbox');if(p){p.classList.remove('pop');void p.offsetWidth;p.classList.add('pop')}})}
let VOICE=null;function pickVoice(){try{const vs=speechSynthesis.getVoices();VOICE=vs.find(v=>/es[-_]ES/i.test(v.lang))||vs.find(v=>/^es/i.test(v.lang))||null}catch(e){}}
try{pickVoice();speechSynthesis.onvoiceschanged=pickVoice}catch(e){}
const canSpeak=()=>{try{return 'speechSynthesis' in window}catch(e){return false}};
function say(t){try{const u=new SpeechSynthesisUtterance(t);u.lang='es-ES';if(!VOICE)pickVoice();if(VOICE)u.voice=VOICE;u.rate=.85;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
const spk=t=>`<button type="button" class="spk" data-say="${esc(t)}" aria-label="Escuchar (listen)" title="Escuchar (listen)">🔊</button>`;
function confetti(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const w=document.createElement('div');w.className='conf';w.setAttribute('aria-hidden','true');const e=['⭐','🎉','✨','🌟','🎈','💚'];
for(let i=0;i<34;i++){const s=document.createElement('span');s.textContent=pick(e);s.style.left=rr(2,98)+'%';s.style.animationDelay=rr(0,.5)+'s';s.style.fontSize=rr(16,34)+'px';s.style.setProperty('--dx',rr(-80,80)+'px');w.appendChild(s)}
document.body.appendChild(w);setTimeout(()=>w.remove(),2600)}
function toast(html,ms=2200){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.appendChild(t)}t.innerHTML=html;t.classList.add('on');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('on'),ms)}

/* ---------- diagrams ---------- */
const ovl=(x1,y1,x2,y2,w,h)=>Math.max(0,w-Math.abs(x1-x2))*Math.max(0,h-Math.abs(y1-y2));
function placeLabels(marks,W,H,bw,bh,r){const out=[],ks=[r+bh/2+6,r*2.4+bh/2+6,r*3.8+bh/2+8,r*5.6+bh/2+10];const cand=[];
ks.forEach(k=>cand.push([0,k],[0,-k],[k+bw/2-bh/2,0],[-(k+bw/2-bh/2),0],[bw*.42,k],[-bw*.42,k],[bw*.42,-k],[-bw*.42,-k]));
marks.forEach((m,i)=>{let best=null,bs=1e12;const pf=m.prefs||(m.pref?[m.pref]:[]);const cs=pf.concat(cand);
 for(let ci=0;ci<cs.length;ci++){const [dx,dy]=cs[ci];const cx=m.x+dx,cy=m.y+dy;let s=ci<pf.length?ci*3:Math.hypot(dx,dy)+(pf.length?400:0);
  if(cx-bw/2<2||cx+bw/2>W-2||cy-bh/2<2||cy+bh/2>H-2)s+=1e9;
  for(const b of out)s+=ovl(cx,cy,b.cx,b.cy,bw+6,bh+6)*1e5;
  marks.forEach((p,j)=>{if(Math.abs(p.x-cx)<bw/2+r&&Math.abs(p.y-cy)<bh/2+r)s+=j==i?4e4:2e4});
  if(s<bs){bs=s;best={cx,cy}}}
 out.push(best)});return out}
const indefOf=w=>w.replace(/^el /,'un ').replace(/^la /,'una ').replace(/^los /,'unos ').replace(/^las /,'unas ');
/* o: {id, W, H, art, marks:[{x,y,a,en}], list, r, bw, label, pan, desc:"sentence starter"} */
function dgm(o){const id=o.id,W=o.W,H=o.H,ph=isPhone()||o.list,r=isPhone()?Math.max(o.r||0,W/40):(o.r||Math.max(W,H)/70);const en=showEn();
let lead='',ov='';
if(!ph){const bw=o.bw||W*.135,bh=o.bh||Math.max(bw*.26,H*.032);const bx=placeLabels(o.marks,W,H,bw,bh,r);
 lead=bx.map((b,i)=>{const m=o.marks[i];if(m.nolead)return '';return `<line class="lead" x1="${m.x}" y1="${m.y}" x2="${b.cx}" y2="${b.cy}" stroke-width="${r/6}"/>`}).join('');
 ov=`<div class="ov">${o.marks.map((m,i)=>inp(m.a,{pin:i,ph:(i+1)+(en&&m.en?' · '+m.en:''),label:`${i+1}`,style:`left:${(bx[i].cx/W*100).toFixed(2)}%;top:${(bx[i].cy/H*100).toFixed(2)}%;width:${(bw/W*100).toFixed(2)}%;height:${(bh/H*100).toFixed(2)}%`})).join('')}</div>`}
const pins=o.marks.map((m,i)=>`<g class="pin" id="pin-${id}-${i}"><circle cx="${m.x}" cy="${m.y}" r="${r}"/><text x="${m.x}" y="${m.y+r*.38}" font-size="${r*1.08}" text-anchor="middle">${i+1}</text></g>`).join('');
const svg=`<svg viewBox="0 0 ${W} ${H}" class="dgs" role="img" aria-label="${esc(o.label||'Diagrama')}">${o.art}<g class="leads">${lead}</g>${pins}${o.extra||''}</svg>`;
const list=ph?`<div class="dl${o.marks.some(m=>m.more)?' wide3':''}">${o.marks.map((m,i)=>`<label class="dli"><b class="num">${i+1}</b><span class="dlf">${m.lab?`<b class="dlab">${esc(m.lab)}</b>`:''}<span class="dlrow">${inp(m.a,{pin:i,label:`${i+1}`,ph:m.more?'prenda (item)':null})}${(m.more||[]).map(([a,ph])=>inp(a,{ph,label:ph})).join('')}</span>${m.en&&en?`<small class="en">${esc(m.en)}</small>`:''}</span></label>`).join('')}</div>`:'';
const phw=isPhone()&&W>700&&!o.pan?(W>1150?220:170):0;
const inner=`<div class="dgw${ph?' ph':''}" style="aspect-ratio:${W}/${H}${o.pan?`;width:${o.pan}px`:phw?`;width:${phw}%`:''}">${svg}${ov}</div>`;
let desc='';if(o.desc&&o.marks.length>=3){const ws=o.marks.map(m=>m.a);const ex=shuf(o.marks).slice(0,3).map(m=>indefOf(artForm(m.a,RUN[id]&&RUN[id].unit||null)));const model=`${o.desc} ${ex.slice(0,2).join(', ')} y ${ex[2]}.`;
 desc=`<div class="desc"><p class="dh"><b>✍️ Describe el dibujo</b> ${tEn('write 1 or 2 sentences with at least 3 words from the picture')}</p><textarea class="ans" rows="2" data-desc="${esc(ws.join(';'))}" data-m="${esc(model)}" placeholder="${esc(o.desc)} …"></textarea><p class="dfb"></p><p class="model" hidden>Ejemplo: ${esc(model)}</p></div>`}
return `<div class="dg ${o.cls||''}">${o.pan||phw?`<div class="pan" data-pan>${inner}</div>${phw?'<p class="best">↔ Desliza para ver todo el dibujo</p>':''}`:inner}${list}</div>${desc}`}

/* ---------- svg helpers ---------- */
const P=(pts)=>pts.map(p=>p.map(v=>+v.toFixed(1)).join(',')).join(' ');
const shade=(hex,f)=>{let c=hex.replace('#','');if(c.length==3)c=c.split('').map(x=>x+x).join('');const n=parseInt(c,16);let r=n>>16,g=n>>8&255,b=n&255;
 if(f<0){r*=1+f;g*=1+f;b*=1+f}else{r+=(255-r)*f;g+=(255-g)*f;b+=(255-b)*f}return '#'+[r,g,b].map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,'0')).join('')};
const emo=(x,y,e,s=20)=>`<text x="${x}" y="${y}" font-size="${s}" text-anchor="middle" dominant-baseline="central" class="emo">${e}</text>`;

/* ---------- global events ---------- */
document.addEventListener('click',e=>{const iok=e.target.closest&&e.target.closest('input.ans.ok');if(iok){say(iok.value);return}
 const t=e.target.closest('button,[data-say]');if(!t)return;
 if(t.dataset.chip!=null){useChip(t);return}
 if(t.dataset.say){say(t.dataset.say);return}
 const d=t.dataset.do,id=t.dataset.b;if(!d||!id)return;
 if(d=='check')grade(id);if(d=='show')showAns(id);if(d=='new')mount(id)});
document.addEventListener('focusin',e=>{const i=e.target;if(i.matches&&i.matches('input.ans')){const b=i.closest('.blk');if(b)LAST[b.dataset.b]=i}});
document.addEventListener('input',e=>{const i=e.target;if(i.matches&&i.matches('input.ans')){i.classList.remove('ok','bad','almost','try');if(i._hint&&!i._hint.classList.contains('ans'))clearHint(i);const b=i.closest('.blk');if(b)markChips(b.dataset.b)}});
document.addEventListener('change',e=>{const i=e.target;if(!S.instant||!i.matches||!i.matches('input.ans')||i.dataset.noinst)return;const b=i.closest('.blk');if(!b)return;const id=b.dataset.b;if(BL[id]&&!BL[id].grade&&!(RUN[id]&&RUN[id].o.noCheck))checkOne(i,id)});
document.addEventListener('keydown',e=>{if(e.key=='Enter'&&e.target.matches&&e.target.matches('input.ans')&&!e.target.dataset.noinst){e.preventDefault();const b=e.target.closest('.blk');if(!b)return;const id=b.dataset.b;
 if(S.instant&&BL[id]&&!BL[id].grade&&e.target.value.trim()){checkOne(e.target,id);if(!e.target.classList.contains('ok')&&!e.target.classList.contains('bad'))return}
 const ins=$$('.bb input.ans',b);const i=ins.indexOf(e.target);const nx=ins.slice(i+1).find(x=>!x.classList.contains('ok'));if(nx)nx.focus();else if(!S.instant){const c=$('[data-do=check]',b);if(c)c.click()}}});
/* drag to pan big maps */
document.addEventListener('pointerdown',e=>{const p=e.target.closest('[data-pan]');if(!p||e.target.closest('input,button'))return;if(e.pointerType=='touch')return;
 const sx=e.clientX,sy=e.clientY,l=p.scrollLeft,t=p.scrollTop;p._dragged=false;
 const mv=ev=>{const dx=ev.clientX-sx,dy=ev.clientY-sy;if(Math.abs(dx)+Math.abs(dy)>6){p._dragged=true;p.classList.add('drag')}if(p._dragged){p.scrollLeft=l-dx;p.scrollTop=t-dy}};const up=()=>{p.classList.remove('drag');setTimeout(()=>p._dragged=false,0);removeEventListener('pointermove',mv);removeEventListener('pointerup',up)};
 addEventListener('pointermove',mv);addEventListener('pointerup',up)});
