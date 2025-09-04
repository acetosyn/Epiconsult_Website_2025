// ================= Specialist Services Data =================
const services = {
  surgery: {
    "Neurosurgery": [],
    "Urology": [],
    "Anesthesiology": [],
    "General Surgery": [],
    "Plastic Surgery": [],
    "Orthopedic Surgery": [],
    "Spine Surgery": [],
    "Pediatric Surgery": [],
    "ENT (Ear, Nose & Throat)": [],
    "Cosmetic Surgery": [
      "Breast Augmentation & Enlargement",
      "Breast Reduction",
      "Tummy Tuck",
      "Liposuction & Body Contouring"
    ],
    "Obstetrics": [
      "Ante-Natal Clinic",
      "Cesarean Section",
      "Post-Natal Care",
      "Obstetric Emergencies",
      "Family Planning & Contraception Services"
    ],
    "Gynecology": [
      "Gynecological Emergencies",
      "Infertility Clinic",
      "Surgery",
      "Menopause Management",
      "Routine Check-ups",
      "Pap Smear",
      "Pelvic Exam",
      "Gynecological Consultation"
    ]
  },

  medicine: {
    "Cardiology": [],
    "Neurology": [],
    "Pediatrics": [],
    "Endocrinology": [],
    "Dermatology": [],
    "Gastroenterology": [],
    "General Outpatient (GP)": [],
    "Hematology": [],
    "Nephrology": [],
    "Immunology": [],
    "Pulmonology": [],
    "Rheumatology": [],
    "Family Medicine": []
  }
};

// ================= State =================
let currentCategory = null;
let currentServices = [];
let filteredServices = [];
let currentPage = 1;
const itemsPerPage = 8;

// Track accordion state
let currentlyOpenEl = null;
let autoCollapseTimer = null;
const AUTO_COLLAPSE_MS = 10000;

// ================= DOM Elements =================
const modal = document.getElementById("serviceModal");
const bookingModal = document.getElementById("bookingModal");
const serviceList = document.getElementById("serviceList");
const paginationContainer = document.getElementById("paginationContainer"); // new fixed container
const modalTitle = document.getElementById("modalTitle");
const bookingTitle = document.getElementById("bookingTitle");
const paginationControls = document.createElement("div");
paginationControls.className = "pagination-controls";

// ================= Open Category Modal =================
function openCategory(category) {
  if (!services[category]) return;

  currentCategory = category;
  currentServices = Object.entries(services[category]);
  filteredServices = [...currentServices];
  currentPage = 1;

  modalTitle.textContent = category.toUpperCase() + " SPECIALTIES";
  serviceList.innerHTML = "";
  paginationContainer.innerHTML = "";

  const modalContent = modal.querySelector(".modal-content");
  modalContent.classList.remove("modal-navy", "modal-red");

  if (category === "medicine") {
    modalContent.classList.add("modal-navy");
  } else if (category === "surgery") {
    modalContent.classList.add("modal-red");
  }

  renderPage();

  modal.classList.remove("hidden");
  setTimeout(() => {
    modalContent.classList.add("show");
  }, 10);
}

// ================= Render Services (with pagination) =================
function renderPage() {
  clearAutoCollapseTimer();
  currentlyOpenEl = null;

  serviceList.innerHTML = "";

  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const pageItems = filteredServices.slice(startIdx, endIdx);

  pageItems.forEach(([service, subs], i) => {
    const item = createServiceItem(service, subs, currentCategory);

    // entry animation
    item.style.opacity = "0";
    item.style.transform = "scale(0.95)";
    setTimeout(() => {
      item.style.transition = "all 0.35s ease";
      item.style.opacity = "1";
      item.style.transform = "scale(1)";
    }, 70 * i);

    serviceList.appendChild(item);
  });

  renderPagination();
}

// ================= Create Service Item =================
function createServiceItem(service, subs, category) {
  const hasSub = Array.isArray(subs) && subs.length > 0;

  const item = document.createElement("div");
  item.className =
    "service-item bg-white/10 border border-white/20 rounded-xl shadow-md p-4 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl";

  const header = document.createElement("div");
  header.className = "flex justify-between items-center cursor-pointer";

  const title = document.createElement("span");
  title.className = "font-semibold";
  title.textContent = service;

  const toggleIcon = document.createElement("span");
  toggleIcon.className =
    "toggle-icon text-lg font-bold transition-transform duration-300";

  if (hasSub) {
    toggleIcon.textContent = "+";
    toggleIcon.style.fontWeight = "900";
    item.classList.add("has-sub");
  } else {
    toggleIcon.textContent = "›";
    toggleIcon.classList.add("text-gray-400");
  }

  header.appendChild(title);
  header.appendChild(toggleIcon);
  item.appendChild(header);

  if (hasSub) {
    const subList = document.createElement("div");
    subList.className =
      "sub-list max-h-0 overflow-hidden transition-all duration-500 ease-in-out ml-4 mt-3 space-y-2";

    subs.forEach(sub => {
      const subItem = document.createElement("div");
      subItem.className =
        "sub-item p-2 bg-white/20 rounded-lg cursor-pointer hover:bg-white/30 transition";
      subItem.textContent = sub;
      subItem.onclick = () => openBooking(sub, category);
      subList.appendChild(subItem);
    });

    item.appendChild(subList);

    header.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      if (isOpen) {
        collapseItem(item, subList, toggleIcon);
        return;
      }

      if (currentlyOpenEl && currentlyOpenEl !== item) {
        const openSubList = currentlyOpenEl.querySelector(".sub-list");
        const openToggle = currentlyOpenEl.querySelector(".toggle-icon");
        collapseItem(currentlyOpenEl, openSubList, openToggle);
      }

      expandItem(item, subList, toggleIcon);
      currentlyOpenEl = item;

      clearAutoCollapseTimer();
      autoCollapseTimer = setTimeout(() => {
        if (currentlyOpenEl === item) {
          collapseItem(item, subList, toggleIcon);
          currentlyOpenEl = null;
        }
      }, AUTO_COLLAPSE_MS);
    });
  } else {
    header.addEventListener("click", () => openBooking(service, category));
  }

  return item;
}

// Helpers
function expandItem(item, subList, toggleIcon) {
  item.classList.add("open");
  toggleIcon.textContent = "−";
  subList.style.maxHeight = subList.scrollHeight + "px";
}

function collapseItem(item, subList, toggleIcon) {
  item.classList.remove("open");
  toggleIcon.textContent = "+";
  subList.style.maxHeight = "0";
}

function clearAutoCollapseTimer() {
  if (autoCollapseTimer) {
    clearTimeout(autoCollapseTimer);
    autoCollapseTimer = null;
  }
}

// ================= Pagination =================
function renderPagination() {
  paginationControls.innerHTML = "";
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  if (totalPages <= 1) return;

  if (currentPage > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Prev";
    prevBtn.className = "px-3 py-1 rounded-md mx-1 transition hover:scale-105";
    prevBtn.addEventListener("click", () => {
      currentPage--;
      renderPage();
    });
    paginationControls.appendChild(prevBtn);
  }

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = "px-3 py-1 rounded-md mx-1 transition hover:scale-105 border";

    if (i === currentPage) {
      btn.classList.add("active");
      if (currentCategory === "medicine") {
        btn.style.background = "#fff";
        btn.style.color = "#003366";
        btn.style.fontWeight = "700";
        btn.style.borderColor = "#003366";
      } else if (currentCategory === "surgery") {
        btn.style.background = "#b91c1c";
        btn.style.color = "#fff";
        btn.style.fontWeight = "700";
        btn.style.borderColor = "#b91c1c";
      }
    }

    btn.addEventListener("click", () => {
      currentPage = i;
      renderPage();
    });
    paginationControls.appendChild(btn);
  }

  if (currentPage < totalPages) {
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.className = "px-3 py-1 rounded-md mx-1 transition hover:scale-105";
    nextBtn.addEventListener("click", () => {
      currentPage++;
      renderPage();
    });
    paginationControls.appendChild(nextBtn);
  }

  paginationContainer.appendChild(paginationControls);
}

// ================= Modal Actions =================
function closeModal() {
  const content = modal.querySelector(".modal-content");
  content.classList.remove("show");
  setTimeout(() => modal.classList.add("hidden"), 300);
}

function openBooking(service, category) {
  bookingTitle.textContent = service;

  const bookingContent = bookingModal.querySelector(".modal-content");
  bookingContent.classList.remove("modal-navy", "modal-red");

  if (category === "medicine") {
    bookingContent.classList.add("modal-navy");
  } else if (category === "surgery") {
    bookingContent.classList.add("modal-red");
  }

  bookingModal.classList.remove("hidden");
  setTimeout(() => {
    bookingContent.classList.add("show");
  }, 10);
}

function closeBooking() {
  const content = bookingModal.querySelector(".modal-content");
  content.classList.remove("show");
  setTimeout(() => bookingModal.classList.add("hidden"), 300);
}

function confirmBooking() {
  alert("✅ Booking confirmed! Payment details will be sent.");
  closeBooking();
  closeModal();
}

// ================= Event Listeners =================
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("medicineBtn")?.addEventListener("click", () =>
    openCategory("medicine")
  );
  document.getElementById("surgeryBtn")?.addEventListener("click", () =>
    openCategory("surgery")
  );
  document.getElementById("closeModalBtn")?.addEventListener("click", closeModal);
  document.getElementById("closeBookingBtn")?.addEventListener("click", closeBooking);
  document.getElementById("confirmBookingBtn")?.addEventListener("click", confirmBooking);
});
