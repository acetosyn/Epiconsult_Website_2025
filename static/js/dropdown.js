// static/js/dropdown.js
(function () {
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

  function getClinicHref(sectionKey, name) {
    const key = sectionKey.toLowerCase();
    if (key.includes("general")) return "/clinic/general";
    if (key.includes("sickle")) return "/clinic/sickle-cell";
    if (key.includes("specialist")) return "/clinic/specialist";
    return "/clinic/" + slugify(name);
  }

  function getDiagnosticsHref(sectionKey, name) {
    const key = sectionKey.toLowerCase();
    if (key.includes("imaging") || key.includes("radiology"))
      return "/diagnostics/radiology";
    if (key.includes("laboratory")) return "/diagnostics/laboratory";
    return "/diagnostics#" + slugify(name);
  }

  // ---------- DESKTOP BUILDER (with nested flyouts) ----------
  function buildDesktopDropdown(rootEl, data, type) {
    rootEl.innerHTML = "";
    if (!data) return;

    const container = document.createElement("div");
    container.className = "mega-grid";

    Object.keys(data).forEach((sectionKey) => {
      const section = document.createElement("div");
      section.className = "mega-section";

      const headerLink = document.createElement("a");
      headerLink.className = "mega-header";
      headerLink.textContent = sectionKey;

      headerLink.href =
        type === "clinic"
          ? getClinicHref(sectionKey, sectionKey)
          : getDiagnosticsHref(sectionKey, sectionKey);

      section.appendChild(headerLink);

      // Recursive submenu builder
      function buildList(items, parentSectionKey) {
        const list = document.createElement("div");
        list.className = "mega-list";

        items.forEach((it) => {
          const name =
            typeof it === "string" ? it : it.name || it.title || it.label;

          if (typeof it === "object" && !Array.isArray(it)) {
            // Nested submenu
            const subWrapper = document.createElement("div");
            subWrapper.className = "submenu-wrapper";

            const link = document.createElement("a");
            link.className = "mega-link has-submenu";
            link.textContent = name;
            link.href =
              type === "clinic"
                ? getClinicHref(parentSectionKey, name)
                : getDiagnosticsHref(parentSectionKey, name);

            const subMenu = buildList(Object.keys(it), name);
            subMenu.classList.add("submenu");

            subWrapper.appendChild(link);
            subWrapper.appendChild(subMenu);
            list.appendChild(subWrapper);

            // Hover toggle
            subWrapper.addEventListener("mouseenter", () => {
              subMenu.classList.add("submenu-open");
            });
            subWrapper.addEventListener("mouseleave", () => {
              subMenu.classList.remove("submenu-open");
            });
          } else {
            // Normal link
            const a = document.createElement("a");
            a.className = "mega-link";
            a.textContent = name;
            a.href =
              type === "clinic"
                ? getClinicHref(parentSectionKey, name)
                : getDiagnosticsHref(parentSectionKey, name);
            list.appendChild(a);
          }
        });

        return list;
      }

      const items = Array.isArray(data[sectionKey])
        ? data[sectionKey]
        : typeof data[sectionKey] === "object"
        ? Object.keys(data[sectionKey])
        : [];

      if (items.length > 0) {
        section.appendChild(buildList(items, sectionKey));
      }

      container.appendChild(section);
    });

    rootEl.appendChild(container);
  }

  // ---------- MOBILE BUILDER (accordion, unchanged) ----------
  function buildMobileAccordion(rootEl, data, type) {
    rootEl.innerHTML = "";
    if (!data) return;

    Object.keys(data).forEach((sectionKey) => {
      const wrapper = document.createElement("div");

      const btn = document.createElement("button");
      btn.className =
        "w-full flex justify-between items-center py-2 px-3 rounded-md font-medium text-gray-100 hover:text-red-400";
      btn.innerHTML = `<span>${sectionKey}</span><span class="toggle-icon text-lg font-bold">+</span>`;
      btn.setAttribute("aria-expanded", "false");

      const panel = document.createElement("div");
      panel.className =
        "submenu ml-3 max-h-0 overflow-hidden transition-all duration-300 ease-in-out";
      wrapper.appendChild(btn);
      wrapper.appendChild(panel);

      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!expanded));
        btn.querySelector(".toggle-icon").textContent = expanded ? "+" : "−";

        if (!expanded) {
          panel.innerHTML = "";
          const items = Array.isArray(data[sectionKey])
            ? data[sectionKey]
            : Object.keys(data[sectionKey] || {});

          items.forEach((it) => {
            const name =
              typeof it === "string" ? it : it.name || it.title || it.label;
            const a = document.createElement("a");
            a.className = "block py-1 text-gray-300 hover:text-red-400";
            a.textContent = name;
            a.href =
              type === "clinic"
                ? getClinicHref(sectionKey, name)
                : getDiagnosticsHref(sectionKey, name);
            panel.appendChild(a);
          });

          panel.style.maxHeight = panel.scrollHeight + "px";
        } else {
          panel.style.maxHeight = "0px";
        }
      });

      rootEl.appendChild(wrapper);
    });
  }

  async function initMenu(jsonUrl, desktopRootId, mobileRootId, type) {
    try {
      const json = await fetchJson(jsonUrl);
      if (!json) return;

      let dataRoot = json;
      const topKeys = Object.keys(json);
      if (topKeys.length === 1 && typeof json[topKeys[0]] === "object") {
        dataRoot = json[topKeys[0]];
      }

      const desktopRoot = document.getElementById(desktopRootId);
      const mobileRoot = document.getElementById(mobileRootId);
      if (desktopRoot) buildDesktopDropdown(desktopRoot, dataRoot, type);
      if (mobileRoot) buildMobileAccordion(mobileRoot, dataRoot, type);
    } catch (err) {
      console.error("initMenu error", err);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const clinicUrl =
      document.getElementById("clinic-menu-container")?.dataset.json ||
      "/dataset/clinic.json";
    const diagUrl =
      document.getElementById("diagnostics-menu-container")?.dataset.json ||
      "/dataset/diagnostics.json";
    initMenu(clinicUrl, "clinic-dropdown-root", "mobile-clinic-root", "clinic");
    initMenu(
      diagUrl,
      "diagnostics-dropdown-root",
      "mobile-diagnostics-root",
      "diagnostics"
    );
  });
})();
