// imaging_hero.js
document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".imaging-hero-slide");
  let currentSlide = 0;
  let interval = 5000; // 5 seconds

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }

  // Initialize first slide
  showSlide(currentSlide);

  // Auto-slide
  setInterval(nextSlide, interval);
});
