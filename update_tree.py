import re

with open('js/shared-tree.js', 'r', encoding='utf-8') as f:
    content = f.read()

placeholder_logic = """
function buildPlaceholderHTML(label, relationVal, parentOrRelatedToId) {
  return `
    <div class="child-card placeholder-node" style="cursor:pointer;" onclick="openAddModalWithPreselect('${relationVal}', '${parentOrRelatedToId}')">
      <div class="child-inner" style="border: 2px dashed rgba(212,175,55,0.4); background: rgba(0,0,0,0.2); box-shadow:none; padding:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:80px; transition:all 0.2s;" onmouseover="this.style.borderColor='rgba(212,175,55,0.9)'; this.style.boxShadow='0 0 15px rgba(212,175,55,0.2)';" onmouseout="this.style.borderColor='rgba(212,175,55,0.4)'; this.style.boxShadow='none';">
        <div style="font-size:24px; color:rgba(212,175,55,0.6); margin-bottom:4px;">+</div>
        <div style="font-family:'Cinzel', serif; font-size:11px; font-weight:600; color:var(--gold-bright); text-align:center; text-transform:uppercase; letter-spacing:1px;">Add ${label}</div>
      </div>
    </div>
  `;
}

function getPlaceholdersForNode(m, relStr, currentPOV) {
  let html = '';
  // Map standard labels to placeholder logic
  switch(relStr) {
    case 'Pitaji': // Father
      html += buildPlaceholderHTML('Dada', 'dada', m.id);
      html += buildPlaceholderHTML('Dadi', 'dadi', m.id);
      html += buildPlaceholderHTML('Chacha', 'chacha', m.id);
      html += buildPlaceholderHTML('Bua', 'bua', m.id);
      break;
    case 'Mataji': // Mother
      html += buildPlaceholderHTML('Nana', 'nana', m.id);
      html += buildPlaceholderHTML('Nani', 'nani', m.id);
      html += buildPlaceholderHTML('Mama', 'mama', m.id);
      html += buildPlaceholderHTML('Mausi', 'mausi', m.id);
      break;
    case 'Chacha':
    case 'Mama':
      if (relStr === 'Chacha') html += buildPlaceholderHTML('Chachi', 'chachi', m.id);
      if (relStr === 'Mama') html += buildPlaceholderHTML('Mami', 'mami', m.id);
      html += buildPlaceholderHTML('Cousin', (relStr==='Chacha'?'cousin_brother_pat':'cousin_brother_mat'), m.id);
      break;
    case 'Bua':
    case 'Mausi':
      if (relStr === 'Bua') html += buildPlaceholderHTML('Phupha', 'phupha', m.id);
      if (relStr === 'Mausi') html += buildPlaceholderHTML('Mausa', 'mausa', m.id);
      html += buildPlaceholderHTML('Cousin', (relStr==='Bua'?'cousin_brother_pat':'cousin_brother_mat'), m.id);
      break;
    case 'Bhai':
    case 'Bhaiya': // Brother
      html += buildPlaceholderHTML('Bhatija', 'bhatija', m.id);
      html += buildPlaceholderHTML('Bhatiji', 'bhatiji', m.id);
      break;
    case 'Behen':
    case 'Didi': // Sister
      html += buildPlaceholderHTML('Bhanja', 'bhanja', m.id);
      html += buildPlaceholderHTML('Bhanji', 'bhanji', m.id);
      break;
    case 'Pati':
    case 'Patni': // Spouse
      html += buildPlaceholderHTML('Sasur', 'sasur', m.id);
      html += buildPlaceholderHTML('Saas', 'saas', m.id);
      html += buildPlaceholderHTML(m.gender==='M'?'Devar/Jeth':'Saala', m.gender==='M'?'devar_jeth':'saala', m.id);
      html += buildPlaceholderHTML(m.gender==='M'?'Nanad':'Saali', m.gender==='M'?'nanad':'saali', m.id);
      break;
    case 'Beta': // Son
      html += buildPlaceholderHTML('Bahu', 'bahu', m.id);
      break;
    case 'Beti': // Daughter
      html += buildPlaceholderHTML('Damaad', 'damaad', m.id);
      break;
    case 'Swayam': // Self
      // Optional: Add slots for direct family? Not strictly requested by prompt for self, mostly for existing nodes.
      break;
  }
  return html;
}
"""

content = content.replace("function buildNodeHTML(m, currentPOV, onNodeClickName, isHead = false) {", placeholder_logic + "\nfunction buildNodeHTML(m, currentPOV, onNodeClickName, isHead = false) {")

build_node = r"""function buildNodeHTML(m, currentPOV, onNodeClickName, isHead = false) {
  if (!m) return '';
  const rel = getSmartIndianRelation(familyMembers, currentPOV, m.id);
  const isActive = m.id === currentPOV;
  return renderProfileCardHTML(m, rel, { isActive, isHead, onNodeClickName });
}"""

new_build_node = r"""function buildNodeHTML(m, currentPOV, onNodeClickName, isHead = false) {
  if (!m) return '';
  const rel = getSmartIndianRelation(familyMembers, currentPOV, m.id);
  const isActive = m.id === currentPOV;
  let html = renderProfileCardHTML(m, rel, { isActive, isHead, onNodeClickName });
  if (rel) {
     html += getPlaceholdersForNode(m, rel.latin, currentPOV);
  }
  return html;
}"""

content = content.replace(build_node, new_build_node)

with open('js/shared-tree.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated shared-tree.js with placeholders!")
