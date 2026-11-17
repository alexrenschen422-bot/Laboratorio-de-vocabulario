/* pet.js: daily habit = streak, weekly dots, "done today" check, trophies,
   and "Mi animal": trophies unlock animals, stars unlock hats, glasses and backgrounds. Bought items are kept forever. */
/* animals cost trophies (1 a day); hats, glasses and backgrounds cost stars */
const PETS=[['owl','🦉','Búho',0],['cat','🐱','Gato',1],['dog','🐶','Perro',1],['chick','🐥','Pollito',1],['frog','🐸','Rana',2],['rabbit','🐰','Conejo',2],['hamster','🐹','Hámster',2],['mouse','🐭','Ratón',3],['pig','🐷','Cerdito',3],['bear','🐻','Oso',4],['fox','🦊','Zorro',5],['cow','🐮','Vaca',5],['monkey','🐵','Mono',7],['panda','🐼','Panda',8],['penguin','🐧','Pingüino',10],['koala','🐨','Koala',12],['lion','🦁','León',15],['tiger','🐯','Tigre',20],['octopus','🐙','Pulpo',25],['shark','🦈','Tiburón',30],['unicorn','🦄','Unicornio',50],['dragon','🐲','Dragón',75],['trex','🦖','T-Rex',100]];
const HATS=[['','✖️','Nada',0],['flower','🌸','Flor',300],['bow','🎀','Lazo',400],['cap','🧢','Gorra',500],['tophat','🎩','Sombrero',900],['cowboy','🤠','Vaquero',1200],['grad','🎓','Birrete',1500],['crown','👑','Corona',3000]];
const FACES=[['','✖️','Nada',0],['glasses','👓','Gafas',400],['sun','🕶️','Gafas de sol',800],['goggles','🥽','Gafas de bucear',1500]];
const BGS=[['','#E3F2EE','Menta',0],['sky','#DCEAFB','Cielo',200],['sun','#FFF0C2','Sol',200],['rose','#FBDDE5','Rosa',400],['lila','#E9E1FA','Lila',400],['peach','#FFDCC7','Melocotón',600],['gold','#F6C945','Oro',1500],['night','#24344F','Noche',2000]];
const PSHOP={a:PETS,h:HATS,f:FACES,bg:BGS};
const petLoad=()=>Object.assign({a:'owl',h:'',f:'',bg:'',own:['a:owl','h:','f:','bg:']},jget('pet',{}));
const petSave=p=>store.set('pet',JSON.stringify(p));
const troph=()=>+store.get('troph')||0;
const starsN=()=>+store.get('stars')||0;
const PCUR=k=>k=='a'?'🏆':'⭐';
const pWallet=k=>k=='a'?troph():starsN();
const dlDays=()=>jget('dldays',[]);
const doneToday=()=>dlDays().includes(today());
/* streak = days in a row the daily review was finished (today, or up to yesterday if not done yet) */
function dStreak(){const d=new Set(dlDays());const k=x=>x.getFullYear()+'-'+(x.getMonth()+1)+'-'+x.getDate();const x=new Date();if(!d.has(k(x)))x.setDate(x.getDate()-1);let n=0;while(d.has(k(x))){n++;x.setDate(x.getDate()-1)}return n}
function weekDots(){const d=new Set(dlDays()),now=new Date(),k=x=>x.getFullYear()+'-'+(x.getMonth()+1)+'-'+x.getDate();const mon=new Date(now);mon.setDate(now.getDate()-((now.getDay()+6)%7));
 return `<ol class="wdots" aria-label="Esta semana (this week)">${['L','M','X','J','V','S','D'].map((l,i)=>{const x=new Date(mon);x.setDate(mon.getDate()+i);const key=k(x),isT=key==k(now),fut=x>now&&!isT;
  return `<li class="${d.has(key)?'on':''}${isT?' today':''}${fut?' fut':''}"><span>${d.has(key)?'✓':''}</span><small>${l}</small></li>`}).join('')}</ol>`}
/* called once when the daily review is finished: +1 trophy per day */
function dayReward(){const d=dlDays();if(d.includes(today()))return {t:0,s:dStreak()};d.push(today());store.set('dldays',JSON.stringify(d.slice(-400)));
 const s=dStreak(),t=1;store.set('troph',troph()+t);return {t,s}}
/* animal mood: happy when today's review is done, waiting if you're on a streak, sleepy/sad after missing days */
function petMood(){if(doneToday())return 'happy';if(dStreak()>0||!dlDays().length)return 'wait';return 'sad'}
const MOODS={happy:['💖','😊 ¡Está feliz!','happy'],wait:['💭','⏳ Te espera para el repaso','waiting for your review'],sad:['💤','💤 Te echa de menos','misses you']};
function petHTML(size){const p=petLoad(),a=PETS.find(x=>x[0]==p.a)||PETS[0],h=HATS.find(x=>x[0]==p.h),f=FACES.find(x=>x[0]==p.f),bg=(BGS.find(x=>x[0]==p.bg)||BGS[0])[1];
 const m=petMood();return `<span class="pet m-${m}" data-ps="${size}" style="--s:${size}px;--pbg:${bg}" aria-hidden="true"><span class="pa">${a[0]=='owl'?owl(size):a[1]}</span>${h&&h[0]?`<span class="ph">${h[1]}</span>`:''}${f&&f[0]?`<span class="pf">${f[1]}</span>`:''}<span class="pm">${MOODS[m][0]}</span></span>`}
function petRefresh(){$$('.pet[data-ps]').forEach(e=>{e.outerHTML=petHTML(+e.dataset.ps)})}
BL['pet']={label:'Mi animal',noUnit:1,render(){const p=petLoad(),t=troph(),sn=starsN();
 const sec=(k,title,en)=>`<h4 class="sec">${title} ${tEn(en)} <span class="pcur">${PCUR(k)}</span></h4><div class="pshop">${PSHOP[k].map(([id,ic,nm,cost])=>{const key=k+':'+id,own=p.own.includes(key)||!cost,on=p[k]==id;
  return `<button class="pitem${on?' on':''}${own?' own':''}" data-pet="${key}"${!own&&cost>pWallet(k)?' disabled':''}><span class="pic"${k=='bg'?` style="background:${ic}"`:''}>${k=='bg'?'':ic}</span><b>${nm}</b><small>${on?'✓ Puesto':own?'Tuyo':`${PCUR(k)} ${cost}`}</small></button>`}).join('')}</div>`;
 return {t:'Mi animal',en:'My animal',icon:'🐾',noCheck:1,noBank:1,noNew:1,body:`<div class="petstage">${petHTML(170)}<div class="wallet"><p class="tro">🏆 <b>${t}</b> ${t==1?'trofeo':'trofeos'} <span class="sub">→ animales ${tEn('animals')}</span></p>
  <p class="tro">⭐ <b>${sn}</b> estrellas <span class="sub">→ sombreros, gafas y fondos ${tEn('hats, glasses, backgrounds')}</span></p>
  <p class="sub">🏆 1 trofeo cada día que terminas el repaso de hoy. ⭐ Estrellas con cada respuesta correcta, en cualquier ejercicio. Lo que compras es tuyo para siempre. ${tEn('1 trophy each day you finish today\'s review. Stars for every right answer anywhere. What you buy is yours forever.')}</p></div></div>
  ${sec('a','Animales','animals')}${sec('h','Sombreros','hats')}${sec('f','Gafas','glasses')}${sec('bg','Fondo','background')}`}}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-pet]');if(!b||b.disabled)return;const [k,id]=b.dataset.pet.split(':'),it=PSHOP[k].find(x=>x[0]==id),p=petLoad(),key=k+':'+id;
 if(!p.own.includes(key)&&it[3]){if(pWallet(k)<it[3])return;if(k=='a')store.set('troph',troph()-it[3]);else{store.set('stars',starsN()-it[3]);$$('.starsn').forEach(el=>el.textContent=starsN())}
  p.own.push(key);toast(`🎉 ¡Nuevo! ${k=="bg"?"🎨":it[1]} ${it[2]} <span class="en">(-${it[3]} ${PCUR(k)})</span>`,2200);confetti&&confetti()}
 p[k]=id;petSave(p);mount('pet');petRefresh();DIRTY.add('inicio')});
