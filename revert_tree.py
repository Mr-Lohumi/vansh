import re

with open('js/shared-tree.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove buildPlaceholderHTML entirely
content = re.sub(r'function buildPlaceholderHTML.*?return html;\n\}', '', content, flags=re.DOTALL)

# Revert buildNodeHTML to original
old_build_node = """function buildNodeHTML(m, currentPOV, onNodeClickName, isHead = false) {
  if (!m) return '';
  const rel = getSmartIndianRelation(familyMembers, currentPOV, m.id);
  const isActive = m.id === currentPOV;
  let html = renderProfileCardHTML(m, rel, { isActive, isHead, onNodeClickName });
  if (rel) {
     html += getPlaceholdersForNode(m, rel.latin, currentPOV);
  }
  return html;
}"""

new_build_node = """function buildNodeHTML(m, currentPOV, onNodeClickName, isHead = false) {
  if (!m) return '';
  const rel = getSmartIndianRelation(familyMembers, currentPOV, m.id);
  const isActive = m.id === currentPOV;
  return renderProfileCardHTML(m, rel, { isActive, isHead, onNodeClickName });
}"""

content = content.replace(old_build_node, new_build_node)

with open('js/shared-tree.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Restored buildNodeHTML and removed placeholders.")
