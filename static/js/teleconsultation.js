// static/js/teleconsultation.js
document.addEventListener("DOMContentLoaded", () => {
  // --- Elements ---
  const googleBtn = document.getElementById("googleSignInBtn");
  const teleForm = document.getElementById("teleForm");
  const teleBookBtn = document.getElementById("teleBookBtn");
  const suggestBtn = document.getElementById("suggestBtn");

  const teleSummaryModal = document.getElementById("teleSummaryModal");
  const teleSummaryContent = document.getElementById("teleSummaryContent");
  const teleEditBtn = document.getElementById("teleEditBtn");
  const teleCancelBtn = document.getElementById("teleCancelBtn");
  const teleConfirmBtn = document.getElementById("teleConfirmBtn");

  const stepBtns = document.querySelectorAll(".step-btn");
  const darkModeToggle = document.getElementById("darkModeToggle");

  // --- Step Progress Interaction ---
  stepBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      stepBtns.forEach(b => b.classList.remove("text-red-600"));
      btn.classList.add("text-red-600");
    });
  });

  // --- Dark Mode Toggle ---
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
  }
  darkModeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    if (document.documentElement.classList.contains("dark")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  });

  // --- Simulate Google Sign-In ---
  googleBtn.addEventListener("click", () => {
    alert("✅ Google Sign-in successful (demo mode)");
    document.getElementById("fullName").value = "John Doe";
    document.getElementById("email").value = "johndoe@gmail.com";
  });

 // --- AI Suggest Best Time ---
suggestBtn.addEventListener("click", () => {
  const now = new Date();
  const dateInput = document.getElementById("consultDate");
  const timeSelect = document.getElementById("consultTime");

  let suggestion = "";
  let suggestedDate = new Date(now);

  const day = now.getDay(); // Sunday = 0, Monday = 1 ...
  const hour = now.getHours();

  if (hour < 9) {
    suggestion = "Morning (9AM - 12PM)";
  } else if (hour < 12) {
    suggestion = "Morning (9AM - 12PM)";
  } else if (hour < 17) {
    suggestion = "Afternoon (12PM - 5PM)";
  } else {
    // After 5pm → move to next working day
    do {
      suggestedDate.setDate(suggestedDate.getDate() + 1);
    } while (suggestedDate.getDay() === 0); // skip Sundays
    suggestion = "Morning (9AM - 12PM)";
  }

  // Format YYYY-MM-DD for input[type=date]
  const yyyy = suggestedDate.getFullYear();
  const mm = String(suggestedDate.getMonth() + 1).padStart(2, "0");
  const dd = String(suggestedDate.getDate()).padStart(2, "0");
  dateInput.value = `${yyyy}-${mm}-${dd}`;

  timeSelect.value = suggestion;

  alert(`💡 Suggested slot: ${suggestion} on ${dateInput.value}`);
});

  // --- Validation ---
  function validateForm() {
    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const date = document.getElementById("consultDate").value;
    const time = document.getElementById("consultTime").value;

    if (!name || !email || !phone || !date || !time) {
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

  // --- Collect Data ---
  function getFormData() {
    return {
      name: document.getElementById("fullName").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      notes: document.getElementById("notes").value.trim(),
      date: document.getElementById("consultDate").value,
      time: document.getElementById("consultTime").value,
    };
  }

  // --- Show Summary Modal ---
  function showSummary(data) {
    teleSummaryContent.innerHTML = `
      <p><strong>Full Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ""}
      <p><strong>Date:</strong> ${data.date}</p>
      <p><strong>Time:</strong> ${data.time}</p>
      <p class="text-red-600"><strong>Fee:</strong> ₦10,000 Consultation Fee (to be paid before session)</p>
    `;

    teleSummaryModal.classList.remove("hidden");
    teleSummaryModal.classList.add("flex");
    teleSummaryModal.classList.add("animate-fadeIn");
  }

  // --- Book Button Handler ---
  teleBookBtn.addEventListener("click", () => {
    if (!validateForm()) return;
    const data = getFormData();
    showSummary(data);
  });

  // --- Modal Buttons ---
  teleEditBtn.addEventListener("click", () => {
    teleSummaryModal.classList.add("hidden");
  });

  teleCancelBtn.addEventListener("click", () => {
    if (confirm("Cancel booking? Your info will be cleared.")) {
      teleForm.reset();
      teleSummaryModal.classList.add("hidden");
    }
  });

  teleConfirmBtn.addEventListener("click", () => {
    teleSummaryModal.classList.add("hidden");
    alert("💳 Redirecting to payment gateway (Flutterwave integration placeholder)...");
  });

  // --- Extra UX: Form Validation Glow ---
  document.querySelectorAll("#teleForm input, #teleForm select").forEach(input => {
    input.addEventListener("input", () => {
      if (input.checkValidity()) {
        input.classList.add("ring-2", "ring-green-400");
        input.classList.remove("ring-red-400");
      } else {
        input.classList.remove("ring-green-400");
        input.classList.add("ring-2", "ring-red-400");
      }
    });
  });
});

// --- Tailwind Animations (if not in CSS already) ---
const style = document.createElement("style");
style.innerHTML = `
@keyframes fadeIn { from {opacity:0; transform:scale(0.95);} to {opacity:1; transform:scale(1);} }
.animate-fadeIn { animation: fadeIn 0.3s ease-out; }
`;
document.head.appendChild(style);
