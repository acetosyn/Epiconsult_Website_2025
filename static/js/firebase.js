// static/js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// =============================
// Firebase Init
// =============================
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

// Shared flash key
const AUTH_FLASH_KEY = "auth:flash";

// =============================
// Elements (grab once)
// =============================
// Desktop
const loginLink = document.getElementById("login-link");
const userSection = document.getElementById("user-section");
const welcomeMsg = document.getElementById("welcome-msg");
const logoutBtn = document.getElementById("logout-btn");

// Mobile
const loginLinkMobile = document.getElementById("login-link-mobile");
const userSectionMobile = document.getElementById("user-section-mobile");
const welcomeMsgMobile = document.getElementById("welcome-msg-mobile");
const logoutBtnMobile = document.getElementById("logout-btn-mobile");

// =============================
// Small helpers to avoid flicker/jump
// We purposely avoid using display:none for userSection so layout space is reserved.
// For login buttons we show/hide with display since they don't reserve the same header slot.
function showLogin(el) {
  if (!el) return;
  // ensure visible (inline-flex for desktop button that uses flex classes)
  el.style.display = el === loginLink ? "inline-flex" : ""; // desktop: keep inline-flex to match your markup
  el.classList.remove("opacity-0", "pointer-events-none", "hidden");
}
function hideLogin(el) {
  if (!el) return;
  el.style.display = "none";
}

function showUserSection(el) {
  if (!el) return;
  // keep layout reserved: remove the 'hidden' visual classes but don't force display:none changes
  el.style.display = ""; // let CSS layout decide; user CSS should provide a fixed width/height to reserve space
  el.classList.remove("opacity-0", "pointer-events-none", "hidden");
}
function hideUserSection(el) {
  if (!el) return;
  // keep space reserved — use opacity + pointer-events to make it invisible but still occupy space
  el.classList.add("opacity-0", "pointer-events-none");
  // also make sure it is not display:none — we rely on the CSS reservation for layout stability
  el.style.display = ""; // do not set display:none here
}

// =============================
// Persistence (survives reloads)
setPersistence(auth, browserLocalPersistence).catch((err) => {
  // persistence failing isn't fatal for UI, but log it.
  console.warn("Failed to set persistence:", err);
});

// =============================
// UI update function
function applyAuthUI(user) {
  if (user) {
    const name = user.displayName || (user.email ? user.email.split("@")[0] : "User");

    // Hide login links (they don't need reserved space).
    hideLogin(loginLink);
    hideLogin(loginLinkMobile);

    // Show user sections (keep reserved layout space)
    showUserSection(userSection);
    if (welcomeMsg) welcomeMsg.textContent = `Welcome, ${name}`;

    showUserSection(userSectionMobile);
    if (welcomeMsgMobile) welcomeMsgMobile.textContent = `Welcome, ${name}`;
  } else {
    // No user — show login links, hide user sections visually (but reserve space)
    showLogin(loginLink);
    showLogin(loginLinkMobile);

    hideUserSection(userSection);
    hideUserSection(userSectionMobile);
  }
}

// =============================
// Initialize UI ASAP to avoid flicker
// Strategy:
// 1) If auth.currentUser is already populated (fast path), update UI immediately.
// 2) Always attach onAuthStateChanged to catch any changes / late restoration.
try {
  const immediateUser = auth.currentUser; // may be null or user object
  if (immediateUser) {
    // Fast path: show user immediately
    applyAuthUI(immediateUser);
  } else {
    // If no immediate user, we still hide both until onAuthStateChanged runs.
    // (Important: ensure your CSS initially hides these elements — see below)
  }
} catch (err) {
  console.warn("Error reading currentUser:", err);
}

// Attach listener (this fires immediately after SDK determines state)
onAuthStateChanged(auth, (user) => {
  applyAuthUI(user);
});

// =============================
// Logout
async function handleLogout() {
  try {
    await signOut(auth);
    sessionStorage.setItem(AUTH_FLASH_KEY, "Logout successful ✅");
    // after signOut we redirect to login (server route)
    window.location.href = "/login";
  } catch (err) {
    console.error("Logout failed:", err);
  }
}

logoutBtn?.addEventListener("click", handleLogout);
logoutBtnMobile?.addEventListener("click", handleLogout);
