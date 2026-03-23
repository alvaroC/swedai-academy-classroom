// =============================================================
// supabase.js – Supabase Configuration & Client
// =============================================================
// PURPOSE: Creates the Supabase client that the entire app uses
// to communicate with the database and handle authentication.
//
// WHY A SEPARATE FILE: Keeps credentials in one place.
// If the URL or key ever changes, you only update it here.
// =============================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://adwlxsasasdjwaxixfqf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_F6FoJiFZ0O744zoe3BDATA_3eclCFfp';

// The single Supabase client instance used across the entire app
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
