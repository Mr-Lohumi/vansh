import sys

with open('traditions.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Lines are 0-indexed in Python. We want to delete lines 99 to 196 (inclusive).
# In 0-index, this is lines[98:196].
new_lines = lines[:98] + lines[196:]

with open('traditions.html', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Fixed traditions.html")
