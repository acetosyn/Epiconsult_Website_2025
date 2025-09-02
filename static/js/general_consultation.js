// general_consultation.js

// In-House Doctor Consultation
document.getElementById("doctorForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const name = formData.get("fullName");
  const date = formData.get("date");
  const time = formData.get("time");

  const msg = `Thank you ${name}, your appointment is booked for ${date} (${time}).`;
  showConfirmation(msg);
});

// Telemedicine Consultation → Load teleconsultation.html dynamically
document.getElementById("teleBtn")?.addEventListener("click", async () => {
  try {
    const response = await fetch("/teleconsultation");
    const html = await response.text();
    document.body.innerHTML = html; // replaces page content dynamically
    window.history.pushState({}, "", "/teleconsultation");
  } catch (err) {
    console.error("❌ Failed to load teleconsultation:", err);
    alert("Unable to load teleconsultation page. Please try again.");
  }
});

// Show confirmation
function showConfirmation(message) {
  const card = document.getElementById("confirmationCard");
  const msgEl = document.getElementById("confirmationMessage");
  msgEl.textContent = message;
  card.classList.remove("hidden");
}

// Close confirmation
function closeConfirmation() {
  document.getElementById("confirmationCard").classList.add("hidden");
}
