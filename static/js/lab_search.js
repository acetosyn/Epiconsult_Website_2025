// lab_search.js

window.addEventListener("DOMContentLoaded", () => {
  const globalSearch = document.getElementById("global-search");
  const globalResults = document.getElementById("global-results");

  if (!globalSearch || !globalResults) return; // Prevent errors if elements don’t exist

  function renderGlobalResults(matches) {
    globalResults.innerHTML = "";
    if (matches.length === 0) {
      globalResults.classList.add("hidden");
      return;
    }
    globalResults.classList.remove("hidden");

    matches.forEach(testObj => {
      const categoryName = labData[testObj.category]?.category || "Other";

      const card = document.createElement("div");
      card.className =
        "test-card bg-white shadow-md rounded-xl p-4 mb-3 cursor-pointer hover:shadow-lg transition";

      card.innerHTML = `
        <div class="flex items-center justify-between">
          <h4 class="font-semibold text-gray-800">${testObj.name}</h4>
          <span class="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-600">
            ${categoryName}
          </span>
        </div>
      `;

      card.addEventListener("click", () => {
        // Auto-fill booking form
        const categoryKey = testObj.category;
        document.getElementById("booking-category").value = categoryKey;

        // Trigger population of tests in booking dropdown
        const event = new Event("change");
        document.getElementById("booking-category").dispatchEvent(event);

        document.getElementById("booking-test-input").value = testObj.name;
        document.getElementById("summary-category").textContent =
          labData[categoryKey].category;
        document.getElementById("summary-test").textContent = testObj.name;

        scrollToBooking();

        // ✅ Show Clear button when picking from global search
        if (typeof toggleClearButton === "function") {
          toggleClearButton();
        }
      });

      globalResults.appendChild(card);
    });
  }

  // Search on typing
  globalSearch.addEventListener("input", e => {
    const q = e.target.value.toLowerCase();
    if (q.length < 3) {
      globalResults.classList.add("hidden");
      return;
    }
    const matches = allTests.filter(t => t.name.toLowerCase().includes(q));
    renderGlobalResults(matches);
  });
});
