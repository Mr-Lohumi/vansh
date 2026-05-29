/* ═══════════════════════════════════════════════════════════════
   VANSH (वंश) — Supabase Sync Bridge
   Syncs user profiles to a shared cloud DB so any user
   on any device can discover other Vansh members via search.
   ═══════════════════════════════════════════════════════════════ */

const SUPABASE_URL     = 'https://chdjjajzcawaehycfghz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nObuTD4BzdQndwLBTyUAbQ_zCqJqVQp';

// Create a single Supabase client
if (window.supabase) {
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/* ──────────────────────────────────────────────────────────────
   Push a member's PUBLIC profile to Supabase `vansh_members` table
   Call this after every registration or profile update.
   ────────────────────────────────────────────────────────────── */
async function syncMemberToCloud(member) {
  if (!window.supabaseClient || !member) return;
  try {
    const payload = {
      id:          member.id,
      username:    member.username  || '',
      first_name:  member.firstName || '',
      last_name:   member.lastName  || '',
      email:       member.email     || '',
      password:    member.password  || '',
      gender:      member.gender    || 'M',
      age:         member.age       || 0,
      dob:         member.dob       || null,
      caste:       member.caste     || '',
      gotra:       member.gotra     || '',
      native_place: member.nativePlace || '',
      occupation:  member.occupation || '',
      verified:    member.verified  || false,
      image_url:   member.imageUrl  || null,
      updated_at:  new Date().toISOString(),
    };
    const { error } = await window.supabaseClient
      .from('vansh_members')
      .upsert(payload, { onConflict: 'id' });
    if (error) console.warn('[Vansh Sync] Cloud push failed:', error.message);
    else console.log('[Vansh Sync] Member synced to cloud:', member.id);
  } catch (err) {
    console.warn('[Vansh Sync] Unexpected error:', err);
  }
}

/* Authenticate from Supabase cloud — used when local localStorage lookup fails */
async function cloudAuthenticateUser(loginKey, password) {
  if (!window.supabaseClient) return null;
  try {
    const cleanKey = loginKey.trim().toLowerCase();
    const safeKey = cleanKey.replace(/"/g, ''); // prevent injection in .or string
    const { data, error } = await window.supabaseClient
      .from('vansh_members')
      .select('*')
      .or(`email.eq."${safeKey}",username.eq."${safeKey}",first_name.ilike."${safeKey}"`)
      .limit(10);
    if (error || !data || data.length === 0) return null;

    // Find exact match
    const matched = data.find(r => {
      const fullName = `${r.first_name} ${r.last_name}`.toLowerCase().trim();
      return r.email === cleanKey || r.username === cleanKey ||
             r.first_name.toLowerCase() === cleanKey || fullName === cleanKey;
    });
    if (!matched) return null;

    const correctPassword = matched.password || 'vansh2025';
    if (password !== correctPassword) return { found: true, wrongPassword: true };

    // Pull their full member record into local storage so the app works
    const localMember = {
      id:          matched.id,
      username:    matched.username,
      firstName:   matched.first_name,
      lastName:    matched.last_name,
      email:       matched.email,
      password:    matched.password,
      gender:      matched.gender,
      age:         matched.age,
      dob:         matched.dob || '',
      caste:       matched.caste,
      gotra:       matched.gotra,
      nativePlace: matched.native_place,
      occupation:  matched.occupation,
      verified:    matched.verified,
      imageUrl:    matched.image_url || '',
      parents:     [],
      spouse:      null,
      gen:         2,
      bio:         'Lineage heir registered via production gateway.',
    };

    // Merge into local DB so tree/feed features work
    const db = JSON.parse(localStorage.getItem('vansh_family_data_v2') || '[]');
    const existingIdx = db.findIndex(m => m.id === localMember.id);
    if (existingIdx >= 0) db[existingIdx] = { ...db[existingIdx], ...localMember };
    else db.push(localMember);
    localStorage.setItem('vansh_family_data_v2', JSON.stringify(db));

    return { found: true, wrongPassword: false, member: localMember };
  } catch(err) {
    console.warn('[CloudAuth] Error:', err);
    return null;
  }
}

/* ──────────────────────────────────────────────────────────────
   Refresh local family member data (esp. imageUrl) from Supabase.
   Call on page load in tree/dashboard so profile pics stay in sync
   even when another user updates their photo on a different device.
   ────────────────────────────────────────────────────────────── */
async function refreshMembersFromCloud() {
  if (!window.supabaseClient) return;
  try {
    const db = JSON.parse(localStorage.getItem('vansh_family_data_v2') || '[]');
    if (!db.length) return;
    const ids = db.map(m => m.id);

    const { data, error } = await window.supabaseClient
      .from('vansh_members')
      .select('id, first_name, last_name, image_url, occupation, verified, age, gender')
      .in('id', ids);

    if (error || !data || !data.length) return;

    let changed = false;
    data.forEach(row => {
      const local = db.find(m => m.id === row.id);
      if (!local) return;
      // Update imageUrl if cloud has one and local doesn't (or cloud is newer)
      if (row.image_url && row.image_url !== local.imageUrl) {
        local.imageUrl = row.image_url;
        changed = true;
      }
      // Also sync name updates
      if (row.first_name && row.first_name !== local.firstName) {
        local.firstName = row.first_name;
        changed = true;
      }
      if (row.last_name && row.last_name !== local.lastName) {
        local.lastName = row.last_name;
        changed = true;
      }
    });

    if (changed) {
      localStorage.setItem('vansh_family_data_v2', JSON.stringify(db));
      // Also update the live familyMembers array if it's loaded
      if (window.familyMembers && Array.isArray(window.familyMembers)) {
        data.forEach(row => {
          const live = window.familyMembers.find(m => m.id === row.id);
          if (live && row.image_url) live.imageUrl = row.image_url;
          if (live && row.first_name) live.firstName = row.first_name;
          if (live && row.last_name) live.lastName = row.last_name;
        });
      }
      console.log('[Vansh] Member profiles refreshed from cloud.');
    }
  } catch(err) {
    console.warn('[Vansh] refreshMembersFromCloud error:', err);
  }
}

/* ──────────────────────────────────────────────────────────────
   Search ALL Vansh members from Supabase cloud (cross-device)
   Returns array of member objects (mapped to local shape).
   ────────────────────────────────────────────────────────────── */
async function searchMembersCloud(query) {
  if (!window.supabaseClient || !query) return [];
  try {
    // Search by first_name, last_name, username, or email (case-insensitive)
    const q = query.replace(/'/g, '');  // basic sanitize
    const terms = q.split(' ').filter(t => t.trim().length > 0);
    
    let queryBuilder = window.supabaseClient.from('vansh_members').select('*');
    
    terms.forEach(term => {
      queryBuilder = queryBuilder.or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,username.ilike.%${term}%,email.ilike.%${term}%`);
    });
    
    const { data, error } = await queryBuilder.limit(20);

    if (error) {
      console.warn('[Vansh Search] Cloud query failed:', error.message);
      return [];
    }
    // Map Supabase column names → local member shape
    return (data || []).map(r => ({
      id:          r.id,
      username:    r.username,
      firstName:   r.first_name,
      lastName:    r.last_name,
      email:       r.email,
      gender:      r.gender,
      age:         r.age,
      dob:         r.dob,
      caste:       r.caste,
      gotra:       r.gotra,
      nativePlace: r.native_place,
      occupation:  r.occupation,
      verified:    r.verified,
      imageUrl:    r.image_url || '',
      _fromCloud:  true,
    }));
  } catch (err) {
    console.warn('[Vansh Search] Unexpected search error:', err);
    return [];
  }
}

/* ──────────────────────────────────────────────────────────────
   Global Relationship Invites
   ────────────────────────────────────────────────────────────── */

async function sendCloudInvite(fromUserId, toUserId, relationType) {
  if (!window.supabaseClient) return { success: false, message: 'Cloud disconnected' };
  try {
    const payload = {
      id: 'INV_' + Date.now().toString(36) + Math.random().toString(36).substring(2,6),
      from_user_id: fromUserId,
      to_user_id: toUserId,
      relation_type: relationType,
      status: 'pending'
    };
    const { error } = await window.supabaseClient.from('vansh_invites').insert(payload);
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Invite sent globally.' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

async function fetchCloudInvites(userId) {
  if (!window.supabaseClient) return [];
  try {
    const { data, error } = await window.supabaseClient
      .from('vansh_invites')
      .select('*')
      .eq('to_user_id', userId)
      .eq('status', 'pending');
      
    if (error) return [];
    
    // Map to local format
    return (data || []).map(r => ({
      id: r.id,
      fromUserId: r.from_user_id,
      toUserId: r.to_user_id,
      relationType: r.relation_type,
      status: r.status,
      timestamp: r.created_at
    }));
  } catch (err) {
    return [];
  }
}

async function fetchOutboundAcceptedInvites(userId) {
  if (!window.supabaseClient) return [];
  try {
    const { data, error } = await window.supabaseClient
      .from('vansh_invites')
      .select('*')
      .eq('from_user_id', userId)
      .eq('status', 'accepted');
      
    if (error) return [];
    
    return (data || []).map(r => ({
      id: r.id,
      fromUserId: r.from_user_id,
      toUserId: r.to_user_id,
      relationType: r.relation_type,
      status: r.status,
      timestamp: r.created_at
    }));
  } catch (err) {
    return [];
  }
}

async function updateCloudInviteStatus(inviteId, status) {
  if (!window.supabaseClient) return false;
  try {
    const { error } = await window.supabaseClient
      .from('vansh_invites')
      .update({ status: status })
      .eq('id', inviteId);
    if (error) {
      console.error('[Vansh] updateCloudInviteStatus error:', error);
      if (typeof showToast === 'function') showToast('Debug', `Update failed: ${error.message}`, 'warn');
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Vansh] updateCloudInviteStatus catch:', err);
    return false;
  }
}

async function processCloudInvite(invite, action) {
  if (!window.supabaseClient) return false;
  
  // 1. Update cloud status
  const success = await updateCloudInviteStatus(invite.id, action);
  if (!success) return false;

  // 2. Update local connections if accepted
  if (action === 'accepted') {
    let pool = [];
    try {
      const saved = localStorage.getItem('vansh_family_data_v2');
      if (saved) pool = JSON.parse(saved);
      if (!Array.isArray(pool)) pool = [];
    } catch(e) { pool = []; }

    const fromUser = pool.find(u => u.id === invite.fromUserId);
    const toUser = pool.find(u => u.id === invite.toUserId);

    if (fromUser && toUser) {
      function ensureParent(userId, gender, label) {
        let user = pool.find(u => u.id === userId);
        if (!user.parents) user.parents = [];
        let parent = user.parents.map(pid => pool.find(u => u.id === pid)).find(p => p && p.gender === gender);
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
          pool.push(parent);
          user.parents.push(parent.id);
        }
        return parent;
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
        if (!fromUser.parents) fromUser.parents = [];
        if (!toUser.parents) toUser.parents = [];
        if (fromUser.parents.length === 0 && toUser.parents.length === 0) {
           ensureParent(fromUser.id, 'M', 'Father');
        }
        fromUser.parents.forEach(p => { if (!toUser.parents.includes(p)) toUser.parents.push(p); });
        toUser.parents.forEach(p => { if (!fromUser.parents.includes(p)) fromUser.parents.push(p); });
      }

      localStorage.setItem('vansh_family_data_v2', JSON.stringify(pool));
    }
  }

  return true;
}

window.processCloudInvite = processCloudInvite;

async function getCloudMemberById(userId) {
  if (!window.supabaseClient || !userId) return null;
  try {
    const { data, error } = await window.supabaseClient
      .from('vansh_members')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error || !data) return null;
    
    return {
      id:          data.id,
      username:    data.username,
      firstName:   data.first_name,
      lastName:    data.last_name,
      email:       data.email,
      gender:      data.gender,
      age:         data.age,
      dob:         data.dob,
      caste:       data.caste,
      gotra:       data.gotra,
      nativePlace: data.native_place,
      occupation:  data.occupation,
      verified:    data.verified,
      imageUrl:    data.image_url,
      parents:     [],
      spouse:      null,
      gen:         2
    };
  } catch(err) {
    return null;
  }
}

// --- SOCIAL POSTS API ---
async function fetchUserPosts(userId) {
  if (!window.supabaseClient) return [];
  try {
    const { data, error } = await window.supabaseClient
      .from('vansh_posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  } catch (err) { return []; }
}

async function fetchNetworkPosts(userIds) {
  if (!window.supabaseClient || !userIds || userIds.length === 0) return [];
  try {
    const { data, error } = await window.supabaseClient
      .from('vansh_posts')
      .select('*')
      .in('user_id', userIds)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  } catch (err) { return []; }
}

async function createPost(userId, content, imageUrl = null, authorName = '', authorAvatar = '') {
  if (!window.supabaseClient) return false;
  try {
    const { error } = await window.supabaseClient
      .from('vansh_posts')
      .insert({
        id: 'POST_' + Date.now().toString(36) + Math.random().toString(36).substring(2,6),
        user_id: userId,
        content: content,
        image_url: imageUrl,
        author_name: authorName,
        author_avatar: authorAvatar
      });
    return !error;
  } catch (err) { return false; }
}

async function deletePost(postId, userId) {
  if (!window.supabaseClient) return { success: false, error: 'Cloud disconnected' };
  try {
    const { error } = await window.supabaseClient
      .from('vansh_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    console.error('[Vansh] deletePost error:', err);
    return { success: false, error: err.message };
  }
}

// --- MESSAGING API ---
async function fetchUserMessages(userId) {
  if (!window.supabaseClient) return [];
  try {
    const { data, error } = await window.supabaseClient
      .from('vansh_messages')
      .select('*')
      .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
      .order('created_at', { ascending: true });
    if (error) return [];
    return data || [];
  } catch (err) { return []; }
}

async function sendMessage(fromId, toId, content, hasAllianceCard = false) {
  if (!window.supabaseClient) return false;
  try {
    const { error } = await window.supabaseClient
      .from('vansh_messages')
      .insert({
        id: 'MSG_' + Date.now().toString(36) + Math.random().toString(36).substring(2,6),
        from_user_id: fromId,
        to_user_id: toId,
        content: content,
        has_alliance_card: hasAllianceCard
      });
    return !error;
  } catch (err) { return false; }
}

// --- POST INTERACTIONS API ---
async function fetchPostInteractions(postIds) {
  if (!window.supabaseClient || !postIds || postIds.length === 0) return { respects: [], comments: [] };
  try {
    const [resRespects, resComments] = await Promise.all([
      window.supabaseClient.from('vansh_respects').select('*').in('post_id', postIds),
      window.supabaseClient.from('vansh_comments').select('*').in('post_id', postIds).order('created_at', { ascending: true })
    ]);
    return {
      respects: resRespects.data || [],
      comments: resComments.data || []
    };
  } catch (err) { return { respects: [], comments: [] }; }
}

async function toggleRespect(postId, userId) {
  if (!window.supabaseClient) return { success: false, error: 'Cloud disconnected' };
  try {
    // Check if respect exists
    const { data, error: findErr } = await window.supabaseClient
      .from('vansh_respects')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (findErr) return { success: false, error: findErr.message };
      
    if (data) {
      // Remove respect
      const { error: delErr } = await window.supabaseClient.from('vansh_respects').delete().eq('id', data.id);
      if (delErr) return { success: false, error: delErr.message };
      return { success: true, status: 'removed' };
    } else {
      // Add respect
      const { error: insErr } = await window.supabaseClient.from('vansh_respects').insert({
        id: 'RSP_' + Date.now().toString(36) + Math.random().toString(36).substring(2,6),
        post_id: postId,
        user_id: userId
      });
      if (insErr) return { success: false, error: insErr.message };
      return { success: true, status: 'added' };
    }
  } catch (err) { return { success: false, error: err.message }; }
}

async function addComment(postId, userId, content, authorName, authorAvatar) {
  if (!window.supabaseClient) return { success: false, error: 'Cloud disconnected' };
  try {
    const { error } = await window.supabaseClient.from('vansh_comments').insert({
      id: 'CMT_' + Date.now().toString(36) + Math.random().toString(36).substring(2,6),
      post_id: postId,
      user_id: userId,
      content: content,
      author_name: authorName,
      author_avatar: authorAvatar
    });
    if (error) {
      console.error('[Vansh] addComment error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) { return { success: false, error: err.message }; }
}
