// static/js/login.js

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
    loginForm.classList.add("active");
    signupForm.classList.remove("active");
  } else {
    signupTab.classList.add("active");
    loginTab.classList.remove("active");
    formsWrapper.classList.add("show-signup");
    signupForm.classList.add("active");
    loginForm.classList.remove("active");
  }
}

loginTab?.addEventListener("click", () => switchTab("login"));
signupTab?.addEventListener("click", () => switchTab("signup"));

// ==============================
// Typewriter text
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
  "Secure, fast, and reliable."
]);
typeWriter("signup-typewriter", [
  "Create an account with us to get started.",
  "Join Epiconsult Diagnostics today!"
]);

// ==============================
// Password visibility
// ==============================
document.querySelectorAll(".toggle-password").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const input = toggle.previousElementSibling;
    if (!input) return;
    const isHidden = input.type === "password";
    input.type = isHidden ? "text" : "password";
    toggle.textContent = isHidden ? "🙈" : "👁️";
  });
});

// ==============================
// Helpers
// ==============================
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
window.addEventListener("pageshow", resetLoginButton);
window.addEventListener("DOMContentLoaded", resetLoginButton);

// ==============================
// Supabase Auth Handling
// ==============================

// Login
// ==============================
// Login
// ==============================
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const errorBox = document.getElementById("login-error");
  const submitBtn = document.getElementById("login-submit-btn");

  errorBox.textContent = "";
  submitBtn.disabled = true;
  submitBtn.textContent = "Signing in...";

  try {
    const resp = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await resp.json();

    if (!resp.ok) {
      errorBox.textContent = data.error || "Login failed.";
      resetLoginButton();
      return;
    }

    // success → redirect
    window.location.href = getNextUrl();
  } catch (err) {
    errorBox.textContent = "Network error: " + err.message;
    resetLoginButton();
  }
});

// ==============================
// Signup
// ==============================
signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const first = document.getElementById("signup-first-name")?.value.trim();
  const middle = document.getElementById("signup-middle-name")?.value.trim();
  const last = document.getElementById("signup-last-name")?.value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm-password").value;
  const errorBox = document.getElementById("signup-error");
  const submitBtn = document.getElementById("signup-submit-btn");

  errorBox.textContent = "";

  if (password !== confirm) {
    errorBox.textContent = "Passwords do not match.";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account...";

  try {
    const resp = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        first_name: first,
        middle_name: middle,
        last_name: last
      })
    });

    const data = await resp.json();
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";

    if (!resp.ok) {
      errorBox.textContent = data.error || "Signup failed.";
      return;
    }

    alert(data.message || "Account created. Please check your email to verify.");
    switchTab("login");
  } catch (err) {
    errorBox.textContent = "Network error: " + err.message;
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";
  }
});

// Signup
// Signup
signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const first = document.getElementById("signup-first-name")?.value.trim();
  const middle = document.getElementById("signup-middle-name")?.value.trim();
  const last = document.getElementById("signup-last-name")?.value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm-password").value;
  const errorBox = document.getElementById("signup-error");
  const submitBtn = document.getElementById("signup-submit-btn");

  errorBox.textContent = "";

  if (password !== confirm) {
    errorBox.textContent = "Passwords do not match.";
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account...";

  const fullName = [first, middle, last].filter(Boolean).join(" ");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: fullName } }
  });

  // Reset button state
  submitBtn.disabled = false;
  submitBtn.textContent = "Create Account";

  if (error) {
    errorBox.textContent = error.message;
    return;
  }

  if (data.user && !data.session) {
    // Email confirmation required
    alert("Account created. Please check your email to verify your account before logging in.");
    switchTab("login"); // switch back to login form
  } else if (data.session) {
    // Instant login if email confirmation not required
    window.location.href = "/";
  }
});
