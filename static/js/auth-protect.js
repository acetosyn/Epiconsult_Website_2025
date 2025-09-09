// static/js/auth-protect.js
import { auth } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-protected]").forEach(link => {
    link.addEventListener("click", (e) => {
      const user = auth.currentUser;
      if (!user) {
        e.preventDefault();
        window.location.href = "/login?next=" + encodeURIComponent(link.getAttribute("href"));
      }
    });
  });
});
