const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://chdjjajzcawaehycfghz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nObuTD4BzdQndwLBTyUAbQ_zCqJqVQp';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkMotherQA() {
    const { data: members, error: mErr } = await supabase.from('vansh_members').select('*');
    if (mErr) return console.error(mErr);
    
    const mother = members.find(m => (m.first_name || '').toLowerCase().includes('mother qa') || (m.first_name || '').toLowerCase().includes('mother'));
    if (!mother) {
        console.log("Could not find Mother QA");
        return;
    }
    console.log("Found Mother QA:", mother.id, mother.first_name);
    
    const { data: invites, error: iErr } = await supabase.from('vansh_invites').select('*').eq('to_user_id', mother.id);
    if (iErr) return console.error(iErr);
    
    console.log("Invites for Mother QA:", invites);
}
checkMotherQA();
