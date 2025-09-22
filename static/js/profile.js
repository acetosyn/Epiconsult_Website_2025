// static/js/profile.js
// Frontend: fetch and update profile from server API (Flask + Supabase)

document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("profile-loader");
  const content = document.getElementById("profile-content");

  const profileName = document.getElementById("profile-name");
  const profileEmail = document.getElementById("profile-email");
  const detailName = document.getElementById("detail-name");
  const detailEmail = document.getElementById("detail-email");
  const bookedServices = document.getElementById("booked-services");

  // Modal elements
  const editBtn = document.getElementById("edit-profile-btn");
  const modal = document.getElementById("edit-profile-modal");
  const closeBtn = document.getElementById("close-edit-modal");
  const saveBtn = document.getElementById("save-profile-btn");

  const inputFirst = document.getElementById("edit-first-name");
  const inputMiddle = document.getElementById("edit-middle-name");
  const inputLast = document.getElementById("edit-last-name");

  // Utility
  function showContent() {
    if (loader) loader.style.display = "none";
    if (content) content.style.display = "block";
  }

  function showError(msg = "Error loading profile") {
    if (profileName) profileName.textContent = msg;
    if (profileEmail) profileEmail.textContent = "-";
    showContent();
  }

  async function callApi(path, method = "GET", body = null) {
    const headers = {};
    if (body) headers["Content-Type"] = "application/json";
    const res = await fetch(path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "same-origin", // send cookies (Flask session)
    });
    return res;
  }

  async function loadProfile() {
    try {
      const res = await callApi("/api/profile", "GET");
      if (!res.ok) {
        const txt = await res.text();
        console.error("Profile API failed:", res.status, txt);
        showError("Failed to load profile");
        return;
      }
      const user = await res.json();

      // Fill UI
      const fullName = [user.first_name, user.middle_name, user.last_name].filter(Boolean).join(" ");
      profileName.textContent = fullName || "Unnamed User";
      profileEmail.textContent = user.email || "-";
      detailName.textContent = fullName || "-";
      detailEmail.textContent = user.email || "-";

      // services placeholder
      if (Array.isArray(user.services) && user.services.length) {
        bookedServices.innerHTML = "";
        user.services.forEach((s) => {
          const li = document.createElement("li");
          li.textContent = s;
          bookedServices.appendChild(li);
        });
      } else {
        bookedServices.innerHTML = "<li>No services booked yet.</li>";
      }

      // Prefill modal inputs
      if (inputFirst) inputFirst.value = user.first_name || "";
      if (inputMiddle) inputMiddle.value = user.middle_name || "";
      if (inputLast) inputLast.value = user.last_name || "";

      showContent();
    } catch (err) {
      console.error("Error fetching profile:", err);
      showError();
    }
  }

  // Load profile on page load
  loadProfile();

  // Modal open/close
  if (editBtn) {
    editBtn.addEventListener("click", () => modal.classList.remove("hidden"));
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
  }

  // Save handler
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      try {
        const payload = {
          first_name: inputFirst.value,
          middle_name: inputMiddle.value || null,
          last_name: inputLast.value,
        };
        const res = await callApi("/api/profile/update", "POST", payload);
        if (!res.ok) {
          const txt = await res.text();
          console.error("Update failed:", res.status, txt);
          alert("Failed to save profile");
          return;
        }
        const updated = await res.json();

        // Update UI
        const fullName = [updated.first_name, updated.middle_name, updated.last_name].filter(Boolean).join(" ");
        profileName.textContent = fullName;
        profileEmail.textContent = updated.email || profileEmail.textContent;
        detailName.textContent = fullName;
        detailEmail.textContent = updated.email || detailEmail.textContent;

        modal.classList.add("hidden");
        alert("Profile saved");
      } catch (err) {
        console.error("Save error:", err);
        alert("Failed to save profile");
      }
    });
  }

  // --- nav switching (same as before) ---
  document.querySelectorAll(".nav-link").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-link").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const section = btn.dataset.section;
      document.querySelectorAll(".section").forEach((s) => s.classList.remove("active"));
      const activeSection = document.getElementById(`section-${section}`);
      if (activeSection) activeSection.classList.add("active");
    });
  });
});
