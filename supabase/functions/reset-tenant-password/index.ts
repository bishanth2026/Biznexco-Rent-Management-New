import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userResp, error: userErr } = await callerClient.auth.getUser();
    if (userErr || !userResp?.user) return json({ error: 'Invalid session' }, 401);

    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: callerProfile } = await adminClient
      .from('profiles').select('role').eq('id', userResp.user.id).single();
    if (!callerProfile || callerProfile.role !== 'owner') {
      return json({ error: 'Only owners can reset tenant passwords' }, 403);
    }

    const { tenantId, newPassword } = await req.json();
    if (!tenantId || !newPassword || newPassword.length < 6) {
      return json({ error: 'tenantId and a newPassword of at least 6 characters are required' }, 400);
    }

    const { data: tenantRow, error: tenantErr } = await adminClient
      .from('tenants').select('id, profile_id, owner_id').eq('id', tenantId).single();
    if (tenantErr || !tenantRow) return json({ error: 'Tenant not found' }, 404);
    if (tenantRow.owner_id !== userResp.user.id) {
      return json({ error: 'You do not have permission to reset this tenant\'s password' }, 403);
    }
    if (!tenantRow.profile_id) return json({ error: 'This tenant has no linked login account' }, 400);

    const { error: updateErr } = await adminClient.auth.admin.updateUserById(tenantRow.profile_id, {
      password: newPassword,
    });
    if (updateErr) return json({ error: updateErr.message }, 500);

    return json({ success: true });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Unexpected error' }, 500);
  }
});
