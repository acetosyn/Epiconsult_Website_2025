// static/js/lab_data.js

let testPopup;
let searchInput;
let resultContainer;
let currentTests = [];
let allTests = [];
let labData = {}; // global lab data

async function loadLabData() {
  try {
    const response = await fetch("/static/data/lab_packages.json");
    const data = await response.json();
    labData = data; // store globally

    console.log("✅ Lab data loaded:", Object.keys(data));

    const categorySelect = document.getElementById("booking-category");
    const testSelect = document.getElementById("booking-test");
    const testInput = document.getElementById("booking-test-input");
    const testSelectorDiv = document.getElementById("test-selector");
    const searchTestsInput = document.getElementById("search-tests");

    // Populate booking category <select> dynamically
    categorySelect.innerHTML = '<option value="">-- Select Category --</option>';
    Object.keys(labData).forEach((catKey) => {
      const option = document.createElement("option");
      option.value = catKey;
      option.textContent = labData[catKey].category; // user-friendly label
      categorySelect.appendChild(option);
    });

    // Flatten all tests for global search
    Object.keys(data).forEach((catKey) => {
      data[catKey].tests.forEach((test) => {
        allTests.push({ name: test, category: catKey });
      });
    });
    console.log("📋 Total tests indexed for search:", allTests.length);

    // -----------------------------
    // Service Modal Handling
    // -----------------------------
    function openCategory(category) {
      console.log("🟢 openCategory called with:", category);

      if (!labData[category]) {
        console.warn("⚠️ No category found in labData for:", category);
        return;
      }

      const modal = document.getElementById("serviceModal");
      const modalContent = modal.querySelector(".modal-content");
      const modalTitle = document.getElementById("modalTitle");
      const serviceList = document.getElementById("serviceList");

      modalTitle.textContent = labData[category].category;
      serviceList.innerHTML = "";

      // Render each test as a styled card
      labData[category].tests.forEach((test) => {
        const card = document.createElement("div");
        card.className =
          "special-card zoom-effect bg-white text-navy p-6 rounded-2xl shadow-lg cursor-pointer transition transform hover:scale-105";
        card.innerHTML = `
          <div class="text-3xl mb-3">🧪</div>
          <h4 class="text-base font-semibold">${test}</h4>
        `;

        card.onclick = () => {
          console.log("📌 Test selected from modal:", test);
          // Auto-fill booking fields
          categorySelect.value = category;
          testInput.value = test;
          testSelect.innerHTML = `<option value="${test}" selected>${test}</option>`;
          testSelectorDiv.classList.remove("hidden");
          updateSummary();
          toggleClearButton(); // 👈 show Clear button

          closeModal();
          scrollToBooking();
        };

        serviceList.appendChild(card);
      });

      modal.classList.remove("hidden");
      setTimeout(() => modalContent.classList.add("show"), 10);
    }

    function closeModal() {
      const modal = document.getElementById("serviceModal");
      const content = modal.querySelector(".modal-content");
      content.classList.remove("show");
      setTimeout(() => modal.classList.add("hidden"), 300);
    }

    document.getElementById("closeModalBtn")?.addEventListener("click", closeModal);
    window.openCategory = openCategory; // Expose globally

    // -----------------------------
    // Test Popup (Dropdown Style)
    // -----------------------------
    testPopup = document.createElement("div");
    testPopup.id = "test-popup";
    testPopup.className =
      "hidden fixed z-50 bg-white shadow-2xl rounded-xl border max-h-96 overflow-y-auto w-[90%] sm:w-[350px]";
    document.body.appendChild(testPopup);

    const searchWrapper = document.createElement("div");
    searchWrapper.className = "p-2 border-b bg-gray-50 sticky top-0 z-10";

    searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "🔍 Filter tests...";
    searchInput.className =
      "w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500";
    searchWrapper.appendChild(searchInput);
    testPopup.appendChild(searchWrapper);

    resultContainer = document.createElement("div");
    resultContainer.id = "test-results";
    testPopup.appendChild(resultContainer);

    function renderTests(tests, query = "") {
      resultContainer.innerHTML = "";
      if (!tests || tests.length === 0) {
        resultContainer.innerHTML =
          "<p class='p-4 text-gray-500 italic'>No tests found</p>";
        return;
      }

      tests.forEach((test) => {
        const item = document.createElement("div");
        item.className =
          "px-4 py-2 hover:bg-red-50 cursor-pointer transition text-sm";

        let displayName = test.name;
        if (query) {
          const regex = new RegExp(`(${query})`, "gi");
          displayName = displayName.replace(
            regex,
            `<mark class="bg-yellow-200">$1</mark>`
          );
        }
        item.innerHTML = displayName;

        item.onclick = () => {
          console.log("📌 Test selected from popup:", test);
          categorySelect.value = test.category;
          testInput.value = test.name;
          testSelect.innerHTML = `<option value="${test.name}" selected>${test.name}</option>`;
          testPopup.classList.add("hidden");
          testSelectorDiv.classList.remove("hidden");
          updateSummary();
          toggleClearButton(); // 👈 show Clear button
        };

        resultContainer.appendChild(item);
      });
    }

    function positionPopup(anchorEl) {
      if (testPopup.classList.contains("hidden")) return;
      const rect = anchorEl.getBoundingClientRect();
      const scrollY = window.scrollY;
      testPopup.style.left = `${rect.left}px`;
      testPopup.style.top = `${rect.bottom + scrollY + 4}px`;
      testPopup.style.width = `${rect.width}px`;
    }

    // -----------------------------
    // Booking Form Logic
    // -----------------------------
    categorySelect.addEventListener("change", () => {
      const selected = categorySelect.value;
      console.log("📂 Category selected in booking form:", selected);

      if (labData[selected]) {
        testSelectorDiv.classList.remove("hidden");
        currentTests = labData[selected].tests.map((t) => ({
          name: t,
          category: selected,
        }));
        renderTests(currentTests);
        testPopup.classList.remove("hidden");
        positionPopup(categorySelect);
      } else {
        console.warn("⚠️ No tests found for:", selected);
      }
      updateSummary();
      toggleClearButton(); // 👈 show Clear button if test already picked
    });

    testInput.addEventListener("focus", () => {
      if (categorySelect.value) {
        currentTests = labData[categorySelect.value].tests.map((t) => ({
          name: t,
          category: categorySelect.value,
        }));
        renderTests(currentTests);
      }
      testPopup.classList.remove("hidden");
      positionPopup(testInput);
    });

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim().toLowerCase();
      if (query.length >= 3) {
        const filtered = allTests.filter((t) =>
          t.name.toLowerCase().includes(query)
        );
        renderTests(filtered, query);
        testPopup.classList.remove("hidden");
        positionPopup(testInput);
      } else if (categorySelect.value) {
        currentTests = labData[categorySelect.value].tests.map((t) => ({
          name: t,
          category: categorySelect.value,
        }));
        renderTests(currentTests);
      }
    });

    // Global Search
    if (searchTestsInput) {
      searchTestsInput.addEventListener("input", (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (query.length >= 3) {
          const filtered = allTests.filter((t) =>
            t.name.toLowerCase().includes(query)
          );
          renderTests(filtered, query);
          testPopup.classList.remove("hidden");
          positionPopup(searchTestsInput);
        }
      });
    }

    // -----------------------------
    // Booking Summary
    // -----------------------------
    const nameInput = document.querySelector("input[name='name']");
    const emailInput = document.querySelector("input[name='email']");
    const dateInput = document.querySelector("input[name='date']");

    function updateSummary() {
      document.getElementById("summary-name").textContent =
        nameInput.value || "-";
      document.getElementById("summary-email").textContent =
        emailInput.value || "-";
      document.getElementById("summary-category").textContent =
        categorySelect.options[categorySelect.selectedIndex]?.text || "-";
      document.getElementById("summary-test").textContent =
        testInput.value || "-";
      document.getElementById("summary-datetime").textContent =
        dateInput.value || "-";
    }

    [nameInput, emailInput, dateInput, testInput, categorySelect].forEach((el) =>
      el.addEventListener("input", updateSummary)
    );

    // -----------------------------
    // Close popup on outside click
    // -----------------------------
    document.addEventListener("click", (e) => {
      if (
        !testPopup.contains(e.target) &&
        e.target !== testInput &&
        e.target !== searchTestsInput
      ) {
        testPopup.classList.add("hidden");
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") testPopup.classList.add("hidden");
    });
  } catch (err) {
    console.error("❌ Failed to load lab packages:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadLabData);
