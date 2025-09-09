// static/js/login.js
import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// ==============================
// Tabs
// ==============================
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const formsWrapper = document.querySelector(".auth-forms");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

function switchTab(target) {
  if (target === "login") {
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    formsWrapper.classList.remove("show-signup");
  } else {
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    formsWrapper.classList.add("show-signup");
  }
}
loginTab.addEventListener("click", () => switchTab("login"));
signupTab.addEventListener("click", () => switchTab("signup"));

// ==============================
// Typewriter
// ==============================
function typeWriter(elementId, messages, speed = 80, delay = 2500) {
  const element = document.getElementById(elementId);
  if (!element) return;
  let i = 0, j = 0, currentMessage = "";
  function type() {
    if (j < messages[i].length) {
      currentMessage += messages[i].charAt(j);
      element.textContent = currentMessage;
      j++;
      setTimeout(type, speed);
    } else {
      setTimeout(() => {
        currentMessage = "";
        element.textContent = "";
        j = 0;
        i = (i + 1) % messages.length;
        type();
      }, delay);
    }
  }
  type();
}
typeWriter("login-typewriter", [
  "Sign in to access your dashboard.",
  "Secure, fast, and reliable.",
]);
typeWriter("signup-typewriter", [
  "Create an account with us to get started.",
  "Join Epiconsult Diagnostics today!",
]);

// ==============================
// Password visibility toggle
// ==============================
document.querySelectorAll(".toggle-password").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const input = toggle.previousElementSibling;
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    toggle.textContent = isHidden ? "🙈" : "👁️";
  });
});

// ==============================
// Helpers
// ==============================
const AUTH_FLASH_KEY = "auth:flash";

function getNextUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("next") || "/";
}

function resetLoginButton() {
  const btn = document.getElementById("login-submit-btn");
  if (btn) {
    btn.disabled = false;
    btn.textContent = "Sign In";
  }
}

// On back/forward cache restore or normal load, reset any stale UI
window.addEventListener("pageshow", resetLoginButton);
window.addEventListener("DOMContentLoaded", () => {
  resetLoginButton();
  // Nuke any non-auth flash messages that might have leaked in
  sessionStorage.removeItem("authMessage"); // older key used elsewhere
});

// ==============================
// Firebase Auth Handling
// ==============================
// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  // stop other global listeners (e.g., booking) from hijacking this submit
  e.stopPropagation();
  e.stopImmediatePropagation();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const errorBox = document.getElementById("login-error");
  const submitBtn = document.getElementById("login-submit-btn");

  errorBox.textContent = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "Signing in...";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    sessionStorage.setItem(AUTH_FLASH_KEY, "Login successful 🎉");
    window.location.href = getNextUrl();
  } catch (error) {
    errorBox.textContent = error.message;
    submitBtn.disabled = false;
    submitBtn.textContent = "Sign In";
  }
});

// Signup
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("signup-confirm-password").value;
  const errorBox = document.getElementById("signup-error");
  const submitBtn = document.getElementById("signup-submit-btn");

  errorBox.textContent = "";

  if (password !== confirmPassword) {
    errorBox.textContent = "Passwords do not match.";
    return;
  }

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";
    await createUserWithEmailAndPassword(auth, email, password);
    sessionStorage.setItem(AUTH_FLASH_KEY, "Account created successfully 🎉 Please log in.");
    window.location.href = "/login";
  } catch (error) {
    errorBox.textContent = error.message;
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";
  }
});

// ==============================
// Google Sign-In
// ==============================
const googleProvider = new GoogleAuthProvider();

document.getElementById("googleLoginBtnSignin")?.addEventListener("click", () => {
  signInWithPopup(auth, googleProvider)
    .then(() => {
      sessionStorage.setItem(AUTH_FLASH_KEY, "Login successful 🎉");
      window.location.href = getNextUrl();
    })
    .catch((error) => {
      document.getElementById("login-error").textContent = error.message;
    });
});

document.getElementById("googleLoginBtnSignup")?.addEventListener("click", () => {
  signInWithPopup(auth, googleProvider)
    .then(() => {
      sessionStorage.setItem(AUTH_FLASH_KEY, "Account created successfully 🎉 Please log in.");
      window.location.href = "/login";
    })
    .catch((error) => {
      document.getElementById("signup-error").textContent = error.message;
    });
});

// ==============================
// Auth Flash Message (namespaced)
// ==============================
window.addEventListener("DOMContentLoaded", () => {
  const message = sessionStorage.getItem(AUTH_FLASH_KEY);
  if (message) {
    const box = document.createElement("div");
    box.className = box.className =
  "flash-message fixed top-36 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-[9999]";

    box.textContent = message;
    document.body.prepend(box);

    setTimeout(() => box.remove(), 3000);
    sessionStorage.removeItem(AUTH_FLASH_KEY);
  }
});
