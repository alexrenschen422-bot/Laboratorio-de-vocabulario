/* vocab.js: builds ALL (every word with unit and level 1/2/3) */
(function(){
const BW=new Set(),add=w=>alts(w).forEach(x=>BW.add(norm(x,false)));
Object.values(FOOD).forEach(l=>l.forEach(x=>{if(!x[3])add(x[0])}));
FAM.forEach(r=>r[1].forEach(n=>{if(n!=='YO'&&!n[3])add(n[2])}));
OUTB2.concat(INB2).forEach(x=>{if(x[4]==1)add(x[0])});
BWLIST.split('|').forEach(add);
const isB=es=>alts(es).some(x=>{const n=norm(x,false);return BW.has(n)||BW.has(n.replace(/s$/,''))||BW.has(n+'s')});
const CB={};Object.entries(CORE).forEach(([u,s])=>{CB[u]=new Set(s.split('|').map(w=>norm(w,false)))});
const isC=(u,es)=>alts(es).some(x=>{const n=norm(x,false);return CB[u].has(n)||CB[u].has(n.replace(/s$/,''))});
function parse(u,s,lf){s.split(';').forEach(p=>{p=p.trim();if(!p)return;let lv=0;if(p[0]=='*'){lv=2;p=p.slice(1)}const i=p.indexOf('=');const es=p.slice(0,i).trim(),en=p.slice(i+1).trim();ALL.push({u,es,en,lvl:lv||lf(es)})})}
parse('Familia',VOCS.Familia,es=>isB(es)?1:2);
parse('Ropa',ROPA_BOOK,()=>1);
parse('Comida',VOCS.Comida,es=>isB(es)?1:2);
parse('Cuerpo',VOCS.Cuerpo,es=>isB(es)?1:2);
parse('Ciudad',NEW.Ciudad,es=>isC('Ciudad',es)?1:2);
parse('Vivienda',NEW.Vivienda,es=>isC('Vivienda',es)?1:2);
Object.entries(EXTRA).forEach(([u,s])=>parse(u,s,()=>3));
EXPR.forEach(x=>ALL.push({u:'Expresiones',es:x[1],en:x[2],lvl:1,src:x[0]}));
EXPR3.forEach(x=>ALL.push({u:'Expresiones',es:x[1],en:x[2],lvl:3,src:x[0]}));
buildIndex();
})();
