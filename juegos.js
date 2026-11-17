/* juegos.js: Juegos = Parejas (match game), Contrarreloj (60-second speed round), Ahorcado (hangman),
   Expresión del día (everyday Spain Spanish you don't learn in class). */
/* ---------- shared: word pool ---------- */
const GSTRIP=s=>s.replace(/^(el|la|los|las|un|una) /,'');
function gPool(u){const seen=new Set();return ALL.filter(c=>c.lvl<=S.lvl&&c.u!='Expresiones'&&(u=='all'||c.u==u)).map(c=>({es:first(c.es),en:c.en.split(' / ')[0],c})).filter(x=>deacc(GSTRIP(x.es)).toLowerCase()!=deacc(x.en).toLowerCase()).filter(x=>{const k=x.es+'|'+x.en;if(seen.has(k)||seen.has(x.en))return false;seen.add(k);seen.add(x.en);return true})}
const GU={match:'all',speed:'all',hang:'all'};
function gUnitSel(g){return `<label class="gsel"><span>Unidad ${tEn('unit')}</span><select data-gu="${g}"><option value="all">🌈 Todas</option>${Object.entries(UNAMES).filter(([k])=>k!='Expresiones').map(([k,v])=>`<option value="${k}"${GU[g]==k?' selected':''}>${v[2]} ${v[0]}</option>`).join('')}</select></label>`}
const gBest=()=>jget('gbest',{});
function gSetBest(k,v,lower){const b=gBest();const old=b[k];const rec=old==null||(lower?v<old:v>old);if(rec){b[k]=v;store.set('gbest',JSON.stringify(b))}return {rec,old}}
const fmtT=s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
/* ---------- 1. Parejas: 9 Spanish + 9 English tiles ---------- */
let MG=null;
function mgNew(){const p=shuf(gPool(GU.match)).slice(0,9);MG={t0:0,sec:0,sel:null,done:0,miss:0,end:false,
 tiles:shuf(p.flatMap((x,i)=>[{i,s:'es',t:x.es},{i,s:'en',t:x.en}]))}}
function mgBody(){if(!MG)mgNew();const b=gBest()['match_'+GU.match];
 return `<div class="ghead">${gUnitSel('match')}<span class="gstat">⏱️ <b id="mgt">${fmtT(MG.sec)}</b></span><span class="gstat">❌ <b>${MG.miss}</b></span><span class="gstat">🏅 ${b!=null?fmtT(b):'—'}</span></div>
 ${MG.end?`<div class="qcard done"><p class="qw">🎉 ${fmtT(MG.sec)}</p><p class="qk">${MG.rec?'¡Nuevo récord! 🏅':'¡Muy bien!'} · ${MG.miss} ${MG.miss==1?'error':'errores'}</p><div class="row"><button class="btn pri big" data-mg="again">🔁 Otra vez<small>Play again</small></button></div></div>`:''}
 <div class="mgrid">${MG.tiles.map((x,k)=>`<button class="mtile ${x.s}${x.gone?' gone':''}${MG.sel===k?' sel':''}" data-mt="${k}"${x.gone?' disabled':''}>${esc(x.t)}</button>`).join('')}</div>
 <p class="sub">Toca una palabra en español y su traducción en inglés. ${tEn('Tap a Spanish word and its English match.')}</p>`}
function mgDraw(){const e=$('#mg');if(e)e.innerHTML=mgBody()}
BL['g-match']={label:'Parejas',noUnit:1,render(){return {t:'Parejas',en:'Match game',icon:'🧩',noCheck:1,noBank:1,noNew:1,body:`<div id="mg">${mgBody()}</div>`}}};
/* ---------- 2. Contrarreloj: 60 seconds ---------- */
let SG=null;
function sgQ(){const p=gPool(GU.speed);const a=pick(p);const o=shuf([a,...shuf(p.filter(x=>x.es!=a.es)).slice(0,3)]);return {a,o}}
function sgBody(){const b=gBest()['speed_'+GU.speed];
 if(!SG||SG.end){return `<div class="ghead">${gUnitSel('speed')}<span class="gstat">🏅 ${b!=null?b:'—'}</span></div>
  ${SG&&SG.end?`<div class="qcard done"><p class="qw">⚡ ${SG.ok}</p><p class="qk">${SG.rec?'¡Nuevo récord! 🏅':'respuestas correctas'} ${tEn('right answers')}</p></div>`:''}
  <div class="qcard"><p class="qk">60 segundos. ¿Cuántas sabes? ${tEn('60 seconds. How many do you know?')}</p><div class="row"><button class="btn pri big" data-sg="go">⚡ ${SG?'Otra vez':'¡Empezar!'}<small>${SG?'Play again':'Start'}</small></button></div></div>`}
 const q=SG.q;return `<div class="ghead"><span class="gstat big">⏱️ <b id="sgt">${Math.max(0,60-Math.floor(SG.sec))}</b></span><span class="gstat big">✅ <b>${SG.ok}</b></span></div>
 <div class="qcard"><p class="qw">${esc(q.a.en)}</p><div class="sgopts">${q.o.map((x,k)=>`<button class="btn sgo" data-sgo="${k}">${esc(x.es)}</button>`).join('')}</div><p class="qfb" id="sgfb"></p></div>`}
function sgDraw(){const e=$('#sg');if(e)e.innerHTML=sgBody()}
BL['g-speed']={label:'Contrarreloj',noUnit:1,render(){return {t:'Contrarreloj',en:'60-second speed round',icon:'⚡',noCheck:1,noBank:1,noNew:1,body:`<div id="sg">${sgBody()}</div>`}}};
/* ---------- 3. Ahorcado ---------- */
let HG=null;
function hgNew(){const p=gPool(GU.hang).map(x=>({...x,w:GSTRIP(x.es)})).filter(x=>/^[a-záéíóúüñ]{4,12}$/i.test(x.w));const x=pick(p);HG={w:x.w.toLowerCase(),en:x.en,g:[],bad:0,end:0}}
function hgBody(){if(!HG)hgNew();const W=HG.w,has=l=>[...W].some(c=>deacc(c)==l||c==l);
 const shown=[...W].map(c=>HG.g.includes(c=='ñ'?'ñ':deacc(c))||HG.end?c:'_');
 return `<div class="ghead">${gUnitSel('hang')}<span class="gstat">${'❤️'.repeat(6-HG.bad)}${'🖤'.repeat(HG.bad)}</span></div>
 <div class="qcard"><p class="qk">Pista ${tEn('clue')}: <b>${esc(HG.en)}</b></p><p class="hword">${shown.map(c=>`<span>${c}</span>`).join('')}</p>
 ${HG.end?`<p class="qk">${HG.end==1?'🎉 ¡Muy bien!':'😵 Era:'} <b>${esc(W)}</b> ${spk(W)}</p><div class="row"><button class="btn pri big" data-hg="next">▶ Otra palabra<small>Next word</small></button></div>`
 :`<div class="hkeys">${'abcdefghijklmnñopqrstuvwxyz'.split('').map(l=>`<button class="hk${HG.g.includes(l)?(has(l)?' ok':' bad'):''}" data-hk="${l}"${HG.g.includes(l)?' disabled':''}>${l}</button>`).join('')}</div>`}</div>
 <p class="sub">Los acentos no importan: la «a» vale para «á». ${tEn('Accents don\'t matter.')}</p>`}
function hgDraw(){const e=$('#hg');if(e)e.innerHTML=hgBody()}
BL['g-hang']={label:'Ahorcado',noUnit:1,render(){return {t:'Ahorcado',en:'Hangman',icon:'🪢',noCheck:1,noBank:1,noNew:1,body:`<div id="hg">${hgBody()}</div>`}}};
/* ---------- 4. Expresión del día: real everyday Spain Spanish ---------- */
const WOTD=[
['Claro','Of course / sure','Para decir que sí, que algo es obvio.','—¿Me ayudas? —¡Claro!','"Can you help me?" "Of course!"'],
['Vale','OK','La palabra más usada en España para decir «de acuerdo».','—Quedamos a las seis. —Vale.','"Let\'s meet at six." "OK."'],
['De tal palo, tal astilla','Like father, like son','Los hijos se parecen a sus padres.','Juan también es médico, como su padre: de tal palo, tal astilla.','Juan is a doctor too, like his dad: like father, like son.'],
['Día a día','Day by day / everyday life','Poco a poco, o la vida normal de cada día.','En mi día a día uso mucho el metro.','In my everyday life I use the metro a lot.'],
['¡Venga!','Come on! / Let\'s go! / OK then','Para animar a alguien o para terminar una conversación.','¡Venga, que llegamos tarde!','Come on, we\'re going to be late!'],
['¡Qué guay!','How cool!','Algo te gusta mucho. Muy típico de España.','—Me voy a Ibiza. —¡Qué guay!','"I\'m going to Ibiza." "How cool!"'],
['Mola','It\'s cool / I like it','Del verbo «molar»: gustar mucho.','Tu chaqueta mola mucho.','Your jacket is really cool.'],
['Estar hecho polvo','To be exhausted','Estar muy cansado.','Después del examen estoy hecho polvo.','After the exam I\'m exhausted.'],
['No pasa nada','No problem / It\'s fine','Para tranquilizar a alguien.','—Perdón, llego tarde. —No pasa nada.','"Sorry, I\'m late." "It\'s fine."'],
['Me da igual','I don\'t mind','No tienes preferencia.','—¿Pizza o pasta? —Me da igual.','"Pizza or pasta?" "I don\'t mind."'],
['¡Ojalá!','I hope so! / If only!','Viene del árabe. Se usa con subjuntivo.','¡Ojalá haga sol mañana!','I hope it\'s sunny tomorrow!'],
['Currar','To work (informal)','«Trabajar» en español coloquial de España.','Mañana curro desde las ocho.','Tomorrow I work from eight.'],
['Majo / maja','Nice, friendly','Una persona simpática y agradable.','Tu profesora es muy maja.','Your teacher is really nice.'],
['¡Qué rollo!','What a drag! / How boring!','Algo es aburrido o pesado.','Tengo que limpiar la casa. ¡Qué rollo!','I have to clean the house. What a drag!'],
['Estar en las nubes','To have your head in the clouds','No prestar atención.','Hoy en clase estaba en las nubes.','Today in class my head was in the clouds.'],
['Tomar el pelo','To pull someone\'s leg','Hacer una broma, engañar a alguien en broma.','¿Hablas en serio o me estás tomando el pelo?','Are you serious or are you pulling my leg?'],
['Ponerse las pilas','To get your act together','Empezar a trabajar en serio.','El control es el lunes: ¡tengo que ponerme las pilas!','The test is on Monday: I need to get my act together!'],
['Echar una mano','To give a hand','Ayudar a alguien.','¿Me echas una mano con la mudanza?','Can you give me a hand with the move?'],
['Costar un ojo de la cara','To cost an arm and a leg','Ser muy caro.','Los pisos en el centro de Madrid cuestan un ojo de la cara.','Flats in central Madrid cost an arm and a leg.'],
['Ser pan comido','To be a piece of cake','Ser muy fácil.','El examen fue pan comido.','The exam was a piece of cake.'],
['Más vale tarde que nunca','Better late than never','Es mejor hacerlo tarde que no hacerlo.','Por fin has llegado. ¡Más vale tarde que nunca!','You finally made it. Better late than never!'],
['A lo mejor','Maybe','Igual que «quizás», pero más coloquial. Va con indicativo.','A lo mejor voy al cine esta noche.','Maybe I\'ll go to the cinema tonight.'],
['O sea','I mean / so','Para explicar mejor lo que has dicho.','Llego a las diez, o sea, un poco tarde.','I arrive at ten, I mean, a bit late.'],
['Menos mal','Thank goodness','Sientes alivio.','Menos mal que llevo paraguas.','Thank goodness I have an umbrella.'],
['¡Qué va!','No way! / Not at all!','Para negar con fuerza.','—¿Estás cansado? —¡Qué va!','"Are you tired?" "Not at all!"'],
['¿Quedamos?','Shall we meet up?','«Quedar» = verse con amigos.','¿Quedamos el sábado para tomar algo?','Shall we meet up on Saturday for a drink?'],
['Flipar','To be amazed / to freak out','Sorprenderse mucho (coloquial).','Flipé con el Palacio Real.','I was blown away by the Royal Palace.'],
['Al fin y al cabo','After all','Para dar la conclusión más importante.','Al fin y al cabo, es tu decisión.','After all, it\'s your decision.'],
['Por si acaso','Just in case','Hacer algo como precaución.','Llévate una chaqueta, por si acaso.','Take a jacket, just in case.'],
['Cada dos por tres','Every five minutes / constantly','Muy a menudo.','Mi hermano me llama cada dos por tres.','My brother calls me constantly.'],
['Hacer puente','To take a long weekend','No trabajar el día entre un festivo y el fin de semana.','El jueves es fiesta, así que hacemos puente.','Thursday is a holiday, so we\'re taking a long weekend.'],
['La sobremesa','Time chatting after a meal','El tiempo que pasas en la mesa hablando después de comer. ¡Muy español!','La sobremesa duró dos horas.','The after-lunch chat lasted two hours.'],
['Madrugar','To get up early','Levantarse muy temprano.','Mañana tengo que madrugar.','Tomorrow I have to get up early.'],
['Una caña','A small draught beer','En España, una cerveza pequeña de barril.','¿Nos tomamos una caña?','Shall we have a beer?'],
['Tapear / ir de tapas','To go out for tapas','Ir a varios bares a comer tapas.','Los domingos vamos de tapas por La Latina.','On Sundays we go out for tapas in La Latina.'],
['Guiri','Tourist / foreigner (informal)','Así llaman los españoles a los turistas extranjeros, con humor.','La Puerta del Sol está llena de guiris.','Puerta del Sol is full of tourists.'],
['Chulo / chula','Cool, nice','Algo bonito o que mola.','¡Qué piso más chulo!','What a cool flat!'],
['Cutre','Shabby, cheap-looking','De mala calidad o feo.','El hotel era un poco cutre.','The hotel was a bit shabby.'],
['Meter la pata','To put your foot in it','Cometer un error, sobre todo al hablar.','Metí la pata: le conté la sorpresa.','I put my foot in it: I told her about the surprise.'],
['No tener pelos en la lengua','To not mince your words','Decir lo que piensas sin miedo.','Mi abuela no tiene pelos en la lengua.','My grandma doesn\'t mince her words.'],
['Dormir como un tronco','To sleep like a log','Dormir muy profundamente.','Anoche dormí como un tronco.','Last night I slept like a log.'],
['Llover a cántaros','To pour with rain','Llover muchísimo.','No salgas, está lloviendo a cántaros.','Don\'t go out, it\'s pouring.'],
['Estar como una cabra','To be crazy (in a funny way)','Estar un poco loco.','Mi tío está como una cabra.','My uncle is a bit nuts.'],
['Ir al grano','To get to the point','Hablar de lo importante sin rodeos.','No tengo tiempo: ve al grano.','I don\'t have time: get to the point.'],
['Quedarse en blanco','To go blank','Olvidar todo de repente.','En el examen me quedé en blanco.','In the exam my mind went blank.'],
['Hablar por los codos','To talk a lot','Hablar muchísimo.','Mi compañera habla por los codos.','My classmate talks nonstop.'],
['Estar a tope','To be at full speed / packed','Muy lleno o con mucha energía.','El metro va a tope a las ocho.','The metro is packed at eight.'],
['Poco a poco','Little by little','Despacio, paso a paso.','Poco a poco hablo mejor español.','Little by little I\'m speaking better Spanish.'],
['¡Anda!','Wow! / No way!','Sorpresa.','¡Anda! ¿Tú también eres de Chicago?','Wow! You\'re from Chicago too?'],
['Tener buena pinta','To look good','Algo parece bueno, sobre todo la comida.','Esa tortilla tiene muy buena pinta.','That tortilla looks really good.'],
['Dar la lata','To be a pain / to pester','Molestar mucho.','Mi hermano pequeño me da la lata todo el día.','My little brother pesters me all day.'],
['Estar de buen rollo','To be in a good vibe','Ambiente positivo y tranquilo.','En la fiesta había muy buen rollo.','There was a great vibe at the party.'],
['En un abrir y cerrar de ojos','In the blink of an eye','Muy rápido.','El fin de semana pasó en un abrir y cerrar de ojos.','The weekend went by in the blink of an eye.'],
['Pasarlo bomba','To have a blast','Divertirse muchísimo.','En el concierto lo pasamos bomba.','We had a blast at the concert.'],
['¡Qué morro!','What nerve!','Alguien tiene mucha cara, es descarado.','Se coló en la fila. ¡Qué morro!','He cut in line. What nerve!'],
['Ser un rollo','To be boring','Igual que «¡qué rollo!», para algo aburrido.','La película es un rollo.','The movie is boring.'],
['Ni idea','No idea','No sabes algo.','—¿Dónde está la parada? —Ni idea.','"Where\'s the stop?" "No idea."'],
['Echar de menos','To miss (someone)','Sentir la falta de alguien o algo.','Echo de menos a mi familia.','I miss my family.'],
['Tener mala suerte','To be unlucky','Te pasan cosas malas.','Perdí el autobús otra vez: ¡qué mala suerte!','I missed the bus again: what bad luck!'],
['A tope de','Full of / loads of','Muchísimo de algo.','Estoy a tope de deberes.','I have loads of homework.']];
const wotdIdx=(d=new Date())=>{const t=Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5;return ((t%WOTD.length)+WOTD.length)%WOTD.length};
function wotdCard(w,big){const [es,en,ex,s1,s2]=w;return `<div class="wotd${big?' big':''}"><p class="wes">${esc(es)} ${spk(es)}</p><p class="wen">${esc(en)}</p><p class="wex">${esc(ex)}</p><p class="ws1">«${esc(s1)}»</p><p class="ws2">${esc(s2)}</p></div>`}
BL['g-wotd']={label:'Expresión del día',noUnit:1,render(){const i=wotdIdx();const prev=[1,2,3,4,5,6].map(k=>{const d=new Date();d.setDate(d.getDate()-k);return WOTD[wotdIdx(d)]});
 return {t:'Expresión del día',en:'Expression of the day',icon:'💬',noCheck:1,noBank:1,noNew:1,body:`<p class="sub">Español de la calle, de España, que no se aprende en clase. ${tEn('Real everyday Spanish from Spain that you don\'t learn in class.')}</p>${wotdCard(WOTD[i],1)}
 <h4 class="sec">Días anteriores ${tEn('previous days')}</h4><div class="wprev">${prev.map(w=>`<details><summary><b>${esc(w[0])}</b> <span class="sub">${esc(w[1])}</span></summary>${wotdCard(w)}</details>`).join('')}</div>`}}};
/* ---------- events ---------- */
setInterval(()=>{if(MG&&MG.t0&&!MG.end){MG.sec=(Date.now()-MG.t0)/1000;const e=$('#mgt');if(e)e.textContent=fmtT(MG.sec)}
 if(SG&&SG.t0&&!SG.end){SG.sec=(Date.now()-SG.t0)/1000;const e=$('#sgt');if(e)e.textContent=Math.max(0,60-Math.floor(SG.sec));if(SG.sec>=60){SG.end=true;const r=gSetBest('speed_'+GU.speed,SG.ok);SG.rec=r.rec&&SG.ok>0;if(SG.ok)addStars(Math.ceil(SG.ok/2));if(SG.rec)confetti();sgDraw()}}},250);
document.addEventListener('change',e=>{const s=e.target.closest('[data-gu]');if(!s)return;const g=s.dataset.gu;GU[g]=s.value;if(g=='match'){mgNew();mgDraw()}if(g=='speed'){SG=null;sgDraw()}if(g=='hang'){hgNew();hgDraw()}});
document.addEventListener('click',e=>{let t;
 if(t=e.target.closest('[data-mt]')){if(!MG||MG.end)return;const k=+t.dataset.mt,x=MG.tiles[k];if(x.gone)return;if(!MG.t0)MG.t0=Date.now();
  if(MG.sel===null||MG.sel===k||MG.tiles[MG.sel].s==x.s){MG.sel=MG.sel===k?null:k;if(x.s=='es'&&MG.sel===k)say(x.t);mgDraw();return}
  const y=MG.tiles[MG.sel];if(y.i==x.i){x.gone=y.gone=true;MG.sel=null;MG.done++;
   if(MG.done==9){MG.end=true;MG.sec=(Date.now()-MG.t0)/1000;const r=gSetBest('match_'+GU.match,Math.round(MG.sec),true);MG.rec=r.rec;addStars(MG.rec?6:3);confetti()}mgDraw()}
  else{MG.miss++;const a=$(`[data-mt="${MG.sel}"]`),b2=t;MG.sel=null;[a,b2].forEach(z=>z&&z.classList.add('nope'));setTimeout(mgDraw,450)}return}
 if(t=e.target.closest('[data-mg]')){mgNew();mgDraw();return}
 if(t=e.target.closest('[data-sg]')){SG={t0:Date.now(),sec:0,ok:0,end:false,q:sgQ()};sgDraw();return}
 if(t=e.target.closest('[data-sgo]')){if(!SG||SG.end||SG.lock)return;const o=SG.q.o[+t.dataset.sgo],ok=o.es==SG.q.a.es;t.classList.add(ok?'ok':'bad');
  if(ok){SG.ok++;SG.q=sgQ();setTimeout(sgDraw,150)}else{SG.lock=1;$$('.sgo').forEach((b,k)=>{if(SG.q.o[k].es==SG.q.a.es)b.classList.add('ok')});setTimeout(()=>{SG.lock=0;SG.q=sgQ();sgDraw()},700)}return}
 if(t=e.target.closest('[data-hk]')){if(!HG||HG.end)return;const l=t.dataset.hk;if(HG.g.includes(l))return;HG.g.push(l);const has=[...HG.w].some(c=>(c=='ñ'?'ñ':deacc(c))==l);if(!has)HG.bad++;
  const won=[...HG.w].every(c=>HG.g.includes(c=='ñ'?'ñ':deacc(c)));if(won){HG.end=1;addStars(4);say(HG.w);const ce=entry(HG.w);if(ce)srsUpd(ce,true)}else if(HG.bad>=6){HG.end=2;say(HG.w)}hgDraw();return}
 if(t=e.target.closest('[data-hg]')){hgNew();hgDraw();return}});
