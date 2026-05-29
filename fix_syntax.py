with open('js/shared-data.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if "function getSmartIndianRelation" in line:
        pass
    
    # We want to skip from the end of our injected getSmartIndianRelation to the start of getAllRelationsFrom
    # Our injected getSmartIndianRelation ends with:
    #   return R('रिश्तेदार','Rishtedar','Relative','self','badge-self');
    # }
    
    # Wait, instead of guessing indices, I'll just find the exact lines.
    pass

# Read as string
content = "".join(lines)

import re

# We will find where our injected function ends
#   return R('रिश्तेदार','Rishtedar','Relative','self','badge-self');
# }
# And delete everything from there up to `function getAllRelationsFrom`

fixed_content = re.sub(
    r"(return R\('रिश्तेदार','Rishtedar','Relative','self','badge-self'\);\n\})(.*?)(function getAllRelationsFrom\()",
    r"\1\n\n\3",
    content,
    flags=re.DOTALL
)

with open('js/shared-data.js', 'w', encoding='utf-8') as f:
    f.write(fixed_content)

print("Fixed syntax error in shared-data.js!")
