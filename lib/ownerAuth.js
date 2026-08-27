import { supabase } from './supabaseClient.js';

export async function ownerSignIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Invalid email or password.');

  const profile = await fetchOwnProfile();
  if (!profile || profile.role !== 'owner') {
    await supabase.auth.signOut();
    throw new Error('This account is not registered as an Owner.');
  }
  return { user: data.user, profile };
}

// DISABLED — SECURITY: there is currently no secure server-side
// invitation/bootstrap mechanism gating owner-account creation. Every new
// auth.users row (however it's created) is now unconditionally assigned
// role='tenant' by the handle_new_auth_user() trigger (see phase5.sql §B),
// so this function is a dead end even if called: it would just create a
// tenant-role profile with no linked tenants row. It's kept (rather than
// deleted) only as a documented placeholder for a FUTURE owner-invitation
// Edge Function — one that verifies a pre-issued, single-use invite token
// with the service role BEFORE calling auth.admin.createUser(...) and then
// explicitly promoting that one profile to 'owner' server-side. Until that
// Edge Function exists, this path must stay disabled.
export async function ownerSignUp() {
  throw new Error(
    'Owner self-registration is disabled. Owner accounts must be provisioned by a platform administrator.'
  );
}

export async function ownerSignOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function ownerRequestPasswordReset(email) {
  const resetUrl = new URL('./reset-password.html', window.location.href).href;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: resetUrl,
  });

  if (error) throw error;
}

export async function ownerCompletePasswordReset(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function fetchOwnProfile() {
  const { data: userResp } = await supabase.auth.getUser();
  if (!userResp?.user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, full_name, email')
    .eq('id', userResp.user.id)
    .single();
  if (error) return null;
  return data;
}
