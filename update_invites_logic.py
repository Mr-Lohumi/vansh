import re

with open('js/shared-data.js', 'r', encoding='utf-8') as f:
    content = f.read()

accept_logic = """
  const rel = invite.relationType ? invite.relationType.toLowerCase() : '';
  
  // fromUser = the person who sent the invite
  // toUser = the person receiving the invite
  // rel = what toUser is to fromUser. (e.g. if rel='chacha', toUser is fromUser's Chacha).
  
  // We'll mimic the logic from addFamilyMember but apply it to the existing `toUser` ID instead of a new ID.
  const M = fromUser;
  const newMember = toUser;
  
  const father = getParents(M.id).find(p => p.gender === 'M');
  const mother = getParents(M.id).find(p => p.gender === 'F');

  switch(rel) {
    case 'father':
    case 'mother':
      newMember.gender = rel === 'father' ? 'M' : 'F';
      if (!M.parents) M.parents = [];
      if (!M.parents.includes(newMember.id)) M.parents.push(newMember.id);
      break;
    case 'son':
    case 'daughter':
      newMember.gender = rel === 'son' ? 'M' : 'F';
      if (!newMember.parents) newMember.parents = [];
      if (!newMember.parents.includes(M.id)) newMember.parents.push(M.id);
      break;
    case 'brother':
    case 'sister':
      newMember.gender = rel === 'brother' ? 'M' : 'F';
      if (M.parents) {
        if (!newMember.parents) newMember.parents = [];
        M.parents.forEach(p => { if (!newMember.parents.includes(p)) newMember.parents.push(p); });
      }
      break;
    case 'husband':
    case 'wife':
      newMember.gender = rel === 'husband' ? 'M' : 'F';
      newMember.spouse = M.id;
      M.spouse = newMember.id;
      break;
      
    case 'dada':
    case 'dadi':
      if (father) {
         newMember.gender = rel === 'dada' ? 'M' : 'F';
         if (!father.parents) father.parents = [];
         if (!father.parents.includes(newMember.id)) father.parents.push(newMember.id);
      }
      break;
    case 'nana':
    case 'nani':
      if (mother) {
         newMember.gender = rel === 'nana' ? 'M' : 'F';
         if (!mother.parents) mother.parents = [];
         if (!mother.parents.includes(newMember.id)) mother.parents.push(newMember.id);
      }
      break;
      
    case 'chacha':
    case 'bua':
      if (father) {
        newMember.gender = rel === 'chacha' ? 'M' : 'F';
        if (!newMember.parents) newMember.parents = [];
        if (father.parents) father.parents.forEach(p => { if(!newMember.parents.includes(p)) newMember.parents.push(p); });
      }
      break;
    case 'mama':
    case 'mausi':
      if (mother) {
        newMember.gender = rel === 'mama' ? 'M' : 'F';
        if (!newMember.parents) newMember.parents = [];
        if (mother.parents) mother.parents.forEach(p => { if(!newMember.parents.includes(p)) newMember.parents.push(p); });
      }
      break;
      
    // The complex nested relationships (Chachi, Cousin, etc) are harder to safely map via an invite 
    // because they require selecting the exact Chacha/Bua node. 
    // If we receive an invite for a complex relation, we'll try to find any valid anchor, or fallback.
    
    case 'sasur':
    case 'saas':
      const sp = getSpouse(M.id);
      if (sp) {
        newMember.gender = rel === 'sasur' ? 'M' : 'F';
        if (!sp.parents) sp.parents = [];
        if (!sp.parents.includes(newMember.id)) sp.parents.push(newMember.id);
      }
      break;
      
    case 'saala':
    case 'saali':
    case 'devar_jeth':
    case 'nanad':
      const userSpouse = getSpouse(M.id);
      if (userSpouse) {
        newMember.gender = ['saala','devar_jeth'].includes(rel) ? 'M' : 'F';
        if (!newMember.parents) newMember.parents = [];
        if (userSpouse.parents) userSpouse.parents.forEach(p => { if(!newMember.parents.includes(p)) newMember.parents.push(p); });
      }
      break;
  }
"""

content = re.sub(
    r'const rel = invite\.relationType \? invite\.relationType\.toUpperCase\(\) : \'\';.*?linkSiblings\(fromUser, toUser\);\s*\}',
    accept_logic,
    content,
    flags=re.DOTALL
)

# And similarly for the other place in processCloudInvite if it exists (it seems I duplicated logic before)
content = re.sub(
    r'const rel = invite\.relationType \? invite\.relationType\.toUpperCase\(\) : \'\';.*?linkSiblings\(fromUser, toUser\);\s*\}',
    accept_logic,
    content,
    flags=re.DOTALL
)

with open('js/shared-data.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated acceptInvite logic in shared-data.js!")
