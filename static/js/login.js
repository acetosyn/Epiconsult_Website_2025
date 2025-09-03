// ==============================
// 🌐 Login & Register Scripts (Hardened)
// ==============================

// Tab buttons & forms
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const formsWrapper = document.querySelector(".auth-forms");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

// Helper: switch tabs safely
function switchTab(target) {
  if (target === "login") {
    loginTab.classList.add("active");
    signupTab.classList.remove("active");
    loginTab.setAttribute("aria-selected", "true");
    signupTab.setAttribute("aria-selected", "false");

    formsWrapper.classList.remove("show-signup");
    loginForm.classList.add("active");
    signupForm.classList.remove("active");
  } else {
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    signupTab.setAttribute("aria-selected", "true");
    loginTab.setAttribute("aria-selected", "false");

    formsWrapper.classList.add("show-signup");
    signupForm.classList.add("active");
    loginForm.classList.remove("active");
  }
}

// Attach tab events (debounced)
let tabCooldown = false;
function handleTabClick(tab) {
  if (tabCooldown) return;
  tabCooldown = true;
  switchTab(tab);
  setTimeout(() => (tabCooldown = false), 300); // prevent spam clicks
}

loginTab.addEventListener("click", () => handleTabClick("login"));
signupTab.addEventListener("click", () => handleTabClick("signup"));

// ==============================
// ⌨️ Typewriter effect (optimized)
// ==============================
function typeWriter(elementId, messages, speed = 80, delay = 2500) {
  const element = document.getElementById(elementId);
  if (!element) return;

  let i = 0, j = 0;
  let currentMessage = "";
  let timeoutId = null;
  let isPaused = document.hidden;

  function clearTimer() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  function type() {
    if (!element || isPaused) return;

    if (j < messages[i].length) {
      currentMessage += messages[i].charAt(j);
      element.textContent = currentMessage;
      j++;
      timeoutId = setTimeout(type, speed);
    } else {
      timeoutId = setTimeout(() => {
        currentMessage = "";
        element.textContent = "";
        j = 0;
        i = (i + 1) % messages.length;
        type();
      }, delay);
    }
  }

  // Handle tab visibility changes
  document.addEventListener("visibilitychange", () => {
    isPaused = document.hidden;
    if (!isPaused && !timeoutId) {
      // restart typing if resumed
      type();
    } else {
      clearTimer();
    }
  });

  type();
}

// Init typewriters
typeWriter("login-typewriter", [
  "Sign in to access your dashboard.",
  "Secure, fast, and reliable."
]);

typeWriter("signup-typewriter", [
  "Create an account to get started.",
  "Join Epiconsult Diagnostics today!"
]);

// ==============================
// 👁️ Password visibility toggle
// ==============================
document.querySelectorAll(".toggle-password").forEach(toggle => {
  toggle.addEventListener("click", () => {
    const input = toggle.previousElementSibling;
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";

    // Update button text + state
    toggle.textContent = isHidden ? "🙈" : "👁️";
    toggle.setAttribute("aria-pressed", String(isHidden));
  });
});
