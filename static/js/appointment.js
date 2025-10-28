// ============================================================
// static/js/appointment.js — Epiconsult Advanced Booking System
// (Supports Multiple Tests, Responsive Cart, Auto-Close Modal)
// ============================================================
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

  // New cart UI elements
  const addToCartBtn = document.getElementById("addToCartBtn");
  const floatingCartBtn = document.getElementById("floatingCartBtn");
  const cartDrawer = document.getElementById("cartDrawer");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const clearCartBtn = document.getElementById("clearCartBtn");
  const proceedCartBtn = document.getElementById("proceedCartBtn");
  const cartItems = document.getElementById("cartItems");
  const cartBadge = document.getElementById("cartBadge");

  // =========================================================
  // TEST DATA
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
  // 🎵 AUDIO FEEDBACK
  // =========================================================
  const successSound = new Audio("/static/sounds/success.mp3");
  successSound.volume = 0.45;
  successSound.preload = "auto";

  // =========================================================
  // CART STATE MANAGEMENT
  // =========================================================
  let cart = JSON.parse(localStorage.getItem("epiconsultCart") || "[]");

  function saveCart() {
    localStorage.setItem("epiconsultCart", JSON.stringify(cart));
  }

  function updateCartBadge() {
    cartBadge.textContent = cart.length;
  }

  function renderCart() {
    cartItems.innerHTML = "";
    if (cart.length === 0) {
      cartItems.innerHTML = `<li class="text-gray-400 text-center py-3">No tests added yet</li>`;
    } else {
      cart.forEach((item, i) => {
        const li = document.createElement("li");
        li.className = "cart-item flex justify-between items-center py-2 border-b border-gray-200";
        li.innerHTML = `
          <div class="flex flex-col text-sm">
            <span class="font-semibold text-gray-800">${item.test}</span>
            <span class="text-xs text-gray-500">${item.category}</span>
          </div>
          <button class="remove-btn text-red-600 hover:text-red-800 transition" data-index="${i}">×</button>
        `;
        cartItems.appendChild(li);
      });
    }
    updateCartBadge();
  }

  // =========================================================
  // FETCH TESTS FOR CATEGORY
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

  // Populate subcategories
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
  // ADD TO CART FUNCTIONALITY
  // =========================================================
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      const category = serviceCategory.value;
      const test = serviceSubcategory.value;

      if (!category || !test) {
        toast("⚠️ Please select a category and test first.", "error");
        return;
      }

      const exists = cart.some(item => item.category === category && item.test === test);
      if (exists) {
        toast("ℹ️ Test already in cart.", "info");
        return;
      }

      cart.push({ category, test });
      saveCart();
      renderCart();
      toast("✅ Added to cart.", "success");
    });
  }

  // Remove single test
  cartItems.addEventListener("click", e => {
    if (e.target.classList.contains("remove-btn")) {
      const idx = e.target.dataset.index;
      cart.splice(idx, 1);
      saveCart();
      renderCart();
      toast("❌ Test removed.", "info");
    }
  });

  // Clear all
  clearCartBtn.addEventListener("click", () => {
    if (cart.length === 0) return toast("Cart is already empty.", "info");
    cart = [];
    saveCart();
    renderCart();
    toast("🗑️ All tests cleared.", "info");
  });

  // =========================================================
  // MOBILE CART UI TOGGLE
  // =========================================================
  floatingCartBtn.addEventListener("click", () => {
    cartDrawer.classList.toggle("hidden");
    cartDrawer.classList.toggle("show");
  });

  closeCartBtn.addEventListener("click", () => {
    cartDrawer.classList.add("hidden");
    cartDrawer.classList.remove("show");
  });

  proceedCartBtn.addEventListener("click", () => {
    if (cart.length === 0) {
      toast("⚠️ Please add at least one test.", "error");
      return;
    }
    if (!validateForm()) return;
    showSummary(getFormData(), "Book Multiple");
    cartDrawer.classList.add("hidden");
  });

  // =========================================================
  // VALIDATION (unchanged)
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
      if (!loader) {
        loader = document.createElement("div");
        loader.id = "loadingOverlay";
        loader.className = "appointment-modal-overlay";
        loader.innerHTML = `
          <div class="flex flex-col items-center justify-center text-white animate-fade-in">
            <div class="loader"></div>
            <p class="mt-3 text-lg tracking-wide fade-text">Processing your booking...</p>
          </div>`;
        document.body.appendChild(loader);
      }
    } else if (loader) {
      loader.remove();
    }
  }

  // =========================================================
  // SUMMARY MODAL
  // =========================================================
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
      subService: serviceSubcategory.value,
    };
  }

  function showSummary(data, bookingType) {
    const modal = document.getElementById("summaryModal");
    const content = document.getElementById("summaryContent");

    let testsHTML = "";
    if (bookingType === "Book Multiple" && cart.length > 0) {
      testsHTML = `
        <div class="mt-3">
          <p><strong>Selected Tests:</strong></p>
          <ul class="list-disc ml-6 text-gray-700">
            ${cart.map(i => `<li>${i.test} (${i.category})</li>`).join("")}
          </ul>
        </div>`;
    } else {
      testsHTML = `<p><strong>Service:</strong> ${data.service}</p>${data.subService ? `<p><strong>Test:</strong> ${data.subService}</p>` : ""}`;
    }

    content.innerHTML = `
      <p><strong>Full Name:</strong> ${data.name}</p>
      <p><strong>Sex:</strong> ${data.sex}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      ${data.address ? `<p><strong>Address:</strong> ${data.address}</p>` : ""}
      ${testsHTML}
      <p><strong>Date:</strong> ${data.date}</p>
      <p><strong>Time:</strong> ${data.time}</p>
      <p class="text-red-600"><strong>Booking Type:</strong> ${bookingType}</p>
    `;

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    document.getElementById("editBtn").onclick = () => modal.classList.add("hidden");
    document.getElementById("cancelBtn").onclick = () => {
      modal.classList.add("hidden");
      form.reset();
      cart = [];
      saveCart();
      renderCart();
    };
    document.getElementById("confirmBtn").onclick = async () => {
      modal.classList.add("hidden");
      await submitBooking(bookingType);
    };
  }

// =========================================================
// SUBMIT HANDLER — Multi Booking + Backend Sync + Success Modal
// =========================================================
async function submitBooking(bookingType) {
  if (!validateForm()) return;

  const formData = new FormData(form);
  formData.append("bookingType", bookingType);

  // 🧾 Include cart tests (if any)
  if (cart.length > 0) {
    formData.append("multiTests", JSON.stringify(cart));
  }

  showLoading(true);

  try {
    const response = await fetch("/book", { method: "POST", body: formData });
    const result = await response.json();
    showLoading(false);

    if (result.status === "success") {
      successSound.currentTime = 0;
      successSound.play();

      // Reset form + cart
      form.reset();
      cart = [];
      saveCart();
      renderCart();

      // ✅ Show Success Modal
      showSuccessModal("Appointment successfully booked!");

      // Close summary or overlay if open
      document.querySelectorAll(".appointment-modal-overlay").forEach(m => m.remove());
      setTimeout(() => {
        const sm = document.getElementById("summaryModal");
        if (sm) {
          sm.classList.add("hidden");
          sm.style.display = "none";
        }
      }, 300);
    } else {
      toast("❌ " + (result.message || "Booking failed."), "error");
    }
  } catch (err) {
    showLoading(false);
    toast("⚠️ Network Error: " + err.message, "error");
  }
}

// =========================================================
// ✨ SUCCESS MODAL UI
// =========================================================
function showSuccessModal(message) {
  // Remove existing modals if any
  const existing = document.getElementById("successModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "successModal";
  modal.className =
    "fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[2000] animate-fade-in";

  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-sm text-center animate-pop-in">
      <div class="flex flex-col items-center">
        <div class="w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Success!</h3>
        <p class="text-gray-600">${message}</p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Auto-close after 5 seconds
  setTimeout(() => {
    modal.classList.add("opacity-0", "transition", "duration-500");
    setTimeout(() => modal.remove(), 600);
  }, 5000);
}

// Add modal animations
const successStyle = document.createElement("style");
successStyle.textContent = `
  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pop-in { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .animate-fade-in { animation: fade-in 0.4s ease-out; }
  .animate-pop-in { animation: pop-in 0.3s ease-out; }
`;
document.head.appendChild(successStyle);


  // =========================================================
  // BUTTON EVENTS (Single booking)
  // =========================================================
  bookOnlyBtn.addEventListener("click", () => {
    if (!validateForm()) return;
    if (cart.length > 0) {
      showSummary(getFormData(), "Book Multiple");
    } else {
      showSummary(getFormData(), "Book Only");
    }
  });

  bookPayBtn.addEventListener("click", () => {
    if (!validateForm()) return;
    if (cart.length > 0) {
      showSummary(getFormData(), "Book Multiple");
    } else {
      showSummary(getFormData(), "Book & Pay Later");
    }
  });

  // =========================================================
  // 🔍 SEARCH AUTOCOMPLETE (unchanged)
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
      searchResults = [];
      selectedIndex = -1;
      resultsContainer.innerHTML = "";

      if (q.length < 2) {
        resultsPanel.classList.add("hidden");
        return;
      }

      const lowerQ = q.toLowerCase();
      searchResults = ALL_TESTS.filter(
        t => t.test.toLowerCase().includes(lowerQ) || t.category.toLowerCase().includes(lowerQ)
      );
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
      } else if (e.key === "Escape") {
        resultsPanel.classList.add("hidden");
      }
    });

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
    .loader { width:60px;height:60px;border:4px solid rgba(255,255,255,0.25);
      border-top:4px solid #e11d48;border-radius:50%;animation:spin 1.1s linear infinite;}
    @keyframes spin {from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
    @keyframes fade-text {0%,100%{opacity:0.4;}50%{opacity:1;} }
    .fade-text{animation:fade-text 2s infinite ease-in-out;}
    .cart-drawer.show{transform:translateY(0);opacity:1;}
  `;
  document.head.appendChild(style);

  // Initial render
  renderCart();
});
