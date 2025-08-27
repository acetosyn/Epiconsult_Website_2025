// chat-extras.js
// Load this AFTER chat.js and chat2.js

document.addEventListener("DOMContentLoaded", () => {
  const chatPanel = document.getElementById("chatbot-panel");
  const chatMessages = document.getElementById("chat-messages");
  const btnLight = document.getElementById("chat-light");
  const btnDark  = document.getElementById("chat-dark");
  const btnClear = document.getElementById("chat-clear");

  // ============ HISTORY ============

  const STORAGE_KEY = "epiconsult_chat_history";
  const THEME_KEY = "epiconsult_theme";
  const RESTORE_ON_LOAD = false; // default OFF per your preference: "on reload those history should have cleared"

  function loadHistoryRaw() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function dedupeHistory(items) {
    const seen = new Set();
    const out = [];
    for (const it of items) {
      const key = `${it.isUser ? 1 : 0}|${it.message}`; // ignore timestamp to collapse duplicates
      if (!seen.has(key)) {
        seen.add(key);
        out.push(it);
      }
    }
    return out;
  }

  let chatHistory = dedupeHistory(loadHistoryRaw());
  // Normalize + cap (just in case)
  if (chatHistory.length > 200) {
    chatHistory = chatHistory.slice(-200);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));

  // Expose getter for TTS
  window.getChatHistory = () => [...chatHistory];

  // Render history (optional)
  if (RESTORE_ON_LOAD) {
    // Render without re-saving
    chatHistory.forEach((item) => {
      if (window.addMessage) window.addMessage(item.message, item.isUser, false);
    });
  } else {
    // Do nothing: visual history starts clean on reload
  }

  function saveHistory() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
  }

  // Wrap the final addMessage (with typing effect) to persist history exactly once
  if (window.addMessage) {
    const baseAddMessage = window.addMessage;
    window.addMessage = function(message, isUser = false, save = true) {
      // Save first (so TTS can use it immediately)
      if (save) {
        chatHistory.push({ message, isUser, timestamp: new Date().toISOString() });
        // dedupe on the fly (only last occurrence kept)
        chatHistory = dedupeHistory(chatHistory).slice(-200);
        saveHistory();
      }
      return baseAddMessage(message, isUser, save);
    };
  }

  // Clear history: remove from storage + remove all dynamic message nodes
  function clearHistoryUIOnly() {
    // Keep everything up to the clear-section; remove all nodes after it
    const clearSection = btnClear ? btnClear.closest(".mt-3") : null;
    if (!clearSection || !chatMessages) return;

    while (clearSection.nextSibling) {
      clearSection.nextSibling.remove();
    }
  }

  if (btnClear) {
    btnClear.addEventListener("click", () => {
      if (!confirm("Clear chat history? This cannot be undone.")) return;
      chatHistory = [];
      localStorage.removeItem(STORAGE_KEY);
      clearHistoryUIOnly();
    });
  }

  // ============ THEME ============

  function applyTheme(theme) {
    // store + expose
    localStorage.setItem(THEME_KEY, theme);
    window.__chatTheme = theme;

    // Panel base
    if (chatPanel) {
      chatPanel.classList.remove("dark-panel", "light-panel");
      chatPanel.classList.add(theme === "dark" ? "dark-panel" : "light-panel");
    }

    // Restyle all existing bubbles to current theme
    if (chatMessages) {
      chatMessages.querySelectorAll('[data-chat-message="1"]').forEach((row) => {
        const isUser = row.dataset.isUser === "true";
        const bubble = row.querySelector(".bubble");
        if (!bubble) return;

        // Remove previous bubble palette
        bubble.classList.remove(
          "bg-gradient-to-r", "from-emerald-500", "to-teal-600", "text-white",
          "bg-emerald-600/90", "border-emerald-400/20",
          "bg-gradient-to-r", "from-indigo-50", "to-purple-50", "text-gray-800",
          "bg-zinc-800", "text-zinc-100", "border", "border-white/10"
        );

        if (isUser) {
          if (theme === "dark") {
            bubble.className = `bubble bg-emerald-600/90 text-white px-4 py-2 rounded-2xl max-w-xs text-sm shadow border border-emerald-400/20`;
          } else {
            bubble.className = `bubble bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-2xl max-w-xs text-sm shadow`;
          }
        } else {
          if (theme === "dark") {
            bubble.className = `bubble bg-zinc-800 text-zinc-100 px-4 py-2 rounded-2xl max-w-xs text-sm shadow border border-white/10`;
          } else {
            bubble.className = `bubble bg-gradient-to-r from-indigo-50 to-purple-50 text-gray-800 px-4 py-2 rounded-2xl max-w-xs text-sm shadow`;
          }
        }
      });
    }
  }

  // Initialize theme
  const storedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const startTheme = storedTheme || (prefersDark ? "dark" : "light");
  applyTheme(startTheme);

  if (btnLight) btnLight.addEventListener("click", () => applyTheme("light"));
  if (btnDark)  btnDark.addEventListener("click",  () => applyTheme("dark"));
});
