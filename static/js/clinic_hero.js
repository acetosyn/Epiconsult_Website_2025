// ==========================
// general_hero.js
// ==========================

// Typewriter effect for hero text
document.addEventListener("DOMContentLoaded", () => {
  const typewriterEl = document.getElementById("typewriter");
  if (!typewriterEl) return;

  const phrases = [
    "Comprehensive Healthcare for Every Family",
    "Instant Doctor Consultations",
    "Seamless Telemedicine Services",
    "Your Trusted Diagnostic Partner"
  ];

  let phraseIndex = 0;
  let letterIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function typeEffect() {
    const currentPhrase = phrases[phraseIndex];
    if (!isDeleting) {
      // Typing forward
      typewriterEl.textContent = currentPhrase.substring(0, letterIndex + 1);
      letterIndex++;
      if (letterIndex === currentPhrase.length) {
        isDeleting = true;
        typingSpeed = 1500; // pause before deleting
      } else {
        typingSpeed = 100; // typing speed
      }
    } else {
      // Deleting backward
      typewriterEl.textContent = currentPhrase.substring(0, letterIndex - 1);
      letterIndex--;
      if (letterIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 500; // pause before typing next phrase
      } else {
        typingSpeed = 50; // deleting speed
      }
    }
    setTimeout(typeEffect, typingSpeed);
  }

  typeEffect();
});


// ==========================
// Consultation Confirmation
// ==========================
function confirmConsultation(type) {
  const confirmationCard = document.getElementById("confirmationCard");
  const message = document.getElementById("confirmationMessage");

  if (type === "doctor") {
    message.textContent =
      "Your Doctor Connect consultation has been booked successfully. Our in-house doctor will reach out shortly.";
  } else if (type === "tele") {
    message.textContent =
      "Your TeleConsultation has been booked successfully. You will receive a secure video link soon.";
  }

  confirmationCard.classList.remove("hidden");
  confirmationCard.classList.add("animate-slideUp");
}

function closeConfirmation() {
  const confirmationCard = document.getElementById("confirmationCard");
  confirmationCard.classList.add("hidden");
}
