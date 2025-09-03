// static/js/auth-protect.js
import { auth } from "./firebase.js";

// ✅ Protect "data-protected" links
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-protected]").forEach(link => {
    link.addEventListener("click", (e) => {
      const user = auth.currentUser;
      if (!user) {
        e.preventDefault(); // stop normal link navigation
        // redirect to login with next param
        window.location.href = "/login?next=" + encodeURIComponent(link.getAttribute("href"));
      }
    });
  });
});
