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

  // ----------- LINK HELPERS -----------
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

  // ----------- DESKTOP DROPDOWN (flyouts) -----------
  function buildDesktopDropdown(rootEl, data, type) {
    rootEl.innerHTML = "";
    if (!data) return;

    const container = document.createElement("div");
    container.className = "dropdown-menu";

    Object.keys(data).forEach((sectionKey) => {
      const hasChildren =
        typeof data[sectionKey] === "object" &&
        Object.keys(data[sectionKey]).length > 0;

      const item = document.createElement("div");
      item.className = "dropdown-item";

      const link = document.createElement("a");
      link.className = "dropdown-link";
      link.textContent = sectionKey;
      link.href =
        type === "clinic"
          ? getClinicHref(sectionKey, sectionKey)
          : getDiagnosticsHref(sectionKey, sectionKey);

      if (hasChildren) {
        const chevron = document.createElement("span");
        chevron.className = "chevron";
        chevron.innerHTML = "▸"; // CSS will rotate this
        link.appendChild(chevron);

        const submenu = document.createElement("div");
        submenu.className = "submenu";

        Object.keys(data[sectionKey]).forEach((childKey) => {
          const childLink = document.createElement("a");
          childLink.className = "submenu-link";
          childLink.textContent = childKey;
          childLink.href =
            type === "clinic"
              ? getClinicHref(sectionKey, childKey)
              : getDiagnosticsHref(sectionKey, childKey);
          submenu.appendChild(childLink);
        });

        item.appendChild(link);
        item.appendChild(submenu);

        // Hover events
        item.addEventListener("mouseenter", () => {
          submenu.classList.add("submenu-open");
          chevron.classList.add("rotate");
        });
        item.addEventListener("mouseleave", () => {
          submenu.classList.remove("submenu-open");
          chevron.classList.remove("rotate");
        });
      } else {
        item.appendChild(link);
      }

      container.appendChild(item);
    });

    rootEl.appendChild(container);
  }

  // ----------- MOBILE ACCORDION -----------
  function buildMobileAccordion(rootEl, data, type) {
    rootEl.innerHTML = "";
    if (!data) return;

    Object.keys(data).forEach((sectionKey) => {
      const wrapper = document.createElement("div");
      wrapper.className = "mobile-section";

      const btn = document.createElement("button");
      btn.className =
        "w-full flex justify-between items-center py-2 px-3 rounded-md font-medium text-gray-100 hover:text-red-400";
      btn.innerHTML = `<span>${sectionKey}</span><span class="toggle-icon">▸</span>`;
      btn.setAttribute("aria-expanded", "false");

      const panel = document.createElement("div");
      panel.className =
        "submenu ml-3 max-h-0 overflow-hidden transition-all duration-300 ease-in-out";
      wrapper.appendChild(btn);
      wrapper.appendChild(panel);

      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!expanded));
        btn.querySelector(".toggle-icon").classList.toggle("rotate", !expanded);

        if (!expanded) {
          panel.innerHTML = "";
          Object.keys(data[sectionKey] || {}).forEach((childKey) => {
            const a = document.createElement("a");
            a.className = "block py-1 text-gray-300 hover:text-red-400";
            a.textContent = childKey;
            a.href =
              type === "clinic"
                ? getClinicHref(sectionKey, childKey)
                : getDiagnosticsHref(sectionKey, childKey);
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

  // ----------- INITIALIZER -----------
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

  // ----------- BOOTSTRAP -----------
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
