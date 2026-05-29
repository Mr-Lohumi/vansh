/* ═══════════════════════════════════════════════════════════════
   VANSH (वंश) — Shared Data Layer + Relationship Engine (Ivory Pivot)
   ═══════════════════════════════════════════════════════════════ */

const FAMILY_DATA_KEY = 'vansh_family_data_v2';

function loadFamilyData() {
  try {
    const saved = localStorage.getItem(FAMILY_DATA_KEY);
    if (saved) {
      let parsed = JSON.parse(saved);

      // Backfill missing usernames
      let changed = false;
      parsed.forEach(m => {
        if (!m.username) {
          const baseUsername = ((m.firstName || "") + "_" + (m.lastName || "")).toLowerCase().replace(/[^a-z0-9_]/g, '');
          let newUsername = baseUsername || "user";
          let counter = 1;
          while (parsed.some(other => other !== m && other.username === newUsername)) {
            newUsername = baseUsername + counter;
            counter++;
          }
          m.username = newUsername;
          changed = true;
        }
        if (m.firstName === 'Unknown' && (m.lastName === 'Father' || m.lastName === 'Mother' || m.lastName === 'Parent')) {
          m.firstName = m.lastName;
          m.lastName = '';
          if (!m.isPlaceholder) m.isPlaceholder = true;
          changed = true;
        }
      });
      if (changed) saveFamilyData(parsed);
      return parsed;
    }
  } catch(e) {}
  return [];
}
function saveFamilyData(members) {
  try { localStorage.setItem(FAMILY_DATA_KEY, JSON.stringify(members)); } catch(e) {}
}

let familyMembers = loadFamilyData();

// One-time sync of all local members to cloud (runs in background)
setTimeout(() => {
  if (typeof syncMemberToCloud === 'function' && familyMembers.length > 0) {
    familyMembers.forEach(m => syncMemberToCloud(m));
  }
}, 2000);

function getMemberById(id) { return familyMembers.find(m => m.id === id) || null; }
function getFullName(m) { return `${m.firstName} ${m.lastName}`; }
function getInitials(m) {
  const f = m.firstName || '';
  const l = m.lastName || '';
  return (f[0] || '') + (l[0] || '');
}
function getCasteLine(m) { return `${m.caste}${m.subCaste ? ' (' + m.subCaste + ')' : ''}`; }
function getVerifiedMembers() { return familyMembers.filter(m => m.verified); }

function getMyFamilyNetwork() {
  const auth = typeof getAuthData === 'function' ? getAuthData() : null;
  if (!auth || !auth.userId) return [];
  
  const myId = auth.userId;
  if (!getMemberById(myId)) return [];

  const visited = new Set();
  const queue = [myId];
  
  while(queue.length > 0) {
    const currId = queue.shift();
    if (visited.has(currId)) continue;
    visited.add(currId);
    
    const curr = getMemberById(currId);
    if (!curr) continue;
    
    if (curr.spouse && !visited.has(curr.spouse)) queue.push(curr.spouse);
    if (curr.parents) curr.parents.forEach(p => { if (!visited.has(p)) queue.push(p); });
    
    familyMembers.forEach(m => {
      if (m.parents && m.parents.includes(currId) && !visited.has(m.id)) queue.push(m.id);
    });
  }
  
  return familyMembers.filter(m => visited.has(m.id) && !m.isPlaceholder);
}

// --- RELATIONSHIP INVITE SYSTEM ---
const INVITES_DATA_KEY = 'vansh_invites_v1';

function loadInvites() {
  try {
    const saved = localStorage.getItem(INVITES_DATA_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch(e) {}
  return [];
}
function saveInvites(invites) {
  try { localStorage.setItem(INVITES_DATA_KEY, JSON.stringify(invites)); } catch(e) {}
}

let pendingInvites = loadInvites();

function getInvitesForUser(userId) {
  return pendingInvites.filter(i => i.toUserId === userId && i.status === 'pending');
}

function sendInvite(fromUserId, toUserId, relationType) {
  // Check if an invite already exists
  if (pendingInvites.some(i => i.fromUserId === fromUserId && i.toUserId === toUserId && i.status === 'pending')) {
    return { success: false, message: 'Invite already pending.' };
  }
  
  const invite = {
    id: 'INV' + Date.now(),
    fromUserId,
    toUserId,
    relationType, // 'brother', 'sister', 'spouse', 'parent', 'child'
    status: 'pending',
    timestamp: new Date().toISOString()
  };
  pendingInvites.push(invite);
  saveInvites(pendingInvites);
  return { success: true, message: 'Invite sent successfully.' };
}

function acceptInvite(inviteId) {
  const invite = pendingInvites.find(i => i.id === inviteId);
  if (!invite) return false;
  
  invite.status = 'accepted';
  saveInvites(pendingInvites);
  
  const fromUser = getMemberById(invite.fromUserId);
  const toUser = getMemberById(invite.toUserId);
  if (!fromUser || !toUser) return false;
  
  function ensureParent(userId, gender, label) {
    let user = getMemberById(userId);
    if (!user.parents) user.parents = [];
    let parent = user.parents.map(pid => getMemberById(pid)).find(p => p && p.gender === gender);
    if (!parent) {
      parent = {
        id: 'u_' + Date.now() + Math.floor(Math.random()*1000),
        firstName: label,
        lastName: '',
        gender: gender,
        age: (user.age || 20) + 25,
        parents: [],
        isPlaceholder: true
      };
      familyMembers.push(parent);
      user.parents.push(parent.id);
    }
    return parent;
  }

  function linkSiblings(u1, u2) {
    if (!u1.parents) u1.parents = [];
    if (!u2.parents) u2.parents = [];
    if (u1.parents.length === 0) ensureParent(u1.id, 'M', 'Father');
    u1.parents.forEach(p => { if (!u2.parents.includes(p)) u2.parents.push(p); });
    u2.parents.forEach(p => { if (!u1.parents.includes(p)) u1.parents.push(p); });
  }

  const rel = invite.relationType ? invite.relationType.toUpperCase() : '';
  
  if (rel === 'FATHER' || rel === 'MOTHER') {
    toUser.gender = (rel === 'FATHER') ? 'M' : 'F';
    if (!fromUser.parents) fromUser.parents = [];
    if (!fromUser.parents.includes(toUser.id)) fromUser.parents.push(toUser.id);
  } else if (rel === 'SON' || rel === 'DAUGHTER') {
    toUser.gender = (rel === 'SON') ? 'M' : 'F';
    if (!toUser.parents) toUser.parents = [];
    if (!toUser.parents.includes(fromUser.id)) toUser.parents.push(fromUser.id);
  } else if (rel === 'HUSBAND' || rel === 'WIFE') {
    toUser.gender = (rel === 'HUSBAND') ? 'M' : 'F';
    fromUser.spouse = toUser.id;
    toUser.spouse = fromUser.id;
  } else if (rel === 'BROTHER' || rel === 'SISTER') {
    toUser.gender = (rel === 'BROTHER') ? 'M' : 'F';
    linkSiblings(fromUser, toUser);
  }
  
  
  autoInferEdges(fromUser.id);
  autoInferEdges(toUser.id);
  
  autoInferEdges(fromUser.id);
  autoInferEdges(toUser.id);
  saveFamilyData(familyMembers);
  return true;
}

// Process an invite fetched from Supabase Cloud
async function processCloudInvite(invite, action) {
  if (typeof updateCloudInviteStatus === 'function') {
    const success = await updateCloudInviteStatus(invite.id, action);
    if (!success) return false;
  }
  
  if (action !== 'accepted') return true;
  
  let fromUser = getMemberById(invite.fromUserId);
  if (!fromUser && typeof getCloudMemberById === 'function') {
    fromUser = await getCloudMemberById(invite.fromUserId);
    if (fromUser) {
      familyMembers.push(fromUser);
      saveFamilyData(familyMembers);
    } else {
      console.error('[Vansh] Failed to fetch fromUser from cloud:', invite.fromUserId);
    }
  }
  
  let toUser = getMemberById(invite.toUserId);
  if (!toUser && typeof getCloudMemberById === 'function') {
    toUser = await getCloudMemberById(invite.toUserId);
    if (toUser) {
      familyMembers.push(toUser);
      saveFamilyData(familyMembers);
    } else {
      console.error('[Vansh] Failed to fetch toUser from cloud:', invite.toUserId);
    }
  }
  
  if (!fromUser || !toUser) {
    console.error('[Vansh] Missing users in processCloudInvite. fromUser:', !!fromUser, 'toUser:', !!toUser);
    if (typeof showToast === 'function') showToast('Debug', `fromUser=${!!fromUser}, toUser=${!!toUser}`, 'warn');
    return false;
  }
  
  function ensureParent(userId, gender, label) {
    let user = getMemberById(userId);
    if (!user.parents) user.parents = [];
    let parent = user.parents.map(pid => getMemberById(pid)).find(p => p && p.gender === gender);
    if (!parent) {
      parent = {
        id: 'P' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2,6).toUpperCase(),
        firstName: label,
        lastName: '',
        gender: gender,
        age: (user.age || 20) + 25,
        parents: [],
        isPlaceholder: true
      };
      familyMembers.push(parent);
      user.parents.push(parent.id);
    }
    return parent;
  }

  function linkSiblings(u1, u2) {
    if (!u1.parents) u1.parents = [];
    if (!u2.parents) u2.parents = [];
    if (u1.parents.length === 0 && u2.parents.length === 0) {
      ensureParent(u1.id, 'M', 'Father');
    }
    u1.parents.forEach(p => { if (!u2.parents.includes(p)) u2.parents.push(p); });
    u2.parents.forEach(p => { if (!u1.parents.includes(p)) u1.parents.push(p); });
  }

  const rel = invite.relationType ? invite.relationType.toUpperCase() : '';
  
  if (rel === 'FATHER' || rel === 'MOTHER') {
    toUser.gender = (rel === 'FATHER') ? 'M' : 'F';
    if (!fromUser.parents) fromUser.parents = [];
    if (!fromUser.parents.includes(toUser.id)) fromUser.parents.push(toUser.id);
  } else if (rel === 'SON' || rel === 'DAUGHTER') {
    toUser.gender = (rel === 'SON') ? 'M' : 'F';
    if (!toUser.parents) toUser.parents = [];
    if (!toUser.parents.includes(fromUser.id)) toUser.parents.push(fromUser.id);
  } else if (rel === 'HUSBAND' || rel === 'WIFE') {
    toUser.gender = (rel === 'HUSBAND') ? 'M' : 'F';
    fromUser.spouse = toUser.id;
    toUser.spouse = fromUser.id;
  } else if (rel === 'BROTHER' || rel === 'SISTER') {
    toUser.gender = (rel === 'BROTHER') ? 'M' : 'F';
    linkSiblings(fromUser, toUser);
  }
  
  saveFamilyData(familyMembers);
  
  // Sync the updated users to cloud
  if (typeof syncMemberToCloud === 'function') {
    syncMemberToCloud(fromUser);
    syncMemberToCloud(toUser);
  }
  
  return true;
}

// Remove a relationship edge locally
function removeRelationshipLocally(targetId) {
  const authData = getAuthData();
  if (!authData || !authData.userId) return false;
  
  const me = getMemberById(authData.userId);
  const target = getMemberById(targetId);
  if (!me || !target) return false;

  // Remove from parents
  if (me.parents && me.parents.includes(target.id)) {
    me.parents = me.parents.filter(id => id !== target.id);
  }
  if (target.parents && target.parents.includes(me.id)) {
    target.parents = target.parents.filter(id => id !== me.id);
  }
  
  // Remove from spouse
  if (me.spouse === target.id) me.spouse = null;
  if (target.spouse === me.id) target.spouse = null;
  
  saveFamilyData(familyMembers);
  
  if (typeof syncMemberToCloud === 'function') {
    syncMemberToCloud(me);
    syncMemberToCloud(target);
  }
  
  return true;
}

// Check and apply any accepted invites sent by the current user
async function syncOutboundInvites() {
  const auth = getAuthData();
  if (!auth) return;
  if (typeof fetchOutboundAcceptedInvites === 'function') {
    const invites = await fetchOutboundAcceptedInvites(auth.userId);
    let processed = [];
    try { processed = JSON.parse(localStorage.getItem('vansh_processed_outbound') || '[]'); } catch(e) {}
    
    let changed = false;
    for (const inv of invites) {
      if (processed.includes(inv.id)) continue;
      
      // We momentarily disable updateCloudInviteStatus so we don't overwrite the cloud status
      const origUpdate = window.updateCloudInviteStatus;
      window.updateCloudInviteStatus = async () => true;
      
      const success = await processCloudInvite(inv, 'accepted');
      
      window.updateCloudInviteStatus = origUpdate;
      
      if (success) {
        processed.push(inv.id);
        changed = true;
      }
    }
    
    if (changed) {
      localStorage.setItem('vansh_processed_outbound', JSON.stringify(processed));
      // Refresh UI depending on the page
      if (typeof renderTree === 'function') renderTree();
      else window.location.reload();
    }
  }
}

// ----------------------------------

function getAvatarStyle(m) {
  const base = "background-size: cover; background-position: center; display: flex; align-items: center; justify-content: center; ";
  if (m.imageUrl) {
    return base + `background-image: url('${m.imageUrl}'); color: transparent;`;
  }
  return base + `background-color: var(--bg-hover); color: var(--gold); border-color: var(--border);`;
}


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


function updateFamilyMember(id, updates) {
  const idx = familyMembers.findIndex(m => m.id === id);
  if (idx !== -1) {
    familyMembers[idx] = { ...familyMembers[idx], ...updates };
    saveFamilyData(familyMembers);
    
    if (typeof syncMemberToCloud === 'function') syncMemberToCloud(familyMembers[idx]);
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
     if (sp && fSibs.includes(sp)) return bg === 'M' ? R('फूफा','Phupha','Uncle (Bua\'s Husband)','parent','badge-parent') : R('चाची/ताई','Chachi','Aunt (Chacha\'s Wife)','parent','badge-parent');
     
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
     if (sp && mSibs.includes(sp)) return bg === 'M' ? R('मौसा','Mausa','Uncle (Mausi\'s Husband)','parent','badge-maternal') : R('मामी','Mami','Aunt (Mama\'s Wife)','parent','badge-maternal');
     
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

// ── PROFILE VISIBILITY TIERS ──
function isConnected(startId, targetId) {
  if (startId === targetId) return true;
  const visited = new Set();
  const queue = [startId];
  visited.add(startId);
  
  while (queue.length > 0) {
    const currId = queue.shift();
    if (currId === targetId) return true;
    
    const curr = getMemberById(currId);
    if (!curr) continue;
    
    // Add parents
    if (curr.parents) {
      curr.parents.forEach(p => {
        if (!visited.has(p)) { visited.add(p); queue.push(p); }
      });
    }
    
    // Add children
    const childs = familyMembers.filter(m => m.parents && m.parents.includes(currId)).map(m => m.id);
    childs.forEach(c => {
      if (!visited.has(c)) { visited.add(c); queue.push(c); }
    });
    
    // Add spouse
    if (curr.spouse && !visited.has(curr.spouse)) {
      visited.add(curr.spouse); queue.push(curr.spouse);
    }
  }
  return false;
}

function getRelationshipTier(meId, targetId) {
  if (meId === targetId) return 'SELF';
  
  const myData = getMemberById(meId);
  if (!myData) return 'STRANGER';
  
  const myParents = myData.parents || [];
  const myChildren = familyMembers.filter(m => m.parents && m.parents.includes(meId)).map(m => m.id);
  
  // Siblings: share at least one parent
  const mySiblings = new Set();
  myParents.forEach(pId => {
    const parentChildren = familyMembers.filter(m => m.parents && m.parents.includes(pId)).map(m => m.id);
    parentChildren.forEach(c => {
      if (c !== meId) mySiblings.add(c);
    });
  });
  
  if (myParents.includes(targetId) || 
      myChildren.includes(targetId) || 
      mySiblings.has(targetId) || 
      myData.spouse === targetId) {
    return 'CLOSE_FAMILY';
  }
  
  if (isConnected(meId, targetId)) {
    return 'FAMILY_NETWORK';
  }
  
  return 'STRANGER';
}

// --- SCHEMA MIGRATION SCRIPT ---
(function runSchemaMigration() {
  const auth = typeof getAuthData === 'function' ? getAuthData() : null;
  const myId = auth ? auth.userId : null;
  if (!myId) return;

  function migrateTable(key) {
    let data = [];
    try {
      const saved = localStorage.getItem(key);
      if (saved) data = JSON.parse(saved);
    } catch(e) {}
    
    if (!Array.isArray(data) || data.length === 0) return;
    
    let changed = false;
    data.forEach(item => {
      if (!item.owner_id) {
        item.owner_id = item.userId || myId; // Fallback to userId or current user
        changed = true;
      }
      if (!item.created_at && item.id) {
        // Extract timestamp from id like art_1734567890
        const parts = item.id.split('_');
        if (parts.length === 2 && !isNaN(parseInt(parts[1]))) {
          item.created_at = parseInt(parts[1]);
        } else {
          item.created_at = Date.now(); // Fallback
        }
        changed = true;
      }
    });

    if (changed) {
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`[Migration] Backfilled owner_id and created_at in ${key}`);
    }
  }

  // Run on startup
  setTimeout(() => {
    migrateTable('vansh_museum_db');
    migrateTable('vansh_events_db');
    migrateTable('vansh_traditions_v1');
  }, 1000);
})();
