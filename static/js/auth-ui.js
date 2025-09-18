// static/js/auth-ui.js
(function () {
  // ---------------------------
  // Flash / Toast
  // ---------------------------
  function createFlash(message, { type = "info", timeout = 4000 } = {}) {
    const id = "epiconsult-flash-container";
    let container = document.getElementById(id);
    if (!container) {
      container = document.createElement("div");
      container.id = id;
      container.style.position = "fixed";
      container.style.top = "16px";
      container.style.right = "16px";
      container.style.zIndex = 9999;
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.gap = "8px";
      document.body.appendChild(container);
    }

    let bg, color, icon;
    switch (type) {
      case "error":   bg = "#fee2e2"; color = "#b91c1c"; icon = "⚠️"; break;
      case "success": bg = "#d1fae5"; color = "#065f46"; icon = "✅"; break;
      case "logout":  bg = "#fef3c7"; color = "#92400e"; icon = "🚪"; break;
      default:        bg = "#eef2ff"; color = "#374151"; icon = "ℹ️";
    }

    const box = document.createElement("div");
    box.style.padding = "12px 16px";
    box.style.borderRadius = "12px";
    box.style.background = bg;
    box.style.color = color;
    box.style.fontWeight = "600";
    box.style.display = "flex";
    box.style.alignItems = "center";
    box.style.gap = "8px";
    box.style.boxShadow = "0 6px 18px rgba(2,6,23,0.08)";
    box.textContent = `${icon} ${message}`;
    box.style.opacity = "0";
    box.style.transform = "translateY(-6px)";
    box.style.transition = "opacity 200ms ease, transform 200ms ease";

    container.appendChild(box);

    requestAnimationFrame(() => {
      box.style.opacity = "1";
      box.style.transform = "translateY(0)";
    });

    setTimeout(() => {
      box.style.opacity = "0";
      box.style.transform = "translateY(-6px)";
      setTimeout(() => box.remove(), 250);
    }, timeout);
  }

  // ---------------------------
  // Templates
  // ---------------------------
  function renderSkeleton() {
    return `
      <div class="animate-pulse flex items-center gap-2">
        <div class="w-8 h-8 rounded-full bg-gray-300"></div>
        <div class="h-4 bg-gray-300 rounded w-20"></div>
      </div>
    `;
  }

  function renderLogin() {
    return `
      <a href="/login" 
         class="px-4 py-2 rounded bg-navy text-white font-medium hover:bg-yellow-400 transition">
        🔑 Login
      </a>
    `;
  }

  function renderUserDropdown(user) {
    const profileUrl = window.__PROFILE_URL__ || "/profile"; // ✅ use Flask injected URL
    const name = user?.name || (user?.email ? user.email.split("@")[0] : "User");
    return `
      <div class="relative">
        <button class="user-menu-btn flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition"
          aria-expanded="false">
          <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">
            ${name[0].toUpperCase()}
          </div>
          <span class="hidden sm:inline font-medium text-gray-800">Welcome, ${name}</span>
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        <div class="user-dropdown hidden absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg overflow-hidden z-50">
          <a href="${profileUrl}" class="block px-4 py-2 text-sm hover:bg-gray-100">Profile</a>
          <button class="logout-btn w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
            Logout
          </button>
        </div>
      </div>
    `;
  }

  // ---------------------------
  // Render into slots
  // ---------------------------
  function renderIntoSlot(slotId, user, firstLoad = false) {
    const slot = document.getElementById(slotId);
    if (!slot) return;

    slot.innerHTML = ""; // clear
    if (firstLoad) {
      slot.innerHTML = renderSkeleton();
      return;
    }
    if (!user) {
      slot.innerHTML = renderLogin();
      return;
    }

    slot.innerHTML = renderUserDropdown(user);

    const btn = slot.querySelector(".user-menu-btn");
    const dd = slot.querySelector(".user-dropdown");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      dd.classList.toggle("hidden");
      btn.setAttribute("aria-expanded", dd.classList.contains("hidden") ? "false" : "true");
    });

    document.addEventListener("click", (e) => {
      if (!slot.contains(e.target)) {
        dd.classList.add("hidden");
        btn.setAttribute("aria-expanded", "false");
      }
    });

    slot.querySelector(".logout-btn").addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        const mod = await import("/static/js/firebase.js");
        if (mod?.doFirebaseLogout) {
          await mod.doFirebaseLogout();
          return;
        }
      } catch (_) {}
      try { await fetch("/sessionLogout", { method: "POST" }); } catch (_) {}
      document.dispatchEvent(new CustomEvent("auth-changed", { detail: null }));
      window.location.href = "/";
    });
  }

  function updateUI(user) {
    renderIntoSlot("auth-slot", user);
    renderIntoSlot("auth-slot-mobile", user);
  }

  // ---------------------------
  // Auth state listener
  // ---------------------------
  let hasEverAuth = false;
  let lastUser = null;

  document.addEventListener("auth-changed", (e) => {
    const user = e.detail ?? null;
    updateUI(user);

    if (!hasEverAuth) {
      hasEverAuth = true;
      lastUser = user;
      return;
    }

    if (!lastUser && user) {
      createFlash("Login successful", { type: "success" });
    } else if (lastUser && !user) {
      createFlash("Logged out successfully", { type: "logout" });
    }

    lastUser = user;
  });

  // ---------------------------
  // Init
  // ---------------------------
  document.addEventListener("DOMContentLoaded", () => {
    // Show skeleton immediately
    renderIntoSlot("auth-slot", null, true);
    renderIntoSlot("auth-slot-mobile", null, true);

    if (window.__CURRENT_USER__ !== undefined) {
      updateUI(window.__CURRENT_USER__);
    }

    // Dev hooks
    window.setLoggedInUser = (u) => {
      window.__CURRENT_USER__ = u;
      document.dispatchEvent(new CustomEvent("auth-changed", { detail: u }));
    };
    window.EpiconsultFlash = { show: createFlash };
    window.EpiconsultUI = { update: updateUI };
  });
})();
