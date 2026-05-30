import re

def rewrite_relation_logic():
    with open('js/shared-data.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_func = """function getSmartIndianRelation(allMembers, activeNodeId, targetNodeId) {
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
  if (pA.includes(targetNodeId)) return bg === 'M' ? R('पिताजी','Pitaji','Father','parent','badge-parent') : (bg === 'F' ? R('माताजी','Mataji','Mother','parent','badge-maternal') : R('माता-पिता','Parent','Parent','parent','badge-parent'));
  
  const cA = children(activeNodeId);
  if (cA.includes(targetNodeId)) return bg === 'M' ? R('बेटा','Beta','Son','child','badge-child') : (bg === 'F' ? R('बेटी','Beti','Daughter','child','badge-child') : R('बच्चा','Child','Child','child','badge-child'));
  
  const sA = spouse(activeNodeId);
  if (sA === targetNodeId) return bg === 'M' ? R('पति','Pati','Husband','spouse','badge-spouse') : (bg === 'F' ? R('पत्नी','Patni','Wife','spouse','badge-spouse') : R('जीवनसाथी','Spouse','Spouse','spouse','badge-spouse'));
  
  const sibA = siblings(activeNodeId);
  if (sibA.includes(targetNodeId)) return bg === 'M' ? R('भाई','Bhai','Brother','sibling','badge-sibling') : (bg === 'F' ? R('बहन','Behen','Sister','sibling','badge-sibling') : R('सहोदर','Sibling','Sibling','sibling','badge-sibling'));

  const fatherId = pA.find(p => M.get(p).gender === 'M');
  const motherId = pA.find(p => M.get(p).gender === 'F');
  
  // Grandparents
  if (fatherId && parents(fatherId).includes(targetNodeId)) return bg === 'M' ? R('दादा','Dada','Grandfather','parent','badge-parent') : (bg === 'F' ? R('दादी','Dadi','Grandmother','parent','badge-parent') : R('Grandparent','Grandparent','Grandparent','parent','badge-parent'));
  if (motherId && parents(motherId).includes(targetNodeId)) return bg === 'M' ? R('नाना','Nana','Grandfather (M)','parent','badge-maternal') : (bg === 'F' ? R('नानी','Nani','Grandmother (M)','parent','badge-maternal') : R('Grandparent','Grandparent','Grandparent','parent','badge-maternal'));
  
  // Aunts & Uncles (Paternal)
  if (fatherId) {
     const fSibs = siblings(fatherId);
     if (fSibs.includes(targetNodeId)) return bg === 'M' ? R('चाचा/ताऊ','Chacha','Paternal Uncle','parent','badge-parent') : (bg === 'F' ? R('बुआ','Bua','Paternal Aunt','parent','badge-parent') : R('Relative','Relative','Relative','parent','badge-parent'));
     
     // Chachi & Phupha
     for (const fSib of fSibs) {
       const sp = spouse(fSib);
       if (sp === targetNodeId) {
         if (M.get(fSib).gender === 'M' && bg === 'F') return R('चाची/ताई','Chachi','Aunt (Chacha\\'s Wife)','parent','badge-parent');
         if (M.get(fSib).gender === 'F' && bg === 'M') return R('फूफा','Phupha','Uncle (Bua\\'s Husband)','parent','badge-parent');
       }
       if (children(fSib).includes(targetNodeId)) return bg === 'M' ? R('चचेरा भाई','Cousin Brother','Paternal Cousin','sibling','badge-sibling') : (bg === 'F' ? R('चचेरी बहन','Cousin Sister','Paternal Cousin','sibling','badge-sibling') : R('Cousin','Cousin','Cousin','sibling','badge-sibling'));
     }
  }
  
  // Aunts & Uncles (Maternal)
  if (motherId) {
     const mSibs = siblings(motherId);
     if (mSibs.includes(targetNodeId)) return bg === 'M' ? R('मामा','Mama','Maternal Uncle','parent','badge-maternal') : (bg === 'F' ? R('मौसी','Mausi','Maternal Aunt','parent','badge-maternal') : R('Relative','Relative','Relative','parent','badge-maternal'));
     
     // Mami & Mausa
     for (const mSib of mSibs) {
       const sp = spouse(mSib);
       if (sp === targetNodeId) {
         if (M.get(mSib).gender === 'F' && bg === 'M') return R('मौसा','Mausa','Uncle (Mausi\\'s Husband)','parent','badge-maternal');
         if (M.get(mSib).gender === 'M' && bg === 'F') return R('मामी','Mami','Aunt (Mama\\'s Wife)','parent','badge-maternal');
       }
       if (children(mSib).includes(targetNodeId)) return bg === 'M' ? R('ममेरा भाई','Cousin Brother','Maternal Cousin','sibling','badge-sibling') : (bg === 'F' ? R('मौसेरी बहन','Cousin Sister','Maternal Cousin','sibling','badge-sibling') : R('Cousin','Cousin','Cousin','sibling','badge-sibling'));
     }
  }
  
  // Nieces & Nephews
  for (const sib of sibA) {
    if (children(sib).includes(targetNodeId)) {
       const sibGender = M.get(sib).gender;
       if (sibGender === 'M') return bg === 'M' ? R('भतीजा','Bhatija','Nephew','child','badge-child') : (bg === 'F' ? R('भतीजी','Bhatiji','Niece','child','badge-child') : R('Niece/Nephew','Niece/Nephew','Niece/Nephew','child','badge-child'));
       if (sibGender === 'F') return bg === 'M' ? R('भांजा','Bhanja','Nephew','child','badge-child') : (bg === 'F' ? R('भांजी','Bhanji','Niece','child','badge-child') : R('Niece/Nephew','Niece/Nephew','Niece/Nephew','child','badge-child'));
    }
    // Sister-in-law (Bhabhi) / Brother-in-law (Jija)
    const sp = spouse(sib);
    if (sp === targetNodeId) {
       const sibGender = M.get(sib).gender;
       if (sibGender === 'M' && bg === 'F') return R('भाभी','Bhabhi','Sister-in-law','sibling','badge-sibling');
       if (sibGender === 'F' && bg === 'M') return R('जीजा','Jija','Brother-in-law','sibling','badge-sibling');
    }
  }

  // In-laws
  if (sA) {
     const pSA = parents(sA);
     if (pSA.includes(targetNodeId)) return bg === 'M' ? R('ससुर','Sasur','Father-in-law','parent','badge-parent') : (bg === 'F' ? R('सास','Saas','Mother-in-law','parent','badge-parent') : R('Parent-in-law','Parent-in-law','Parent-in-law','parent','badge-parent'));
     
     const sibSA = siblings(sA);
     if (sibSA.includes(targetNodeId)) {
        if (A.gender === 'M') {
           return bg === 'M' ? R('साला','Saala','Brother-in-law','sibling','badge-sibling') : (bg === 'F' ? R('साली','Saali','Sister-in-law','sibling','badge-sibling') : R('In-law','In-law','Sibling-in-law','sibling','badge-sibling'));
        }
        if (A.gender === 'F') {
           if (bg === 'M') {
             const hAge = M.get(sA).age || 0;
             const bAge = B.age || 0;
             return (bAge > hAge) ? R('जेठ','Jeth','Brother-in-law','sibling','badge-sibling') : R('देवर','Devar','Brother-in-law','sibling','badge-sibling');
           }
           if (bg === 'F') return R('ननद','Nanad','Sister-in-law','sibling','badge-sibling');
           return R('In-law','In-law','Sibling-in-law','sibling','badge-sibling');
        }
     }
  }
  
  // Son-in-law / Daughter-in-law
  for (const c of cA) {
     const sp = spouse(c);
     if (sp === targetNodeId) {
        const cGender = M.get(c).gender;
        if (cGender === 'M' && bg === 'F') return R('बहू','Bahu','Daughter-in-law','child','badge-child');
        if (cGender === 'F' && bg === 'M') return R('दामाद','Damaad','Son-in-law','child','badge-child');
     }
  }

  return R('रिश्तेदार','Rishtedar','Relative','self','badge-self');
}"""
    
    content = re.sub(r'function getSmartIndianRelation\(allMembers, activeNodeId, targetNodeId\) \{.*?return R\(\'रिश्तेदार\',\'Rishtedar\',\'Relative\',\'self\',\'badge-self\'\);\n\}', new_func, content, flags=re.DOTALL)
    
    with open('js/shared-data.js', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Rewrote getSmartIndianRelation successfully")

rewrite_relation_logic()
