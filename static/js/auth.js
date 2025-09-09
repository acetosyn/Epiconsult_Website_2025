// static/js/auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// -------------------------------
// FIREBASE CONFIG
// -------------------------------
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  appId: "..."
};

// -------------------------------
// INIT
// -------------------------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// -------------------------------
// SESSION SYNC WITH FLASK
// -------------------------------
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const idToken = await user.getIdToken();
    await fetch("/sessionLogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    });
  } else {
    await fetch("/sessionLogout", { method: "POST" });
  }
});

// -------------------------------
// LOGOUT HANDLER
// -------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "/"; // redirect home after logout
    });
  }
});

// ✅ Export so other scripts can use it
export { auth };
