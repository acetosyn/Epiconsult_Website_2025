// Categories + Services
const services = {
  surgery: [
    "Neuro-surgery", "Urology", "Anesthesiology", "General Surgery",
    "Plastic Surgery", "Orthopedic Surgery", "Gynecology",
    "Spine Surgery", "Bariatrics"
  ],
  medicine: [
    "Cardiology", "Neurology", "Pediatrics", "Endocrinology",
    "Dermatology", "Gastroenterology", "GP (General Outpatient)", "Hematology"
  ]
};

const modal = document.getElementById("serviceModal");
const bookingModal = document.getElementById("bookingModal");
const serviceList = document.getElementById("serviceList");
const modalTitle = document.getElementById("modalTitle");
const bookingTitle = document.getElementById("bookingTitle");

function openCategory(category) {
  if (!services[category]) return;

  modalTitle.textContent = category.toUpperCase() + " SPECIALTIES";
  serviceList.innerHTML = "";

  // reset modal color classes
  const modalContent = modal.querySelector(".modal-content");
  modalContent.classList.remove("modal-navy", "modal-red");

  // apply correct color
  if (category === "medicine") {
    modalContent.classList.add("modal-navy");
  } else if (category === "surgery") {
    modalContent.classList.add("modal-red");
  }

  services[category].forEach(service => {
    const div = document.createElement("div");
    div.className =
      "service-item p-4 bg-white/10 border border-white/20 rounded-xl shadow-md text-center cursor-pointer transition transform hover:scale-105 hover:bg-white/20";
    div.innerHTML = `<span class="text-2xl mr-2">${category === "surgery" ? "🩺" : "⚕️"}</span> ${service}`;
    div.onclick = () => openBooking(service, category);
    serviceList.appendChild(div);
  });

  modal.classList.remove("hidden");
  setTimeout(() => {
    modalContent.classList.add("show");
  }, 10);
}

function closeModal() {
  const content = modal.querySelector(".modal-content");
  content.classList.remove("show");
  setTimeout(() => modal.classList.add("hidden"), 300);
}

function openBooking(service, category) {
  bookingTitle.textContent = service;

  // reset booking modal colors
  const bookingContent = bookingModal.querySelector(".modal-content");
  bookingContent.classList.remove("modal-navy", "modal-red");

  // match category color
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

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("medicineBtn")?.addEventListener("click", () => openCategory("medicine"));
  document.getElementById("surgeryBtn")?.addEventListener("click", () => openCategory("surgery"));
  document.getElementById("closeModalBtn")?.addEventListener("click", closeModal);
  document.getElementById("closeBookingBtn")?.addEventListener("click", closeBooking);
  document.getElementById("confirmBookingBtn")?.addEventListener("click", confirmBooking);
});
