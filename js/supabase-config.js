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

async function updateCloudInviteStatus(inviteId, status) {
  if (!window.supabaseClient) return false;
  try {
    const { error } = await window.supabaseClient
      .from('vansh_invites')
      .update({ status: status })
      .eq('id', inviteId);
    return !error;
  } catch (err) {
    return false;
  }
}
