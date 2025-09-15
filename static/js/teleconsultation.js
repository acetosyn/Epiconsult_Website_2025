// static/js/teleconsultation.js
// Assumes you have a local firebase.js that exports `auth` (already in your project)
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  /* ========= Elements ========= */
  const steps = Array.from(document.querySelectorAll(".step"));
  const progress = document.querySelector(".steps__progress");

  const authStatus = document.getElementById("authStatus");
  const googleBtn = document.getElementById("googleSignInBtn");
  const zoomBtn = document.getElementById("zoomSignInBtn");

  const suggestBtn = document.getElementById("suggestBtn");
  const deviceTestBtn = document.getElementById("deviceTestBtn");
  const bookBtn = document.getElementById("teleBookBtn");

  const modal = document.getElementById("teleSummaryModal");
  const summaryContent = document.getElementById("teleSummaryContent");
  const editBtn = document.getElementById("teleEditBtn");
  const cancelBtn = document.getElementById("teleCancelBtn");
  const confirmBtn = document.getElementById("teleConfirmBtn");

  const deviceModal = document.getElementById("deviceModal");
  const deviceCloseBtn = document.getElementById("deviceCloseBtn");
  const deviceRunBtn = document.getElementById("deviceRunBtn");
  const deviceChecklist = document.getElementById("deviceChecklist");

  const tzEl = document.getElementById("tz");
  const dateHint = document.getElementById("dateHint");
  const toastRegion = document.getElementById("toastRegion");

  const previewStage = document.getElementById("previewStage");
  const zoomIn = document.getElementById("zoomIn");
  const zoomOut = document.getElementById("zoomOut");
  const zoomReset = document.getElementById("zoomReset");

  const form = {
    date: document.getElementById("consultDate"),
    time: document.getElementById("consultTime"),
    name: document.getElementById("fullName"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    notes: document.getElementById("notes")
  };

  /* ========= Helpers ========= */
  const toast = (msg) => {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    toastRegion.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  };

  const openModal = (m) => { m.classList.add("is-open"); m.setAttribute("aria-hidden","false"); };
  const closeModal = (m) => { m.classList.remove("is-open"); m.setAttribute("aria-hidden","true"); };

  const updateSteps = (index /* 0..3 */) => {
    steps.forEach((s,i)=> s.classList.toggle("is-active", i===index));
    const pct = ((index+1)/4)*100;
    if (progress) progress.style.width = `${pct}%`;
  };

  // Zoomable preview (similar “zoom in/out” interaction like your laboratory page reference)
  let stageScale = 1;
  const clamp = (v,min,max)=> Math.max(min, Math.min(max, v));
  const setStageScale = (v) => {
    stageScale = clamp(v, 0.6, 1.4);
    previewStage.style.transform = `scale(${stageScale})`;
    zoomReset.textContent = `${Math.round(stageScale*100)}%`;
  };

  /* ========= Auth Guard =========
     – On click of Google/Zoom buttons: if user not signed in => redirect to login.html
     – If signed in => allow flow (you can later wire to actual provider linking / oauth flow) */
  const requireAuth = (onAuthed) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        window.location.href = "login.html";
      } else {
        onAuthed?.(user);
      }
    });
  };

  googleBtn.addEventListener("click", () => {
    requireAuth((user) => {
      toast(`Signed in as ${user.email}. Google will be linked on next step.`);
      updateSteps(1);
    });
  });

  zoomBtn.addEventListener("click", () => {
    requireAuth((user) => {
      toast(`Signed in as ${user.email}. Zoom connect placeholder.`);
      updateSteps(1);
    });
  });

  // Show auth status on page load (non-blocking)
  onAuthStateChanged(auth, (user) => {
    authStatus.textContent = user
      ? `Signed in as ${user.email}`
      : "You’re not signed in.";
  });

  /* ========= Timezone & Date Helpers ========= */
  try {
    tzEl.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";
  } catch { tzEl.textContent = "Local"; }

  // If today selected, hint if time has passed
  const validateDateHint = () => {
    const v = form.date.value;
    if(!v){ dateHint.textContent=""; return; }
    const todayStr = new Date().toISOString().slice(0,10);
    if (v === todayStr) {
      dateHint.textContent = "Booking for today — pick a time later than now.";
    } else {
      dateHint.textContent = "";
    }
  };
  form.date.addEventListener("change", validateDateHint);

  /* ========= Smart Time Suggestion =========
     – Picks next half-hour slot between 09:00–16:30 (local)
     – If outside window, suggests 09:00 next day
  */
  suggestBtn.addEventListener("click", () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const rounded = minutes <= 30 ? 30 : 60;
    now.setMinutes(rounded, 0, 0);

    const openH = 9, closeH = 16; // last slot 16:30
    let target = new Date(now);

    const withinWindow = target.getHours() > openH || (target.getHours() === openH && target.getMinutes() >= 0);
    const beforeOpen = target.getHours() < openH || (target.getHours() === openH && target.getMinutes() < 0);
    const afterClose = target.getHours() > closeH || (target.getHours() === closeH && target.getMinutes() > 30);

    let dateStr;
    if (beforeOpen) {
      target.setHours(openH, 0, 0, 0);
      dateStr = new Date().toISOString().slice(0,10);
    } else if (!withinWindow || afterClose) {
      // tomorrow 09:00
      const t = new Date();
      t.setDate(t.getDate()+1); t.setHours(openH,0,0,0);
      target = t;
      dateStr = t.toISOString().slice(0,10);
    } else {
      dateStr = new Date().toISOString().slice(0,10);
    }

    const hh = String(target.getHours()).padStart(2,"0");
    const mm = String(target.getMinutes()).padStart(2,"0");
    const slot = `${hh}:${mm}`;

    form.date.value = dateStr;
    form.time.value = slot;

    toast(`Suggested: ${dateStr} at ${slot}`);
    validateDateHint();
    updateSteps(1); // moved past Sign In section
  });

  /* ========= Booking Summary Modal ========= */
  const openSummary = () => {
    const data = {
      date: form.date.value || "—",
      time: form.time.value || "—",
      name: form.name.value || "—",
      email: form.email.value || "—",
      phone: form.phone.value || "—",
      notes: form.notes.value || "None"
    };

    const required = [form.date, form.time, form.name, form.email, form.phone];
    const missing = required.filter(i=>!i.value);
    if (missing.length){
      missing.forEach(i => i.classList.add("input--error"));
      toast("Please complete all required fields.");
      return;
    } else {
      required.forEach(i=> i.classList.remove("input--error"));
    }

    summaryContent.innerHTML = `
      <div class="summary-grid">
        <div><strong>Date:</strong> ${data.date}</div>
        <div><strong>Time:</strong> ${data.time}</div>
        <div><strong>Name:</strong> ${data.name}</div>
        <div><strong>Email:</strong> ${data.email}</div>
        <div><strong>Phone:</strong> ${data.phone}</div>
        <div><strong>Notes:</strong> ${data.notes}</div>
      </div>
      <p class="sub" style="margin-top:8px">You will be redirected to payment to secure your slot.</p>
    `;
    openModal(modal);
    updateSteps(2);
  };

  bookBtn.addEventListener("click", () => {
    // Ensure user is signed in before allowing payment summary
    requireAuth(() => openSummary());
  });

  editBtn.addEventListener("click", () => closeModal(modal));
  cancelBtn.addEventListener("click", () => closeModal(modal));
  confirmBtn.addEventListener("click", () => {
    closeModal(modal);
    updateSteps(3);
    toast("Redirecting to payment…");
    // Replace with your payment route
    window.location.href = "/pay";
  });

  /* ========= Device Check Modal ========= */
  deviceTestBtn.addEventListener("click", () => openModal(deviceModal));
  deviceCloseBtn.addEventListener("click", () => closeModal(deviceModal));

  deviceRunBtn.addEventListener("click", async () => {
    // Mic
    const setStatus = (key, text, ok) => {
      const el = deviceChecklist.querySelector(`.status[data-key="${key}"]`);
      if (!el) return;
      el.textContent = text;
      el.style.color = ok ? "#7cffad" : "#ff99ad";
    };

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus("mic","OK",true);
    } catch { setStatus("mic","Blocked",false); }

    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setStatus("cam","OK",true);
    } catch { setStatus("cam","Blocked",false); }

    // rudimentary network “ping” using image load
    const img = new Image();
    const start = performance.now();
    const done = () => {
      const ms = Math.round(performance.now() - start);
      const ok = ms < 800;
      setStatus("net", `${ms} ms`, ok);
    };
    img.onload = done; img.onerror = done;
    img.src = `data:image/gif;base64,R0lGODlhAQABAAAAACw=`; // tiny inline “ping”
    // Screen share support check
    const shareOK = !!navigator.mediaDevices?.getDisplayMedia;
    setStatus("share", shareOK ? "Available" : "Unavailable", shareOK);
  });

  /* ========= Stage Zoom Controls (like your laboratory zoom feature) ========= */
  zoomIn.addEventListener("click", () => setStageScale(stageScale + 0.1));
  zoomOut.addEventListener("click", () => setStageScale(stageScale - 0.1));
  zoomReset.addEventListener("click", () => setStageScale(1));

  // Initialize UI state
  setStageScale(1);
  updateSteps(0);

  // Accessibility: close modal on Escape
  document.addEventListener("keydown", (e)=>{
    if (e.key === "Escape") {
      [modal, deviceModal].forEach(m => m.classList.contains("is-open") && closeModal(m));
    }
  });
});
