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






  // Hero Slider
  const heroSlides = document.querySelectorAll(".hero-slide")
  const heroDots = document.querySelectorAll(".hero-dot")
  let currentSlide = 0
  let slideInterval

  function showSlide(index) {
    // Hide all slides
    heroSlides.forEach((slide) => {
      slide.classList.remove("active")
      slide.style.opacity = "0"
    })

    // Remove active class from all dots
    heroDots.forEach((dot) => {
      dot.classList.remove("active")
      dot.classList.remove("bg-accent-orange")
      dot.classList.add("bg-white/50")
    })

    // Show current slide
    if (heroSlides[index]) {
      heroSlides[index].classList.add("active")
      heroSlides[index].style.opacity = "1"
    }

    // Activate current dot
    if (heroDots[index]) {
      heroDots[index].classList.add("active")
      heroDots[index].classList.add("bg-accent-orange")
      heroDots[index].classList.remove("bg-white/50")
    }
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % heroSlides.length
    showSlide(currentSlide)
  }

  function startSlideshow() {
    slideInterval = setInterval(nextSlide, 5000) // Change slide every 5 seconds
  }

  function stopSlideshow() {
    if (slideInterval) {
      clearInterval(slideInterval)
    }
  }

  // Initialize hero slider
  if (heroSlides.length > 0) {
    showSlide(0)
    startSlideshow()

    // Add click handlers to dots
    heroDots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        currentSlide = index
        showSlide(currentSlide)
        stopSlideshow()
        startSlideshow() // Restart the slideshow
      })
    })

    // Pause slideshow on hover
    const heroSection = document.querySelector(".hero-slider")
    if (heroSection) {
      heroSection.addEventListener("mouseenter", stopSlideshow)
      heroSection.addEventListener("mouseleave", startSlideshow)
    }
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })