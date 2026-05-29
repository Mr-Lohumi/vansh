import os
import glob
import re

html_files = glob.glob('*.html')

for file_name in html_files:
    with open(file_name, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = re.sub(r'js/([^"]+)\?v=24', r'js/\1?v=25', content)
    
    with open(file_name, 'w', encoding='utf-8') as f:
        f.write(content)

print("Bumped version strings to v=25.")
