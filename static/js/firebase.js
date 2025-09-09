// static/js/firebase.js
// Single source-of-truth Firebase module (v12)
// - Initializes Firebase auth
// - Syncs session with Flask (/sessionLogin, /sessionLogout)
// - Emits `auth-changed` CustomEvent whenever auth state updates
// - Exports `auth` and `doFirebaseLogout()`

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// -------------------------------
// FIREBASE CONFIG
// -------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCsvPKDajql3Itl7MHz9_WTV28vbhOEatY",
  authDomain: "epiconsult-f6360.firebaseapp.com",
  projectId: "epiconsult-f6360",
  storageBucket: "epiconsult-f6360.firebasestorage.app",
  messagingSenderId: "728704140739",
  appId: "1:728704140739:web:3b87291c4cda1372d06976",
  measurementId: "G-JJY0309NML"
};

// -------------------------------
// INIT
// -------------------------------
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// -------------------------------
// PERSISTENCE
// -------------------------------
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("Failed to set persistence:", err);
});

// Helper to dispatch auth-changed with plain user object (or null)
function broadcastAuthChange(userObj) {
  // dispatch with plain object (null if logged out)
  document.dispatchEvent(new CustomEvent("auth-changed", { detail: userObj }));
  // also set global for synchronous reads
  window.__CURRENT_USER__ = userObj;
}

// -------------------------------
// AUTH STATE LISTENER (sync with Flask)
// -------------------------------
onAuthStateChanged(auth, async (user) => {
  // normalize user for UI (keep small payload)
  const currentUser = user
    ? {
        name: user.displayName || null,
        email: user.email || null,
        uid: user.uid || null
      }
    : null;

  // notify UI immediately
  broadcastAuthChange(currentUser);

  // Sync with Flask session (best-effort)
  try {
    if (user) {
      const idToken = await user.getIdToken(/* forceRefresh */ false);
      await fetch("/sessionLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      });
    } else {
      // server-side session clear
      await fetch("/sessionLogout", { method: "POST" });
    }
  } catch (err) {
    console.warn("Session sync failed:", err);
  }
});

// -------------------------------
// LOGOUT (clears UI immediately and signs out)
// -------------------------------
export async function doFirebaseLogout() {
  try {
    // Clear UI state immediately (avoid race)
    broadcastAuthChange(null);

    // Sign out from Firebase
    await signOut(auth);

    // Tell server to clear session (if still needed)
    try {
      await fetch("/sessionLogout", { method: "POST" });
    } catch (err) {
      // non-fatal
      console.warn("Server sessionLogout failed after signOut:", err);
    }

    // Redirect to home (or login) after signout
    window.location.href = "/";
  } catch (err) {
    console.error("Logout failed:", err);
    // If signOut failed, still clear server and reload to safe state
    try {
      await fetch("/sessionLogout", { method: "POST" });
    } catch (_) {}
    window.location.reload();
  }
}
