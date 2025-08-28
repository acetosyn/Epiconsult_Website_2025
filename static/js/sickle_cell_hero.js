// static/js/sickle_cell_hero.js
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll(".sickle-hero-slide");
    const dots = document.querySelectorAll(".sickle-hero-dot");
    const heroText = document.querySelector(".sickle-hero-text");

    console.log("[sickle_cell_hero] slides found:", slides.length, "dots found:", dots.length);

    if (!slides || slides.length === 0) {
      console.warn("[sickle_cell_hero] no .sickle-hero-slide elements found — exiting.");
      return;
    }

    let currentIndex = 0;
    const intervalTime = 8000; // 8s
    let slideInterval = null;

    function applyClasses(slide, isActive) {
      // We rely on the Tailwind classes already present: opacity-0 / opacity-100 / transition-opacity / duration-1000
      slide.classList.toggle("opacity-100", isActive);
      slide.classList.toggle("opacity-0", !isActive);
    }

    function showSlide(index, animateText = true) {
      if (!slides || slides.length === 0) return;

      const safeIndex = ((index % slides.length) + slides.length) % slides.length;
      slides.forEach((slide, i) => applyClasses(slide, i === safeIndex));

      if (dots && dots.length > 0) {
        dots.forEach((dot, i) => {
          dot.classList.toggle("bg-teal-500", i === safeIndex);
          dot.classList.toggle("bg-teal-500/50", i !== safeIndex);
        });
      }

      currentIndex = safeIndex;
      console.debug("[sickle_cell_hero] showSlide:", currentIndex);

      // optional text animation on new slide
      if (heroText && animateText) {
        heroText.classList.remove("opacity-100", "translate-y-0");
        heroText.classList.add("opacity-0", "translate-y-4");
        // force reflow then animate in
        void heroText.offsetWidth;
        setTimeout(() => {
          heroText.classList.remove("opacity-0", "translate-y-4");
          heroText.classList.add("transition-all", "duration-1000", "ease-out", "opacity-100", "translate-y-0");
        }, 80);
      }
    }

    function nextSlide() {
      showSlide((currentIndex + 1) % slides.length);
    }

    // initialize: ensure each slide has the classes expected by the script/Tailwind
    slides.forEach((slide, i) => {
      // make sure transition classes exist (safe idempotent)
      slide.classList.add("transition-opacity", "duration-1000");
      // ensure both opacity classes exist somewhere in the DOM so Tailwind won't purge them
      // (we don't remove anything here; we set proper initial state next)
    });

    // show first slide
    showSlide(0, true);

    // only auto-rotate if we have more than one slide
    if (slides.length > 1) {
      slideInterval = setInterval(nextSlide, intervalTime);
    }

    // dot click handlers (if dots present)
    if (dots && dots.length > 0) {
      dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
          if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
          }
          showSlide(i);
          // restart auto rotate after manual click
          if (slides.length > 1) slideInterval = setInterval(nextSlide, intervalTime);
        });
      });
    }

    // make script resilient to dynamic changes: if slides added later, nothing breaks
    // (no MutationObserver added here to keep it simple)
  });
})();
