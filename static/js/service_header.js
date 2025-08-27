document.addEventListener("DOMContentLoaded", () => {
  const heroSlider = document.querySelector(".hero-slider");
  const heroSlides = heroSlider ? heroSlider.querySelectorAll("img") : [];
  const textSlides = document.querySelectorAll("#hero-texts .hero-slide");

  let index = 0;

  function showSlide(i) {
    // --- Handle image slides ---
    if (heroSlides.length > 0) {
      heroSlider.style.transform = `translateX(-${i * 100}%)`;
    }

    // --- Handle text slides ---
    textSlides.forEach((s) => {
      s.classList.add("hidden", "opacity-0");
      s.classList.remove("opacity-100", "cover", "push", "reveal", "blinds", "ripple", "flip");
    });

    if (textSlides[i]) {
      const effect = textSlides[i].dataset.effect || "opacity-100";
      textSlides[i].classList.remove("hidden", "opacity-0");
      textSlides[i].classList.add("opacity-100", effect);
    }
  }

  if (heroSlides.length > 0 || textSlides.length > 0) {
    showSlide(0); // initial
    setInterval(() => {
      index = (index + 1) % Math.max(heroSlides.length, textSlides.length);
      showSlide(index);
    }, 15000); // 15s interval
  }
});
