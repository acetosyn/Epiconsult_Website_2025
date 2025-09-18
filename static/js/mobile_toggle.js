// static/js/mobile_toggle.js
<<<<<<< HEAD

=======
>>>>>>> staging
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("mobile-menu-button");
  const menu = document.getElementById("mobile-menu");
  const overlay = document.getElementById("mobile-overlay");
  const drawerCloseBtn = document.getElementById("drawer-close-btn");

  // User dropdown elements
  const userBtn = document.getElementById("user-menu-btn-mobile");
  const userDropdown = document.getElementById("user-dropdown-mobile");
  const userArrow = document.getElementById("user-arrow-mobile");

  function openMenu() {
    menu.classList.remove("translate-x-full");
    menu.classList.add("translate-x-0");
    overlay.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
  }

  function closeMenu() {
    menu.classList.remove("translate-x-0");
    menu.classList.add("translate-x-full");
    overlay.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");

    // also reset user dropdown if open
    if (userDropdown) {
      userDropdown.classList.add("hidden");
      userBtn?.setAttribute("aria-expanded", "false");
      userArrow?.classList.remove("rotate-180");
    }
  }

  if (menuBtn && menu && overlay) {
<<<<<<< HEAD
    // Toggle button
    menuBtn.addEventListener("click", () => {
      const isClosed = menu.classList.contains("translate-x-full");
      isClosed ? openMenu() : closeMenu();
    });

    // Close if clicking overlay
    overlay.addEventListener("click", closeMenu);

    // Auto-reset on desktop resize
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024) {
        closeMenu();
=======
    menuBtn.addEventListener("click", openMenu);
    overlay.addEventListener("click", closeMenu);
    if (drawerCloseBtn) drawerCloseBtn.addEventListener("click", closeMenu);

    // Auto-reset on desktop resize
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024) {
        closeMenu();
      }
    });
  }

  // =============================
  // Mobile User Dropdown Toggle
  // =============================
  if (userBtn && userDropdown) {
    userBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent closing immediately
      const expanded = userBtn.getAttribute("aria-expanded") === "true";
      userBtn.setAttribute("aria-expanded", String(!expanded));
      userDropdown.classList.toggle("hidden", expanded);
      userArrow?.classList.toggle("rotate-180", !expanded);
    });

    // Close dropdown if clicking outside (but inside drawer)
    document.addEventListener("click", (e) => {
      if (
        !userDropdown.classList.contains("hidden") && 
        !userBtn.contains(e.target) && 
        !userDropdown.contains(e.target) && 
        menu.contains(e.target) // ✅ only inside drawer
      ) {
        userDropdown.classList.add("hidden");
        userBtn.setAttribute("aria-expanded", "false");
        userArrow?.classList.remove("rotate-180");
>>>>>>> staging
      }
    });
  }
});
