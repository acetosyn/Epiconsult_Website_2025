// static/js/auth-ui.js
// Centralized UI control for login/logout state
// Listens for `auth-changed` events (detail = user or null)

document.addEventListener("DOMContentLoaded", () => {
  const loginLink = document.getElementById("login-link");
  const loginLinkMobile = document.getElementById("login-link-mobile");
  const userSection = document.getElementById("user-section");
  const userSectionMobile = document.getElementById("user-section-mobile");
  const welcomeMsg = document.getElementById("welcome-msg");
  const welcomeMsgMobile = document.getElementById("welcome-msg-mobile");
  const logoutBtn = document.getElementById("logout-btn");
  const logoutBtnMobile = document.getElementById("logout-btn-mobile");

  function show(el) {
    if (el) el.classList.remove("hidden-user");
  }
  function hide(el) {
    if (el) el.classList.add("hidden-user");
  }

  function updateUI(user) {
    if (user) {
      const name = user.name || (user.email ? user.email.split("@")[0] : "User");
      if (welcomeMsg) welcomeMsg.textContent = `Welcome, ${name}`;
      if (welcomeMsgMobile) welcomeMsgMobile.textContent = `Welcome, ${name}`;
      hide(loginLink);
      hide(loginLinkMobile);
      show(userSection);
      show(userSectionMobile);
    } else {
      show(loginLink);
      show(loginLinkMobile);
      hide(userSection);
      hide(userSectionMobile);
      if (welcomeMsg) welcomeMsg.textContent = "";
      if (welcomeMsgMobile) welcomeMsgMobile.textContent = "";
    }
  }

  // Initial render from Flask-injected user
  updateUI(window.__CURRENT_USER__ || null);

  // Listen for auth changes
  document.addEventListener("auth-changed", (e) => {
    updateUI(e?.detail ?? null);
  });

  // ----------- Logout handler -----------
  async function handleLogout() {
    try {
      const mod = await import("/static/js/firebase.js");
      if (mod && typeof mod.doFirebaseLogout === "function") {
        await mod.doFirebaseLogout();
      } else {
        await fetch("/sessionLogout", { method: "POST" });
      }
    } catch (err) {
      console.error("Logout error:", err);
      try {
        await fetch("/sessionLogout", { method: "POST" });
      } catch (_) {}
    }

    // Notify all listeners: user is logged out
    document.dispatchEvent(new CustomEvent("auth-changed", { detail: null }));

    // Optional redirect
    window.location.href = "/";
  }

  logoutBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    handleLogout();
  });
  logoutBtnMobile?.addEventListener("click", (e) => {
    e.preventDefault();
    handleLogout();
  });

  // ----------- Helper for login -----------
  // Call this from firebase.js or Flask login success
  window.setLoggedInUser = (userObj) => {
    document.dispatchEvent(new CustomEvent("auth-changed", { detail: userObj }));
  };
});
