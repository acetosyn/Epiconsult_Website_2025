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
