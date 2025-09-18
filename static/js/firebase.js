// static/js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCsvPKDajql3Itl7MHz9_WTV28vbhOEatY",
  authDomain: "epiconsult-f6360.firebaseapp.com",
  projectId: "epiconsult-f6360",
  storageBucket: "epiconsult-f6360.firebasestorage.app",
  messagingSenderId: "728704140739",
  appId: "1:728704140739:web:3b87291c4cda1372d06976",
  measurementId: "G-JJY0309NML"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("Failed to set persistence:", err);
});

// helper broadcast for other modules (keeps existing behavior)
function broadcastAuthChange(userObj) {
  document.dispatchEvent(new CustomEvent("auth-changed", { detail: userObj }));
  window.__CURRENT_USER__ = userObj;
}

onAuthStateChanged(auth, async (user) => {
  const currentUser = user
    ? {
        name: user.displayName || null,
        email: user.email || null,
        uid: user.uid || null,
        photoURL: user.photoURL || null
      }
    : null;

  broadcastAuthChange(currentUser);

  try {
    if (user) {
      const idToken = await user.getIdToken(/* forceRefresh */ false);
      await fetch("/sessionLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      });
    } else {
      await fetch("/sessionLogout", { method: "POST" });
    }
  } catch (err) {
    console.warn("Session sync failed:", err);
  }
});

export async function doFirebaseLogout() {
  try {
    broadcastAuthChange(null);
    await signOut(auth);
    try {
      await fetch("/sessionLogout", { method: "POST" });
    } catch (err) {
      console.warn("Server sessionLogout failed after signOut:", err);
    }
    window.location.href = "/";
  } catch (err) {
    console.error("Logout failed:", err);
    try { await fetch("/sessionLogout", { method: "POST" }); } catch (_) {}
    window.location.reload();
  }
}
