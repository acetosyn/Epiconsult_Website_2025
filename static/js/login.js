// ==============================
// 🌐 Login & Register Scripts
// ==============================

// Tab buttons & forms
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const formsWrapper = document.querySelector(".auth-forms");

// Switch to Login
loginTab.addEventListener("click", () => {
  loginTab.classList.add("active");
  signupTab.classList.remove("active");

  // Desktop: slide to login
  formsWrapper.classList.remove("show-signup");

  // Mobile: toggle forms
  document.getElementById("loginForm").classList.add("active");
  document.getElementById("signupForm").classList.remove("active");
});

// Switch to Signup
signupTab.addEventListener("click", () => {
  signupTab.classList.add("active");
  loginTab.classList.remove("active");

  // Desktop: slide to signup
  formsWrapper.classList.add("show-signup");

  // Mobile: toggle forms
  document.getElementById("signupForm").classList.add("active");
  document.getElementById("loginForm").classList.remove("active");
});

// ==============================
// ⌨️ Typewriter effect
// ==============================
function typeWriter(elementId, messages, speed = 80, delay = 2500) {
  let i = 0;
  let j = 0;
  let currentMessage = "";
  const element = document.getElementById(elementId);

  function type() {
    if (!element) return; // safety guard

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
        setTimeout(type, speed);
      }, delay);
    }
  }
  type();
}

// Typewriter texts
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
    if (input.type === "password") {
      input.type = "text";
      toggle.textContent = "🙈";
    } else {
      input.type = "password";
      toggle.textContent = "👁️";
    }
  });
});
