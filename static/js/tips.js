document.addEventListener("DOMContentLoaded", () => {
  const tipsContainer = document.querySelector("#tips-container");
  const tipsUrl = tipsContainer.dataset.url || "/static/data/tips.json";

  let tips = [];
  let currentIndex = 0;
  const tipsPerPage = 6; // number of tips visible at once
  const rotationInterval = 12000; // 12 seconds per "page"

  async function loadDailyTips() {
    try {
      const response = await fetch(tipsUrl);
      if (!response.ok) throw new Error("Failed to fetch tips.");
      tips = await response.json();

      shuffleTips(tips); // randomize tips order once
      renderTips();
      setInterval(() => fadeOutAndNext(), rotationInterval);
    } catch (error) {
      console.error("Error loading tips:", error);
      tips = [
        { tip: "Stay hydrated: Drink at least 8 glasses of water daily." },
        { tip: "Avoid extreme temperatures to reduce crises." },
        { tip: "Schedule regular medical check-ups." },
        { tip: "Maintain a balanced diet with iron-rich foods." },
        { tip: "Engage in light exercise to improve circulation." },
        { tip: "Get enough rest to support your immune system." },
      ];
      renderTips();
    }
  }

  function shuffleTips(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function renderTips() {
    tipsContainer.innerHTML = ""; // clear previous

    const slice = tips.slice(currentIndex, currentIndex + tipsPerPage);

    // If we reach the end, loop back
    if (slice.length < tipsPerPage) {
      slice.push(...tips.slice(0, tipsPerPage - slice.length));
      currentIndex = 0;
    } else {
      currentIndex += tipsPerPage;
    }

    slice.forEach((t, i) => {
      const card = document.createElement("div");
      card.className =
        "tip-card zoom-effect stagger-item fade-zoom bg-white border border-gray-200 rounded-2xl shadow-md p-6 text-center transform transition duration-500 opacity-0 translate-y-4";

      const text = document.createElement("p");
      text.className = "text-gray-700 font-medium";
      text.textContent = t.tip;

      card.appendChild(text);
      tipsContainer.appendChild(card);

      // staggered fade-in animation
      setTimeout(() => {
        card.classList.remove("opacity-0", "translate-y-4");
        card.classList.add("opacity-100", "translate-y-0");
      }, i * 200);
    });
  }

  function fadeOutAndNext() {
    const cards = tipsContainer.querySelectorAll(".tip-card");
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.classList.add("opacity-0", "translate-y-4");
      }, i * 100);
    });

    // after fade-out, load next tips
    setTimeout(renderTips, 600);
  }

  loadDailyTips();
});
