// carousel_slider.js
document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");
  let currentIndex = 0;
  const intervalTime = 8000; // 8s

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
    let next = (currentIndex + 1) % slides.length;
    showSlide(next);
  }

  let interval = setInterval(nextSlide, intervalTime);

  // allow manual navigation
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      clearInterval(interval);
      showSlide(i);
      interval = setInterval(nextSlide, intervalTime);
    });
  });

  // initialize first slide
  showSlide(currentIndex);
});
