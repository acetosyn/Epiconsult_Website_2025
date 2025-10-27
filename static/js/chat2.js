// ================== e-Care Pop-Up Assistant Typing Engine (chat2.js) ==================
document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.getElementById("chat-messages");

  // --- Typing Indicator ---
  function showTypingIndicator() {
    removeTypingIndicator();
    const typingDiv = document.createElement("div");
    typingDiv.id = "typing-indicator";
    typingDiv.className = "flex items-start space-x-2 animate-fade-in";
    typingDiv.innerHTML = `
      <img src="/static/images/bot.jpg" class="w-8 h-8 rounded-full object-cover animate-avatar-pulse">
      <div class="typing-bubble flex space-x-1 px-4 py-2 rounded-2xl">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>`;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTypingIndicator() {
    const el = document.getElementById("typing-indicator");
    if (el) el.remove();
  }

  // --- Smooth Bot Typing Reveal ---
  function typeBotMessage(message) {
    removeTypingIndicator();

    const msgDiv = document.createElement("div");
    msgDiv.className = "chat-msg flex items-start space-x-2 mb-2 animate-slide-in";
    msgDiv.dataset.chatMessage = "1";
    msgDiv.dataset.isUser = "false";
    msgDiv.innerHTML = `
      <img src="/static/images/bot.jpg" class="w-8 h-8 rounded-full object-cover animate-avatar-pulse">
      <div class="bot-bubble bg-gradient-to-r from-indigo-50 to-purple-50 text-gray-800 px-4 py-2 rounded-2xl max-w-xs text-sm shadow"></div>
    `;

    const textContainer = msgDiv.querySelector(".bot-bubble");
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    let i = 0;
    const step = () => {
      if (i < message.length) {
        textContainer.textContent += message[i++];
        chatMessages.scrollTop = chatMessages.scrollHeight;
        setTimeout(step, 25);
      } else {
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const ts = document.createElement("div");
        ts.className = "text-[10px] text-gray-400 mt-1";
        ts.textContent = time;
        textContainer.parentElement.appendChild(ts);
      }
    };
    step();
  }

  // --- Intercept Message Rendering ---
  const originalAdd = window.addMessage;
  window.addMessage = function(message, isUser = false, save = true) {
    if (isUser) {
      originalAdd(message, true, save);
    } else {
      showTypingIndicator();
      setTimeout(() => typeBotMessage(message), 600);
    }
  };

  // Trigger from chat.js when sendMessage is called
  chatMessages.addEventListener("chat-start-typing", () => showTypingIndicator());
});
