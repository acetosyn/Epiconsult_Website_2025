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

// Open category modal
function openCategory(category) {
  modalTitle.textContent = category.toUpperCase() + " SPECIALTIES";
  serviceList.innerHTML = "";

  services[category].forEach(service => {
    const div = document.createElement("div");
    div.className =
      "service-item p-4 bg-gray-50 border rounded-xl shadow-md text-center cursor-pointer transition transform hover:scale-105 hover:bg-gray-100";
    div.innerHTML = `<span class="text-2xl mr-2">${category === "surgery" ? "🩺" : "⚕️"}</span> ${service}`;
    div.onclick = () => openBooking(service);
    serviceList.appendChild(div);
  });

  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
}

function openBooking(service) {
  bookingTitle.textContent = service;
  bookingModal.classList.remove("hidden");
}

function closeBooking() {
  bookingModal.classList.add("hidden");
}

function confirmBooking() {
  alert("✅ Booking confirmed! Payment details will be sent.");
  closeBooking();
  closeModal();
}

// Attach events after DOM loads
document.addEventListener("DOMContentLoaded", () => {
  const medicineBtn = document.getElementById("medicineBtn");
  const surgeryBtn = document.getElementById("surgeryBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const closeBookingBtn = document.getElementById("closeBookingBtn");
  const confirmBookingBtn = document.getElementById("confirmBookingBtn");

  if (medicineBtn) {
    medicineBtn.addEventListener("click", () => openCategory("medicine"));
  }

  if (surgeryBtn) {
    surgeryBtn.addEventListener("click", () => openCategory("surgery"));
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeModal);
  }

  if (closeBookingBtn) {
    closeBookingBtn.addEventListener("click", closeBooking);
  }

  if (confirmBookingBtn) {
    confirmBookingBtn.addEventListener("click", confirmBooking);
  }
});
