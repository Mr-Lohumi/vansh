import re

def fix_svg_styling():
    with open('js/shared-tree.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update the dotted path rendering to use a highly visible color and thicker stroke
    old_dotted = '<path d="${dottedPathString}" fill="none" stroke="var(--gold)" stroke-width="1.5" stroke-dasharray="3, 4" opacity="0.8" />'
    new_dotted = '<path d="${dottedPathString}" fill="none" stroke="#f4d772" stroke-width="2.5" stroke-dasharray="6, 6" opacity="0.95" filter="drop-shadow(0 0 4px rgba(244,215,114,0.6))" />'
    content = content.replace(old_dotted, new_dotted)

    # 2. Add 'Brother', 'Sister' and lowercase fallbacks to directs list just in case
    old_directs = "const directs = ['Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Husband', 'Wife', 'Self', 'Parent', 'Child', 'Spouse', 'Sibling'];"
    new_directs = "const directs = ['Father', 'Mother', 'Son', 'Daughter', 'Brother', 'Sister', 'Husband', 'Wife', 'Self', 'Parent', 'Child', 'Spouse', 'Sibling'];\n     if (!rel || !rel.english) return false;\n     return directs.some(d => rel.english.toLowerCase().includes(d.toLowerCase()));"
    
    # We need to use regex to replace it carefully
    content = re.sub(
        r"const directs = \['Father'.*?'Sibling'\];\n\s*return directs\.includes\(rel\.english\);",
        new_directs,
        content
    )

    with open('js/shared-tree.js', 'w', encoding='utf-8') as f:
        f.write(content)

    print("Fixed SVG dotted style and directs matching")

fix_svg_styling()
