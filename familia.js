/* familia.js: illustrated family tree (circled person) + "Mi árbol" + scenarios */
const REL={esposo:['esposo|marido','esposa|mujer',1],ex:['exmarido|exesposo','exmujer|exesposa',3],padre:['padre','madre',1],padrastro:['padrastro','madrastra',2],hijo:['hijo','hija',1],hijastro:['hijastro','hijastra',2],hermano:['hermano','hermana',1],medio:['medio hermano|hermanastro','media hermana|hermanastra',2],hermanastro:['hermanastro','hermanastra',2],abuelo:['abuelo','abuela',1],bisabuelo:['bisabuelo','bisabuela',2],nieto:['nieto','nieta',1],bisnieto:['bisnieto','bisnieta',2],tio:['tío','tía',1],tiopol:['tío|tío político','tía|tía política',1],tioabuelo:['tío abuelo','tía abuela',2],primo:['primo','prima',1],primo2:['primo segundo','prima segunda',3],sobrino:['sobrino','sobrina',1],sobrinonieto:['sobrino nieto','sobrina nieta',3],suegro:['suegro','suegra',2],yerno:['yerno','nuera',2],cunado:['cuñado','cuñada',2],concunado:['concuñado','concuñada',3],consuegro:['consuegro','consuegra',3]};
const REN={esposo:['husband','wife'],ex:['ex-husband','ex-wife'],padre:['father','mother'],padrastro:['stepfather','stepmother'],hijo:['son','daughter'],hijastro:['stepson','stepdaughter'],hermano:['brother','sister'],medio:['half brother','half sister'],hermanastro:['stepbrother','stepsister'],abuelo:['grandfather','grandmother'],bisabuelo:['great-grandfather','great-grandmother'],nieto:['grandson','granddaughter'],bisnieto:['great-grandson','great-granddaughter'],tio:['uncle','aunt'],tiopol:['uncle','aunt'],tioabuelo:['great-uncle','great-aunt'],primo:['cousin','cousin'],primo2:['second cousin','second cousin'],sobrino:['nephew','niece'],sobrinonieto:['grandnephew','grandniece'],suegro:['father-in-law','mother-in-law'],yerno:['son-in-law','daughter-in-law'],cunado:['brother-in-law','sister-in-law'],concunado:['co-brother-in-law','co-sister-in-law'],consuegro:["child's father-in-law","child's mother-in-law"]};
const GBASE={tiopol:'tio'};
const GEN={abuelo:'grandparents',bisabuelo:'great-grandparents',tio:'uncles and aunts',primo:'cousins',hermano:'siblings',nieto:'grandchildren',sobrino:'nephews and nieces',hijo:'children',suegro:'parents-in-law',consuegro:'co-parents-in-law',bisnieto:'great-grandchildren',tioabuelo:'great-uncles and aunts',medio:'half siblings',hermanastro:'stepsiblings',hijastro:'stepchildren',sobrinonieto:'grandnephews',primo2:'second cousins',cunado:'siblings-in-law',concunado:'co-siblings-in-law'};
const plw=w=>w.split(' ').map(t=>/^(medio|media)$/.test(t)?t:/[aeiouáéíóú]$/.test(t)?t+'s':t+'es').join(' ');
const NAMES={m:[['Antonio','Manuel','José','Francisco','Ramón','Joaquín','Emilio'],['Javier','Carlos','Miguel','Alberto','Luis','Andrés','Fernando','Raúl','Óscar','Jorge'],['Hugo','Lucas','Pablo','Daniel','Mateo','Leo','Marcos','Álvaro','Diego','Adrián'],['Bruno','Gael','Izan','Nico']],
 f:[['Carmen','Dolores','Pilar','Mercedes','Rosario','Concha','Teresa'],['Elena','Marta','Laura','Cristina','Isabel','Ana','Beatriz','Silvia','Raquel','Nuria'],['Lucía','Sofía','Martina','Paula','Valeria','Alba','Noa','Julia','Irene','Carla'],['Vega','Mía','Lola','Emma']]};
/* templates: id, gen, x, sex ('m','f','r', or '~id' = opposite of id), parents, spouse/ex */
const FT={
1:{W:1260,P:[['g1',1,180,'m'],['g2',1,330,'f'],['g3',1,900,'m'],['g4',1,1050,'f'],
 ['u1',2,110,'r',['g1','g2']],['u1s',2,250,'~u1'],['p',2,470,'m',['g1','g2']],['m',2,760,'f',['g3','g4']],['a2',2,1010,'r',['g3','g4']],['a2s',2,1150,'~a2'],
 ['c1',3,110,'r',['u1','u1s']],['c2',3,250,'r',['u1','u1s']],['k1',3,470,'r',['p','m']],['k2',3,615,'r',['p','m']],['k3',3,760,'r',['p','m']],['c3',3,1010,'r',['a2','a2s']],['c4',3,1150,'r',['a2','a2s']]],
 S:[['g1','g2'],['g3','g4'],['u1','u1s'],['p','m'],['a2','a2s']],X:[]},
2:{W:1250,P:[['b1',0,130,'m'],['b2',0,270,'f'],['ta',1,80,'r',['b1','b2']],['g1',1,240,'m',['b1','b2']],['g2',1,380,'f'],['g3',1,840,'m'],['g4',1,980,'f'],
 ['u1',2,100,'r',['g1','g2']],['u1s',2,240,'~u1'],['p',2,420,'m',['g1','g2']],['m',2,620,'f',['g3','g4']],['sf',2,800,'~m'],['a2',2,1000,'r',['g3','g4']],['a2s',2,1140,'~a2'],
 ['c1',3,100,'r',['u1','u1s']],['k1',3,330,'r',['p','m']],['k1s',3,460,'~k1'],['k2',3,590,'r',['p','m']],['h1',3,720,'r',['m','sf']],['sk',3,860,'r',['sf']],['c3',3,1000,'r',['a2','a2s']],['c4',3,1140,'r',['a2','a2s']],
 ['n1',4,330,'r',['k1','k1s']],['n2',4,460,'r',['k1','k1s']]],
 S:[['b1','b2'],['g1','g2'],['g3','g4'],['u1','u1s'],['m','sf'],['a2','a2s'],['k1','k1s']],X:[['p','m']]},
3:{W:1180,P:[['b1',0,120,'m'],['b2',0,260,'f'],['ta',1,80,'r',['b1','b2']],['g1',1,230,'m',['b1','b2']],['g2',1,370,'f'],['g3',1,560,'m'],['g4',1,700,'f'],
 ['u1',2,100,'r',['g1','g2']],['u1s',2,230,'~u1'],['p',2,380,'m',['g1','g2']],['m',2,560,'f',['g3','g4']],['sf',2,720,'~m'],['cp1',2,930,'m'],['cp2',2,1070,'f'],
 ['c1',3,100,'r',['u1','u1s']],['k2',3,240,'r',['p','m']],['k2s',3,370,'~k2'],['h1',3,510,'r',['m','sf']],['sk',3,640,'r',['sf']],['k1',3,800,'r',['p','m']],['k1s',3,930,'~k1',['cp1','cp2']],['ks2',3,1070,'r',['cp1','cp2']],
 ['cc1',4,100,'r',['c1']],['n1',4,800,'r',['k1','k1s']],['n2',4,930,'r',['k1','k1s']]],
 S:[['b1','b2'],['g1','g2'],['g3','g4'],['u1','u1s'],['m','sf'],['cp1','cp2'],['k2','k2s'],['k1','k1s']],X:[['p','m']]}};
function famBuild(L){const T=FT[L],F={},used=new Set();const flip=Math.random()<.5;
T.P.forEach(([id,gen,x,sx,par])=>{F[id]={id,gen,x,sx,par:par||[],ex:[]}});
Object.values(F).forEach(p=>{let s=p.sx;if(s=='r')s=Math.random()<.5?'m':'f';p.sex=s});
Object.values(F).forEach(p=>{if(p.sx[0]=='~')p.sex=F[p.sx.slice(1)].sex=='m'?'f':'m'});
if(flip&&F.p&&F.m){F.p.sex='f';F.m.sex='m';if(F.sf)F.sf.sex='f'}
T.S.forEach(([a,b])=>{F[a].sp=b;F[b].sp=a});T.X.forEach(([a,b])=>{F[a].ex.push(b);F[b].ex.push(a)});
const ages=[4,3,2,1,0];
Object.values(F).forEach(p=>{const g=Math.min(3,Math.max(0,p.gen-(L==1?0:1)+(L==1?-1:0)));let ag=L==1?[3,2,1][p.gen-1]:[4,3,2,1,0][p.gen];p.age=ag;
 const band=ag>=3?0:ag==2?1:ag==1?2:3;const pool=NAMES[p.sex][band].filter(n=>!used.has(n));p.name=pick(pool.length?pool:NAMES[p.sex][band]);used.add(p.name);
 p.skin=pick(['#F5D3B5','#EBC09A','#D9A47C','#B97C54','#8C5A3C']);p.hair=ag>=3?pick(['#D7D7D2','#BEBEB8','#E9E6DD']):pick(['#3B2A20','#5A3A22','#8A5A2B','#C99A4B','#1E1E1E','#A0522D']);
 p.style=p.sex=='m'?(ag>=3?pick(['bald','short']):ag==0?'curl':pick(['short','spiky','side'])):(ag>=3?pick(['bun','curly']):ag==0?'curl':pick(['long','bob','pony','curly']));
 p.glasses=ag>=3?Math.random()<.6:Math.random()<.15;p.beard=p.sex=='m'&&ag==2&&Math.random()<.4;p.shirt=pick(['#6FA8DC','#EE8B6A','#7BC4A6','#F2B33D','#A493D8','#E57C9A','#5DA3A0'])});
return F}
function famRel(F,e,p){const par=x=>F[x].par,kids=x=>Object.values(F).filter(q=>q.par.includes(x)).map(q=>q.id),sp=x=>F[x].sp,
 sib=x=>Object.values(F).filter(q=>q.id!=x&&q.par.some(pp=>par(x).includes(pp))).map(q=>q.id),
 full=(a,b)=>par(a).length==2&&par(b).length==2&&par(a).every(x=>par(b).includes(x));
 if(sp(e)==p)return'esposo';if(F[e].ex.includes(p))return'ex';if(par(e).includes(p))return'padre';
 if(par(e).some(x=>sp(x)==p))return'padrastro';if(kids(e).includes(p))return'hijo';if(sp(e)&&kids(sp(e)).includes(p))return'hijastro';
 if(sib(e).includes(p))return full(e,p)?'hermano':'medio';if(par(e).some(x=>sp(x)&&kids(sp(x)).includes(p)))return'hermanastro';
 const gp=par(e).flatMap(par);if(gp.includes(p))return'abuelo';if(gp.flatMap(par).includes(p))return'bisabuelo';
 const gk=kids(e).flatMap(kids);if(gk.includes(p))return'nieto';if(gk.flatMap(kids).includes(p))return'bisnieto';
 const ps=par(e).flatMap(sib);if(ps.includes(p))return'tio';if(ps.some(x=>sp(x)==p))return'tiopol';if(gp.flatMap(sib).includes(p))return'tioabuelo';
 if(ps.flatMap(kids).includes(p))return'primo';const sb=sib(e);if(sb.flatMap(kids).includes(p))return'sobrino';if(sp(e)&&sib(sp(e)).flatMap(kids).includes(p))return'sobrino';
 if(sb.flatMap(kids).flatMap(kids).includes(p))return'sobrinonieto';
 if(sp(e)&&par(sp(e)).includes(p))return'suegro';if(kids(e).some(x=>sp(x)==p))return'yerno';
 if(sp(e)&&sib(sp(e)).includes(p))return'cunado';if(sb.some(x=>sp(x)==p))return'cunado';if(sp(e)&&sib(sp(e)).some(x=>sp(x)==p))return'concunado';
 if(kids(e).some(x=>sp(x)&&par(sp(x)).includes(p)))return'consuegro';
 if(par(e).flatMap(x=>par(x).flatMap(sib).flatMap(kids)).flatMap(kids).includes(p))return'primo2';return null}
/* cartoon portrait */
function face(p,x,y,R,uid){const s=R/40,k=p.skin,dk=shade(k,-.18),h=p.hair,hd=shade(h,-.2);const hy=y-4*s,hr=(p.age==0?13:16)*s;let back='',front='';
const st=p.style;
if(st=='long'){back=`<path d="M${x-hr-3*s} ${hy}Q${x-hr-6*s} ${hy+30*s} ${x-hr+2*s} ${hy+34*s}L${x+hr-2*s} ${hy+34*s}Q${x+hr+6*s} ${hy+30*s} ${x+hr+3*s} ${hy}Z" fill="${h}"/>`}
if(st=='curly'){back=[-1,0,1].map(i=>`<circle cx="${x+i*hr*.8}" cy="${hy-hr*.7}" r="${hr*.55}" fill="${h}"/>`).join('')+`<circle cx="${x-hr*.95}" cy="${hy}" r="${hr*.5}" fill="${h}"/><circle cx="${x+hr*.95}" cy="${hy}" r="${hr*.5}" fill="${h}"/>`}
if(st=='bob')back=`<path d="M${x-hr-3*s} ${hy-2*s}Q${x-hr-4*s} ${hy+16*s} ${x-hr+3*s} ${hy+17*s}L${x+hr-3*s} ${hy+17*s}Q${x+hr+4*s} ${hy+16*s} ${x+hr+3*s} ${hy-2*s}Z" fill="${h}"/>`;
if(st=='pony')back=`<path d="M${x+hr*.6} ${hy-hr*.6}q${16*s} ${2*s} ${12*s} ${24*s}q-${4*s} -${10*s} -${12*s} -${14*s}Z" fill="${h}"/>`;
if(st=='bun')back=`<circle cx="${x}" cy="${hy-hr*1.05}" r="${hr*.45}" fill="${h}"/>`;
const body=`<path d="M${x-26*s} ${y+44*s}Q${x-24*s} ${y+18*s} ${x} ${y+16*s}Q${x+24*s} ${y+18*s} ${x+26*s} ${y+44*s}Z" fill="${p.shirt}"/><path d="M${x-6*s} ${y+16*s}L${x} ${y+24*s}L${x+6*s} ${y+16*s}Z" fill="${k}"/>`;
const head=`<rect x="${x-4*s}" y="${hy+hr*.6}" width="${8*s}" height="${9*s}" fill="${dk}"/><circle cx="${x-hr}" cy="${hy+2*s}" r="${3.5*s}" fill="${k}"/><circle cx="${x+hr}" cy="${hy+2*s}" r="${3.5*s}" fill="${k}"/><circle cx="${x}" cy="${hy}" r="${hr}" fill="${k}"/>`;
if(st=='short')front=`<path d="M${x-hr} ${hy-1*s}Q${x-hr} ${hy-hr-3*s} ${x} ${hy-hr-2*s}Q${x+hr+1*s} ${hy-hr-2*s} ${x+hr} ${hy-2*s}Q${x+4*s} ${hy-hr*.55} ${x-hr} ${hy-1*s}Z" fill="${h}"/>`;
if(st=='side')front=`<path d="M${x-hr} ${hy}Q${x-hr-1*s} ${hy-hr-3*s} ${x+2*s} ${hy-hr-2*s}Q${x+hr+2*s} ${hy-hr} ${x+hr} ${hy}Q${x+hr*.2} ${hy-hr*.9} ${x-hr*.5} ${hy-hr*.3}Q${x-hr*.8} ${hy-hr*.1} ${x-hr} ${hy}Z" fill="${h}"/>`;
if(st=='spiky')front=`<path d="M${x-hr} ${hy-2*s}L${x-hr*.8} ${hy-hr-4*s}L${x-hr*.35} ${hy-hr*.8}L${x} ${hy-hr-6*s}L${x+hr*.35} ${hy-hr*.8}L${x+hr*.8} ${hy-hr-4*s}L${x+hr} ${hy-2*s}Q${x} ${hy-hr*.6} ${x-hr} ${hy-2*s}Z" fill="${h}"/>`;
if(st=='bald')front=`<path d="M${x-hr} ${hy+2*s}Q${x-hr-2*s} ${hy-6*s} ${x-hr*.6} ${hy-8*s}L${x-hr*.6} ${hy-2*s}Z M${x+hr} ${hy+2*s}Q${x+hr+2*s} ${hy-6*s} ${x+hr*.6} ${hy-8*s}L${x+hr*.6} ${hy-2*s}Z" fill="${h}"/>`;
if(st=='long'||st=='bob'||st=='pony'||st=='bun'||st=='curly')front=`<path d="M${x-hr-1*s} ${hy+2*s}Q${x-hr} ${hy-hr-4*s} ${x} ${hy-hr-3*s}Q${x+hr} ${hy-hr-4*s} ${x+hr+1*s} ${hy+2*s}Q${x+hr*.5} ${hy-hr*.45} ${x-hr*.1} ${hy-hr*.55}Q${x-hr*.6} ${hy-hr*.3} ${x-hr-1*s} ${hy+2*s}Z" fill="${h}"/>`;
if(st=='curl')front=`<path d="M${x-2*s} ${hy-hr+1*s}q${3*s} -${7*s} ${7*s} -${2*s}" fill="none" stroke="${hd}" stroke-width="${2.2*s}" stroke-linecap="round"/>`;
const ey=hy+1*s,ex=6*s;let fc=`<ellipse cx="${x-ex}" cy="${ey}" rx="${1.9*s}" ry="${2.4*s}" fill="#2B2B2B"/><ellipse cx="${x+ex}" cy="${ey}" rx="${1.9*s}" ry="${2.4*s}" fill="#2B2B2B"/><circle cx="${x-ex+.7*s}" cy="${ey-.9*s}" r="${.6*s}" fill="#fff"/><circle cx="${x+ex+.7*s}" cy="${ey-.9*s}" r="${.6*s}" fill="#fff"/>`;
fc+=`<path d="M${x-5*s} ${hy+7*s}Q${x} ${hy+11.5*s} ${x+5*s} ${hy+7*s}" fill="none" stroke="#8A3B2E" stroke-width="${1.6*s}" stroke-linecap="round"/><circle cx="${x-10*s}" cy="${hy+6*s}" r="${2.6*s}" fill="#F08F8F" opacity=".45"/><circle cx="${x+10*s}" cy="${hy+6*s}" r="${2.6*s}" fill="#F08F8F" opacity=".45"/>`;
if(p.age>=3)fc+=`<path d="M${x-9*s} ${ey-4.5*s}h${5*s}M${x+4*s} ${ey-4.5*s}h${5*s}" stroke="${shade(h,-.3)}" stroke-width="${1.4*s}" stroke-linecap="round"/>`;
if(p.glasses)fc+=`<g fill="none" stroke="#3A3A3A" stroke-width="${1.3*s}"><circle cx="${x-ex}" cy="${ey}" r="${4.3*s}"/><circle cx="${x+ex}" cy="${ey}" r="${4.3*s}"/><path d="M${x-ex+4.3*s} ${ey}h${2*ex-8.6*s}"/></g>`;
if(p.beard)fc+=`<path d="M${x-hr*.85} ${hy+3*s}Q${x-hr*.6} ${hy+hr+3*s} ${x} ${hy+hr+3*s}Q${x+hr*.6} ${hy+hr+3*s} ${x+hr*.85} ${hy+3*s}Q${x} ${hy+13*s} ${x-hr*.85} ${hy+3*s}Z" fill="${h}" opacity=".9"/>`;
return `<clipPath id="cp${uid}"><circle cx="${x}" cy="${y}" r="${R}"/></clipPath><circle cx="${x}" cy="${y}" r="${R}" fill="${shade(p.shirt,.72)}"/><g clip-path="url(#cp${uid})">${back}${body}${head}${front}${fc}</g>`}
const famState={};
function famTree(id){const L=S.lvl,T=FT[L],F=famBuild(L),ids=Object.keys(F);
const opts=ids.map(e=>{const rel={};ids.forEach(p=>{if(p!=e){const r=famRel(F,e,p);if(r&&REL[r][2]<=L)rel[p]=r}});const n=Object.keys(rel).length,nl=Object.values(rel).filter(r=>REL[r][2]==L).length;return {e,rel,n,nl,mid:F[e].gen==2||F[e].gen==3}}).filter(o=>o.n>=(L==1?7:9));
const good=opts.filter(o=>L==1||o.nl>=(L==2?3:2));const src=good.length?good:opts;const mids=src.filter(o=>o.mid);
const best=(mids.length&&Math.random()<.8)?pick(mids):pick(src);
const {e,rel}=best;const gens=[...new Set(ids.map(i=>F[i].gen))].sort();const g0=gens[0];const RH=200,R=38,top=78;const H=top+gens.length*RH-10;const W=T.W;
const Y=p=>top+(F[p].gen-g0)*RH+R;
/* groups (plural answers) */
const groups=[];const taken=new Set([e]);const want=L==1?1:2;
const cands=[];
T.S.forEach(([a,b])=>{if(rel[a]&&rel[b]&&(GBASE[rel[a]]||rel[a])==(GBASE[rel[b]]||rel[b])&&rel[a]!='esposo')cands.push([a,b])});
const famUnits={};ids.forEach(i=>{const k=F[i].par.join('+');if(k)(famUnits[k]=famUnits[k]||[]).push(i)});
Object.values(famUnits).forEach(m=>{const l=m.filter(i=>rel[i]);const byT={};l.forEach(i=>{const t=GBASE[rel[i]]||rel[i];(byT[t]=byT[t]||[]).push(i)});Object.values(byT).forEach(g=>{if(g.length>=2)cands.push(g.sort((a,b)=>F[a].x-F[b].x))})});
shuf(cands).forEach(g=>{if(groups.length<want&&g.every(i=>!taken.has(i))&&!ids.some(j=>!g.includes(j)&&F[j].gen==F[g[0]].gen&&F[j].x>Math.min(...g.map(i=>F[i].x))&&F[j].x<Math.max(...g.map(i=>F[i].x)))&&Math.max(...g.map(i=>F[i].x))-Math.min(...g.map(i=>F[i].x))<300){groups.push(g);g.forEach(i=>taken.add(i))}});
/* drawing */
let art=`<defs><linearGradient id="fsky${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAF6F1"/><stop offset="1" stop-color="#F8F4E8"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#fsky${id})"/>`;
art+=`<g opacity=".16"><rect x="${W/2-26}" y="${H*.35}" width="52" height="${H*.65}" rx="20" fill="#8A5A2B"/>${[[.5,.22,.28],[.27,.3,.2],[.73,.3,.2],[.38,.12,.16],[.62,.12,.16],[.15,.45,.14],[.85,.45,.14]].map(([a,b,c])=>`<circle cx="${W*a}" cy="${H*b}" r="${W*c}" fill="#5BA86F"/>`).join('')}</g>`;
const lines=[];
T.S.concat(T.X).forEach(([a,b])=>{const xa=F[a].x,xb=F[b].x,y=Y(a),dv=F[a].ex.includes(b);lines.push(`<line x1="${xa+R}" y1="${y}" x2="${xb-R}" y2="${y}" stroke="${dv?'#B98A86':'#C7A15A'}" stroke-width="5" ${dv?'stroke-dasharray="10 8"':''} stroke-linecap="round"/>`);
 lines.push(emo((xa+xb)/2,y-15,dv?'💔':'💍',20))});
const unitsDrawn={};ids.forEach(i=>{const pr=F[i].par;if(!pr.length)return;const k=pr.join('+');if(unitsDrawn[k])return;unitsDrawn[k]=1;
 const kids=ids.filter(j=>F[j].par.join('+')==k);const ax=pr.length==2?(F[pr[0]].x+F[pr[1]].x)/2:F[pr[0]].x;const ay=Y(pr[0])+(pr.length==2?0:R);const ky=Y(kids[0])-R;const by=ky-26;
 const xs=kids.map(j=>F[j].x).concat(ax);lines.push(`<path d="M${ax} ${ay}V${by}M${Math.min(...xs)} ${by}H${Math.max(...xs)}${kids.map(j=>`M${F[j].x} ${by}V${ky}`).join('')}" fill="none" stroke="#9BB5AE" stroke-width="4" stroke-linecap="round"/>`)});
art+=lines.join('');
const marks=[];let pk=0;
groups.forEach(g=>{const xs=g.map(i=>F[i].x),y=Y(g[0]);art+=`<rect x="${Math.min(...xs)-R-14}" y="${y-R-14}" width="${Math.max(...xs)-Math.min(...xs)+2*R+28}" height="${2*R+52}" rx="26" fill="#FFF8E1" stroke="#E0A93A" stroke-width="3" stroke-dasharray="9 7" opacity=".95"/>`});
ids.forEach((i,n)=>{const p=F[i],y=Y(i),x=p.x,isE=i==e,asked=!!rel[i]||isE;
 art+=`<g opacity="${asked?1:.45}">${isE?`<circle cx="${x}" cy="${y}" r="${R+12}" fill="#F2B33D"/><circle cx="${x}" cy="${y}" r="${R+6}" fill="#FFF4D6"/>`:''}${face(p,x,y,R,id+'_'+n)}<circle cx="${x}" cy="${y}" r="${R}" fill="none" stroke="${isE?'#E09A1A':'#FFFFFF'}" stroke-width="${isE?5:3}"/>
 <rect x="${x-50}" y="${y+R+5}" width="100" height="24" rx="12" fill="${isE?'#F2B33D':'#FFFFFF'}" stroke="${isE?'#E09A1A':'#D5E3DF'}" stroke-width="2"/><text x="${x}" y="${y+R+22}" text-anchor="middle" font-size="15" font-weight="800" fill="#1F3A40" font-family="Nunito,system-ui">${isE?'⭐ ':''}${esc(p.name)}</text></g>`});
ids.forEach(i=>{if(!rel[i]||groups.some(g=>g.includes(i)))return;const p=F[i],r=REL[rel[i]];marks.push({x:p.x+R*.78,y:Y(i)-R*.78,a:r[p.sex=='m'?0:1],en:REN[rel[i]][p.sex=='m'?0:1],lab:p.name,nolead:1,pref:[-R*.78,R*.78+R+58]})});
groups.forEach(g=>{const xs=g.map(i=>F[i].x),y=Y(g[0]),allF=g.every(i=>F[i].sex=='f'),t=rel[g[0]],b=GBASE[t]||t;const w=alts(REL[b][allF?1:0]).map(plw).join('|');
 marks.push({x:Math.max(...xs)+R+10,y:y-R-10,a:w,en:allF?REN[b][1]+'s':(GEN[b]||REN[b][0]+'s'),lab:g.map(i=>F[i].name).join(' + '),grp:1,nolead:1,pref:[-(Math.max(...xs)-Math.min(...xs))/2-R-10,R*2+68]})});
famState[id]={F,e,marks};
const ego=F[e].name;
const legend=`<g font-family="Nunito,system-ui" font-size="15" font-weight="800" fill="#1F3A40"><rect x="14" y="12" width="${W-28}" height="46" rx="16" fill="#FFFFFFD9"/>${emo(40,35,'⭐',20)}<text x="58" y="41">= ${esc(ego)}</text>${emo(170,35,'💍',18)}<text x="186" y="41">casados</text>${L>1?`${emo(290,35,'💔',18)}<text x="306" y="41">divorciados</text>`:''}<rect x="${L>1?440:300}" y="22" width="30" height="24" rx="8" fill="#FFF8E1" stroke="#E0A93A" stroke-width="2" stroke-dasharray="5 4"/><text x="${L>1?478:338}" y="41">= una respuesta para todo el grupo (plural)</text></g>`;
return {art:art+legend,W,H,marks,ego}}
BL['fam-tree']={unit:'Familia',label:'Árbol',render(){const t=famTree('fam-tree');
return {t:'El árbol de la familia',en:'The family tree',icon:'🌳',wide:1,
sub:`Mira a <b>⭐ ${esc(t.ego)}</b>. ¿Qué es cada persona para ${esc(t.ego)}? En los recuadros amarillos escribe una sola palabra en plural (por ejemplo: <i>primos</i>).`,subEn:`Look at ⭐ ${t.ego}. What is each person to ${t.ego}? In the yellow boxes write one plural word (for example: primos = cousins).`,
body:dgm({id:'fam-tree',W:t.W,H:t.H,art:t.art,marks:t.marks,r:15,bw:120,bh:32,label:'Árbol familiar',desc:`${t.ego} tiene`})}}};

/* ---------- "Mi árbol" (you are YO) + scenarios ---------- */
const FAM3=['Familia de la familia',[['la mujer del hermano de mi marido','husband\u2019s brother\u2019s wife','concuñada',3],['el padre de mi yerno','son-in-law\u2019s father','consuegro',3],['la madre de mi nuera','daughter-in-law\u2019s mother','consuegra',3],['el nieto de mi hermano','brother\u2019s grandson','sobrino nieto',3],['la nieta de mi hermana','sister\u2019s granddaughter','sobrina nieta',3],['el hijo del primo de mi padre','father\u2019s cousin\u2019s son','primo segundo',3],['el marido de mi tía (no es hermano de mis padres)','aunt\u2019s husband','tío político|tío',3],['el hombre que estuvo casado con mi madre','mother\u2019s former husband','exmarido|exesposo',3]]];
const WHAT3=[['Mi hijo se casa con Laura. ¿Qué son los padres de Laura para mí?','consuegros',3],['Mi hermano tiene un nieto. ¿Qué es ese niño para mí?','sobrino nieto',3],['Mi marido tiene un hermano casado. ¿Qué es la mujer de ese hermano para mí?','concuñada',3],['El primo de mi madre tiene una hija. ¿Qué es ella para mí?','prima segunda',3],['Mis padres se divorciaron. ¿Qué es ahora mi padre para mi madre?','exmarido|exesposo',3],['En mi casa somos siete hermanos. ¿Qué tipo de familia es?','familia numerosa|numerosa',3],['Soy el hermano más pequeño. ¿Cómo me llaman?','benjamín',3],['Mis abuelos llevan cincuenta años casados. ¿Qué celebran?','bodas de oro',3],['Mis padres se casan y se van de viaje. ¿Qué viaje es?','luna de miel',3],['Mi tía tuvo tres bebés el mismo día. ¿Qué son?','trillizos',3],['Una persona que no tiene padres es…','huérfano|huérfana',2],['El primer hijo de una familia es el…','primogénito',3]];
function famNode2(n){if(n==='YO')return `<div class="card" style="background:var(--pri);color:var(--priInk);justify-content:center"><b style="font:800 1.5rem var(--f-disp)">YO</b><span style="font-size:.8rem">(me)</span></div>`;
return `<div class="card"><span class="d">${esc(n[0])} ${tEn(n[1])}</span>${inp(n[2])}</div>`}
BL['fam-yo']={unit:'Familia',label:'Mi árbol',render(){const L=S.lvl;let rows;
if(L==3)rows=[FAM3];else rows=FAM.map(([t,ns])=>[t,ns.filter(n=>n==='YO'||(n[3]||1)<=L&&(L==2||!n[3]))]).filter(([t,ns])=>ns.some(n=>n!=='YO'));
return {t:'Mi árbol genealógico',en:'My family tree (you are YO)',icon:'🧒',sub:'Eres <b>YO</b>. Escribe qué es cada persona para ti.',subEn:'You are YO (me). Write what each person is to you.',
body:rows.map(([t,ns])=>`<h4>${esc(t)}</h4><div class="cards">${ns.map(famNode2).join('')}</div>`).join('')}}};
BL['fam-what']={unit:'Familia',label:'¿Y si…?',render(){const all=WHAT.map(w=>[w[0],w[1],w[2]||1]).concat(WHAT3);const qs=draw(all,w=>w[2],S.lvl==1?8:10);
return {t:'¿Y si…? Escenarios',en:'What if…? Situations',icon:'🤔',sub:'Lee la situación y escribe la palabra de la familia.',subEn:'Read the situation and write the family word.',
body:`<div class="qs">${qs.map(([q,a])=>`<div class="q"><p>${esc(q)}</p>${inp(a)}</div>`).join('')}</div>`}}};
VIEWS.push({id:'familia',u:'Familia',t:'La familia',en:'Family',ic:'👪',desc:'árbol, parientes y situaciones',blocks:['fam-tree','fam-yo','fam-what']});
addXS('Familia',WHAT3.map(w=>[w[0],w[1],w[2]]));
