// static/js/lab.js

// Smooth scroll to booking form
function scrollToBooking() {
  const section = document.getElementById("book-lab");
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

// 🔄 Full Clear button logic
const clearBookingBtn = document.getElementById("clear-booking");
const bookingForm = document.getElementById("lab-booking-form");

if (clearBookingBtn && bookingForm) {
  clearBookingBtn.addEventListener("click", () => {
    // Reset the form completely
    bookingForm.reset();

    // Reset summary fields
    document.getElementById("summary-name").textContent = "-";
    document.getElementById("summary-email").textContent = "-";
    document.getElementById("summary-category").textContent = "-";
    document.getElementById("summary-test").textContent = "-";
    document.getElementById("summary-datetime").textContent = "-";

    // Reset progress bar (Step 1 active, rest inactive)
    const steps = document.querySelectorAll(".step");
    steps.forEach((step, idx) => {
      if (idx === 0) {
        step.classList.add("active");
      } else {
        step.classList.remove("active");
      }
    });

    // Hide clear button again
    clearBookingBtn.classList.add("hidden");

    console.log("🔄 Booking form and progress bar reset");
  });
}

// 👀 Function to toggle Clear button
function toggleClearButton() {
  const categoryVal = document.getElementById("booking-category")?.value;
  const testVal = document.getElementById("booking-test-input")?.value;
  if (categoryVal && testVal) {
    clearBookingBtn.classList.remove("hidden");
  } else {
    clearBookingBtn.classList.add("hidden");
  }
}

// Attach listeners for manual input
["booking-category", "booking-test-input"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", toggleClearButton);
});

// 🔗 Expose so lab_data.js can call it after auto-fills
window.toggleClearButton = toggleClearButton;
