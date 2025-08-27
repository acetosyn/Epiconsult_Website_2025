// Main JavaScript functionality
document.addEventListener("DOMContentLoaded", () => {
  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn")
  const mobileMenu = document.getElementById("mobile-menu")

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden")
    })
  }

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

  // Form handling
  const appointmentForm = document.querySelector("form")
  if (appointmentForm) {
    appointmentForm.addEventListener("submit", function (e) {
      e.preventDefault()

      // Get form data
      const formData = new FormData(this)
      const data = Object.fromEntries(formData)

      // Show loading state
      const submitBtn = this.querySelector('button[type="submit"]')
      const originalText = submitBtn.textContent
      submitBtn.textContent = "Booking..."
      submitBtn.disabled = true

      // Simulate API call
      setTimeout(() => {
        alert("Appointment request submitted! We will contact you shortly to confirm your booking.")
        submitBtn.textContent = originalText
        submitBtn.disabled = false
        this.reset()
      }, 2000)
    })
  }

  // Add loading states to buttons
  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", function () {
      if (this.type !== "submit" && !this.id.includes("chatbot") && !this.classList.contains("hero-dot")) {
        this.style.transform = "scale(0.95)"
        setTimeout(() => {
          this.style.transform = ""
        }, 150)
      }
    })
  })

  // Navbar scroll effect
  const navbar = document.querySelector("nav")
  let lastScrollY = window.scrollY

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY

    if (currentScrollY > 100) {
      navbar.classList.add("shadow-xl")
    } else {
      navbar.classList.remove("shadow-xl")
    }

    lastScrollY = currentScrollY
  })

  // Console log for debugging
  console.log("[v2] Epiconsult Diagnostics website loaded successfully")
  console.log("[v2] Hero slider initialized with", heroSlides.length, "slides")
  console.log("[v2] Scroll animations now handled in scrollAnimations.js")
})

// Error handling
window.addEventListener("error", (e) => {
  console.error("[v2] JavaScript error:", e.error)
})

// Performance monitoring
window.addEventListener("load", () => {
  console.log("[v2] Page fully loaded")

  // Hide loading states if any
  document.querySelectorAll(".loading").forEach((element) => {
    element.classList.remove("loading")
  })
})
