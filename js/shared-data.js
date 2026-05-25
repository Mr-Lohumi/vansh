/* ═══════════════════════════════════════════════════════════════
   VANSH (वंश) — Shared Data Layer + Relationship Engine (Ivory Pivot)
   ═══════════════════════════════════════════════════════════════ */

const FAMILY_DATA_KEY = 'vansh_family_data_v2';

function loadFamilyData() {
  try {
    const saved = localStorage.getItem(FAMILY_DATA_KEY);
    if (saved) return JSON.parse(saved);
  } catch(e) {}
  return [];
}
function saveFamilyData(members) {
  try { localStorage.setItem(FAMILY_DATA_KEY, JSON.stringify(members)); } catch(e) {}
}

let familyMembers = loadFamilyData();

function getMemberById(id) { return familyMembers.find(m => m.id === id) || null; }
function getFullName(m) { return `${m.firstName} ${m.lastName}`; }
function getInitials(m) { return (m.firstName[0] || '') + (m.lastName[0] || ''); }
function getCasteLine(m) { return `${m.caste}${m.subCaste ? ' (' + m.subCaste + ')' : ''}`; }
function getVerifiedMembers() { return familyMembers.filter(m => m.verified); }

function getAvatarStyle(m) {
  if (m.imageUrl) {
    return `background-image: url('${m.imageUrl}'); color: transparent;`;
  }
  return `background-color: var(--bg-hover); color: var(--gold); border-color: var(--border);`;
}

function addFamilyMember(memberData) {
  const maxId = familyMembers.reduce((max, m) => {
    const n = parseInt(m.id.replace('P', ''));
    return n > max ? n : max;
  }, 0);
  
  let gen = 2;
  if (memberData.parents && memberData.parents.length > 0) {
    const p = getMemberById(memberData.parents[0]);
    if (p) gen = p.gen + 1;
  }
  if (memberData.spouse) {
    const s = getMemberById(memberData.spouse);
    if(s) gen = s.gen;
  }

  const newMember = {
    id: 'P' + (maxId + 1),
    verified: false,
    gen: gen,
    ...memberData
  };
  
  if (newMember.spouse) {
    const s = getMemberById(newMember.spouse);
    if(s) s.spouse = newMember.id;
  }

  familyMembers.push(newMember);
  saveFamilyData(familyMembers);
  return newMember;
}

function updateFamilyMember(id, updates) {
  const idx = familyMembers.findIndex(m => m.id === id);
  if (idx !== -1) {
    familyMembers[idx] = { ...familyMembers[idx], ...updates };
    saveFamilyData(familyMembers);
  }
}

// ── MATCHMAKING DB ──
const MATCHMAKING_DB = [
  { id: "M1", firstName: "Simran", lastName: "Verma", age: 21, caste: "Brahmin", gotra: "Vatsa", nativePlace: "Delhi", education: "M.Sc Economics", verified: 98, gender: "F", imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80" },
  { id: "M2", firstName: "Sneha", lastName: "Iyer", age: 22, caste: "Iyer", gotra: "Bharadwaj", nativePlace: "Mumbai", education: "B.Tech CS", verified: 95, gender: "F", imageUrl: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&q=80" },
  { id: "M3", firstName: "Ananya", lastName: "Joshi", age: 21, caste: "Brahmin", gotra: "Sandilya", nativePlace: "Pune", education: "MBA Finance", verified: 97, gender: "F", imageUrl: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&q=80" },
  { id: "M4", firstName: "Ritu", lastName: "Gupta", age: 23, caste: "Agarwal", gotra: "Gautam", nativePlace: "Jaipur", education: "B.Com", verified: 92, gender: "F", imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80" },
  { id: "M5", firstName: "Kavya", lastName: "Pandey", age: 22, caste: "Brahmin", gotra: "Kashyap", nativePlace: "Lucknow", education: "B.A.", verified: 90, gender: "F", imageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?w=400&q=80" },
  { id: "M6", firstName: "Rohan", lastName: "Mishra", age: 26, caste: "Brahmin", gotra: "Vatsa", nativePlace: "Kanpur", education: "CA", verified: 96, gender: "M", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80" },
  { id: "M7", firstName: "Aditya", lastName: "Sharma", age: 27, caste: "Brahmin", gotra: "Kashyap", nativePlace: "Delhi", education: "M.Tech", verified: 93, gender: "M", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80" }
];

// Relationship engine
function getSmartIndianRelation(allMembers, activeNodeId, targetNodeId) {
  if (activeNodeId === targetNodeId) return { hindi:'स्वयं', latin:'Swayam', english:'Self', category:'self', badge:'badge-self' };
  const M = new Map(); allMembers.forEach(m => M.set(m.id, m));
  const self = M.get(activeNodeId), other = M.get(targetNodeId);
  if (!self || !other) return null;

  const parents  = id => (M.get(id)?.parents || []).filter(p => M.has(p));
  const spouse   = id => { const m = M.get(id); if (m?.spouse && M.has(m.spouse)) return m.spouse; for (const [k,v] of M) { if (v.spouse === id) return k; } return null; };
  const children = id => allMembers.filter(m => m.parents && m.parents.includes(id)).map(m => m.id);
  const siblings = id => { const s = new Set(); for (const p of parents(id)) children(p).forEach(c => { if (c !== id) s.add(c); }); return [...s]; };

  const A = activeNodeId, B = targetNodeId;
  const ag = self.gender, bg = other.gender;
  const aAge = self.age, bAge = other.age;
  const R = (h, l, e, c, b) => ({ hindi:h, latin:l, english:e, category:c, badge: b || 'badge-parent' });

  if (parents(A).includes(B)) return bg === 'M' ? R('पिताजी','Pitaji','Father','parent','badge-parent') : R('माताजी','Mataji','Mother','parent','badge-maternal');
  if (parents(B).includes(A)) return bg === 'M' ? R('बेटा','Beta','Son','child','badge-child') : R('बेटी','Beti','Daughter','child','badge-child');
  if (spouse(A) === B) return bg === 'M' ? R('पति','Pati','Husband','spouse','badge-spouse') : R('पत्नी','Patni','Wife','spouse','badge-spouse');
  if (siblings(A).includes(B)) {
    if (bg === 'M') return bAge >= aAge ? R('भैया','Bhaiya','Elder Brother','sibling','badge-sibling') : R('भाई','Bhai','Younger Brother','sibling','badge-sibling');
    return bAge >= aAge ? R('दीदी','Didi','Elder Sister','sibling','badge-sibling') : R('बहन','Behen','Younger Sister','sibling','badge-sibling');
  }
  
  for (const pid of parents(A)) {
    if (parents(pid).includes(B)) {
      const via = M.get(pid);
      if (via?.gender === 'M') return bg === 'M' ? R('दादाजी','Dadaji','Paternal Grandfather','grand','badge-grand') : R('दादीजी','Dadiji','Paternal Grandmother','grand','badge-grand');
      return bg === 'M' ? R('नानाजी','Nanaji','Maternal Grandfather','grand','badge-grand') : R('नानीजी','Naniji','Maternal Grandmother','grand','badge-grand');
    }
  }
  
  for (const cid of children(A)) {
    if (children(cid).includes(B)) {
      const via = M.get(cid);
      if (via?.gender === 'M') return bg === 'M' ? R('पोता','Pota',"Grandson (Son's)",'grand','badge-grand') : R('पोती','Poti',"Granddaughter (Son's)",'grand','badge-grand');
      return bg === 'M' ? R('नाती','Nati',"Grandson (Daughter's)",'grand','badge-grand') : R('नातिन','Natin',"Granddaughter (Daughter's)",'grand','badge-grand');
    }
  }
  
  for (const pid of parents(A)) {
    const par = M.get(pid);
    if (siblings(pid).includes(B)) {
      if (par?.gender === 'M') {
        if (bg === 'M') return bAge > par.age ? R('ताऊजी','Tauji',"Father's Elder Brother",'uncle','badge-uncle') : R('चाचाजी','Chachaji',"Father's Younger Brother",'uncle','badge-uncle');
        return R('बुआजी','Buaji',"Father's Sister",'uncle','badge-uncle');
      } else {
        if (bg === 'M') return R('मामाजी','Mamaji',"Mother's Brother",'uncle','badge-uncle');
        return bAge >= par.age ? R('मौसीजी','Mausiji',"Mother's Elder Sister",'uncle','badge-uncle') : R('मौसीजी','Mausiji',"Mother's Younger Sister",'uncle','badge-uncle');
      }
    }
    for (const sib of siblings(pid)) {
      if (spouse(sib) === B) {
        const sibM = M.get(sib);
        if (par?.gender === 'M') {
          if (sibM?.gender === 'M') return sibM.age > par.age ? R('ताईजी','Taiji',"Tauji's Wife",'uncle','badge-uncle') : R('चाचीजी','Chachiji',"Chachaji's Wife",'uncle','badge-uncle');
          return R('फूफाजी','Fufaji',"Buaji's Husband",'uncle','badge-uncle');
        } else {
          if (sibM?.gender === 'M') return R('मामीजी','Mamiji',"Mamaji's Wife",'uncle','badge-uncle');
          return R('मौसाजी','Mausaji',"Mausiji's Husband",'uncle','badge-uncle');
        }
      }
    }
  }
  
  for (const sib of siblings(A)) {
    if (children(sib).includes(B)) {
      const sibM = M.get(sib);
      if (sibM?.gender === 'M') return bg === 'M' ? R('भतीजा','Bhatija',"Nephew (Brother's)",'child','badge-child') : R('भतीजी','Bhatiji',"Niece (Brother's)",'child','badge-child');
      return bg === 'M' ? R('भांजा','Bhanja',"Nephew (Sister's)",'child','badge-child') : R('भांजी','Bhanji',"Niece (Sister's)",'child','badge-child');
    }
  }
  
  for (const sib of siblings(A)) {
    if (spouse(sib) === B) {
      const sibM = M.get(sib);
      if (sibM?.gender === 'F') return R('जीजाजी','Jijaji',"Sister's Husband",'inlaw','badge-inlaw');
      return R('भाभी','Bhabhi',"Brother's Wife",'inlaw','badge-inlaw');
    }
  }
  
  for (const cid of children(A)) {
    if (spouse(cid) === B) {
      const ch = M.get(cid);
      if (ch?.gender === 'F') return R('दामाद','Damad','Son-in-law','inlaw','badge-inlaw');
      return R('बहू','Bahu','Daughter-in-law','inlaw','badge-inlaw');
    }
  }
  
  const sp = spouse(A);
  if (sp) {
    if (parents(sp).includes(B)) return bg === 'M' ? R('ससुरजी','Sasurji','Father-in-law','inlaw','badge-inlaw') : R('सासूजी','Sasuji','Mother-in-law','inlaw','badge-inlaw');
    if (siblings(sp).includes(B)) {
      if (ag === 'F') {
        if (bg === 'M') return bAge > (M.get(sp)?.age||0) ? R('जेठजी','Jethji',"Husband's Elder Brother",'inlaw','badge-inlaw') : R('देवर','Devar',"Husband's Younger Brother",'inlaw','badge-inlaw');
        return R('ननद','Nanad',"Husband's Sister",'inlaw','badge-inlaw');
      } else {
        if (bg === 'M') return R('साला','Sala',"Wife's Brother",'inlaw','badge-inlaw');
        return R('साली','Sali',"Wife's Sister",'inlaw','badge-inlaw');
      }
    }
  }
  
  for (const pid of parents(A)) {
    const par = M.get(pid);
    for (const unc of siblings(pid)) {
      if (children(unc).includes(B)) {
        const uncM = M.get(unc);
        if (par?.gender === 'M') {
          if (uncM?.gender === 'M') return bg === 'M' ? R('चचेरा भाई','Chachera Bhai','Paternal Cousin Brother','sibling','badge-sibling') : R('चचेरी बहन','Chacheri Behen','Paternal Cousin Sister','sibling','badge-sibling');
          return bg === 'M' ? R('फुफेरा भाई','Fufera Bhai',"Cousin (Bua's Son)",'sibling','badge-sibling') : R('फुफेरी बहन','Fuferi Behen',"Cousin (Bua's Daughter)",'sibling','badge-sibling');
        } else {
          if (uncM?.gender === 'M') return bg === 'M' ? R('ममेरा भाई','Mamera Bhai',"Cousin (Mama's Son)",'sibling','badge-sibling') : R('ममेरी बहन','Mameri Behen',"Cousin (Mama's Daughter)",'sibling','badge-sibling');
          return bg === 'M' ? R('मौसेरा भाई','Mausera Bhai',"Cousin (Mausi's Son)",'sibling','badge-sibling') : R('मौसेरी बहन','Mauseri Behen',"Cousin (Mausi's Daughter)",'sibling','badge-sibling');
        }
      }
    }
  }

  // ── 1. Cousin Spouses ──
  for (const pid of parents(A)) {
    for (const sib of siblings(pid)) {
      for (const cou of children(sib)) {
        if (spouse(cou) === B) {
          return bg === 'M' ? R('जीजाजी','Jijaji',"Cousin's Husband",'inlaw','badge-inlaw') : R('भाभी','Bhabhi',"Cousin's Wife",'inlaw','badge-inlaw');
        }
      }
    }
  }

  // ── 2. Niece / Nephew Spouses (Spouse of sibling's child) ──
  for (const sib of siblings(A)) {
    for (const ch of children(sib)) {
      if (spouse(ch) === B) {
        const sibM = M.get(sib);
        if (sibM?.gender === 'M') {
          return bg === 'M' ? R('जमाई','Damad',"Niece's Husband",'inlaw','badge-inlaw') : R('बहू','Bahu',"Nephew's Wife",'inlaw','badge-inlaw');
        } else {
          return bg === 'M' ? R('जमाई','Damad',"Niece's Husband",'inlaw','badge-inlaw') : R('बहू','Bahu',"Nephew's Wife",'inlaw','badge-inlaw');
        }
      }
    }
  }

  // ── 3. Spouse's Uncles & Aunts (Uncle/Aunt-in-laws) ──
  if (sp) {
    const r = getSmartIndianRelation(allMembers, sp, B);
    if (r && r.category === 'uncle') {
      const hBase = r.hindi.replace('जी', '');
      const lBase = r.latin.replace('ji', '');
      const suffixH = bg === 'M' ? ' ससुर' : ' सासू';
      const suffixL = bg === 'M' ? ' Sasur' : ' Sasu';
      return R(hBase + suffixH, lBase + suffixL, r.english + '-in-law', 'inlaw', 'badge-inlaw');
    }
  }

  // ── 4. Spouses of Spouse's Siblings (Co-in-laws) ──
  if (sp) {
    for (const sib of siblings(sp)) {
      if (spouse(sib) === B) {
        const spouseObj = M.get(sp);
        const sibM = M.get(sib);
        if (ag === 'M') { // A is Male
          if (sibM?.gender === 'F') return R('साढू भाई','Sadhu Bhai',"Co-brother-in-law",'inlaw','badge-inlaw');
          return R('सलहज','Salhaj',"Co-sister-in-law",'inlaw','badge-inlaw');
        } else { // A is Female
          if (sibM?.gender === 'M') {
            const isOlder = sibM.age > (spouseObj?.age || 0);
            return isOlder ? R('जेठानी','Jethani',"Co-sister-in-law",'inlaw','badge-inlaw') : R('देवरानी','Devrani',"Co-sister-in-law",'inlaw','badge-inlaw');
          }
          return R('नन्दोई','Nandoi',"Co-brother-in-law",'inlaw','badge-inlaw');
        }
      }
    }
  }

  // ── 5. Grandchild's Spouse ──
  for (const cid of children(A)) {
    for (const gcid of children(cid)) {
      if (spouse(gcid) === B) {
        return bg === 'M' ? R('नाती जमाई','Nati Jamai',"Granddaughter's Husband",'inlaw','badge-inlaw') : R('पोता बहू','Pota Bahu',"Grandson's Wife",'inlaw','badge-inlaw');
      }
    }
  }

  return null;
}

function getAllRelationsFrom(personId) {
  const results = [];
  for (const m of familyMembers) {
    if (m.id === personId || !m.verified) continue;
    const r = getSmartIndianRelation(familyMembers, personId, m.id);
    if (r) results.push({ person: m, relation: r });
  }
  return results;
}

function renderProfileCardHTML(member, relation, opts = {}) {
  const { isGhost = false, isActive = false } = opts;
  const full = getFullName(member);
  const ini = getInitials(member);
  const ghost = isGhost ? 'ghost' : '';
  const active = isActive ? 'active' : '';
  const dec = member.deceased ? 'deceased' : '';
  const chk = member.verified ? '<span class="pc-check">✓</span>' : '';
  
  const relString = relation ? relation.english : (isActive ? 'Patriarch / Self' : 'Relative');
  
  let statusText = 'Single';
  if (member.spouse) {
    const spouse = getMemberById(member.spouse);
    statusText = spouse ? `Married to ${spouse.firstName}` : 'Married';
  }
  
  const occupation = member.occupation || 'N/A';

  return `<div class="profile-card ${ghost} ${active} ${dec}" id="pc-${member.id}" data-id="${member.id}">
    <div class="pc-avatar" style="${getAvatarStyle(member)}">${member.imageUrl ? '' : ini}</div>
    <div class="pc-details">
      <div class="pc-name-row"><span class="pc-name">${full}</span>${chk}</div>
      <div class="pc-rel">${relString}</div>
      <div class="pc-meta">
        <span class="pc-meta-line"><b>Age:</b> ${member.age} Yrs · ${member.gender}</span>
        <span class="pc-meta-line"><b>Occ:</b> ${occupation}</span>
        <span class="pc-meta-line"><b>Status:</b> ${statusText}</span>
      </div>
    </div>
    <a href="profile.html?id=${member.id}" class="pc-view-btn" onclick="event.stopPropagation()" title="View Full Profile">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
    </a>
  </div>`;
}

function showToast(title, msg, type = 'info') {
  const t = document.querySelector('.toast-container');
  if(!t) return;
  const tt = t.querySelector('.toast-title');
  const tm = t.querySelector('.toast-msg');
  if (tt) tt.textContent = title;
  if (tm) tm.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
