// static/js/clinic.js
document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".hero-slide");
  if (!slides || slides.length === 0) return; // guard

  let index = 0;
  const effects = ["flip", "cover", "uncover"];

  function showNextSlide() {
    const current = slides[index];
    current.classList.remove("active");

    index = (index + 1) % slides.length;
    const next = slides[index];
    const effect = effects[index % effects.length];

    // Reset
    next.classList.remove("flip-enter", "flip-active", "cover-enter", "cover-active", "uncover-enter", "uncover-active");

    // Apply effect
    next.classList.add(`${effect}-enter`);
    requestAnimationFrame(() => {
      next.classList.add(`${effect}-active`, "active");
    });

    // Hide others after animation
    setTimeout(() => {
      slides.forEach((s, i) => {
        if (i !== index) s.classList.remove("active");
      });
    }, 1000);
  }

  // First slide visible
  slides[0].classList.add("active");

  // Rotate every 4s
  setInterval(showNextSlide, 4000);
});
