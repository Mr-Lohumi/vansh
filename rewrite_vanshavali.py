import re

def rewrite_shared_tree():
    with open('js/shared-tree.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace getBloodlineNetwork completely
    old_network = re.search(r'function getBloodlineNetwork\(currentPOV\) \{.*?return network;\n\}', content, re.DOTALL)
    if not old_network:
        print("Could not find getBloodlineNetwork")
        return

    new_network = """function findRootAncestor(startId) {
  let curr = getMemberById(startId);
  if (!curr) return null;
  let visited = new Set();
  
  while (curr && curr.parents && curr.parents.length > 0) {
    if (visited.has(curr.id)) break;
    visited.add(curr.id);
    let parentNode = curr.parents.map(id => getMemberById(id)).find(p => p && p.gender === 'M');
    if (!parentNode) {
      parentNode = getMemberById(curr.parents[0]);
    }
    if (parentNode) {
      curr = parentNode;
    } else {
      break;
    }
  }
  return curr;
}

function getBloodlineNetwork(currentPOV) {
  const root = findRootAncestor(currentPOV);
  if (!root) return [];
  
  const queue = [{ id: root.id, gen: 1 }];
  const processed = new Set();
  let network = [];
  
  while (queue.length > 0) {
    const { id, gen } = queue.shift();
    if (processed.has(id)) continue;
    processed.add(id);
    
    const m = getMemberById(id);
    if (!m) continue;
    
    m.gen = gen;
    network.push(m);
    
    if (m.spouse) {
      const sp = getMemberById(m.spouse);
      if (sp && !processed.has(sp.id)) {
        sp.gen = gen;
        network.push(sp);
        processed.add(sp.id);
      }
    }
    
    const children = familyMembers.filter(child => {
       if (!child.parents) return false;
       return child.parents.includes(m.id) || (m.spouse && child.parents.includes(m.spouse));
    });
    
    children.forEach(c => {
       if (!processed.has(c.id)) {
          queue.push({ id: c.id, gen: gen + 1 });
       }
    });
  }
  return network;
}"""

    content = content.replace(old_network.group(0), new_network)
    
    with open('js/shared-tree.js', 'w', encoding='utf-8') as f:
        f.write(content)

    print("Rewrote Vanshavali tree logic.")

rewrite_shared_tree()
