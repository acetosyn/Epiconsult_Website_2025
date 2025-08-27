function startClock() {
  const timeEl = document.getElementById("timeDigits");
  const ampmEl = document.getElementById("ampm");
  const dateEl = document.getElementById("liveDate");

  if (!timeEl || !dateEl || !ampmEl) return;

  setInterval(() => {
    const now = new Date();

    // Format time
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12; // 12-hour format

    // Set time
    timeEl.textContent = `${String(hours).padStart(2, "0")}:${minutes}:${seconds}`;

    // AM/PM color
    ampmEl.textContent = ampm;
    ampmEl.className = ampm === "PM" ? "text-red-600 font-bold" : "text-blue-600 font-bold";

    // Date
    const options = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
    dateEl.textContent = now.toLocaleDateString(undefined, options);
  }, 1000);
}

startClock();
