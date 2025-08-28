document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.getElementById("chat-messages");

  // Futuristic typing bubble
  function showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.id = "typing-indicator";
    typingDiv.className = "flex items-start space-x-2 animate-fade-in";
    typingDiv.innerHTML = `
      <img src="/static/images/bot.jpg" class="w-8 h-8 rounded-full object-cover animate-avatar-pulse">
      <div class="typing-bubble flex space-x-1 px-4 py-2 rounded-2xl">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: "smooth" });
  }

  function removeTypingIndicator() {
    const typingDiv = document.getElementById("typing-indicator");
    if (typingDiv) typingDiv.remove();
  }

  // Typing effect for bot messages
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
    chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: "smooth" });

    let i = 0;
    function typingStep() {
      if (i < message.length) {
        textContainer.textContent += message.charAt(i);
        i++;
        chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: "smooth" });
        setTimeout(typingStep, 25); // typing speed (ms per char)
      } else {
        // Add timestamp when finished
        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const ts = document.createElement("div");
        ts.className = "text-[10px] text-gray-400 mt-1";
        ts.textContent = time;
        textContainer.parentElement.appendChild(ts);
      }
    }
    typingStep();
  }

  // Wrap addMessage so bot uses typing effect
  const originalAddMessage = window.addMessage;
  window.addMessage = function(message, isUser = false, save = true) {
    if (isUser) {
      originalAddMessage(message, true, save);

      // Add seen ticks ✅
      const lastMsg = chatMessages.querySelectorAll(".chat-msg[data-is-user='true']");
      if (lastMsg.length > 0) {
        const bubble = lastMsg[lastMsg.length - 1].querySelector(".bubble");
        if (bubble && !bubble.querySelector(".ticks")) {
          const ticks = document.createElement("span");
          ticks.className = "ticks ml-2 text-xs text-emerald-500";
          ticks.textContent = "✓✓";
          bubble.appendChild(ticks);
        }
      }
    } else {
      showTypingIndicator();
      setTimeout(() => {
        typeBotMessage(message);
      }, 700); // delay before typing starts
    }
  };
});
