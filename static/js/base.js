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
