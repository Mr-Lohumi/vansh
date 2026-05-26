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
      gender:      member.gender    || 'M',
      age:         member.age       || 0,
      dob:         member.dob       || null,
      caste:       member.caste     || '',
      gotra:       member.gotra     || '',
      native_place: member.nativePlace || '',
      occupation:  member.occupation || '',
      verified:    member.verified  || false,
      image_url:   member.imageUrl && member.imageUrl.startsWith('http') ? member.imageUrl : null,
      updated_at:  new Date().toISOString(),
    };
    // upsert = insert OR update if id already exists
    const { error } = await window.supabaseClient
      .from('vansh_members')
      .upsert(payload, { onConflict: 'id' });
    if (error) console.warn('[Vansh Sync] Cloud push failed:', error.message);
    else console.log('[Vansh Sync] Member synced to cloud:', member.id);
  } catch (err) {
    console.warn('[Vansh Sync] Unexpected error:', err);
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

async function createPost(userId, content) {
  if (!window.supabaseClient) return false;
  try {
    const { error } = await window.supabaseClient
      .from('vansh_posts')
      .insert({
        id: 'POST_' + Date.now().toString(36) + Math.random().toString(36).substring(2,6),
        user_id: userId,
        content: content
      });
    return !error;
  } catch (err) { return false; }
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
