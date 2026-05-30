import glob
import re

html_files = glob.glob('*.html')

for file_name in html_files:
    with open(file_name, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = re.sub(r'js/([^"]+)\?v=27', r'js/\1?v=28', content)
    
    with open(file_name, 'w', encoding='utf-8') as f:
        f.write(content)

print("Bumped version strings to v=28.")
