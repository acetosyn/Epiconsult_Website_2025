// static/js/login.js
// Auth flow with Supabase-backed Flask endpoints (/login, /signup)

// -----------------------------
// UI: Tabs & helpers
// -----------------------------
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const formsWrapper = document.querySelector(".auth-forms");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const flashBox = document.getElementById("flash-message");

function showFlash(message, type = "info") {
  if (!flashBox) return;
  flashBox.textContent = message;
  flashBox.className = `flash-message ${type}`;
  flashBox.style.display = "block";
  setTimeout(() => {
    flashBox.style.display = "none";
  }, 4000);
}

function classifyError(msg) {
  msg = (msg || "").toLowerCase();
  if (msg.includes("incorrect") || msg.includes("password")) return "error";
  if (msg.includes("not found")) return "warning";
  if (msg.includes("confirm")) return "info";
  return "error";
}

function switchTab(target) {
  if (target === "login") {
    loginTab?.classList.add("active");
    signupTab?.classList.remove("active");
    formsWrapper?.classList.remove("show-signup");
    loginForm?.classList.add("active");
    signupForm?.classList.remove("active");
  } else {
    signupTab?.classList.add("active");
    loginTab?.classList.remove("active");
    formsWrapper?.classList.add("show-signup");
    signupForm?.classList.add("active");
    loginForm?.classList.remove("active");
  }
}

loginTab?.addEventListener("click", () => switchTab("login"));
signupTab?.addEventListener("click", () => switchTab("signup"));

// -----------------------------
// Typewriter
// -----------------------------
function typeWriter(elementId, messages, speed = 80, delay = 2500) {
  const element = document.getElementById(elementId);
  if (!element) return;
  let i = 0, j = 0, current = "";
  function type() {
    if (j < messages[i].length) {
      current += messages[i].charAt(j++);
      element.textContent = current;
      setTimeout(type, speed);
    } else {
      setTimeout(() => { current = ""; j = 0; i = (i + 1) % messages.length; type(); }, delay);
    }
  }
  type();
}
typeWriter("login-typewriter", ["Sign in to access your dashboard.", "Secure, fast, and reliable."]);
typeWriter("signup-typewriter", ["Create an account with us to get started.", "Join Epiconsult Diagnostics today!"]);

// -----------------------------
// Toggle password visibility
// -----------------------------
document.querySelectorAll(".toggle-password").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const inputId = toggle.dataset.target;
    const input = document.getElementById(inputId);
    if (!input) return;
    input.type = input.type === "password" ? "text" : "password";
  });
});

// -----------------------------
// Helpers
// -----------------------------
function getNextUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("next") || "/";
}
function toggleLoader(btn, show) {
  if (!btn) return;
  const text = btn.querySelector(".btn-text");
  const loader = btn.querySelector(".loader");
  if (show) {
    btn.disabled = true;
    text.hidden = true;
    loader.hidden = false;
  } else {
    btn.disabled = false;
    text.hidden = false;
    loader.hidden = true;
  }
}

// ======================
// LOGIN
// ======================
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const submitBtn = document.getElementById("login-submit-btn");

  toggleLoader(submitBtn, true);

  try {
    const resp = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ email, password })
    });

    const data = await resp.json().catch(() => ({}));
    toggleLoader(submitBtn, false);

    if (!resp.ok) {
      const errMsg = data.error || data.message || data.error_description || "Login failed. Please try again.";
      showFlash(errMsg, classifyError(errMsg));
      return;
    }

    // Success → redirect
    window.location.href = getNextUrl();
  } catch (err) {
    toggleLoader(submitBtn, false);
    showFlash("Network error: " + err.message, "error");
  }
});

// ======================
// SIGNUP
// ======================
signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const first = document.getElementById("signup-first-name")?.value.trim() || "";
  const middle = document.getElementById("signup-middle-name")?.value.trim() || "";
  const last = document.getElementById("signup-last-name")?.value.trim() || "";
  const email = document.getElementById("signup-email")?.value.trim();
  const password = document.getElementById("signup-password")?.value;
  const confirm = document.getElementById("signup-confirm-password")?.value;
  const submitBtn = document.getElementById("signup-submit-btn");

  if (!email || !password) {
    showFlash("Email and password required.", "error");
    return;
  }
  if (password !== confirm) {
    showFlash("Passwords do not match.", "error");
    return;
  }

  toggleLoader(submitBtn, true);

  try {
    const resp = await fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        email,
        password,
        first_name: first || null,
        middle_name: middle || null,
        last_name: last || null
      })
    });

    const data = await resp.json().catch(() => ({}));
    toggleLoader(submitBtn, false);

    if (!resp.ok) {
      const errMsg = data.error || data.message || data.error_description || "Signup failed.";
      showFlash(errMsg, classifyError(errMsg));
      return;
    }

    // Always redirect to login with flash
    if (data.redirect) {
      showFlash(data.message || "Account created successfully. Please login.", "success");
      switchTab("login");
    }
  } catch (err) {
    toggleLoader(submitBtn, false);
    showFlash("Network error: " + err.message, "error");
  }
});
