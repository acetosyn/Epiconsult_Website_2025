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
  // Button Click Feedback
  // =============================
  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", function () {
      if (
        this.type !== "submit" &&
        !this.id.includes("chatbot") &&
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
  // Safe HeroSlides Logging
  // =============================
  if (typeof heroSlides !== "undefined" && Array.isArray(heroSlides)) {
    console.log("[v2] Hero slider initialized with", heroSlides.length, "slides");
  }

  console.log("[v2] Epiconsult Diagnostics website loaded successfully (base.js)");
});

// Error Handling
window.addEventListener("error", (e) => {
  console.error("[v2] JavaScript error in base.js:", e.error || e.message || e);
});

// Performance Monitoring
window.addEventListener("load", () => {
  console.log("[v2] Page fully loaded (base.js)");
  document.querySelectorAll(".loading").forEach((el) => el.classList.remove("loading"));
});
