// static/js/dropdown.js
// Architected dynamic dropdowns for Clinic & Diagnostics
// - JSON-driven menus
// - Desktop: hover-to-expand
// - Mobile: tap-to-expand accordion
// - Laboratory → prefers LaboratoryCategories from JSON
// - Smooth zoom/scale effect on dropdowns
// - ARIA + keyboard support

(function () {
  // fallback in case JSON doesn't contain LaboratoryCategories
  const LAB_DISPLAY_FALLBACK = [
    "Haematology",
    "Biochemistry",
    "Microbiology",
    "Immunology",
    "Cytology / Histology",
    "Virology",
    "Tumor Markers",
    "Endocrinology / Hormones",
    "Blood Bank",
    "Others"
  ];

  function slugify(s) {
    return String(s || "")
      .trim()
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function fetchJson(url) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Network error");
      return await res.json();
    } catch (err) {
      console.warn("Dropdown fetch failed for", url, err);
      return null;
    }
  }

  // ---------- Desktop Dropdown ----------
  function buildDesktopDropdown(rootEl, data, type, labCategories) {
    rootEl.innerHTML = "";
    if (!data) return;

    const container = document.createElement("div");
    container.className = "space-y-4";

    const keys = Object.keys(data);

    keys.forEach((sectionKey) => {
      let items = [];

      if (type === "diagnostics") {
        if (sectionKey.toLowerCase().includes("laboratory")) {
          items = labCategories;
        } else {
          items = Array.isArray(data[sectionKey])
            ? data[sectionKey]
            : Object.keys(data[sectionKey] || {});
        }
      } else {
        items = Array.isArray(data[sectionKey])
          ? data[sectionKey]
          : Object.keys(data[sectionKey] || {});
      }

      // Section wrapper
      const section = document.createElement("div");
      section.className = "submenu-wrapper";

      // Section title
      const title = document.createElement("div");
      title.className =
        "font-semibold text-gray-800 hover:text-red-600 cursor-pointer flex items-center justify-between";
      title.setAttribute("role", "button");
      title.setAttribute("tabindex", "0");
      title.innerHTML = `
        <span>${sectionKey}</span>
        <span class="toggle-icon text-sm ml-2">▸</span>
      `;
      section.appendChild(title);

      // Submenu
      const list = document.createElement("div");
      list.className = "submenu pl-3";
      list.setAttribute("role", "menu");

      items.forEach((it) => {
        const name = typeof it === "string" ? it : it.name || it.title || it.label;
        const a = document.createElement("a");
        a.className = "dropdown-link";
        a.setAttribute("role", "menuitem");

        if (type === "clinic") {
          a.href = typeof it === "object" && it.path ? it.path : "/clinic/" + slugify(name);
        } else {
          if (sectionKey.toLowerCase().includes("imaging") || sectionKey.toLowerCase().includes("radiology")) {
            a.href = "/radiology#" + slugify(name);
          } else if (sectionKey.toLowerCase().includes("laboratory")) {
            a.href = "/laboratory#" + slugify(name);
          } else {
            a.href = "/diagnostics#" + slugify(name);
          }
        }
        a.textContent = name;
        list.appendChild(a);
      });

      section.appendChild(list);
      container.appendChild(section);

      // Hover / keyboard open
      title.addEventListener("mouseenter", () => list.classList.add("open"));
      section.addEventListener("mouseleave", () => list.classList.remove("open"));
      title.addEventListener("focus", () => list.classList.add("open"));
      title.addEventListener("blur", () => list.classList.remove("open"));
    });

    rootEl.appendChild(container);
  }

  // ---------- Mobile Accordion ----------
  function buildMobileAccordion(rootEl, data, type, labCategories) {
    rootEl.innerHTML = "";
    if (!data) return;

    const keys = Object.keys(data);

    keys.forEach((sectionKey) => {
      const wrapper = document.createElement("div");

      const btn = document.createElement("button");
      btn.className =
        "w-full flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md font-medium text-gray-800";
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML = `
        <span>${sectionKey}</span>
        <span class="toggle-icon text-lg font-bold">+</span>
      `;

      const panel = document.createElement("div");
      panel.className = "submenu ml-3";
      panel.setAttribute("role", "menu");

      let items = Array.isArray(data[sectionKey])
        ? data[sectionKey]
        : Object.keys(data[sectionKey] || {});
      if (type === "diagnostics" && sectionKey.toLowerCase().includes("laboratory")) {
        items = labCategories;
      }

      items.forEach((it) => {
        const name = typeof it === "string" ? it : it.name || it.title || it.label;
        const a = document.createElement("a");
        a.className = "block py-1 text-gray-700 hover:text-red-600";
        a.setAttribute("role", "menuitem");

        if (type === "clinic") {
          a.href = typeof it === "object" && it.path ? it.path : "/clinic/" + slugify(name);
        } else {
          if (sectionKey.toLowerCase().includes("imaging") || sectionKey.toLowerCase().includes("radiology")) {
            a.href = "/radiology#" + slugify(name);
          } else if (sectionKey.toLowerCase().includes("laboratory")) {
            a.href = "/laboratory#" + slugify(name);
          } else {
            a.href = "/diagnostics#" + slugify(name);
          }
        }
        a.textContent = name;
        panel.appendChild(a);
      });

      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!expanded));
        panel.classList.toggle("open", !expanded);
      });

      wrapper.appendChild(btn);
      wrapper.appendChild(panel);
      rootEl.appendChild(wrapper);
    });
  }

  // ---------- Init ----------
  async function initMenu(jsonUrl, desktopRootId, mobileRootId, type) {
    try {
      const json = await fetchJson(jsonUrl);
      if (!json) return;

      // Pull lab categories if present
      const labCategories = json.LaboratoryCategories || LAB_DISPLAY_FALLBACK;

      let dataRoot = json;
      const topKeys = Object.keys(json);
      if (topKeys.length === 1 && typeof json[topKeys[0]] === "object") {
        dataRoot = json[topKeys[0]];
      }

      const desktopRoot = document.getElementById(desktopRootId);
      const mobileRoot = document.getElementById(mobileRootId);
      if (desktopRoot) buildDesktopDropdown(desktopRoot, dataRoot, type, labCategories);
      if (mobileRoot) buildMobileAccordion(mobileRoot, dataRoot, type, labCategories);
    } catch (err) {
      console.error("initMenu error", err);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const clinicUrl = document.getElementById("clinic-menu-container")?.dataset.json || "/dataset/clinic.json";
    const diagUrl = document.getElementById("diagnostics-menu-container")?.dataset.json || "/dataset/diagnostics.json";
    initMenu(clinicUrl, "clinic-dropdown-root", "mobile-clinic-root", "clinic");
    initMenu(diagUrl, "diagnostics-dropdown-root", "mobile-diagnostics-root", "diagnostics");
  });
})();
