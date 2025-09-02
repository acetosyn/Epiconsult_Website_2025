// static/js/about.js
document.addEventListener("DOMContentLoaded", () => {
  const slider = document.querySelector(".video-slider");
  if (!slider) return;

  const track = slider.querySelector(".slider-track");
  const slides = Array.from(slider.querySelectorAll(".slide"));
  const dotsWrap = slider.querySelector(".slider-dots");

  const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let index = 0;
  let timer = null;
  const INTERVAL = 5000; // ms between slides

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.type = "button";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    dot.addEventListener("click", () => goTo(i, true));
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.querySelectorAll(".dot"));

  function setActiveDot(i) {
    dots.forEach((d, k) => d.classList.toggle("active", k === i));
  }

  function loadAndPlay(videoEl) {
    if (!videoEl.getAttribute("src")) {
      const src = videoEl.dataset.src;
      if (src) {
        videoEl.setAttribute("src", src);
        videoEl.load();
      }
    }
    const p = videoEl.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {});
    }
  }

  function pauseVideo(videoEl) {
    try { videoEl.pause(); } catch {}
    // ✅ Do not remove src — keep buffered so no black screen
  }

  function updateVideos(activeIndex) {
    slides.forEach((slide, i) => {
      const v = slide.querySelector(".slide-video");
      if (!v) return;
      if (i === activeIndex) {
        loadAndPlay(v);
      } else {
        pauseVideo(v);
      }
    });
  }

  function goTo(i, userTriggered = false) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    setActiveDot(index);
    updateVideos(index);

    if (userTriggered) {
      restartAuto();
    }
  }

  function next() { goTo(index + 1); }

  function startAuto() {
    if (REDUCED) return;
    if (timer) return;
    timer = setInterval(next, INTERVAL);
  }

  function stopAuto() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  }

  function restartAuto() { stopAuto(); startAuto(); }

  // Pause auto-slide on hover
  slider.addEventListener("mouseenter", stopAuto);
  slider.addEventListener("mouseleave", startAuto);

  // Start once visible
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        goTo(0);
        startAuto();
        io.disconnect();
      }
    });
  }, { threshold: 0.25 });

  io.observe(slider);

  // Prevent context menu
  slider.addEventListener("contextmenu", (e) => e.preventDefault());
});



// about.js

document.addEventListener("DOMContentLoaded", () => {
  const zoomSections = document.querySelectorAll(".zoom-section");

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    { threshold: 0.2 }
  );

  zoomSections.forEach(section => observer.observe(section));
});
