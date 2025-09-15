// static/js/community.js

document.addEventListener("DOMContentLoaded", () => {
  // Community Services
  const services = [
    {
      title: "Health Awareness Campaigns",
      desc: "Creating awareness on preventable diseases and lifestyle choices.",
      icon: "🩺",
    },
    {
      title: "Free Screening Programs",
      desc: "Blood pressure, diabetes, cancer, and other routine checks.",
      icon: "🧪",
    },
    {
      title: "School Health Outreach",
      desc: "Educating young people on hygiene, nutrition, and fitness.",
      icon: "🏫",
    },
    {
      title: "Rural Medical Missions",
      desc: "Taking healthcare to underserved communities across Nigeria.",
      icon: "🌍",
    },
    {
      title: "Maternal & Child Health",
      desc: "Programs designed for safe motherhood and child development.",
      icon: "👩‍👧",
    },
    {
      title: "Partnerships & Advocacy",
      desc: "Working with NGOs and government bodies for stronger impact.",
      icon: "🤝",
    },
  ];

  const servicesGrid = document.getElementById("community-services");
  services.forEach((s) => {
    const card = document.createElement("div");
    card.className =
      "bg-white p-6 rounded-xl shadow hover:shadow-lg transition";
    card.innerHTML = `
      <div class="text-5xl mb-4">${s.icon}</div>
      <h3 class="text-xl font-bold text-navy mb-2">${s.title}</h3>
      <p class="text-gray-600">${s.desc}</p>
    `;
    servicesGrid.appendChild(card);
  });

  // Event Gallery
  const events = [
    { src: "/static/images/events/1.jpg", alt: "Breast Cancer Awareness Walk" },
    { src: "/static/images/events/2.jpg", alt: "Community Free Screening" },
    { src: "/static/images/events/3.jpg", alt: "School Health Talk" },
    { src: "/static/images/events/4.jpg", alt: "World Diabetes Day" },
    { src: "/static/images/events/5.jpg", alt: "Maternal Health Campaign" },
    { src: "/static/images/events/6.jpg", alt: "HIV/AIDS Awareness Program" },
  ];

  const gallery = document.getElementById("event-gallery");
  events.forEach((e) => {
    const img = document.createElement("img");
    img.src = e.src;
    img.alt = e.alt;
    img.className = "rounded-xl shadow-md hover:scale-105 transition";
    gallery.appendChild(img);
  });

  // Health Days Calendar
  const days = [
    { date: "Feb 4", title: "World Cancer Day" },
    { date: "Mar 24", title: "World Tuberculosis Day" },
    { date: "Apr 7", title: "World Health Day" },
    { date: "May 31", title: "World No Tobacco Day" },
    { date: "Oct 10", title: "World Mental Health Day" },
    { date: "Nov 14", title: "World Diabetes Day" },
  ];

  const calendar = document.getElementById("calendar-cards");
  days.forEach((d) => {
    const div = document.createElement("div");
    div.className =
      "bg-white p-6 rounded-lg shadow text-center hover:bg-navy hover:text-white transition";
    div.innerHTML = `
      <h3 class="text-2xl font-bold mb-2">${d.date}</h3>
      <p>${d.title}</p>
    `;
    calendar.appendChild(div);
  });

  // Posters
  const posters = [
    { src: "/static/images/posters/1.jpg", alt: "Hygiene Awareness" },
    { src: "/static/images/posters/2.jpg", alt: "Diabetes Screening" },
    { src: "/static/images/posters/3.jpg", alt: "Stop Malaria Campaign" },
  ];

  const posterCards = document.getElementById("poster-cards");
  posters.forEach((p) => {
    const img = document.createElement("img");
    img.src = p.src;
    img.alt = p.alt;
    img.className = "rounded-xl shadow hover:scale-105 transition";
    posterCards.appendChild(img);
  });

  // Impact Counter Animation
  function animateCounter(id, target) {
    let count = 0;
    const el = document.getElementById(id);
    const interval = setInterval(() => {
      if (count >= target) {
        clearInterval(interval);
      } else {
        count++;
        el.textContent = count.toLocaleString();
      }
    }, 30);
  }

  animateCounter("counter-people", 50000);
  animateCounter("counter-events", 120);
  animateCounter("counter-cities", 36);
});
