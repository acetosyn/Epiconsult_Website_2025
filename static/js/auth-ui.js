// static/js/auth-ui.js
(function () {
  // ---------------------------
  // Flash / Toast
  // ---------------------------
  function createFlash(message, { type = "info", timeout = 4000, dismissible = true } = {}) {
    const id = "epiconsult-flash-container";
    let container = document.getElementById(id);
    if (!container) {
      container = document.createElement("div");
      container.id = id;
      container.className = "fixed top-4 right-4 z-[9999] flex flex-col gap-2";
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
    box.className = "flex items-center gap-2 px-4 py-3 rounded-lg shadow-md font-medium text-sm";
    box.style.background = bg;
    box.style.color = color;
    box.innerHTML = `${icon} <span>${message}</span>`;

    if (dismissible) {
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "✖";
      closeBtn.className = "ml-3 text-xs opacity-70 hover:opacity-100";
      closeBtn.onclick = () => box.remove();
      box.appendChild(closeBtn);
    }

    container.appendChild(box);
    setTimeout(() => box.remove(), timeout);
  }

  // ---------------------------
  // API helper
  // ---------------------------
  async function fetchProfile() {
    try {
      const res = await fetch("/api/profile", { credentials: "same-origin" });
      if (!res.ok) return null;
      const data = await res.json();
      return data.profile || null;
    } catch {
      return null;
    }
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
  const profileUrl = window.__PROFILE_URL__ || "/profile";
  const name = user?.patient?.first_name 
            || user?.name 
            || (user?.email ? user.email.split("@")[0] : "User");
  const email = user?.email || "";

  return `
    <div class="relative">
      <button class="user-menu-btn flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition"
        aria-expanded="false">
        <div class="w-9 h-9 rounded-full bg-gradient-to-r from-yellow-400 to-red-500 
                    text-white flex items-center justify-center font-bold shadow">
          ${name[0].toUpperCase()}
        </div>
        <span class="hidden sm:inline font-medium text-gray-800">Welcome, ${name}</span>
        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      <!-- Modern Card Dropdown -->
      <div class="user-dropdown hidden absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50">
        <div class="p-4 border-b border-gray-100 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-red-500 
                      text-white flex items-center justify-center font-bold">
            ${name[0].toUpperCase()}
          </div>
          <div class="flex flex-col">
            <span class="font-semibold text-gray-900">${name}</span>
            <span class="text-xs text-gray-500">${email}</span>
          </div>
        </div>

        <div class="flex flex-col p-2">
          <a href="${profileUrl}" class="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100">
            👤 Profile
          </a>
          <button class="logout-btn px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
            🚪 Logout
          </button>
        </div>
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
        await fetch("/logout", { method: "POST" });
      } catch (_) {}
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
  let lastUser = null;

  document.addEventListener("auth-changed", (e) => {
    const user = e.detail ?? null;
    updateUI(user);

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
  document.addEventListener("DOMContentLoaded", async () => {
    renderIntoSlot("auth-slot", null, true);
    renderIntoSlot("auth-slot-mobile", null, true);

    let user = window.__CURRENT_USER__;

    if (!user) {
      user = await fetchProfile(); // fallback to API
    }

    if (user) {
      updateUI(user);
      lastUser = user;
    } else {
      updateUI(null);
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
