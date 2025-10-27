// ================== e-Care Pop-Up Assistant (chat.js) ==================
document.addEventListener("DOMContentLoaded", () => {
  const chatToggle = document.getElementById("chatbot-toggle");
  const chatPanel = document.getElementById("chatbot-panel");
  const chatClose = document.getElementById("chatbot-close");
  const chatMin = document.getElementById("chatbot-minimize");
  const chatMax = document.getElementById("chatbot-maximize");
  const chatInput = document.getElementById("chat-input");
  const chatSend = document.getElementById("chat-send");
  const chatVoice = document.getElementById("chat-voice");
  const chatMessages = document.getElementById("chat-messages");
  const quickBtns = document.querySelectorAll(".chat-quick-btn");
  const chatInputBar = document.getElementById("chat-input-bar");

  // ✅ Conversation memory (shared with chat2.js)
  window.__chatConversation = window.__chatConversation || [];

  let isMaximized = false;
  let isVisible = false;

  // ================== UI CONTROLS ==================
  function getTheme() {
    return window.__chatTheme || localStorage.getItem("epiconsult_theme") || "light";
  }

  function toggleChat() {
    chatPanel.classList.toggle("hidden");
    if (!chatPanel.classList.contains("hidden")) {
      chatPanel.classList.add("show", "dance");
      setTimeout(() => chatPanel.classList.remove("dance"), 600);
      isVisible = true;
    } else {
      isVisible = false;
    }
  }

  function closeChat() {
    chatPanel.classList.add("hidden");
    isVisible = false;
  }

  function minimizeChat() {
    chatPanel.classList.remove("w-full", "h-screen", "top-0", "left-0");
    chatPanel.classList.add("w-[28rem]", "h-[34rem]", "bottom-24", "right-6");
    isMaximized = false;
  }

  function maximizeChat() {
    chatPanel.classList.remove("w-[28rem]", "h-[34rem]", "bottom-24", "right-6");
    chatPanel.classList.add("w-full", "h-screen", "top-0", "left-0");
    isMaximized = true;
  }

  function bubbleClasses(isUser, theme) {
    if (isUser) {
      return theme === "dark"
        ? "bg-emerald-600/90 text-white px-4 py-2 rounded-2xl max-w-xs text-sm shadow border border-emerald-400/20"
        : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-2xl max-w-xs text-sm shadow";
    }
    return theme === "dark"
      ? "bg-zinc-800 text-zinc-100 px-4 py-2 rounded-2xl max-w-xs text-sm shadow border border-white/10"
      : "bg-gradient-to-r from-indigo-50 to-purple-50 text-gray-800 px-4 py-2 rounded-2xl max-w-xs text-sm shadow";
  }

  // ================== MESSAGE RENDERING ==================
  function addMessage(message, isUser = false, save = true) {
    const theme = getTheme();
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-msg flex items-start space-x-2 mb-2 ${isUser ? "justify-end" : ""} animate-slide-in`;
    msgDiv.dataset.chatMessage = "1";
    msgDiv.dataset.isUser = String(isUser);

    if (isUser) {
      msgDiv.innerHTML = `
        <div class="flex items-center space-x-2">
          <div class="bubble ${bubbleClasses(true, theme)}">${message}</div>
          <img src="/static/images/user.jpg" class="w-8 h-8 rounded-full object-cover">
        </div>`;
    } else {
      msgDiv.innerHTML = `
        <div class="flex items-center space-x-2">
          <img src="/static/images/bot.jpg" class="w-8 h-8 rounded-full object-cover">
          <div class="bubble ${bubbleClasses(false, theme)}">${message}</div>
        </div>`;
    }

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // 🔊 Bot TTS (optional, if enabled globally)
    if (!isUser && window.ttsSpeak) window.ttsSpeak(message);

    // Notify chat2.js to animate typing
    const evt = new CustomEvent("chat-message-added", { detail: { message, isUser, save } });
    chatMessages.dispatchEvent(evt);
  }
  window.addMessage = addMessage;

  // ================== STREAMING SEND ==================
  async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    window.__chatConversation.push({ role: "user", content: message });
    chatInput.value = "";

    // 👉 Show typing bubble (chat2.js will handle display/transition)
    chatMessages.dispatchEvent(new CustomEvent("chat-start-typing"));

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          conversation: window.__chatConversation,
        }),
      });

      if (!response.ok) throw new Error("Chat request failed.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullReply = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullReply += decoder.decode(value, { stream: true });
      }

      window.__chatConversation.push({ role: "assistant", content: fullReply });
      window.addMessage(fullReply, false);

    } catch (err) {
      window.addMessage("⚠ Sorry, I couldn’t process that. Please try again.", false);
      console.error("CHAT STREAM ERROR:", err);
    }
  }

  // ================== EVENTS ==================
  if (chatToggle) chatToggle.addEventListener("click", toggleChat);
  if (chatClose) chatClose.addEventListener("click", closeChat);
  if (chatMin) chatMin.addEventListener("click", minimizeChat);
  if (chatMax) chatMax.addEventListener("click", () => (isMaximized ? minimizeChat() : maximizeChat()));
  if (chatSend) chatSend.addEventListener("click", sendMessage);
  if (chatInput) chatInput.addEventListener("keypress", (e) => e.key === "Enter" && sendMessage());

  quickBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      chatInput.value = btn.dataset.message;
      sendMessage();
    })
  );

  if (chatVoice) {
    chatVoice.addEventListener("click", () => {
      if (window.ttsReadChat) {
        const history = window.__chatConversation.slice();
        window.ttsReadChat(history);
      }
    });
  }
});
