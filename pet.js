/* pet.js: daily habit = streak, weekly dots, "done today" check, trophies,
   and "Mi animal": spend trophies to unlock animals, hats, glasses and backgrounds. */
const PETS=[['owl','🦉','Búho',0],['cat','🐱','Gato',1],['dog','🐶','Perro',1],['frog','🐸','Rana',2],['fox','🦊','Zorro',2],['panda','🐼','Panda',3],['penguin','🐧','Pingüino',3],['koala','🐨','Koala',4],['lion','🦁','León',5],['tiger','🐯','Tigre',5],['unicorn','🦄','Unicornio',8],['dragon','🐲','Dragón',10]];
const HATS=[['','✖️','Nada',0],['bow','🎀','Lazo',1],['cap','🧢','Gorra',1],['tophat','🎩','Sombrero',2],['grad','🎓','Birrete',3],['crown','👑','Corona',6]];
const FACES=[['','✖️','Nada',0],['glasses','👓','Gafas',1],['sun','🕶️','Gafas de sol',2]];
const BGS=[['','#E3F2EE','Menta',0],['sky','#DCEAFB','Cielo',1],['sun','#FFF0C2','Sol',1],['rose','#FBDDE5','Rosa',2],['lila','#E9E1FA','Lila',2],['night','#24344F','Noche',4]];
const PSHOP={a:PETS,h:HATS,f:FACES,bg:BGS};
const petLoad=()=>Object.assign({a:'owl',h:'',f:'',bg:'',own:['a:owl','h:','f:','bg:']},jget('pet',{}));
const petSave=p=>store.set('pet',JSON.stringify(p));
const troph=()=>+store.get('troph')||0;
const dlDays=()=>jget('dldays',[]);
const doneToday=()=>dlDays().includes(today());
/* streak = days in a row the daily review was finished (today, or up to yesterday if not done yet) */
function dStreak(){const d=new Set(dlDays());const k=x=>x.getFullYear()+'-'+(x.getMonth()+1)+'-'+x.getDate();const x=new Date();if(!d.has(k(x)))x.setDate(x.getDate()-1);let n=0;while(d.has(k(x))){n++;x.setDate(x.getDate()-1)}return n}
function weekDots(){const d=new Set(dlDays()),now=new Date(),k=x=>x.getFullYear()+'-'+(x.getMonth()+1)+'-'+x.getDate();const mon=new Date(now);mon.setDate(now.getDate()-((now.getDay()+6)%7));
 return `<ol class="wdots" aria-label="Esta semana (this week)">${['L','M','X','J','V','S','D'].map((l,i)=>{const x=new Date(mon);x.setDate(mon.getDate()+i);const key=k(x),isT=key==k(now),fut=x>now&&!isT;
  return `<li class="${d.has(key)?'on':''}${isT?' today':''}${fut?' fut':''}"><span>${d.has(key)?'✓':''}</span><small>${l}</small></li>`}).join('')}</ol>`}
/* called once when the daily review is finished: +1 trophy per day, +2 extra every 7 days in a row */
function dayReward(){const d=dlDays();if(d.includes(today()))return {t:0,s:dStreak()};d.push(today());store.set('dldays',JSON.stringify(d.slice(-400)));
 const s=dStreak(),t=1+(s%7==0?2:0);store.set('troph',troph()+t);return {t,s}}
function petHTML(size){const p=petLoad(),a=PETS.find(x=>x[0]==p.a)||PETS[0],h=HATS.find(x=>x[0]==p.h),f=FACES.find(x=>x[0]==p.f),bg=(BGS.find(x=>x[0]==p.bg)||BGS[0])[1];
 return `<span class="pet" data-ps="${size}" style="--s:${size}px;--pbg:${bg}" aria-hidden="true"><span class="pa">${a[0]=='owl'?owl(size):a[1]}</span>${h&&h[0]?`<span class="ph">${h[1]}</span>`:''}${f&&f[0]?`<span class="pf">${f[1]}</span>`:''}</span>`}
function petRefresh(){$$('.pet[data-ps]').forEach(e=>{e.outerHTML=petHTML(+e.dataset.ps)})}
BL['pet']={label:'Mi animal',noUnit:1,render(){const p=petLoad(),t=troph();
 const sec=(k,title,en)=>`<h4 class="sec">${title} ${tEn(en)}</h4><div class="pshop">${PSHOP[k].map(([id,ic,nm,cost])=>{const key=k+':'+id,own=p.own.includes(key)||!cost,on=p[k]==id;
  return `<button class="pitem${on?' on':''}${own?' own':''}" data-pet="${key}"${!own&&cost>t?' disabled':''}><span class="pic"${k=='bg'?` style="background:${ic}"`:''}>${k=='bg'?'':ic}</span><b>${nm}</b><small>${on?'✓ Puesto':own?'Tuyo':`🏆 ${cost}`}</small></button>`}).join('')}</div>`;
 return {t:'Mi animal',en:'My animal',icon:'🐾',noCheck:1,noBank:1,noNew:1,body:`<div class="petstage">${petHTML(170)}<div><p class="tro">🏆 <b>${t}</b> ${t==1?'trofeo':'trofeos'}</p>
  <p class="sub">Ganas 1 trofeo cada día que terminas el repaso de hoy, y 2 más cada 7 días seguidos. ${tEn('You get 1 trophy each day you finish today\'s review, and 2 more every 7 days in a row.')}</p>${weekDots()}</div></div>
  ${sec('a','Animales','animals')}${sec('h','Sombreros','hats')}${sec('f','Gafas','glasses')}${sec('bg','Fondo','background')}`}}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-pet]');if(!b||b.disabled)return;const [k,id]=b.dataset.pet.split(':'),it=PSHOP[k].find(x=>x[0]==id),p=petLoad(),key=k+':'+id;
 if(!p.own.includes(key)&&it[3]){if(troph()<it[3])return;store.set('troph',troph()-it[3]);p.own.push(key);toast(`🎉 ¡Nuevo! ${k=="bg"?"🎨":it[1]} ${it[2]} <span class="en">(-${it[3]} 🏆)</span>`,2200);confetti&&confetti()}
 p[k]=id;petSave(p);mount('pet');petRefresh();DIRTY.add('inicio')});
