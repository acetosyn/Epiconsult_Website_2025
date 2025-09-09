// static/js/user_dropdown.js
// Handles dropdown toggle only (desktop + mobile)

document.addEventListener("DOMContentLoaded", () => {
  function setupDropdown(buttonId, dropdownId) {
    const button = document.getElementById(buttonId);
    const dropdown = document.getElementById(dropdownId);

    if (!button || !dropdown) return;

    // Toggle dropdown
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle("show");
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && !button.contains(e.target)) {
        dropdown.classList.remove("show");
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Init desktop + mobile
  setupDropdown("user-menu-btn", "user-dropdown");
  setupDropdown("user-menu-btn-mobile", "user-dropdown-mobile");
});
