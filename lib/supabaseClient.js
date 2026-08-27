import { createClient } from '@supabase/supabase-js';

// GitHub Pages is a static browser deployment.
// The Supabase publishable key is safe for browser use.
// Security is enforced by Supabase Auth and Row Level Security.
const supabaseUrl = 'https://xkraouhqatprchzljyvn.supabase.co';

const supabaseAnonKey =
  'sb_publishable_lysHhwyrrYypcJm-GOMBpA_h4JXGTnq';

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
