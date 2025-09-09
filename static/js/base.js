// static/js/base.js

// =============================
// Mobile Menu Toggle
// =============================
const mobileMenuBtn = document.getElementById("mobile-menu-button");
const mobileMenu = document.getElementById("mobile-menu");
const mobileOverlay = document.getElementById("mobile-overlay");

const iconHamburger = document.getElementById("icon-hamburger");
const iconClose = document.getElementById("icon-close");

if (mobileMenuBtn && mobileMenu && mobileOverlay) {
  mobileMenuBtn.addEventListener("click", () => {
    const isOpen = !mobileMenu.classList.contains("translate-x-full");

    if (isOpen) {
      // Close drawer
      mobileMenu.classList.add("translate-x-full");
      mobileOverlay.classList.add("hidden");
      iconHamburger.classList.remove("hidden");
      iconClose.classList.add("hidden");
    } else {
      // Open drawer
      mobileMenu.classList.remove("translate-x-full");
      mobileOverlay.classList.remove("hidden");
      iconHamburger.classList.add("hidden");
      iconClose.classList.remove("hidden");
    }
  });

  // Close when overlay clicked
  mobileOverlay.addEventListener("click", () => {
    mobileMenu.classList.add("translate-x-full");
    mobileOverlay.classList.add("hidden");
    iconHamburger.classList.remove("hidden");
    iconClose.classList.add("hidden");
  });
}

// =============================
// Navbar Auth Toggle
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const loginLink = document.getElementById("login-link");
  const loginLinkMobile = document.getElementById("login-link-mobile");
  const userSection = document.getElementById("user-section");
  const userSectionMobile = document.getElementById("user-section-mobile");
  const welcomeMsg = document.getElementById("welcome-msg");
  const welcomeMsgMobile = document.getElementById("welcome-msg-mobile");

  // Values injected by Flask into base.html
  const { isLoggedIn, username } = window.__USER__ || { isLoggedIn: false, username: "" };

  if (isLoggedIn) {
    // Show user profile section
    loginLink?.classList.add("hidden-user");
    loginLinkMobile?.classList.add("hidden-user");
    userSection?.classList.remove("hidden-user");
    userSectionMobile?.classList.remove("hidden-user");

    if (welcomeMsg) welcomeMsg.textContent = `Welcome, ${username}`;
    if (welcomeMsgMobile) welcomeMsgMobile.textContent = `Welcome, ${username}`;
  } else {
    // Show login buttons
    loginLink?.classList.remove("hidden-user");
    loginLinkMobile?.classList.remove("hidden-user");
    userSection?.classList.add("hidden-user");
    userSectionMobile?.classList.add("hidden-user");

    if (welcomeMsg) welcomeMsg.textContent = "";
    if (welcomeMsgMobile) welcomeMsgMobile.textContent = "";
  }
});
