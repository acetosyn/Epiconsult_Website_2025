// scrollAnimations.js
document.addEventListener("DOMContentLoaded", () => {
  // -----------------------
  // Generic Scroll Animations
  // -----------------------
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        obs.unobserve(entry.target); // only once
      }
    });
  }, observerOptions);

  // Reveal sections + text blocks
  const revealElements = document.querySelectorAll(
    "section, .reveal-on-scroll, .hero-text"
  );
  revealElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(40px)";
    el.style.transition = "opacity 0.8s ease, transform 0.8s ease";
    observer.observe(el);
  });

  // Animate cards in grids (staggered)
  const featureGrids = document.querySelectorAll(".grid");
  featureGrids.forEach((grid) => {
    const children = grid.querySelectorAll(
      ".feature-card, div.bg-navy, .feature-card-alt, .service-card"
    );
    children.forEach((child, idx) => {
      child.style.opacity = "0";
      child.style.transform = "translateY(30px)";
      child.style.transition = `opacity 0.6s ease ${idx * 0.15}s, transform 0.6s ease ${idx * 0.15}s`;
      observer.observe(child);
    });
  });

  console.log("[scrollAnimations] Initialized successfully");
});
