// hero.js

document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");
  const heroText = document.querySelector(".hero-text");
  let currentIndex = 0;
  const intervalTime = 10000; // 10 seconds

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("opacity-0", i !== index);
      slide.classList.toggle("active", i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle("bg-yellow-400", i === index);
      dot.classList.toggle("bg-yellow-400/50", i !== index);
    });
    currentIndex = index;
  }

  function nextSlide() {
    let nextIndex = (currentIndex + 1) % slides.length;
    showSlide(nextIndex);
  }

  let slideInterval = setInterval(nextSlide, intervalTime);

  // Allow manual dot click
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      clearInterval(slideInterval);
      showSlide(i);
      slideInterval = setInterval(nextSlide, intervalTime);
    });
  });

  // Init first slide
  showSlide(currentIndex);

  // Animate text on first load
  if (heroText) {
    setTimeout(() => {
      heroText.classList.remove("opacity-0", "translate-y-10");
      heroText.classList.add("transition-all", "duration-1000", "ease-out", "opacity-100", "translate-y-0");
    }, 300);
  }
});
