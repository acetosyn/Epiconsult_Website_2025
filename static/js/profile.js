// static/js/profile.js
// Frontend: fetch profile from server API, show modal, update via API
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("profile-loader");
  const content = document.getElementById("profile-content");

  const profileName = document.getElementById("profile-name");
  const profileEmail = document.getElementById("profile-email");
  const detailName = document.getElementById("detail-name");
  const detailEmail = document.getElementById("detail-email");
  const detailPhone = document.getElementById("detail-phone");
  const detailAddress = document.getElementById("detail-address");
  const bookedServices = document.getElementById("booked-services");

  // Modal elements (IDs aligned with profile.html from earlier)
  const editBtn = document.getElementById("edit-profile-btn");
  const modal = document.getElementById("edit-profile-modal");
  const closeBtn = document.getElementById("close-edit-modal");
  const saveBtn = document.getElementById("save-profile-btn");

  const inputName = document.getElementById("edit-name");
  const inputPhone = document.getElementById("edit-phone");
  const inputAddress = document.getElementById("edit-address");

  // Utility: hide loader + show content
  function showContent() {
    if (loader) loader.style.display = "none";
    if (content) content.style.display = "block";
  }

  function showError(msg = "Error loading profile") {
    if (profileName) profileName.textContent = msg;
    if (profileEmail) profileEmail.textContent = "-";
    showContent();
  }

  async function callApi(path, method = "GET", token = null, body = null) {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (body) headers["Content-Type"] = "application/json";
    const res = await fetch(path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "same-origin"
    });
    return res;
  }

  async function loadProfileWithToken(idToken) {
    try {
      const res = await callApi("/api/profile", "GET", idToken);
      if (!res.ok) {
        const txt = await res.text();
        console.error("Profile API failed:", res.status, txt);
        showError("Failed to load profile");
        return;
      }
      const user = await res.json();

      // Fill UI
      profileName.textContent = user.name || "Unnamed User";
      profileEmail.textContent = user.email || "-";
      detailName.textContent = user.name || "-";
      detailEmail.textContent = user.email || "-";
      detailPhone.textContent = user.phone || "-";
      detailAddress.textContent = user.address || "-";

      // services — keep minimal, if not present show placeholder
      if (Array.isArray(user.services) && user.services.length) {
        bookedServices.innerHTML = "";
        user.services.forEach(s => {
          const li = document.createElement("li");
          li.textContent = s;
          bookedServices.appendChild(li);
        });
      } else {
        bookedServices.innerHTML = "<li>No services booked yet.</li>";
      }

      // Prefill modal inputs
      inputName.value = user.name || "";
      inputPhone.value = user.phone || "";
      inputAddress.value = user.address || "";

      showContent();
    } catch (err) {
      console.error("Error fetching profile:", err);
      showError();
    }
  }

  // Listen to Firebase auth state — when user signs in we get a token, then call server API
  onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) {
      // Not signed in; hide loader and show content with guest
      showError("Not signed in");
      return;
    }

    try {
      const idToken = await fbUser.getIdToken(/* forceRefresh */ false);
      await loadProfileWithToken(idToken);
    } catch (err) {
      console.error("Failed to get ID token:", err);
      showError("Not authenticated");
    }
  });

  // Modal open/close
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      modal.classList.remove("hidden");
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }

  // Save handler: send update to server
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      // need a current idToken
      const user = auth.currentUser;
      if (!user) {
        alert("Not authenticated");
        return;
      }
      try {
        const idToken = await user.getIdToken(/* forceRefresh */ false);
        const payload = {
          name: inputName.value,
          phone: inputPhone.value,
          address: inputAddress.value
        };
        const res = await callApi("/api/profile/update", "POST", idToken, payload);
        if (!res.ok) {
          const txt = await res.text();
          console.error("Update failed:", res.status, txt);
          alert("Failed to save profile");
          return;
        }
        const updated = await res.json();

        // update UI immediately
        profileName.textContent = updated.name || profileName.textContent;
        profileEmail.textContent = updated.email || profileEmail.textContent;
        detailName.textContent = updated.name || detailName.textContent;
        detailPhone.textContent = updated.phone || detailPhone.textContent;
        detailAddress.textContent = updated.address || detailAddress.textContent;

        modal.classList.add("hidden");
        alert("Profile saved");
      } catch (err) {
        console.error("Save error:", err);
        alert("Failed to save profile");
      }
    });
  }

  // --- nav switching (keeps earlier logic) ---
  document.querySelectorAll(".nav-link").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-link").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const section = btn.dataset.section;
      document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
      const activeSection = document.getElementById(`section-${section}`);
      if (activeSection) activeSection.classList.add("active");
    });
  });
});
