const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://chdjjajzcawaehycfghz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nObuTD4BzdQndwLBTyUAbQ_zCqJqVQp';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabase() {
    console.log("Inserting test invite...");
    const payload = {
      id: 'INV_TEST_' + Date.now().toString(36),
      from_user_id: 'P1',
      to_user_id: 'P2',
      relation_type: 'FATHER',
      status: 'pending'
    };
    const { data, error } = await supabase.from('vansh_invites').insert(payload).select();
    if (error) {
        console.error("Error inserting invite:", error);
    } else {
        console.log("Insert success:", data);
    }
}
testSupabase();
