import sys
order=['old','data_cv','data_more','core','vocab','app','practice','familia','ropa_art','ropa','comida','cuerpo','ciudad_map','ciudad','ciudad2','viv_art','vivienda','learn','daily_data','daily','shell','conj','verbs_data','gram_data','grammar','init']
import os
js=''
for n in order:
    f=f'js/{n}.js'
    if os.path.exists(f): js+=f'\n/* ==== {n}.js ==== */\n'+open(f,encoding='utf8').read()
css=open('app.css',encoding='utf8').read()
html=f'''<title>Laboratorio de vocabulario</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@600;700;800;900&display=swap">
<style>
{css}
</style>
<script>
{js}
</script>
'''
open(sys.argv[1] if len(sys.argv)>1 else 'dist.html','w',encoding='utf8').write(html)
# local preview wrapper
open('preview.html','w',encoding='utf8').write('<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style>'+html.replace('<script>','</head><body><script>',1)+'</body></html>')
print(len(html))
