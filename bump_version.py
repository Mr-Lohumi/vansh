import os
import glob

# Files to process
html_files = glob.glob('*.html')

for file_name in html_files:
    with open(file_name, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace v=12, v=18, v=23 with v=24 for script tags
    import re
    content = re.sub(r'js/([^"]+)\?v=\d+', r'js/\1?v=24', content)
    
    with open(file_name, 'w', encoding='utf-8') as f:
        f.write(content)

print("Bumped version strings to v=24 in all HTML files.")
