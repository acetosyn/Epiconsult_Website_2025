// dropdown.js
document.addEventListener("DOMContentLoaded", () => {
  async function fetchJson(url) {
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error("Fetch failed " + res.status);
      return await res.json();
    } catch (err) {
      console.warn("Failed to fetch", url, err);
      return null;
    }
  }

  // Desktop card
  function buildDesktopCard(container, tree, resolver) {
    container.innerHTML = "";
    container.setAttribute("role", "menu");

    const list = document.createElement("div");
    list.className = "space-y-3";

    Object.keys(tree).forEach((key) => {
      const wrapper = document.createElement("div");

      const header = document.createElement("button");
      header.type = "button";
      header.className =
        "flex justify-between items-center w-full cursor-pointer font-semibold text-gray-800 py-1 hover:text-red-600 transition-colors";
      header.setAttribute("aria-expanded", "false");
      header.textContent = key;

      const toggle = document.createElement("span");
      toggle.textContent = "+";
      toggle.className = "ml-2 text-red-500 font-bold";
      header.appendChild(toggle);

      const subList = document.createElement("div");
      subList.className =
        "submenu pl-3 space-y-1 max-h-0 overflow-hidden transition-all duration-300 ease-in-out";
      subList.setAttribute("role", "group");

      const items = tree[key];
      if (Array.isArray(items)) {
        items.forEach((item) => {
          const a = document.createElement("a");
          a.href = resolver(key, item);
          a.textContent = item;
          a.setAttribute("role", "menuitem");
          a.className =
            "block text-sm text-gray-600 hover:text-red-600 transition-colors";
          subList.appendChild(a);
        });
      } else if (typeof items === "object") {
        Object.keys(items).forEach((childKey) => {
          const a = document.createElement("a");
          a.href = resolver(key, childKey);
          a.textContent = childKey;
          a.setAttribute("role", "menuitem");
          a.className =
            "block text-sm text-gray-600 hover:text-red-600 transition-colors";
          subList.appendChild(a);
        });
      }

      // Toggle expand
      header.addEventListener("click", () => {
        const expanded =
          subList.style.maxHeight && subList.style.maxHeight !== "0px";
        document.querySelectorAll(".submenu").forEach((el) => {
          el.style.maxHeight = "0px";
          el.previousElementSibling.setAttribute("aria-expanded", "false");
          el.previousElementSibling.querySelector("span").textContent = "+";
        });
        if (!expanded) {
          subList.style.maxHeight = subList.scrollHeight + "px";
          header.setAttribute("aria-expanded", "true");
          toggle.textContent = "–";
        } else {
          subList.style.maxHeight = "0px";
          header.setAttribute("aria-expanded", "false");
          toggle.textContent = "+";
        }
      });

      wrapper.appendChild(header);
      wrapper.appendChild(subList);
      list.appendChild(wrapper);
    });

    container.appendChild(list);
  }

  // Mobile accordion
  function buildMobileAccordion(rootEl, tree, resolver) {
    rootEl.innerHTML = "";
    rootEl.setAttribute("role", "menu");

    Object.keys(tree || {}).forEach((key) => {
      const wrapper = document.createElement("div");

      const headerBtn = document.createElement("button");
      headerBtn.type = "button";
      headerBtn.className =
        "w-full text-left py-2 font-medium flex justify-between items-center";
      headerBtn.textContent = key;
      headerBtn.setAttribute("aria-expanded", "false");

      const chevron = document.createElement("span");
      chevron.className = "ml-2 text-gray-400";
      chevron.innerHTML = "▾";
      headerBtn.appendChild(chevron);

      const list = document.createElement("div");
      list.className =
        "pl-4 max-h-0 overflow-hidden transition-all duration-300 ease-in-out";
      list.setAttribute("role", "group");

      const items = tree[key];
      if (Array.isArray(items)) {
        items.forEach((item) => {
          const a = document.createElement("a");
          a.href = resolver(key, item);
          a.textContent = item;
          a.setAttribute("role", "menuitem");
          a.className =
            "block py-1 text-sm text-gray-700 hover:text-red-600 transition-colors";
          list.appendChild(a);
        });
      } else if (typeof items === "object") {
        Object.keys(items).forEach((childKey) => {
          const a = document.createElement("a");
          a.href = resolver(key, childKey);
          a.textContent = childKey;
          a.setAttribute("role", "menuitem");
          a.className =
            "block py-1 text-sm text-gray-700 hover:text-red-600 transition-colors";
          list.appendChild(a);
        });
      }

      headerBtn.addEventListener("click", () => {
        const opened = list.style.maxHeight && list.style.maxHeight !== "0px";
        rootEl.querySelectorAll("div[role='group']").forEach((el) => {
          el.style.maxHeight = "0px";
          el.previousElementSibling.setAttribute("aria-expanded", "false");
        });
        if (!opened) {
          list.style.maxHeight = list.scrollHeight + "px";
          headerBtn.setAttribute("aria-expanded", "true");
        }
      });

      wrapper.appendChild(headerBtn);
      wrapper.appendChild(list);
      rootEl.appendChild(wrapper);
    });
  }

  // Link resolvers
  function clinicLinkResolver(topKey, childKey) {
    const tk = (topKey || "").toUpperCase();
    if (tk === "GENERAL CONSULTATION")
      return "{{ url_for('clinic.general') }}";
    if (tk.includes("SICKLE")) return "{{ url_for('clinic.sickle_cell') }}";
    if (tk === "SPECIALIST") return "{{ url_for('clinic.specialist') }}";
    return "{{ url_for('clinic.specialist') }}";
  }
  function diagnosticsLinkResolver(topKey) {
    if ((topKey || "").toUpperCase().includes("IMAGING"))
      return "{{ url_for('diagnostics.radiology') }}";
    if ((topKey || "").toUpperCase().includes("LABORATORY"))
      return "{{ url_for('diagnostics.laboratory') }}";
    return "{{ url_for('diagnostics.laboratory') }}";
  }
  function laboratoryLinkResolver() {
    return "{{ url_for('diagnostics.laboratory') }}";
  }

  // Init menu
  async function initMenu(menuContainerId, jsonUrl, desktopRootId, mobileRootId, resolver) {
    const data = await fetchJson(jsonUrl);
    let jsonData = data;
    if (jsonData && Object.keys(jsonData).length === 1 && typeof Object.values(jsonData)[0] === "object") {
      jsonData = Object.values(jsonData)[0];
    }

    // Merge lab categories into diagnostics JSON
    if (menuContainerId.includes("diagnostics")) {
      const labData = await fetchJson("/dataset/laboratory.json");
      if (labData) {
        const k = Object.keys(labData);
        let labInner = labData[k[0]] || labData;
        jsonData["Laboratory"] = Object.keys(labInner); // ✅ categories only
      }
    }

    // Desktop hover + sticky
    const desktopRoot = document.getElementById(desktopRootId);
    const parentContainer = document.getElementById(menuContainerId);
    if (desktopRoot && parentContainer) {
      buildDesktopCard(desktopRoot, jsonData || {}, resolver);

      let hoverTimer;
      parentContainer.addEventListener("mouseenter", () => {
        clearTimeout(hoverTimer);
        adjustDropdownPosition(desktopRoot);
        desktopRoot.classList.remove("hidden");
      });

      // ✅ keep open while hovering dropdown
      [parentContainer, desktopRoot].forEach((el) => {
        el.addEventListener("mouseleave", () => {
          hoverTimer = setTimeout(() => {
            desktopRoot.classList.add("hidden");
          }, 250);
        });
        el.addEventListener("mouseenter", () => {
          clearTimeout(hoverTimer);
        });
      });
    }

    // Mobile
    const mobileRoot = document.getElementById(mobileRootId);
    if (mobileRoot) buildMobileAccordion(mobileRoot, jsonData || {}, resolver);
  }

  // Positioning
  function adjustDropdownPosition(dropdown) {
    dropdown.style.left = "0"; 
    dropdown.style.right = "auto";
    const rect = dropdown.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      dropdown.style.left = "auto";
      dropdown.style.right = "0";
    }
  }

  // Initialize
  (async function () {
    const clinicUrl =
      document.getElementById("clinic-menu-container")?.getAttribute("data-json") ||
      "/dataset/clinic.json";
    const diagUrl =
      document.getElementById("diagnostics-menu-container")?.getAttribute("data-json") ||
      "/dataset/diagnostics.json";

    await initMenu("clinic-menu-container", clinicUrl, "clinic-dropdown-root", "mobile-clinic-root", clinicLinkResolver);
    await initMenu("diagnostics-menu-container", diagUrl, "diagnostics-dropdown-root", "mobile-diagnostics-root", diagnosticsLinkResolver);
  })();
});
