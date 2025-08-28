// static/js/main.js
document.addEventListener("DOMContentLoaded", () => {
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Form handling
  const appointmentForm = document.querySelector("form");
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
        alert("Appointment request submitted! We will contact you shortly to confirm your booking.");
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        this.reset();
      }, 2000);
    });
  }

  // Add button press animation (excluding hero dots + chatbot UI)
  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", function () {
      if (
        this.type !== "submit" &&
        !this.id.includes("chatbot") &&
        !this.classList.contains("hero-dot")
      ) {
        this.style.transform = "scale(0.95)";
        setTimeout(() => {
          this.style.transform = "";
        }, 150);
      }
    });
  });

  // Navbar scroll shadow
  const navbar = document.querySelector("nav");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      navbar.classList.add("shadow-xl");
    } else {
      navbar.classList.remove("shadow-xl");
    }
  });

  console.log("[v2] Epiconsult Diagnostics website loaded successfully");
});

// Error handling
window.addEventListener("error", (e) => {
  console.error("[v2] JavaScript error:", e.error);
});

// Performance monitoring
window.addEventListener("load", () => {
  console.log("[v2] Page fully loaded");
  document.querySelectorAll(".loading").forEach((element) => {
    element.classList.remove("loading");
  });
});

// Reset mobile menu on resize to desktop
window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) {
    const mobileMenu = document.getElementById("mobile-menu");
    const hamburger = document.getElementById("icon-hamburger");
    const closeIcon = document.getElementById("icon-close");

    if (mobileMenu) {
      mobileMenu.classList.remove("max-h-screen", "opacity-100");
      mobileMenu.classList.add("max-h-0", "opacity-0");
    }
    if (hamburger) hamburger.classList.remove("hidden");
    if (closeIcon) closeIcon.classList.add("hidden");
  }
});
