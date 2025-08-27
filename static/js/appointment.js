// static/js/appointment.js
document.addEventListener("DOMContentLoaded", () => {
  const serviceCategory = document.getElementById("serviceCategory");
  const serviceSubcategory = document.getElementById("serviceSubcategory");
  const subcategoryWrapper = document.getElementById("subcategoryWrapper");

  const bookOnlyBtn = document.getElementById("bookOnlyBtn");
  const bookPayBtn = document.getElementById("bookPayBtn");

  const summaryModal = document.getElementById("summaryModal");
  const summaryContent = document.getElementById("summaryContent");
  const editBtn = document.getElementById("editBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const confirmBtn = document.getElementById("confirmBtn");

  const searchInput = document.getElementById("searchInput");
  const resultsPanel = document.getElementById("resultsPanel");
  const resultsContainer = document.getElementById("resultsContainer");

  // ---- Load services from embedded JSON ----
  const testData = (typeof window !== "undefined" && window.testData) ? window.testData : {};
  const categories = Object.keys(testData || {});

  // Helper: build structured list for dropdown
  function getTestsFor(category) {
    const node = testData[category];
    if (!node) return [];

    const results = [];

    if (node.services) {
      // Lab category → Department > Group > Tests
      Object.entries(node.services).forEach(([department, groups]) => {
        if (groups && typeof groups === "object") {
          Object.entries(groups).forEach(([groupName, tests]) => {
            if (Array.isArray(tests)) {
              results.push({ department, group: groupName, tests });
            }
          });
        }
      });
    } else {
      // Non-lab categories → treat category as one test
      results.push({ department: null, group: null, tests: [category] });
    }

    return results;
  }

  // Populate main category dropdown
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    serviceCategory.appendChild(option);
  });

  // Populate sub-services when category changes
  serviceCategory.addEventListener("change", () => {
    serviceSubcategory.innerHTML = `<option value="">-- Select Test --</option>`;
    const selected = serviceCategory.value;

    if (!selected) {
      subcategoryWrapper.classList.add("hidden");
      return;
    }

    const groupedTests = getTestsFor(selected);

    if (groupedTests.length === 0) {
      subcategoryWrapper.classList.add("hidden");
      return;
    }

    groupedTests.forEach(groupObj => {
      if (groupObj.department && groupObj.group) {
        const optGroup = document.createElement("optgroup");
        optGroup.label = `${groupObj.department} › ${groupObj.group}`;
        groupObj.tests.forEach(test => {
          const option = document.createElement("option");
          option.value = test;
          option.textContent = test;
          optGroup.appendChild(option);
        });
        serviceSubcategory.appendChild(optGroup);
      } else {
        groupObj.tests.forEach(test => {
          const option = document.createElement("option");
          option.value = test;
          option.textContent = test;
          serviceSubcategory.appendChild(option);
        });
      }
    });

    subcategoryWrapper.classList.remove("hidden");
  });

  // ---------------- Validation ----------------
  function validateForm() {
    const name = document.getElementById("fullName").value.trim();
    const sex = document.getElementById("sex").value;
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const date = document.getElementById("appointmentDate").value;
    const time = document.getElementById("appointmentTime").value;
    const service = serviceCategory.value;

    if (!name || !sex || !phone || !email || !date || !time || !service) {
      alert("⚠️ Please fill in all required fields.");
      return false;
    }

    const phoneRegex = /^(\+234|0)[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      alert("⚠️ Please enter a valid Nigerian phone number.");
      return false;
    }

    return true;
  }

  function getFormData() {
    return {
      name: document.getElementById("fullName").value.trim(),
      sex: document.getElementById("sex").value,
      phone: document.getElementById("phone").value.trim(),
      email: document.getElementById("email").value.trim(),
      address: document.getElementById("address").value.trim(),
      date: document.getElementById("appointmentDate").value,
      time: document.getElementById("appointmentTime").value,
      service: serviceCategory.value,
      subService: serviceSubcategory.value
    };
  }

  function showSummary(data, bookingType) {
    summaryContent.innerHTML = `
      <p><strong>Full Name:</strong> ${data.name}</p>
      <p><strong>Sex:</strong> ${data.sex}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      ${data.address ? `<p><strong>Address:</strong> ${data.address}</p>` : ""}
      <p><strong>Service:</strong> ${data.service}</p>
      ${data.subService ? `<p><strong>Test:</strong> ${data.subService}</p>` : ""}
      <p><strong>Date:</strong> ${data.date}</p>
      <p><strong>Time:</strong> ${data.time}</p>
      <p class="text-red-600"><strong>Booking Type:</strong> ${bookingType}</p>
    `;
    summaryModal.classList.remove("hidden");
    summaryModal.classList.add("flex");
  }

  function handleBooking(type) {
    if (!validateForm()) return;
    const data = getFormData();
    showSummary(data, type);
  }

  bookOnlyBtn.addEventListener("click", () => handleBooking("Book Only"));
  bookPayBtn.addEventListener("click", () => handleBooking("Book & Pay Later"));
  editBtn.addEventListener("click", () => summaryModal.classList.add("hidden"));
  cancelBtn.addEventListener("click", () => {
    if (confirm("Cancel booking? Your info will be cleared.")) {
      document.getElementById("appointmentForm").reset();
      summaryModal.classList.add("hidden");
    }
  });
  confirmBtn.addEventListener("click", () => {
    alert("✅ Booking confirmed! (Backend will handle email sending)");
    summaryModal.classList.add("hidden");
  });

  // ---------------- Search Auto-complete ----------------
  function flattenTests() {
    const flat = [];
    categories.forEach(cat => {
      const tests = getTestsFor(cat);
      tests.forEach(group => {
        group.tests.forEach(test => {
          flat.push({ test, category: cat });
        });
      });
    });
    return flat;
  }

  const ALL_TESTS = flattenTests();
  let searchResults = [];
  let selectedIndex = -1;

  function searchTests(query) {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase();
    return ALL_TESTS.filter(
      t => t.test.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
    );
  }

  function renderResults(list) {
    resultsContainer.innerHTML = "";
    if (list.length === 0) {
      resultsPanel.classList.add("hidden");
      return;
    }
    resultsPanel.classList.remove("hidden");

    list.forEach((item, idx) => {
      const el = document.createElement("div");
      el.className = "p-2 border rounded cursor-pointer hover:bg-gray-100";
      el.dataset.index = idx;
      el.innerHTML = `
        <div class="font-medium">${item.test}</div>
        <div class="text-xs text-gray-500">${item.category}</div>
      `;
      el.addEventListener("click", () => selectResult(idx));
      resultsContainer.appendChild(el);
    });
  }

  function highlightResult(idx) {
    Array.from(resultsContainer.children).forEach((el, i) => {
      el.classList.toggle("bg-gray-200", i === idx);
    });
  }

  function selectResult(idx) {
    const item = searchResults[idx];
    if (!item) return;
    serviceCategory.value = item.category;
    serviceCategory.dispatchEvent(new Event("change"));
    serviceSubcategory.value = item.test;
    subcategoryWrapper.classList.remove("hidden");
    searchInput.value = item.test;
    resultsPanel.classList.add("hidden");
  }

  if (searchInput) {
    searchInput.addEventListener("input", e => {
      const q = e.target.value.trim();
      searchResults = searchTests(q);
      selectedIndex = -1;
      renderResults(searchResults);
    });

    searchInput.addEventListener("keydown", e => {
      if (resultsPanel.classList.contains("hidden")) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % searchResults.length;
        highlightResult(selectedIndex);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + searchResults.length) % searchResults.length;
        highlightResult(selectedIndex);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (selectedIndex >= 0) selectResult(selectedIndex);
      }
    });
  }
});
