// static/js/lab.js

// Smooth scroll to booking form
function scrollToBooking() {
  const section = document.getElementById("book-lab");
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}



// Clear selected test
document.getElementById("clear-test").addEventListener("click", () => {
  document.getElementById("booking-test-input").value = "";
  document.getElementById("booking-test").value = "";
  document.getElementById("summary-test").textContent = "-";
});
