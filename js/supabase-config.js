/* ═══════════════════════════════════════════════════════════════
   VANSH (वंश) — Supabase Initialization
   ═══════════════════════════════════════════════════════════════ */

const SUPABASE_URL = 'https://chdjjajzcawaehycfghz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nObuTD4BzdQndwLBTyUAbQ_zCqJqVQp';

// Create a single supabase client for interacting with your database
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
