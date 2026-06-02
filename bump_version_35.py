import glob
import re

for f in glob.glob('*.html'):
    c = open(f, 'r', encoding='utf-8').read()
    c = re.sub(r'js/([^"]+)\?v=34', r'js/\1?v=35', c)
    open(f, 'w', encoding='utf-8').write(c)
print("v=35 done")
