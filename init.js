/* init.js: exam pools from old data, then start */
SENT2.forEach(s=>{const c=entry(s[1]);if(c)addXS(c.u,[[s[0],s[1],s[2]||1]])});
POOLS.forEach(p=>{const c=entry(first(p[2]));if(c&&c.u!='Ropa')addXG(c.u,[[p[0],p[1],p[2],1]])});
boot();
