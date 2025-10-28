// static/js/appointment.js — Epiconsult Premium Edition
document.addEventListener("DOMContentLoaded", () => {
  // =========================================================
  // DOM ELEMENTS
  // =========================================================
  const form = document.getElementById("appointmentForm");
  const bookOnlyBtn = document.getElementById("bookOnlyBtn");
  const bookPayBtn = document.getElementById("bookPayBtn");
  const serviceCategory = document.getElementById("serviceCategory");
  const serviceSubcategory = document.getElementById("serviceSubcategory");
  const subcategoryWrapper = document.getElementById("subcategoryWrapper");
  const searchInput = document.getElementById("searchInput");
  const resultsPanel = document.getElementById("resultsPanel");
  const resultsContainer = document.getElementById("resultsContainer");

  // =========================================================
  // TEST DATA (populated from backend)
  // =========================================================
  const testData = window.testData || {};
  const categories = Object.keys(testData);

  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    serviceCategory.appendChild(opt);
  });

  // =========================================================
  // AUDIO FEEDBACK SETUP
  // =========================================================
// =========================================================
// 🎵 AUDIO FEEDBACK (Success only)
// =========================================================
const successSound = new Audio("/static/sounds/success.mp3");
successSound.volume = 0.45;
successSound.preload = "auto";


  // =========================================================
  // HELPER: Get tests for category
  // =========================================================
  function getTestsFor(category) {
    const node = testData[category];
    if (!node) return [];
    const results = [];
    if (node.services) {
      Object.entries(node.services).forEach(([department, groups]) => {
        Object.entries(groups).forEach(([groupName, tests]) => {
          if (Array.isArray(tests)) {
            results.push({ department, group: groupName, tests });
          }
        });
      });
    }
    return results;
  }

  serviceCategory.addEventListener("change", () => {
    const selected = serviceCategory.value;
    serviceSubcategory.innerHTML = `<option value="">-- Select Test --</option>`;

    if (!selected) {
      subcategoryWrapper.classList.add("hidden");
      return;
    }

    const groups = getTestsFor(selected);
    if (groups.length === 0) {
      subcategoryWrapper.classList.add("hidden");
      return;
    }

    groups.forEach(g => {
      const optGroup = document.createElement("optgroup");
      optGroup.label = `${g.department} › ${g.group}`;
      g.tests.forEach(t => {
        const option = document.createElement("option");
        option.value = t;
        option.textContent = t;
        optGroup.appendChild(option);
      });
      serviceSubcategory.appendChild(optGroup);
    });

    subcategoryWrapper.classList.remove("hidden");
  });

  // =========================================================
  // VALIDATION
  // =========================================================
  function validateForm() {
    const required = ["fullName", "sex", "phone", "email", "appointmentDate", "appointmentTime"];
    for (const id of required) {
      const el = document.getElementById(id);
      if (!el.value.trim()) {
        toast("⚠️ Please fill all required fields.", "error");
        el.focus();
        return false;
      }
    }

    const phone = document.getElementById("phone").value.trim();
    if (!/^(\+234|0)[0-9]{10}$/.test(phone)) {
      toast("⚠️ Invalid phone number format.", "error");
      return false;
    }

    const email = document.getElementById("email").value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast("⚠️ Invalid email address.", "error");
      return false;
    }
    return true;
  }

  // =========================================================
  // TOAST / MODAL UTILITIES
  // =========================================================
  function createModal(icon, title, message, color = "red", bookingId = null) {
    const modal = document.createElement("div");
    modal.className = "appointment-modal-overlay";
    modal.innerHTML = `
      <div class="appointment-modal animate-fade-in" role="dialog" aria-modal="true">
        <div class="modal-icon ${color === "green" ? "success" : color === "red" ? "error" : "info"}">${icon}</div>
        <h3>${title}</h3>
        <p>${message}</p>
        ${
          bookingId
            ? `<button class="success" id="copyBookingBtn">Copy Booking ID</button>`
            : `<button id="closeModalBtn">OK</button>`
        }
      </div>
    `;
    document.body.appendChild(modal);
    const btn = bookingId ? document.getElementById("copyBookingBtn") : document.getElementById("closeModalBtn");

    if (bookingId) {
      btn.addEventListener("click", () => {
        navigator.clipboard.writeText(bookingId);
        toast("📋 Booking ID copied!", "success");
      });
    }

    btn.addEventListener("click", () => {
      modal.classList.add("animate-fade-out");
      setTimeout(() => modal.remove(), 250);
    });

    // Auto close success after 8s
    if (color === "green") {
      setTimeout(() => {
        modal.classList.add("animate-fade-out");
        setTimeout(() => modal.remove(), 250);
      }, 8000);
    }
  }

  function toast(msg, type = "info") {
    const t = document.createElement("div");
    t.className =
      `fixed top-5 right-5 z-[1000] px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300 ${
        type === "error" ? "bg-red-600" : type === "success" ? "bg-green-600" : "bg-[#0f2b46]"
      }`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => {
      t.style.opacity = "0";
      setTimeout(() => t.remove(), 400);
    }, 3000);
  }

  function showLoading(show = true) {
    let loader = document.getElementById("loadingOverlay");
    if (show) {
      sounds.loading.currentTime = 0;
      sounds.loading.play();
      if (!loader) {
        loader = document.createElement("div");
        loader.id = "loadingOverlay";
        loader.className = "appointment-modal-overlay";
        loader.innerHTML = `
          <div class="flex flex-col items-center justify-center text-white animate-fade-in">
            <div class="loader"></div>
            <p class="mt-3 text-lg tracking-wide fade-text">Processing your booking...</p>
          </div>
        `;
        document.body.appendChild(loader);
      }
    } else if (loader) {
      loader.remove();
    }
  }

  // =========================================================
// SUBMIT HANDLER (Optimized — Success Sound Only)
// =========================================================
async function submitBooking(bookingType) {
  if (!validateForm()) return;
  const formData = new FormData(form);
  formData.append("bookingType", bookingType);

  showLoading(true);

  try {
    const response = await fetch("/book", { method: "POST", body: formData });
    const result = await response.json();
    showLoading(false);

    if (result.status === "success") {
      // ✅ Play soft success sound with fade-in
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const source = ctx.createBufferSource();
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 0.6); // smooth fade-in
        fetch("/static/sounds/success.mp3")
          .then(res => res.arrayBuffer())
          .then(buf => ctx.decodeAudioData(buf))
          .then(decoded => {
            source.buffer = decoded;
            source.connect(gain).connect(ctx.destination);
            source.start(0);
          });
      } catch (e) {
        console.warn("Audio playback skipped:", e.message);
      }

      // ✅ Show modal and reset form
      createModal(
        "✅",
        "Appointment Booked!",
        "Your appointment has been successfully received. A confirmation email has been sent to you.",
        "green",
        result.booking_id || null
      );
      form.reset();
    } else if (result.status === "failed") {
      createModal("❌", "Booking Failed", result.message || "Unable to send confirmation.", "red");
    } else {
      createModal("⚠️", "Unexpected Response", result.message || "Please try again.", "orange");
    }
  } catch (err) {
    showLoading(false);
    createModal("❌", "Network Error", err.message || "Unable to contact server.", "red");
  }
}


  // =========================================================
  // BUTTON EVENTS
  // =========================================================
  bookOnlyBtn.addEventListener("click", () => submitBooking("Book Only"));
  bookPayBtn.addEventListener("click", () => submitBooking("Book & Pay Later"));

  // =========================================================
// 🔍 SEARCH AUTOCOMPLETE (Full Intelligent Version Restored)
// =========================================================
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

// Function to render results dynamically
function renderResults(list) {
  resultsContainer.innerHTML = "";
  if (list.length === 0) {
    resultsPanel.classList.add("hidden");
    return;
  }

  resultsPanel.classList.remove("hidden");
  list.forEach((item, idx) => {
    const el = document.createElement("div");
    el.className =
      "p-2 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition";
    el.dataset.index = idx;
    el.innerHTML = `
      <div class="font-medium text-gray-800">${item.test}</div>
      <div class="text-xs text-gray-500">${item.category}</div>
    `;
    el.addEventListener("click", () => selectResult(idx));
    resultsContainer.appendChild(el);
  });
}

// Function to highlight keyboard-selected result
function highlightResult(idx) {
  Array.from(resultsContainer.children).forEach((el, i) => {
    el.classList.toggle("bg-gray-200", i === idx);
  });
}

// Function to apply selected test
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

// Handle user input
if (searchInput) {
  searchInput.addEventListener("input", e => {
    const q = e.target.value.trim();
    searchResults = [];
    selectedIndex = -1;
    resultsContainer.innerHTML = "";

    if (q.length < 2) {
      resultsPanel.classList.add("hidden");
      return;
    }

    const lowerQ = q.toLowerCase();
    searchResults = ALL_TESTS.filter(
      t =>
        t.test.toLowerCase().includes(lowerQ) ||
        t.category.toLowerCase().includes(lowerQ)
    );

    renderResults(searchResults);
  });

  // Keyboard navigation support
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
    } else if (e.key === "Escape") {
      resultsPanel.classList.add("hidden");
    }
  });

  // Hide dropdown when clicking outside
  document.addEventListener("click", e => {
    if (!resultsPanel.contains(e.target) && e.target !== searchInput) {
      resultsPanel.classList.add("hidden");
    }
  });
}


  // =========================================================
  // STYLE / ANIMATION HELPERS
  // =========================================================
  const style = document.createElement("style");
  style.textContent = `
    .loader { width:60px;height:60px;border:4px solid rgba(255,255,255,0.25);border-top:4px solid #e11d48;border-radius:50%;animation:spin 1.1s linear infinite; }
    @keyframes spin {from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
    @keyframes fade-text {0%,100%{opacity:0.4;}50%{opacity:1;}}
    .fade-text{animation:fade-text 2s infinite ease-in-out;}
  `;
  document.head.appendChild(style);
});
