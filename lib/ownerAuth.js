import { supabase } from './supabaseClient.js';


// ============================================================
// OWNER SIGN IN
// ============================================================

export async function ownerSignIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error('Invalid email or password.');
  }

  const profile = await fetchOwnProfile();

  if (!profile || profile.role !== 'owner') {
    await supabase.auth.signOut();
    throw new Error('This account is not registered as an Owner.');
  }

  return {
    user: data.user,
    profile,
  };
}


// ============================================================
// OWNER SIGN UP
// ============================================================
// Owner self-registration is intentionally disabled.
// Owner accounts must be provisioned by an administrator.

export async function ownerSignUp() {
  throw new Error(
    'Owner self-registration is disabled. Owner accounts must be provisioned by a platform administrator.'
  );
}


// ============================================================
// OWNER SIGN OUT
// ============================================================

export async function ownerSignOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}


// ============================================================
// OWNER PASSWORD RESET REQUEST
// ============================================================
// IMPORTANT:
// The reset URL is generated from the deployed application's
// location instead of window.location.href.
//
// This prevents localhost:3000 from being placed into the
// password-reset email when the application is tested locally.
//
// Because this file is:
//     /lib/ownerAuth.js
//
// and reset-password.html is:
//     /reset-password.html
//
// ../reset-password.html correctly resolves to the root page.
//
// On GitHub Pages this becomes:
// https://bishanth2026.github.io/Biznexco-Rent-Management-New/reset-password.html
// ============================================================

export async function ownerRequestPasswordReset(email) {
  const resetUrl = new URL(
    '../reset-password.html',
    import.meta.url
  ).href;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: resetUrl,
  });

  if (error) {
    throw error;
  }
}


// ============================================================
// COMPLETE PASSWORD RESET
// ============================================================

export async function ownerCompletePasswordReset(newPassword) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }
}


// ============================================================
// FETCH CURRENT USER PROFILE
// ============================================================

export async function fetchOwnProfile() {
  const { data: userResp, error: userError } =
    await supabase.auth.getUser();

  if (userError || !userResp?.user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, full_name, email')
    .eq('id', userResp.user.id)
    .single();

  if (error) {
    return null;
  }

  return data;
}
