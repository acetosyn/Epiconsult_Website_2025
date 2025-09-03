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

// ✅ UI elements
const loginLink = document.getElementById("login-link");
const loginLinkMobile = document.getElementById("login-link-mobile");

const userSection = document.getElementById("user-section");
const welcomeMsg = document.getElementById("welcome-msg");
const logoutBtn = document.getElementById("logout-btn");

const userSectionMobile = document.getElementById("user-section-mobile");
const welcomeMsgMobile = document.getElementById("welcome-msg-mobile");
const logoutBtnMobile = document.getElementById("logout-btn-mobile");

// ✅ Listen for auth state
onAuthStateChanged(auth, (user) => {
  if (user) {
    const name = user.displayName || user.email.split("@")[0];

    if (loginLink) loginLink.classList.add("hidden");
    if (loginLinkMobile) loginLinkMobile.classList.add("hidden");

    if (userSection) userSection.classList.remove("hidden");
    if (welcomeMsg) welcomeMsg.textContent = `Welcome, ${name}`;

    if (userSectionMobile) userSectionMobile.classList.remove("hidden");
    if (welcomeMsgMobile) welcomeMsgMobile.textContent = `Welcome, ${name}`;
  } else {
    if (loginLink) loginLink.classList.remove("hidden");
    if (loginLinkMobile) loginLinkMobile.classList.remove("hidden");

    if (userSection) userSection.classList.add("hidden");
    if (userSectionMobile) userSectionMobile.classList.add("hidden");
  }
});

// ✅ Logout
logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/login";
});
logoutBtnMobile?.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/login";
});
