const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://chdjjajzcawaehycfghz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nObuTD4BzdQndwLBTyUAbQ_zCqJqVQp';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabase() {
    console.log("Testing vansh_invites...");
    const { data, error } = await supabase.from('vansh_invites').select('*').limit(5);
    if (error) {
        console.error("Error fetching invites:", error);
    } else {
        console.log("Invites:", data);
    }
}
testSupabase();
