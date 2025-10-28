/* ==========================================================
   appointment-timer.js — Ultra-Stable Clock Renderer
   Prevents flicker by updating digits individually instead
   of rewriting the entire text node each second.
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const timeDigits = document.getElementById("timeDigits");
  const ampm = document.getElementById("ampm");
  const dateEl = document.getElementById("liveDate");
  if (!timeDigits || !ampm || !dateEl) return;

  // Initialize structure: individual spans for each digit/colon
  const initDigits = () => {
    const placeholders = "00:00:00".split("");
    timeDigits.innerHTML = "";
    placeholders.forEach((char, i) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.display = "inline-block";
      span.style.minWidth = char === ":" ? "0.4ch" : "0.8ch";
      span.style.textAlign = "center";
      timeDigits.appendChild(span);
    });
  };

  const updateClock = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const am = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    const formatted = `${h12.toString().padStart(2, "0")}:${minutes}:${seconds}`;

    const spans = timeDigits.children;
    for (let i = 0; i < formatted.length; i++) {
      if (spans[i].textContent !== formatted[i]) {
        spans[i].textContent = formatted[i]; // update only changed character
      }
    }

    // Update AM/PM only when changed
    if (ampm.textContent !== am) ampm.textContent = am;

    // Update date only if day changes
    const dateStr = now.toDateString();
    if (dateEl.textContent !== dateStr) dateEl.textContent = dateStr;

    // Next update
    const delay = 1000 - now.getMilliseconds();
    setTimeout(updateClock, delay);
  };

  initDigits();
  updateClock();
});
