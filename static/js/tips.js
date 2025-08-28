document.addEventListener("DOMContentLoaded", function () {
  const tipsContainer = document.querySelector("#tips-container");

  async function loadDailyTips() {
    try {
      const response = await fetch("/get-daily-tips");
      const tips = await response.json();

      if (Array.isArray(tips) && tips.length > 0) {
        displayTips(tips);
      } else {
        tipsContainer.innerHTML = "<li class='text-gray-500'>No tips available at the moment.</li>";
      }
    } catch (error) {
      console.error("Error fetching tips:", error);
      // fallback demo tips (for design stage)
      const fallback = [
        { tip: "Stay hydrated: Drink at least 8 glasses of water daily." },
        { tip: "Avoid extreme temperatures to reduce crises." },
        { tip: "Schedule regular medical check-ups." },
      ];
      displayTips(fallback);
    }
  }

  function displayTips(tips) {
    let currentTipIndex = 0;
    const tipElement = document.createElement("li");
    tipElement.classList.add("animated-tip", "font-medium");
    tipsContainer.appendChild(tipElement);

    function updateTip() {
      tipElement.textContent = tips[currentTipIndex].tip;
      tipElement.classList.remove("slide-in-out");
      void tipElement.offsetWidth; // restart animation
      tipElement.classList.add("slide-in-out");
      currentTipIndex = (currentTipIndex + 1) % tips.length;
    }

    updateTip();
    setInterval(updateTip, 5000);
  }

  loadDailyTips();
});
