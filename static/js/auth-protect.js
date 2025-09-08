// static/js/auth-protect.js
import { auth } from "./auth.js";  // reuse the already initialized Firebase auth

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-protected]").forEach(link => {
    link.addEventListener("click", (e) => {
      const user = auth.currentUser;
      if (!user) {
        e.preventDefault();
        // Redirect to login with ?next param
        window.location.href = "/login?next=" + encodeURIComponent(link.getAttribute("href"));
      }
    });
  });
});
