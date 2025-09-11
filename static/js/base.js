// static/js/base.js

document.addEventListener("DOMContentLoaded", () => {
  // =============================
  // Mobile Menu Toggle (Drawer + Overlay)
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
        mobileMenu.classList.add("translate-x-full");
        mobileOverlay.classList.add("hidden");
        iconHamburger?.classList.remove("hidden");
        iconClose?.classList.add("hidden");
      } else {
        mobileMenu.classList.remove("translate-x-full");
        mobileOverlay.classList.remove("hidden");
        iconHamburger?.classList.add("hidden");
        iconClose?.classList.remove("hidden");
      }
    });

    mobileOverlay.addEventListener("click", () => {
      mobileMenu.classList.add("translate-x-full");
      mobileOverlay.classList.add("hidden");
      iconHamburger?.classList.remove("hidden");
      iconClose?.classList.add("hidden");
    });
  }

  // =============================
  // Appointment Form Handling
  // =============================
  const appointmentForm = document.getElementById("appointment-form");
  if (appointmentForm) {
    appointmentForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(this);
      const data = Object.fromEntries(formData);

      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Booking...";
      submitBtn.disabled = true;

      setTimeout(() => {
        alert("Appointment request submitted! We will contact you shortly to confirm.");
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        this.reset();
      }, 2000);
    });
  }

  // =============================
  // Button Click Feedback
  // =============================
  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", function () {
      if (this.type !== "submit" && !this.id.includes("chatbot") && !this.classList.contains("hero-dot")) {
        this.style.transform = "scale(0.95)";
        setTimeout(() => (this.style.transform = ""), 150);
      }
    });
  });

  // =============================
  // Navbar Scroll Shadow
  // =============================
  const navbar = document.querySelector("nav");
  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("shadow-xl", window.scrollY > 100);
    });
  }

  // =============================
  // Navbar Auth Toggle
  // =============================
  const loginLink = document.getElementById("login-link");
  const loginLinkMobile = document.getElementById("login-link-mobile");
  const userSection = document.getElementById("user-section");
  const userSectionMobile = document.getElementById("user-section-mobile");
  const welcomeMsg = document.getElementById("welcome-msg");
  const welcomeMsgMobile = document.getElementById("welcome-msg-mobile");

  const { isLoggedIn, username } = window.__USER__ || { isLoggedIn: false, username: "" };

  if (isLoggedIn) {
    loginLink?.classList.add("hidden");
    loginLinkMobile?.classList.add("hidden");
    userSection?.classList.add("visible");
    userSectionMobile?.classList.add("visible");

    if (welcomeMsg) welcomeMsg.textContent = `Welcome, ${username}`;
    if (welcomeMsgMobile) welcomeMsgMobile.textContent = `Welcome, ${username}`;
  } else {
    loginLink?.classList.remove("hidden");
    loginLinkMobile?.classList.remove("hidden");
    userSection?.classList.remove("visible");
    userSectionMobile?.classList.remove("visible");

    if (welcomeMsg) welcomeMsg.textContent = "";
    if (welcomeMsgMobile) welcomeMsgMobile.textContent = "";
  }

  // =============================
  // Safe HeroSlides Logging
  // =============================
  if (typeof heroSlides !== "undefined" && Array.isArray(heroSlides)) {
    console.log("[v2] Hero slider initialized with", heroSlides.length, "slides");
  } else {
    console.log("[v2] Hero slider not initialized (no heroSlides found)");
  }

  console.log("[v2] Epiconsult Diagnostics website loaded successfully");
});

// =============================
// Error Handling
// =============================
window.addEventListener("error", (e) => {
  console.error("[v2] JavaScript error:", e.error || e.message);
});

// =============================
// Performance Monitoring
// =============================
window.addEventListener("load", () => {
  console.log("[v2] Page fully loaded");
  document.querySelectorAll(".loading").forEach((el) => el.classList.remove("loading"));
});
