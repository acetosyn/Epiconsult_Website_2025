// static/js/profile.js
document.addEventListener("DOMContentLoaded", () => {
  // 🚫 Skip everything if not logged in
  if (!window.__CURRENT_USER__) {
    const loader = document.getElementById("profile-loader");
    const content = document.getElementById("profile-content");
    if (loader) loader.style.display = "none";
    if (content) content.style.display = "none";
    return;
  }

  const loader = document.getElementById("profile-loader");
  const content = document.getElementById("profile-content");

  const profileName = document.getElementById("profile-name");
  const profileEmail = document.getElementById("profile-email");
  const detailName = document.getElementById("detail-name");
  const detailEmail = document.getElementById("detail-email");
  const bookedServices = document.getElementById("booked-services");

  const editBtn = document.getElementById("edit-profile-btn");
  const modal = document.getElementById("edit-profile-modal");
  const closeBtn = document.getElementById("close-edit-modal");
  const saveBtn = document.getElementById("save-profile-btn");

  const inputFirst = document.getElementById("edit-first-name");
  const inputMiddle = document.getElementById("edit-middle-name");
  const inputLast = document.getElementById("edit-last-name");
  const inputEmail = document.getElementById("edit-email");

  const uploadPic = document.getElementById("upload-pic");
  const profilePic = document.getElementById("profile-pic");

  // Toast helper (reuse from auth-ui if available)
  function flash(msg, type = "info") {
    if (window.EpiconsultFlash) {
      window.EpiconsultFlash.show(msg, { type });
    } else {
      alert(msg);
    }
  }

  function showContent() {
    if (loader) loader.style.display = "none";
    if (content) content.style.display = "block";
  }

  async function callApi(path, method = "GET", body = null) {
    const headers = {};
    if (body) headers["Content-Type"] = "application/json";
    const res = await fetch(path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "same-origin",
    });
    return res;
  }

  async function loadProfile() {
    try {
      const res = await callApi("/api/profile", "GET");
      if (!res.ok) {
        console.error("Profile API failed:", res.status);
        showContent();
        return;
      }
      const data = await res.json();
      const p = data.profile || {};
      const patient = p.patient || {};

      const fullName = [patient.first_name, patient.middle_name, patient.last_name]
        .filter(Boolean).join(" ");
      profileName.textContent = fullName || (p.user_metadata?.name || "Unnamed User");
      profileEmail.textContent = p.email || "-";
      detailName.textContent = fullName || "-";
      detailEmail.textContent = p.email || "-";

      if (Array.isArray(patient.services) && patient.services.length) {
        bookedServices.innerHTML = "";
        patient.services.forEach(s => {
          const li = document.createElement("li");
          li.textContent = s;
          bookedServices.appendChild(li);
        });
      } else {
        bookedServices.innerHTML = "<li class='muted-text'>No services booked yet.</li>";
      }

      if (inputFirst) inputFirst.value = patient.first_name || "";
      if (inputMiddle) inputMiddle.value = patient.middle_name || "";
      if (inputLast) inputLast.value = patient.last_name || "";
      if (inputEmail) inputEmail.value = p.email || "";

      showContent();
    } catch (err) {
      console.error("Error fetching profile:", err);
      showContent();
    }
  }

  loadProfile();

  // Edit profile modal
  if (editBtn) editBtn.addEventListener("click", () => modal.classList.remove("hidden"));
  if (closeBtn) closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";
      try {
        const payload = {
          first_name: inputFirst?.value,
          middle_name: inputMiddle?.value || null,
          last_name: inputLast?.value,
        };
        const res = await callApi("/api/profile/update", "POST", payload);
        if (!res.ok) {
          console.error("Update failed:", res.status);
          flash("Failed to update profile", "error");
          return;
        }
        const data = await res.json();
        const p = data.profile || {};
        const patient = p.patient || {};
        const fullName = [patient.first_name, patient.middle_name, patient.last_name]
          .filter(Boolean).join(" ");
        profileName.textContent = fullName;
        detailName.textContent = fullName;
        modal.classList.add("hidden");
        flash("Profile updated successfully", "success");
      } catch (err) {
        console.error("Save error:", err);
        flash("An error occurred", "error");
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save";
      }
    });
  }

  // Avatar upload
  if (uploadPic) {
    uploadPic.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append("avatar", file);

      try {
        const res = await fetch("/api/profile/avatar", {
          method: "POST",
          body: formData,
          credentials: "same-origin",
        });
        if (!res.ok) {
          flash("Failed to upload avatar", "error");
          return;
        }
        const data = await res.json();
        profilePic.src = data.url || profilePic.src;
        flash("Avatar updated!", "success");
      } catch (err) {
        console.error("Avatar upload error:", err);
        flash("Error uploading avatar", "error");
      }
    });
  }

  // nav switching
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
