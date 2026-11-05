/* conj.js: Spanish (Spain) conjugation engine. cj(verb, tense) -> 6 forms [yo, tú, él, nosotros, vosotros, ellos] */
const PERS=['yo','tú','él / ella / usted','nosotros','vosotros','ellos / ellas / ustedes'];
const PERS_S=['yo','tú','él','nosotros','vosotros','ellos'];
const ACC={a:'á',e:'é',i:'í',o:'ó',u:'ú'},UNACC={'á':'a','é':'e','í':'i','ó':'o','ú':'u'};
const unacc=s=>s.replace(/[áéíóú]/g,c=>UNACC[c]);
/* stem changes */
const SC={};
'pensar empezar comenzar cerrar despertar sentar entender perder querer preferir sentir mentir divertir convertir encender defender nevar calentar fregar regar recomendar atravesar confesar negar merendar tender sugerir hervir advertir referir apretar gobernar manifestar sembrar temblar tropezar ascender descender invertir consentir arrepentir requerir atender acertar encerrar'.split(' ').forEach(v=>SC[v]='ie');
'poder volver dormir morir contar costar encontrar mostrar recordar soñar volar almorzar colgar probar sonar rogar mover llover doler resolver devolver envolver soler acostar aprobar demostrar torcer comprobar renovar promover remover morder cocer forzar esforzar apostar acordar tostar'.split(' ').forEach(v=>SC[v]='ue');
'pedir servir repetir seguir conseguir vestir medir reír sonreír freír elegir corregir despedir impedir competir perseguir gemir rendir teñir desteñir reñir'.split(' ').forEach(v=>SC[v]='i');
SC.jugar='ue_u';SC.tener='ie';SC.venir='ie';SC.decir='i';SC.adquirir='ie_i';SC.oler='hue';
/* accent verbs: envío, continúo, reúno, prohíbo */
const ACCV=new Set('enviar confiar enfriar esquiar guiar criar vaciar fiar desafiar ampliar actuar continuar graduar situar evaluar acentuar reunir prohibir'.split(' '));
/* full tables */
const T6=s=>s.split(' ');
const IRR={
 ser:{pres:T6('soy eres es somos sois son'),pret:T6('fui fuiste fue fuimos fuisteis fueron'),impf:T6('era eras era éramos erais eran'),subj:T6('sea seas sea seamos seáis sean'),tu:'sé'},
 ir:{pres:T6('voy vas va vamos vais van'),pret:T6('fui fuiste fue fuimos fuisteis fueron'),impf:T6('iba ibas iba íbamos ibais iban'),subj:T6('vaya vayas vaya vayamos vayáis vayan'),tu:'ve',ger:'yendo'},
 estar:{pres:T6('estoy estás está estamos estáis están'),subj:T6('esté estés esté estemos estéis estén'),pstem:'estuv'},
 haber:{pres:T6('he has ha hemos habéis han'),subj:T6('haya hayas haya hayamos hayáis hayan'),pstem:'hub',fut:'habr'},
 dar:{pres:T6('doy das da damos dais dan'),pret:T6('di diste dio dimos disteis dieron'),subj:T6('dé des dé demos deis den')},
 saber:{pres:T6('sé sabes sabe sabemos sabéis saben'),subj:T6('sepa sepas sepa sepamos sepáis sepan'),pstem:'sup',fut:'sabr'},
 ver:{pres:T6('veo ves ve vemos veis ven'),yo:'veo',pret:T6('vi viste vio vimos visteis vieron'),impf:T6('veía veías veía veíamos veíais veían'),pp:'visto'},
 oír:{pres:T6('oigo oyes oye oímos oís oyen'),yo:'oigo'},
 caber:{yo:'quepo',pstem:'cup',fut:'cabr'},
 tener:{yo:'tengo',pstem:'tuv',fut:'tendr',tu:'ten'},
 venir:{yo:'vengo',pstem:'vin',fut:'vendr',tu:'ven'},
 poner:{yo:'pongo',pstem:'pus',fut:'pondr',tu:'pon',pp:'puesto'},
 salir:{yo:'salgo',fut:'saldr',tu:'sal'},
 valer:{yo:'valgo',fut:'valdr'},
 hacer:{yo:'hago',pstem:'hic',fut:'har',tu:'haz',pp:'hecho'},
 decir:{yo:'digo',pstem:'dij',fut:'dir',tu:'di',pp:'dicho',ger:'diciendo'},
 traer:{yo:'traigo',pstem:'traj'},
 caer:{yo:'caigo'},
 poder:{pstem:'pud',fut:'podr',ger:'pudiendo'},
 querer:{pstem:'quis',fut:'querr'},
 andar:{pstem:'anduv'},
 conducir:{pstem:'conduj'},traducir:{pstem:'traduj'},producir:{pstem:'produj'},reducir:{pstem:'reduj'},introducir:{pstem:'introduj'},deducir:{pstem:'deduj'},
 reír:{pres:T6('río ríes ríe reímos reís ríen'),pret:T6('reí reíste rio reímos reísteis rieron'),subj:T6('ría rías ría riamos riáis rían'),ger:'riendo',pp:'reído'},
 freír:{pres:T6('frío fríes fríe freímos freís fríen'),pret:T6('freí freíste frio freímos freísteis frieron'),subj:T6('fría frías fría friamos friáis frían'),ger:'friendo',pp:'frito'},
 morir:{pp:'muerto'},volver:{pp:'vuelto'},escribir:{pp:'escrito'},abrir:{pp:'abierto'},romper:{pp:'roto'},cubrir:{pp:'cubierto'},resolver:{pp:'resuelto'},imprimir:{pp:'impreso'}
};
/* prefixed verbs inherit the base (mantener, proponer, deshacer, devolver, describir, sonreír...) */
const PREFIX_BASES=['tener','venir','poner','hacer','decir','traer','volver','solver','escribir','cubrir','reír','ducir','seguir','oír','salir','valer','caer'];
function splitPrefix(v){if(IRR[v])return ['',v];for(const b of PREFIX_BASES){if(v.length>b.length&&v.endsWith(b)){const pre=v.slice(0,-b.length);if(pre.length<=6)return [pre,b]}}return ['',v]}
function isRefl(v){return /(ar|er|ir|ír)se$/.test(v)}
const REFP=['me','te','se','nos','os','se'];
function info(v){const end=v.slice(-2).replace('í','i');return {inf:v,end,stem:v.slice(0,-2)}}
function chStem(v,stem){const t=SC[v]||(()=>{const[p,b]=splitPrefix(v);return p&&SC[b]?SC[b]:null})();if(!t)return stem;
 const idx=(()=>{const vs=[...stem.matchAll(/[aeiouáéíóú]/g)];if(!vs.length)return -1;let k=vs.length-1;
  /* skip u after q/g (seguir: seg-u-ir), and trailing vowel cluster in stem like 'fregar' fine */
  while(k>0&&vs[k][0]=='u'&&/[qg]/.test(stem[vs[k].index-1]))k--;return vs[k].index})();
 if(idx<0)return stem;const c=stem[idx];
 if(t=='ie'&&c=='e')return stem.slice(0,idx)+'ie'+stem.slice(idx+1);
 if(t=='ue'&&c=='o')return stem.slice(0,idx)+'ue'+stem.slice(idx+1);
 if(t=='i'&&c=='e')return stem.slice(0,idx)+'i'+stem.slice(idx+1);
 if(t=='ue_u'&&c=='u')return stem.slice(0,idx)+'ue'+stem.slice(idx+1);
 if(t=='ie_i'&&c=='i')return stem.slice(0,idx)+'ie'+stem.slice(idx+1);
 if(t=='hue')return 'hue'+stem.slice(1);
 return stem}
/* weak change for -ir stem changers (sintió, durmió, pidió, sintiendo) */
function weakStem(v,stem){const t=SC[v]||(()=>{const[p,b]=splitPrefix(v);return p&&SC[b]?SC[b]:null})();const e=v.replace(/se$/,'').slice(-2).replace('í','i');if(e!='ir'||!t||t=='ue_u')return stem;
 const vs=[...stem.matchAll(/[aeiou]/g)];let k=vs.length-1;while(k>0&&vs[k][0]=='u'&&/[qg]/.test(stem[vs[k].index-1]))k--;if(k<0)return stem;const i=vs[k].index,c=stem[i];
 if(c=='e')return stem.slice(0,i)+'i'+stem.slice(i+1);if(c=='o')return stem.slice(0,i)+'u'+stem.slice(i+1);return stem}
function accStem(v,stem){if(!ACCV.has(v))return stem;const m=stem.match(/([iu])([^aeiou]*)$/);if(!m)return stem;const i=stem.lastIndexOf(m[1]);return stem.slice(0,i)+ACC[m[1]]+stem.slice(i+1)}
const ENDP={ar:T6('o as a amos áis an'),er:T6('o es e emos éis en'),ir:T6('o es e imos ís en')};
function irrOf(v){if(IRR[v])return [ '',v,IRR[v]];const[p,b]=splitPrefix(v);if(p&&IRR[b])return [p,b,IRR[b]];if(p&&b=='solver')return [p,'resolver',{pp:'suelto'}];if(p&&b=='ducir')return [p,'conducir',{pstem:'duj'}];return ['',v,null]}
function yoForm(v){const {stem,end}=info(v);const [p,b,ir]=irrOf(v);if(ir&&ir.pres)return p+ir.pres[0];if(ir&&ir.yo)return p+ir.yo;
 let s=accStem(v,chStem(v,stem));
 if(/uir$/.test(v)&&!/guir$/.test(v))return stem+'yo';
 if(/[gq]uir$/.test(v)&&/guir$/.test(v))return s.slice(0,-2)+'go';
 if(/(ger|gir)$/.test(v))return s.slice(0,-1)+'jo';
 if(/[aeiouáéó]cer$|[aeiou]cir$|ducir$/.test(v)&&!/(hacer|decir)$/.test(v)&&!/(cocer|mecer)$/.test(v))return s.slice(0,-1)+'zco';
 if(/[^aeiou]cer$|cocer$/.test(v))return s.slice(0,-1)+'zo';
 return s+'o'}
function present(v){const [p,b,ir]=irrOf(v);if(ir&&ir.pres)return ir.pres.map(x=>p+x);const {stem,end}=info(v),E=ENDP[end];
 const ch=accStem(v,chStem(v,stem));const out=E.map((e,i)=>([3,4].includes(i)?stem:ch)+e);
 if(/uir$/.test(v)&&!/guir$/.test(v))[0,1,2,5].forEach(i=>out[i]=stem+'y'+E[i]);
 out[0]=yoForm(v);
 if(ir&&ir.yo&&p==''&&b=='decir'){}
 return out.map(f=>{if(p&&(b=='tener'||b=='venir')){return f}return f})}
const ENDPRET={ar:T6('é aste ó amos asteis aron'),er:T6('í iste ió imos isteis ieron'),ir:T6('í iste ió imos isteis ieron')};
function preterite(v){const [p,b,ir]=irrOf(v);if(ir&&ir.pret)return ir.pret.map(x=>p+x);const {stem,end}=info(v);
 if(ir&&ir.pstem){const s=p+ir.pstem;const j=/j$/.test(s);const f=[s+'e',s+'iste',s+'o',s+'imos',s+'isteis',s+(j?'eron':'ieron')];if(b=='hacer')f[2]=p+'hizo';return f}
 if(end=='ar'){const f=ENDPRET.ar.map(e=>stem+e);f[0]=stem.replace(/c$/,'qu').replace(/gu$/,'gü').replace(/g$/,'gu').replace(/z$/,'c')+'é';return f}
 const w=weakStem(v,stem);
 if(/[aeou]$/.test(stem)&&!/[gq]u$/.test(stem)){const ui=/u$/.test(stem);return [stem+'í',stem+(ui?'iste':'íste'),stem+'yó',stem+(ui?'imos':'ímos'),stem+(ui?'isteis':'ísteis'),stem+'yeron']}
 const f=ENDPRET[end].map(e=>stem+e);f[2]=w+'ió';f[5]=w+'ieron';
 if(/ñ$|ll$/.test(stem)){f[2]=w+'ó';f[5]=w+'eron'}return f}
function imperfect(v){const [p,b,ir]=irrOf(v);if(ir&&ir.impf)return ir.impf.map(x=>p+x);const {stem,end}=info(v);
 return end=='ar'?T6('aba abas aba ábamos abais aban').map(e=>stem+e):T6('ía ías ía íamos íais ían').map(e=>stem+e)}
function futStem(v){const [p,b,ir]=irrOf(v);if(ir&&ir.fut)return p+ir.fut;return unacc(v)}
const future=v=>T6('é ás á emos éis án').map(e=>futStem(v)+e);
const conditional=v=>T6('ía ías ía íamos íais ían').map(e=>futStem(v)+e);
function participle(v){const [p,b,ir]=irrOf(v);if(ir&&ir.pp)return p+ir.pp;if(p&&b=='resolver')return p+'suelto';const {stem,end}=info(v);
 if(end=='ar')return stem+'ado';if(/[aeo]$/.test(stem))return stem+'ído';return stem+'ido'}
function gerund(v){const [p,b,ir]=irrOf(v);if(ir&&ir.ger)return p+ir.ger;const {stem,end}=info(v);if(end=='ar')return stem+'ando';
 if(/[aeiou]$/.test(stem)&&!/[gq]u$/.test(stem))return stem+'yendo';if(/ñ$|ll$/.test(stem))return weakStem(v,stem)+'endo';
 const w=weakStem(v,stem);return w+'iendo'}
function subjunctive(v){const [p,b,ir]=irrOf(v);if(ir&&ir.subj)return ir.subj.map(x=>p+x);const {stem,end}=info(v);const E=end=='ar'?T6('e es e emos éis en'):T6('a as a amos áis an');
 const yo=yoForm(v);const ch=accStem(v,chStem(v,stem));const yoIrr=yo!=ch+'o'&&!/uir$/.test(v);
 const fix=s=>end=='ar'?s.replace(/c$/,'qu').replace(/gu$/,'gü').replace(/g$/,'gu').replace(/z$/,'c'):s;
 if(yoIrr){const s=yo.slice(0,-1);const s45=(SC[v]&&end=='ir'&&!/^(decir|elegir|corregir|seguir|conseguir|perseguir)$/.test(v))?weakStem(v,s):s;return E.map((e,i)=>([3,4].includes(i)?s45:s)+e)}
 if(/uir$/.test(v)&&!/guir$/.test(v))return E.map(e=>stem+'y'+e);
 const s45=end=='ir'?weakStem(v,stem):stem;return E.map((e,i)=>fix([3,4].includes(i)?s45:ch)+e)}
function impSubj(v){const s=preterite(v)[5].replace(/ron$/,'');const sA=s.slice(0,-1)+ACC[s.slice(-1)];return [s+'ra',s+'ras',s+'ra',sA+'ramos',s+'rais',s+'ran']}
function imperative(v){const [p,b,ir]=irrOf(v);const sj=subjunctive(v);let tu=ir&&ir.tu?p+ir.tu:present(v)[2];
 if(p&&ir&&ir.tu&&/^[^aeiou]*[aeiou][^aeiou]*$/.test(ir.tu)&&/[ns]$|[aeiou]$/.test(ir.tu)&&b!='ir'){tu=p+ir.tu.replace(/[aeiou](?=[^aeiou]*$)/,c=>ACC[c])}
 const vos=b=='ir'&&!p?'id':v.slice(0,-1)+'d';return [null,tu,sj[2],b=='ir'&&!p?'vamos':sj[3],vos,sj[5]]}
const HAB=T6('he has ha hemos habéis han'),HABIA=T6('había habías había habíamos habíais habían'),ESTOY=T6('estoy estás está estamos estáis están'),VOY=T6('voy vas va vamos vais van');
const TENSES=[
 ['pres','Presente','Present'],['prog','Presente continuo','Present progressive'],['perf','Pretérito perfecto','Present perfect'],['pret','Pretérito indefinido','Simple past (preterite)'],
 ['impf','Pretérito imperfecto','Imperfect (used to / was -ing)'],['plus','Pluscuamperfecto','Past perfect (had done)'],['ira','Futuro con «ir a»','Near future (going to)'],['fut','Futuro simple','Future (will)'],
 ['cond','Condicional','Conditional (would)'],['subj','Presente de subjuntivo','Present subjunctive'],['imp','Imperativo','Commands'],['isubj','Imperfecto de subjuntivo','Imperfect subjunctive']];
function cjBase(v,t){switch(t){case'pres':return present(v);case'pret':return preterite(v);case'impf':return imperfect(v);case'fut':return future(v);case'cond':return conditional(v);
 case'subj':return subjunctive(v);case'isubj':return impSubj(v);case'imp':return imperative(v);
 case'perf':return HAB.map(h=>h+' '+participle(v));case'plus':return HABIA.map(h=>h+' '+participle(v));
 case'prog':return ESTOY.map(h=>h+' '+gerund(v));case'ira':return VOY.map(h=>h+' a '+v)}}
/* public: handles reflexive verbs (levantarse -> me levanto) */
function cj(verb,t){verb=verb.trim().toLowerCase();if(isRefl(verb)){const v=verb.slice(0,-2);if(t=='imp')return [null,null,null,null,null,null];
 if(t=='ira')return VOY.map((h,i)=>REFP[i]+' '+h+' a '+v);return cjBase(v,t).map((f,i)=>REFP[i]+' '+f)}return cjBase(verb,t)}
/* is this form irregular in this tense? (compares with the regular pattern) */
function regForm(v,t){const {stem,end}=info(v);const R={pres:ENDP[end].map(e=>stem+e),pret:ENDPRET[end].map(e=>stem+e),impf:end=='ar'?T6('aba abas aba ábamos abais aban').map(e=>stem+e):T6('ía ías ía íamos íais ían').map(e=>stem+e),
 fut:T6('é ás á emos éis án').map(e=>v+e),cond:T6('ía ías ía íamos íais ían').map(e=>v+e),subj:(end=='ar'?T6('e es e emos éis en'):T6('a as a amos áis an')).map(e=>stem+e)};
 R.isubj=(end=='ar'?['ara','aras','ara','áramos','arais','aran']:['iera','ieras','iera','iéramos','ierais','ieran']).map(e=>stem+e);
 const pp=end=='ar'?stem+'ado':stem+'ido',ger=end=='ar'?stem+'ando':stem+'iendo';R.perf=HAB.map(h=>h+' '+pp);R.plus=HABIA.map(h=>h+' '+pp);R.prog=ESTOY.map(h=>h+' '+ger);R.ira=VOY.map(h=>h+' a '+v);
 R.imp=[null,stem+ENDP[end][2],R.subj[2],R.subj[3],v.slice(0,-1)+'d',R.subj[5]];return R[t]}
function isIrr(v,t){const a=cjBase(v,t),r=regForm(v,t);return a.some((f,i)=>f!=null&&f!=r[i])}
function vType(v){const b=isRefl(v)?v.slice(0,-2):v;const[p,bb,ir]=irrOf(b);if(ir)return 'irr';const s=SC[b]||(p&&SC[bb]);if(s)return {ie:'e→ie',ue:'o→ue',i:'e→i',ue_u:'u→ue',ie_i:'i→ie',hue:'o→hue'}[s];
 if(TENSES.some(([t])=>isIrr(b,t)))return 'orto';return 'reg'}
