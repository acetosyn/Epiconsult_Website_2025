// static/js/base.js
document.addEventListener("DOMContentLoaded", () => {
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
  // Button Click Feedback (safe)
  // =============================
  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", function () {
<<<<<<< HEAD
      if (
        this.type !== "submit" &&
        !this.id.includes("chatbot") &&
=======
      const id = this.id || "";
      if (
        this.type !== "submit" &&
        !id.includes("chatbot") &&
>>>>>>> staging
        !this.classList.contains("hero-dot")
      ) {
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
<<<<<<< HEAD
  // Navbar Auth Toggle
  // =============================
  const loginLink = document.getElementById("login-link");
  const loginLinkMobile = document.getElementById("login-link-mobile");
  const userSection = document.getElementById("user-section");
  const userSectionMobile = document.getElementById("user-section-mobile");
  const welcomeMsg = document.getElementById("welcome-msg");
  const welcomeMsgMobile = document.getElementById("welcome-msg-mobile");

  const { isLoggedIn, username } = window.__USER__ || {
    isLoggedIn: false,
    username: "",
  };

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
=======
>>>>>>> staging
  // Safe HeroSlides Logging
  // =============================
  if (typeof heroSlides !== "undefined" && Array.isArray(heroSlides)) {
    console.log("[v2] Hero slider initialized with", heroSlides.length, "slides");
  }

  console.log("[v2] Epiconsult Diagnostics website loaded successfully (base.js)");
});

// =============================
// Error Handling
// =============================
window.addEventListener("error", (e) => {
  console.error("[v2] JavaScript error in base.js:", e.error || e.message || e);
});

// =============================
// Performance Monitoring
// =============================
window.addEventListener("load", () => {
<<<<<<< HEAD
  console.log("[v2] Page fully loaded");
  document.querySelectorAll(".loading").forEach((el) =>
    el.classList.remove("loading")
  );
=======
  console.log("[v2] Page fully loaded (base.js)");
  document.querySelectorAll(".loading").forEach((el) => el.classList.remove("loading"));
>>>>>>> staging
});
