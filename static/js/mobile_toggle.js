document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("mobile-menu-button");
  const menu = document.getElementById("mobile-menu");
  const overlay = document.getElementById("mobile-overlay");
  const iconHamburger = document.getElementById("icon-hamburger");
  const iconClose = document.getElementById("icon-close");

  function openMenu() {
    menu.classList.remove("translate-x-full");
    menu.classList.add("translate-x-0");
    overlay.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");

    iconHamburger.classList.add("hidden");
    iconClose.classList.remove("hidden");
  }

  function closeMenu() {
    menu.classList.remove("translate-x-0");
    menu.classList.add("translate-x-full");
    overlay.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");

    iconHamburger.classList.remove("hidden");
    iconClose.classList.add("hidden");
  }

  // Toggle button
  menuBtn.addEventListener("click", () => {
    const isClosed = menu.classList.contains("translate-x-full");
    isClosed ? openMenu() : closeMenu();
  });

  // Close if clicking outside (overlay)
  overlay.addEventListener("click", closeMenu);

  // Auto-reset on desktop resize
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) {
      closeMenu();
    }
  });
});
