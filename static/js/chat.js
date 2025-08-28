// chat.js
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

  let isMaximized = false;
  let isVisible = false;

  // Read theme (used for bubble styling)
  function getTheme() {
    return window.__chatTheme || localStorage.getItem("epiconsult_theme") || "light";
  }

  // Toggle panel
  function toggleChat() {
    if (isVisible) {
      chatPanel.classList.add("hidden");
      isVisible = false;
    } else {
      chatPanel.classList.remove("hidden");
      chatPanel.classList.add("show", "dance");
      setTimeout(() => chatPanel.classList.remove("dance"), 600);
      isVisible = true;
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

  // Compute bubble classes based on theme
  function bubbleClasses(isUser, theme) {
    if (isUser) {
      return theme === "dark"
        ? "bg-emerald-600/90 text-white px-4 py-2 rounded-2xl max-w-xs text-sm shadow border border-emerald-400/20"
        : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-2xl max-w-xs text-sm shadow";
    }
    // bot
    return theme === "dark"
      ? "bg-zinc-800 text-zinc-100 px-4 py-2 rounded-2xl max-w-xs text-sm shadow border border-white/10"
      : "bg-gradient-to-r from-indigo-50 to-purple-50 text-gray-800 px-4 py-2 rounded-2xl max-w-xs text-sm shadow";
  }

  // Add message (no localStorage writes here; chat-extras.js handles persistence)
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

    // 🔊 Speak bot messages via TTS (if available)
    if (!isUser && window.ttsSpeak) {
      window.ttsSpeak(message);
    }

    // Let listeners know a message was added
    const evt = new CustomEvent("chat-message-added", { detail: { message, isUser, save } });
    chatMessages.dispatchEvent(evt);
  }
  window.addMessage = addMessage;

  // Send message
  function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    addMessage(message, true);
    chatInput.value = "";
    chatInputBar.classList.remove("translate-y-0");
    chatInputBar.classList.add("translate-y-2");

    setTimeout(() => {
      const response = getBotResponse(message);
      addMessage(response, false);
    }, 800);
  }

  function getBotResponse(msg) {
    msg = msg.toLowerCase();
    if (msg.includes("appointment")) return "I can help you schedule an appointment.";
    if (msg.includes("teleconsultation")) return "Our teleconsultation is available 24/7.";
    return "Thank you for reaching out! How else can I assist you?";
  }

  // Events
  if (chatToggle) chatToggle.addEventListener("click", toggleChat);
  if (chatClose) chatClose.addEventListener("click", closeChat);
  if (chatMin) chatMin.addEventListener("click", minimizeChat);
  if (chatMax) chatMax.addEventListener("click", () => (isMaximized ? minimizeChat() : maximizeChat()));
  if (chatSend) chatSend.addEventListener("click", sendMessage);
  if (chatInput) chatInput.addEventListener("keypress", (e) => e.key === "Enter" && sendMessage());

  // Quick buttons insert user message (kept as-is)
  quickBtns.forEach((btn) =>
    btn.addEventListener("click", () => addMessage(btn.dataset.message, true))
  );

  // 🔊 Voice button triggers TTS with current history (provided by chat-extras.js)
  if (chatVoice) {
    chatVoice.addEventListener("click", () => {
      if (window.ttsReadChat) {
        const history = window.getChatHistory ? window.getChatHistory() : [];
        window.ttsReadChat(history);
      }
    });
  }
});
