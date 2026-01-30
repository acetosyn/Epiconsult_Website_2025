(() => {
  const slider = document.getElementById("epicHero");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".epic-slide"));

  const titleEl = document.getElementById("epicTitle");
  const subtitleEl = document.getElementById("epicSubtitle");

  const INTERVAL = 6000;
  const TEXT_DELAY = 250;

  // 16 images + 10 captions: change caption every 2 images
  const GROUP_SIZE = 2;

  // 10 real Epiconsult captions (service-reflective)
  const TEXT_SECTIONS = [
    {
      title: "Accurate <span class='text-yellow-400'>Laboratory Testing</span>",
      subtitle: "Reliable blood and lab investigations to guide confident clinical decisions."
    },
    {
      title: "Advanced <span class='text-yellow-400'>Diagnostic Screening</span>",
      subtitle: "Specialized panels for deeper insight — from immunology to hormonal testing."
    },
    {
      title: "Radiology & <span class='text-yellow-400'>Imaging</span>",
      subtitle: "Clear imaging support — ultrasound, X-ray, CT, MRI and specialized studies."
    },
    {
      title: "Cardiac <span class='text-yellow-400'>Diagnostics</span>",
      subtitle: "Heart checks that matter — ECG, ECHO, and monitoring for early detection."
    },
    {
      title: "Women’s <span class='text-yellow-400'>Health Services</span>",
      subtitle: "Screening, antenatal support, and gynecology-focused care with empathy."
    },
    {
      title: "General <span class='text-yellow-400'>Consultation</span> & Counseling",
      subtitle: "Professional evaluation, guidance, and care plans tailored to each patient."
    },
    {
      title: "<span class='text-yellow-400'>Sickle Cell Clinic</span> Support",
      subtitle: "Screening, counseling, and routine care designed for long-term wellbeing."
    },
    {
      title: "Antenatal Care & <span class='text-yellow-400'>Delivery</span>",
      subtitle: "Safe pregnancy journey support — from screening to delivery care."
    },
    {
      title: "Blood Bank & <span class='text-yellow-400'>Donor Services</span>",
      subtitle: "Safe blood services, donor support, and timely access when it matters most."
    },
    {
      title: "Specialist & <span class='text-yellow-400'>Surgical Care</span>",
      subtitle: "Access to specialist clinics and surgical support for complex health needs."
    }
  ];

  let index = 0;
  let timer = null;

  function getSectionForSlide(i) {
    return TEXT_SECTIONS[Math.floor(i / GROUP_SIZE) % TEXT_SECTIONS.length];
  }

  function updateText(i) {
    if (!titleEl || !subtitleEl) return;

    const section = getSectionForSlide(i);

    // animate out
    titleEl.classList.remove("epic-text-in");
    subtitleEl.classList.remove("epic-text-in");
    titleEl.classList.add("epic-text-out");
    subtitleEl.classList.add("epic-text-out");

    // swap and animate in
    setTimeout(() => {
      titleEl.innerHTML = section.title;
      subtitleEl.textContent = section.subtitle;

      titleEl.classList.remove("epic-text-out");
      subtitleEl.classList.remove("epic-text-out");
      titleEl.classList.add("epic-text-in");
      subtitleEl.classList.add("epic-text-in");
    }, TEXT_DELAY);
  }

  function applyState(newIndex, prevIndex) {
    slides.forEach(s => s.classList.remove("is-active", "is-prev", "is-next"));

    if (slides[prevIndex]) slides[prevIndex].classList.add("is-prev");
    slides[newIndex].classList.add("is-active");

    const nextIndex = (newIndex + 1) % slides.length;
    slides[nextIndex].classList.add("is-next");

    updateText(newIndex);
  }

  function goNext() {
    const prev = index;
    index = (index + 1) % slides.length;
    applyState(index, prev);
  }

  function start() {
    if (timer) clearInterval(timer);
    timer = setInterval(goNext, INTERVAL);
  }

  // init
  slides.forEach((s, i) => {
    s.classList.remove("is-active", "is-prev", "is-next");
    s.classList.add(i === 0 ? "is-active" : "is-next");
  });

  updateText(0);
  start();
})();
