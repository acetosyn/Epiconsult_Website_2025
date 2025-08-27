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

  let isMaximized = false;
  let isVisible = false;
  let chatHistory = JSON.parse(localStorage.getItem("epiconsult_chat_history") || "[]");

  // Toggle show/hide
  function toggleChat() {
    if (isVisible) {
      chatPanel.classList.add("hidden");
      isVisible = false;
    } else {
      chatPanel.classList.remove("hidden");
      chatPanel.classList.add("show", "dance");
      setTimeout(() => chatPanel.classList.remove("dance"), 800);
      isVisible = true;
    }
  }

  // Close completely
  function closeChat() {
    chatPanel.classList.add("hidden");
    isVisible = false;
  }

  // Minimize to default
function minimizeChat() {
  chatPanel.classList.remove("w-full", "h-screen", "top-0", "left-0", "right-0", "bottom-0");
  chatPanel.classList.add("w-[28rem]", "h-[34rem]", "bottom-24", "right-6");
  isMaximized = false;
}

// Maximize like ChatGPT
function maximizeChat() {
  chatPanel.classList.remove("w-[28rem]", "h-[34rem]", "bottom-24", "right-6");
  chatPanel.classList.add("w-full", "h-screen", "top-0", "left-0", "right-0", "bottom-0");
  isMaximized = true;
}


  // 🔹 Expose addMessage globally so chat2.js can hook
  window.addMessage = function(message, isUser = false) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `flex items-start space-x-2 ${isUser ? "justify-end" : ""}`;

    if (isUser) {
      msgDiv.innerHTML = `
        <div class="flex items-start space-x-2">
          <div class="bg-red-600 text-white p-3 rounded-lg max-w-xs text-sm">${message}</div>
          <img src="/static/images/user.jpg" class="w-8 h-8 rounded-full object-cover">
        </div>`;
    } else {
      msgDiv.innerHTML = `
        <div class="flex items-start space-x-2">
          <img src="/static/images/bot.jpg" class="w-8 h-8 rounded-full object-cover">
          <div class="bg-gray-100 text-gray-800 p-3 rounded-lg max-w-xs text-sm">${message}</div>
        </div>`;
    }

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    chatHistory.push({ message, isUser, timestamp: new Date().toISOString() });
    localStorage.setItem("epiconsult_chat_history", JSON.stringify(chatHistory));
  };

  // Send
  function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    window.addMessage(message, true);
    chatInput.value = "";

    setTimeout(() => {
      const response = getBotResponse(message);
      window.addMessage(response, false);
    }, 800);
  }

  // Dummy bot
  function getBotResponse(msg) {
    msg = msg.toLowerCase();
    if (msg.includes("appointment")) return "I can help you schedule an appointment.";
    if (msg.includes("teleconsultation")) return "Our teleconsultation is available 24/7.";
    return "Thank you for reaching out! How else can I assist you?";
  }

  // Events
  chatToggle.addEventListener("click", toggleChat);
  chatClose.addEventListener("click", closeChat);
  chatMin.addEventListener("click", minimizeChat);
  chatMax.addEventListener("click", () => isMaximized ? minimizeChat() : maximizeChat());
  chatSend.addEventListener("click", sendMessage);
  chatInput.addEventListener("keypress", e => e.key === "Enter" && sendMessage());
  quickBtns.forEach(btn => btn.addEventListener("click", () => window.addMessage(btn.textContent, true)));
  chatVoice.addEventListener("click", () => alert("🎤 Voice input coming soon..."));
});
