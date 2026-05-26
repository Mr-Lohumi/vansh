const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://chdjjajzcawaehycfghz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nObuTD4BzdQndwLBTyUAbQ_zCqJqVQp';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('vansh_members').select('*').limit(10);
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Data:', data);
  }
}

test();
