import { supabase } from './supabaseClient.js';
import { restoreSession, clearSession } from './sessionManager.js';

export function initAuthListener({ onSignedIn, onSignedOut }) {
  supabase.auth.onAuthStateChange(async (event, authSession) => {
    switch (event) {
      // INITIAL_SESSION is the one-time boot event. It MUST resolve to either
      // onSignedIn (session found + restorable) or onSignedOut (no session,
      // or a session that couldn't be restored to a valid profile) — never
      // silently do nothing, or the boot-loading overlay is left on screen
      // forever and the login form never becomes visible/interactive.
      case 'INITIAL_SESSION': {
        if (authSession) {
          const restored = await restoreSession();
          if (restored) onSignedIn(restored);
          else { await supabase.auth.signOut(); onSignedOut(); }
        } else {
          onSignedOut();
        }
        break;
      }
      case 'SIGNED_IN':
      case 'TOKEN_REFRESHED':
      case 'USER_UPDATED': {
        if (authSession) {
          const restored = await restoreSession();
          if (restored) onSignedIn(restored);
          else { await supabase.auth.signOut(); onSignedOut(); }
        } else {
          onSignedOut();
        }
        break;
      }
      case 'SIGNED_OUT': {
        clearSession();
        onSignedOut();
        break;
      }
      default: break;
    }
  });
}