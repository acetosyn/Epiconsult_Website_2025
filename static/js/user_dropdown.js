// static/js/user_dropdown.js

// =============================
// Dropdown Toggles (Desktop + Mobile)
// =============================
const userMenuBtn = document.getElementById("user-menu-btn");
const userDropdown = document.getElementById("user-dropdown");

const userMenuBtnMobile = document.getElementById("user-menu-btn-mobile");
const userDropdownMobile = document.getElementById("user-dropdown-mobile");

function toggleDropdown(button, dropdown) {
  if (!button || !dropdown) return;

  button.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show"); // controlled by user_icon.css
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && !button.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
}

toggleDropdown(userMenuBtn, userDropdown);
toggleDropdown(userMenuBtnMobile, userDropdownMobile);

// =============================
// Login / Logout Visibility Logic
// =============================
function showUserMenu(userName) {
  // Desktop
  document.getElementById("login-link")?.classList.add("hidden");
  document.getElementById("user-section")?.classList.remove("opacity-0", "pointer-events-none");
  if (document.getElementById("welcome-msg")) {
    document.getElementById("welcome-msg").textContent = `Hi, ${userName}`;
  }

  // Mobile
  document.getElementById("login-link-mobile")?.classList.add("hidden");
  document.getElementById("user-section-mobile")?.classList.remove("opacity-0", "pointer-events-none");
  if (document.getElementById("welcome-msg-mobile")) {
    document.getElementById("welcome-msg-mobile").textContent = `Hi, ${userName}`;
  }
}

function logoutUser() {
  // Desktop
  document.getElementById("login-link")?.classList.remove("hidden");
  document.getElementById("user-section")?.classList.add("opacity-0", "pointer-events-none");
  if (document.getElementById("welcome-msg")) {
    document.getElementById("welcome-msg").textContent = "";
  }

  // Mobile
  document.getElementById("login-link-mobile")?.classList.remove("hidden");
  document.getElementById("user-section-mobile")?.classList.add("opacity-0", "pointer-events-none");
  if (document.getElementById("welcome-msg-mobile")) {
    document.getElementById("welcome-msg-mobile").textContent = "";
  }
}

// =============================
// Logout Button Hooks
// =============================
document.getElementById("logout-btn")?.addEventListener("click", (e) => {
  e.preventDefault();
  logoutUser();
});

document.getElementById("logout-btn-mobile")?.addEventListener("click", (e) => {
  e.preventDefault();
  logoutUser();
});
