import { createClient } from '@supabase/supabase-js';

// GitHub Pages is a static browser deployment.
// The Supabase publishable key is safe for browser use.
// Security is enforced by Supabase Auth and Row Level Security.
const SUPABASE_URL = 'https://yzymvjsnarsxiukkjand.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CgIALirp6pg35BKZWvGuUw_-iTQgEZD-';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'biznexco-supabase-auth',
    },
  }
);
