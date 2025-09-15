// static/js/main.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v2] Epiconsult main.js loaded");

  // ✅ Only page-specific or experimental scripts here

  // Safe heroSlides check
  if (typeof heroSlides !== "undefined" && Array.isArray(heroSlides)) {
    console.log("[v2] Hero slider initialized with", heroSlides.length, "slides");
  }

  console.log("[v2] Scroll animations handled separately (scrollAnimation.js)");
});

// Error handling
window.addEventListener("error", (e) => {
  console.error("[v2] JavaScript error in main.js:", e.error || e.message || e);
});

// Performance monitoring
window.addEventListener("load", () => {
  console.log("[v2] Page fully loaded (main.js)");
});
