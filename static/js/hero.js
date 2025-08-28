// static/js/hero.js
document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");
  const heroText = document.querySelector(".hero-text");
  const heroSection = document.querySelector(".hero-slider");

  console.log("[hero.js] slides:", slides.length);

  if (!slides || slides.length === 0) return;

  let currentIndex = 0;
  const intervalTime = 10000; // 10s autoplay
  let slideInterval = null;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.classList.toggle("opacity-0", i !== index);
      slide.classList.toggle("active", i === index);
      slide.style.opacity = i === index ? "1" : "0";
    });

    if (dots && dots.length > 0) {
      dots.forEach((dot, i) => {
        dot.classList.toggle("bg-yellow-400", i === index);
        dot.classList.toggle("bg-yellow-400/50", i !== index);
      });
    }

    currentIndex = index;
  }

  function nextSlide() {
    let nextIndex = (currentIndex + 1) % slides.length;
    showSlide(nextIndex);
  }

  function startSlideshow() {
    if (slides.length > 1) slideInterval = setInterval(nextSlide, intervalTime);
  }

  function stopSlideshow() {
    if (slideInterval) clearInterval(slideInterval);
  }

  // Init
  showSlide(currentIndex);
  startSlideshow();

  // Dot clicks
  if (dots && dots.length > 0) {
    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        stopSlideshow();
        showSlide(i);
        startSlideshow();
      });
    });
  }

  // Pause on hover
  if (heroSection) {
    heroSection.addEventListener("mouseenter", stopSlideshow);
    heroSection.addEventListener("mouseleave", startSlideshow);
  }

  // Animate text on first load
  if (heroText) {
    setTimeout(() => {
      heroText.classList.remove("opacity-0", "translate-y-10");
      heroText.classList.add(
        "transition-all",
        "duration-1000",
        "ease-out",
        "opacity-100",
        "translate-y-0"
      );
    }, 300);
  }
});
