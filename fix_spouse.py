import re

def fix_spouse_logic():
    with open('js/shared-tree.js', 'r', encoding='utf-8') as f:
        content = f.read()

    old_logic = """    if (m.spouse) {
      const sp = getMemberById(m.spouse);
      if (sp && !processed.has(sp.id)) {
        sp.gen = gen;
        network.push(sp);
        processed.add(sp.id);
      }
    }"""
    
    new_logic = """    if (m.spouse) {
      const sp = getMemberById(m.spouse);
      if (sp && !processed.has(sp.id)) {
        sp.gen = gen;
        network.push(sp);
        processed.add(sp.id);
      }
    }
    // Also check reciprocal spouses in case DB link is 1-way
    const reciprocalSpouses = familyMembers.filter(f => f.spouse === m.id);
    reciprocalSpouses.forEach(sp => {
      if (!processed.has(sp.id)) {
        sp.gen = gen;
        network.push(sp);
        processed.add(sp.id);
      }
    });"""

    content = content.replace(old_logic, new_logic)

    with open('js/shared-tree.js', 'w', encoding='utf-8') as f:
        f.write(content)

    print("Fixed spouse logic")

fix_spouse_logic()
