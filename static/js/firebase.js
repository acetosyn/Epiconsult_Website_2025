// static/js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCsvPKDajql3Itl7MHz9_WTV28vbhOEatY",
  authDomain: "epiconsult-f6360.firebaseapp.com",
  projectId: "epiconsult-f6360",
  storageBucket: "epiconsult-f6360.firebasestorage.app",
  messagingSenderId: "728704140739",
  appId: "1:728704140739:web:3b87291c4cda1372d06976",
  measurementId: "G-JJY0309NML"
};

// ✅ Init
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ✅ Shared flash key
const AUTH_FLASH_KEY = "auth:flash";

// ✅ UI elements
const loginLink = document.getElementById("login-link");
const loginLinkMobile = document.getElementById("login-link-mobile");

const userSection = document.getElementById("user-section");
const welcomeMsg = document.getElementById("welcome-msg");
const logoutBtn = document.getElementById("logout-btn");

const userSectionMobile = document.getElementById("user-section-mobile");
const welcomeMsgMobile = document.getElementById("welcome-msg-mobile");
const logoutBtnMobile = document.getElementById("logout-btn-mobile");

// ✅ Helpers: fade show/hide (no layout jump)
function showEl(el) {
  if (!el) return;
  el.classList.remove("opacity-0", "pointer-events-none");
}
function hideEl(el) {
  if (!el) return;
  el.classList.add("opacity-0", "pointer-events-none");
}

// ✅ Listen for auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    const name = user.displayName || user.email.split("@")[0];

    hideEl(loginLink);
    hideEl(loginLinkMobile);

    showEl(userSection);
    if (welcomeMsg) welcomeMsg.textContent = `Welcome, ${name}`;

    showEl(userSectionMobile);
    if (welcomeMsgMobile) welcomeMsgMobile.textContent = `Welcome, ${name}`;
  } else {
    showEl(loginLink);
    showEl(loginLinkMobile);

    hideEl(userSection);
    hideEl(userSectionMobile);
  }
});

// ✅ Logout handlers
async function handleLogout() {
  await signOut(auth);
  sessionStorage.setItem(AUTH_FLASH_KEY, "Logout successful ✅");
  window.location.href = "/login";
}

logoutBtn?.addEventListener("click", handleLogout);
logoutBtnMobile?.addEventListener("click", handleLogout);
