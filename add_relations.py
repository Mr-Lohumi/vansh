import re

with open('js/shared-data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. We need to inject the `checkRelationPrerequisites` function. We can put it right before `addFamilyMember`.
# 2. We rewrite `addFamilyMember`.
# 3. We rewrite `getSmartIndianRelation`.

relations_logic = """
// ── RELATIONSHIP ENGINE HELPERS ──
function getParents(id) {
  const m = getMemberById(id);
  if (!m || !m.parents) return [];
  return m.parents.map(pid => getMemberById(pid)).filter(Boolean);
}
function getSpouse(id) {
  const m = getMemberById(id);
  if (m && m.spouse) return getMemberById(m.spouse);
  // reverse lookup just in case
  return familyMembers.find(f => f.spouse === id) || null;
}
function getChildren(id) {
  return familyMembers.filter(f => f.parents && f.parents.includes(id));
}
function getSiblings(id) {
  const pList = getParents(id);
  if (pList.length === 0) return [];
  const sibs = new Set();
  pList.forEach(p => {
    getChildren(p.id).forEach(c => {
      if (c.id !== id) sibs.add(c);
    });
  });
  return Array.from(sibs);
}

function checkRelationPrerequisites(myId, relation) {
  const M = getMemberById(myId);
  if (!M) return { status: 'ok' };
  
  const pList = getParents(myId);
  const father = pList.find(p => p.gender === 'M');
  const mother = pList.find(p => p.gender === 'F');
  const sp = getSpouse(myId);
  const sibs = getSiblings(myId);
  const children = getChildren(myId);
  
  const Req = (cond, label, quickAdd) => cond ? { status: 'ok' } : { status: 'missing', missingLabel: label, quickAddVal: quickAdd };
  const Ambig = (options, msg) => {
    if (options.length === 0) return { status: 'ok' }; // should be caught by Req
    if (options.length === 1) return { status: 'ok' };
    return { status: 'ambiguous', options: options.map(o => ({id: o.id, label: getFullName(o)})), message: msg };
  };

  switch (relation) {
    case 'dada':
    case 'dadi':
    case 'chacha':
    case 'bua':
      return Req(father, 'Father', 'father');
      
    case 'nana':
    case 'nani':
    case 'mama':
    case 'mausi':
      return Req(mother, 'Mother', 'mother');
      
    case 'chachi': {
      if (!father) return Req(father, 'Father', 'father');
      const chachas = getSiblings(father.id).filter(s => s.gender === 'M');
      if (chachas.length === 0) return Req(false, 'Chacha', 'chacha');
      return Ambig(chachas, "Wife of which Chacha?");
    }
    case 'phupha': {
      if (!father) return Req(father, 'Father', 'father');
      const buas = getSiblings(father.id).filter(s => s.gender === 'F');
      if (buas.length === 0) return Req(false, 'Bua', 'bua');
      return Ambig(buas, "Husband of which Bua?");
    }
    case 'mami': {
      if (!mother) return Req(mother, 'Mother', 'mother');
      const mamas = getSiblings(mother.id).filter(s => s.gender === 'M');
      if (mamas.length === 0) return Req(false, 'Mama', 'mama');
      return Ambig(mamas, "Wife of which Mama?");
    }
    case 'mausa': {
      if (!mother) return Req(mother, 'Mother', 'mother');
      const mausis = getSiblings(mother.id).filter(s => s.gender === 'F');
      if (mausis.length === 0) return Req(false, 'Mausi', 'mausi');
      return Ambig(mausis, "Husband of which Mausi?");
    }
    
    case 'cousin_brother_pat':
    case 'cousin_sister_pat': {
      if (!father) return Req(father, 'Father', 'father');
      const patAuntsUncles = getSiblings(father.id);
      if (patAuntsUncles.length === 0) return Req(false, 'Chacha or Bua', 'chacha');
      return Ambig(patAuntsUncles, "Child of which relative?");
    }
    case 'cousin_brother_mat':
    case 'cousin_sister_mat': {
      if (!mother) return Req(mother, 'Mother', 'mother');
      const matAuntsUncles = getSiblings(mother.id);
      if (matAuntsUncles.length === 0) return Req(false, 'Mama or Mausi', 'mama');
      return Ambig(matAuntsUncles, "Child of which relative?");
    }
    
    case 'bhatija':
    case 'bhatiji': {
      const brothers = sibs.filter(s => s.gender === 'M');
      if (brothers.length === 0) return Req(false, 'Brother', 'brother');
      return Ambig(brothers, "Child of which brother?");
    }
    case 'bhanja':
    case 'bhanji': {
      const sisters = sibs.filter(s => s.gender === 'F');
      if (sisters.length === 0) return Req(false, 'Sister', 'sister');
      return Ambig(sisters, "Child of which sister?");
    }
    
    case 'sasur':
    case 'saas':
    case 'saala':
    case 'saali':
    case 'devar_jeth':
    case 'nanad':
      return Req(sp, 'Spouse', M.gender === 'M' ? 'wife' : 'husband');
      
    case 'bahu': {
      const sons = children.filter(c => c.gender === 'M');
      if (sons.length === 0) return Req(false, 'Son', 'son');
      return Ambig(sons, "Wife of which son?");
    }
    case 'damaad': {
      const daughters = children.filter(c => c.gender === 'F');
      if (daughters.length === 0) return Req(false, 'Daughter', 'daughter');
      return Ambig(daughters, "Husband of which daughter?");
    }
  }
  return { status: 'ok' };
}

// ── AUTO-INFERENCE LOGIC ──
function autoInferEdges(memberId) {
  const m = getMemberById(memberId);
  if (!m) return;
  
  // A) SIBLINGS: ensure all siblings share parents
  if (m.parents && m.parents.length > 0) {
    const sibs = getSiblings(m.id);
    sibs.forEach(s => {
      if (!s.parents) s.parents = [];
      m.parents.forEach(pId => {
        if (!s.parents.includes(pId)) s.parents.push(pId);
      });
    });
  }
  
  // B) PARENTS / CHILDREN: if parent has spouse, link child to spouse too
  if (m.parents && m.parents.length > 0) {
    const pList = getParents(m.id);
    pList.forEach(p => {
      const sp = getSpouse(p.id);
      if (sp && !m.parents.includes(sp.id)) {
        m.parents.push(sp.id);
      }
    });
  }
  
  // C) SPOUSE: if married, ensure both spouses share children
  if (m.spouse) {
    const sp = getSpouse(m.id);
    if (sp) {
      // Ensure mutual spouse link
      if (sp.spouse !== m.id) sp.spouse = m.id;
      
      const myKids = getChildren(m.id);
      const spKids = getChildren(sp.id);
      
      myKids.forEach(k => {
        if (!k.parents) k.parents = [];
        if (!k.parents.includes(sp.id)) k.parents.push(sp.id);
      });
      spKids.forEach(k => {
        if (!k.parents) k.parents = [];
        if (!k.parents.includes(m.id)) k.parents.push(m.id);
      });
    }
  }
}

// Run inference on entire network (for legacy data fix)
function runRelationshipInference() {
  if (localStorage.getItem('vansh_inference_v1')) return;
  let changed = false;
  
  familyMembers.forEach(m => {
    const beforeStr = JSON.stringify({p: m.parents, s: m.spouse});
    autoInferEdges(m.id);
    const afterStr = JSON.stringify({p: m.parents, s: m.spouse});
    if (beforeStr !== afterStr) changed = true;
  });
  
  if (changed) {
    saveFamilyData(familyMembers);
    if (typeof showToast === 'function') {
      showToast('Network Updated', 'We automatically inferred and linked missing family edges in your tree!', 'ok');
    }
  }
  localStorage.setItem('vansh_inference_v1', 'done');
}
setTimeout(runRelationshipInference, 1000);

function addFamilyMember(memberData) {
  const nextId = 'P' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
  const rel = memberData.relation;
  const relatedTo = memberData.relatedTo; // Usually current user's ID
  
  let newMember = {
    id: nextId,
    verified: false,
    parents: [],
    ...memberData
  };
  delete newMember.relation;
  delete newMember.relatedTo;

  const M = getMemberById(relatedTo);
  if (!M) {
    familyMembers.push(newMember);
    saveFamilyData(familyMembers);
    return newMember;
  }
  
  const father = getParents(M.id).find(p => p.gender === 'M');
  const mother = getParents(M.id).find(p => p.gender === 'F');
  
  // ATOMIC EDGE ASSIGNMENT based on relationship requested
  switch(rel) {
    case 'father':
    case 'mother':
      newMember.gender = rel === 'father' ? 'M' : 'F';
      if (!M.parents) M.parents = [];
      M.parents.push(newMember.id);
      break;
    case 'son':
    case 'daughter':
      newMember.gender = rel === 'son' ? 'M' : 'F';
      newMember.parents.push(M.id);
      break;
    case 'brother':
    case 'sister':
      newMember.gender = rel === 'brother' ? 'M' : 'F';
      if (M.parents) newMember.parents = [...M.parents];
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
         father.parents.push(newMember.id);
      }
      break;
    case 'nana':
    case 'nani':
      if (mother) {
         newMember.gender = rel === 'nana' ? 'M' : 'F';
         if (!mother.parents) mother.parents = [];
         mother.parents.push(newMember.id);
      }
      break;
      
    case 'chacha':
    case 'bua':
      if (father) {
        newMember.gender = rel === 'chacha' ? 'M' : 'F';
        if (father.parents) newMember.parents = [...father.parents];
      }
      break;
    case 'mama':
    case 'mausi':
      if (mother) {
        newMember.gender = rel === 'mama' ? 'M' : 'F';
        if (mother.parents) newMember.parents = [...mother.parents];
      }
      break;
      
    case 'chachi':
    case 'phupha':
    case 'mami':
    case 'mausa':
    case 'bahu':
    case 'damaad':
      // The `relatedTo` is actually the Chacha/Bua/Son etc. (if ambiguous, handled via checkRelationPrerequisites logic mapping it to relatedTo? Wait, the UI sets relatedTo to the ambiguous selection!)
      // Wait, the UI logic in `onRelationChange` sets the dropdown, but `submitAddMember` uses `addAmbiguousSelection.value`!
      const targetM = getMemberById(relatedTo) || M;
      newMember.gender = ['chachi','mami','bahu'].includes(rel) ? 'F' : 'M';
      newMember.spouse = targetM.id;
      targetM.spouse = newMember.id;
      break;
      
    case 'cousin_brother_pat':
    case 'cousin_sister_pat':
    case 'cousin_brother_mat':
    case 'cousin_sister_mat':
    case 'bhatija':
    case 'bhatiji':
    case 'bhanja':
    case 'bhanji': {
      const parentOfNew = getMemberById(relatedTo); // The Chacha/Bua/Brother/Sister
      if (parentOfNew) {
        newMember.gender = ['cousin_brother_pat','cousin_brother_mat','bhatija','bhanja'].includes(rel) ? 'M' : 'F';
        newMember.parents.push(parentOfNew.id);
      }
      break;
    }
    case 'sasur':
    case 'saas':
      const sp = getSpouse(M.id);
      if (sp) {
        newMember.gender = rel === 'sasur' ? 'M' : 'F';
        if (!sp.parents) sp.parents = [];
        sp.parents.push(newMember.id);
      }
      break;
    case 'saala':
    case 'saali':
    case 'devar_jeth':
    case 'nanad':
      const userSpouse = getSpouse(M.id);
      if (userSpouse) {
        newMember.gender = ['saala','devar_jeth'].includes(rel) ? 'M' : 'F';
        if (userSpouse.parents) newMember.parents = [...userSpouse.parents];
      }
      break;
  }

  // Derive Gen
  let gen = 2;
  if (newMember.parents.length > 0) {
    const p = getMemberById(newMember.parents[0]);
    if (p) gen = p.gen + 1;
  } else if (newMember.spouse) {
    const s = getMemberById(newMember.spouse);
    if(s) gen = s.gen;
  } else if (newMember.id !== M.id) {
    // Attempt fallback from M's gen based on relation
    const olderGens = ['father','mother','dada','dadi','nana','nani','chacha','bua','mama','mausi','sasur','saas'];
    const sameGens = ['brother','sister','husband','wife','chachi','phupha','mami','mausa','cousin_brother_pat','cousin_sister_pat','cousin_brother_mat','cousin_sister_mat','saala','saali','devar_jeth','nanad'];
    const youngerGens = ['son','daughter','bhatija','bhatiji','bhanja','bhanji','bahu','damaad'];
    if (olderGens.includes(rel)) gen = M.gen - 1;
    else if (sameGens.includes(rel)) gen = M.gen;
    else if (youngerGens.includes(rel)) gen = M.gen + 1;
  }
  newMember.gen = gen;

  familyMembers.push(newMember);
  saveFamilyData(familyMembers);
  
  // Trigger Auto-Inference for everything modified
  autoInferEdges(newMember.id);
  if (newMember.parents) newMember.parents.forEach(pid => autoInferEdges(pid));
  if (newMember.spouse) autoInferEdges(newMember.spouse);
  if (M && M.id !== newMember.id) autoInferEdges(M.id);
  
  saveFamilyData(familyMembers);
  if (typeof syncMemberToCloud === 'function') syncMemberToCloud(newMember);
  
  return newMember;
}
"""

get_relation_logic = """
function getSmartIndianRelation(allMembers, activeNodeId, targetNodeId) {
  if (activeNodeId === targetNodeId) return { hindi:'स्वयं', latin:'Swayam', english:'Self', category:'self', badge:'badge-self' };
  const M = new Map(); allMembers.forEach(m => M.set(m.id, m));
  const A = M.get(activeNodeId), B = M.get(targetNodeId);
  if (!A || !B) return null;

  const parents  = id => (M.get(id)?.parents || []).filter(p => M.has(p));
  const spouse   = id => { const m = M.get(id); if (m?.spouse && M.has(m.spouse)) return m.spouse; for (const [k,v] of M) { if (v.spouse === id) return k; } return null; };
  const children = id => allMembers.filter(m => m.parents && m.parents.includes(id)).map(m => m.id);
  const siblings = id => { const s = new Set(); for (const p of parents(id)) children(p).forEach(c => { if (c !== id) s.add(c); }); return [...s]; };
  
  const R = (h, l, e, c, b) => ({ hindi:h, latin:l, english:e, category:c, badge: b || 'badge-parent' });
  const bg = B.gender;

  // Direct paths
  const pA = parents(activeNodeId);
  if (pA.includes(targetNodeId)) return bg === 'M' ? R('पिताजी','Pitaji','Father','parent','badge-parent') : R('माताजी','Mataji','Mother','parent','badge-maternal');
  
  const cA = children(activeNodeId);
  if (cA.includes(targetNodeId)) return bg === 'M' ? R('बेटा','Beta','Son','child','badge-child') : R('बेटी','Beti','Daughter','child','badge-child');
  
  const sA = spouse(activeNodeId);
  if (sA === targetNodeId) return bg === 'M' ? R('पति','Pati','Husband','spouse','badge-spouse') : R('पत्नी','Patni','Wife','spouse','badge-spouse');
  
  const sibA = siblings(activeNodeId);
  if (sibA.includes(targetNodeId)) return bg === 'M' ? R('भाई','Bhai','Brother','sibling','badge-sibling') : R('बहन','Behen','Sister','sibling','badge-sibling');

  const fatherId = pA.find(p => M.get(p).gender === 'M');
  const motherId = pA.find(p => M.get(p).gender === 'F');
  
  // Grandparents
  if (fatherId && parents(fatherId).includes(targetNodeId)) return bg === 'M' ? R('दादा','Dada','Grandfather','parent','badge-parent') : R('दादी','Dadi','Grandmother','parent','badge-parent');
  if (motherId && parents(motherId).includes(targetNodeId)) return bg === 'M' ? R('नाना','Nana','Grandfather (M)','parent','badge-maternal') : R('नानी','Nani','Grandmother (M)','parent','badge-maternal');
  
  // Aunts & Uncles (Paternal)
  if (fatherId) {
     const fSibs = siblings(fatherId);
     if (fSibs.includes(targetNodeId)) return bg === 'M' ? R('चाचा/ताऊ','Chacha','Paternal Uncle','parent','badge-parent') : R('बुआ','Bua','Paternal Aunt','parent','badge-parent');
     // Chachi & Phupha
     const sp = spouse(targetNodeId);
     if (sp && fSibs.includes(sp)) return bg === 'M' ? R('फूफा','Phupha','Uncle (Bua\\'s Husband)','parent','badge-parent') : R('चाची/ताई','Chachi','Aunt (Chacha\\'s Wife)','parent','badge-parent');
     
     // Pat Cousins
     for (const fSib of fSibs) {
       if (children(fSib).includes(targetNodeId)) return bg === 'M' ? R('चचेरा भाई','Cousin Brother','Paternal Cousin','sibling','badge-sibling') : R('चचेरी बहन','Cousin Sister','Paternal Cousin','sibling','badge-sibling');
     }
  }
  
  // Aunts & Uncles (Maternal)
  if (motherId) {
     const mSibs = siblings(motherId);
     if (mSibs.includes(targetNodeId)) return bg === 'M' ? R('मामा','Mama','Maternal Uncle','parent','badge-maternal') : R('मौसी','Mausi','Maternal Aunt','parent','badge-maternal');
     // Mami & Mausa
     const sp = spouse(targetNodeId);
     if (sp && mSibs.includes(sp)) return bg === 'M' ? R('मौसा','Mausa','Uncle (Mausi\\'s Husband)','parent','badge-maternal') : R('मामी','Mami','Aunt (Mama\\'s Wife)','parent','badge-maternal');
     
     // Mat Cousins
     for (const mSib of mSibs) {
       if (children(mSib).includes(targetNodeId)) return bg === 'M' ? R('ममेरा भाई','Cousin Brother','Maternal Cousin','sibling','badge-sibling') : R('मौसेरी बहन','Cousin Sister','Maternal Cousin','sibling','badge-sibling');
     }
  }
  
  // Nieces & Nephews
  for (const sib of sibA) {
    if (children(sib).includes(targetNodeId)) {
       const sibGender = M.get(sib).gender;
       if (sibGender === 'M') return bg === 'M' ? R('भतीजा','Bhatija','Nephew','child','badge-child') : R('भतीजी','Bhatiji','Niece','child','badge-child');
       if (sibGender === 'F') return bg === 'M' ? R('भांजा','Bhanja','Nephew','child','badge-child') : R('भांजी','Bhanji','Niece','child','badge-child');
    }
    // Sister-in-law (Bhabhi) / Brother-in-law (Jija)
    const sp = spouse(sib);
    if (sp === targetNodeId) {
       const sibGender = M.get(sib).gender;
       if (sibGender === 'M') return R('भाभी','Bhabhi','Sister-in-law','sibling','badge-sibling');
       if (sibGender === 'F') return R('जीजा','Jija','Brother-in-law','sibling','badge-sibling');
    }
  }

  // In-laws
  if (sA) {
     const pSA = parents(sA);
     if (pSA.includes(targetNodeId)) return bg === 'M' ? R('ससुर','Sasur','Father-in-law','parent','badge-parent') : R('सास','Saas','Mother-in-law','parent','badge-parent');
     
     const sibSA = siblings(sA);
     if (sibSA.includes(targetNodeId)) {
        if (A.gender === 'M') return bg === 'M' ? R('साला','Saala','Brother-in-law','sibling','badge-sibling') : R('साली','Saali','Sister-in-law','sibling','badge-sibling');
        if (A.gender === 'F') return bg === 'M' ? R('देवर/जेठ','Devar/Jeth','Brother-in-law','sibling','badge-sibling') : R('ननद','Nanad','Sister-in-law','sibling','badge-sibling');
     }
  }
  
  // Son-in-law / Daughter-in-law
  for (const c of cA) {
     const sp = spouse(c);
     if (sp === targetNodeId) {
        const cGender = M.get(c).gender;
        if (cGender === 'M') return R('बहू','Bahu','Daughter-in-law','child','badge-child');
        if (cGender === 'F') return R('दामाद','Damaad','Son-in-law','child','badge-child');
     }
  }

  return R('रिश्तेदार','Rishtedar','Relative','self','badge-self');
}
"""

# Replace `function addFamilyMember(memberData) { ... }` block
# Notice that `function updateFamilyMember` follows `addFamilyMember`.
content = re.sub(
    r'function addFamilyMember\(memberData\) \{.*?return newMember;\s*\}', 
    relations_logic, 
    content, 
    flags=re.DOTALL
)

# Replace `function getSmartIndianRelation`
content = re.sub(
    r'function getSmartIndianRelation\(allMembers, activeNodeId, targetNodeId\) \{.*?(?=\n\n|\nfunction|$)',
    get_relation_logic,
    content,
    flags=re.DOTALL
)

# Let's ensure the substitution for `getSmartIndianRelation` actually ended right.
# Often `getSmartIndianRelation` is at the end of the file or followed by another function.
# I'll just rewrite the file.

with open('js/shared-data.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated shared-data.js")
