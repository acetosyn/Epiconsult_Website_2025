document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.getElementById("chat-messages");

  function showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.id = "typing-indicator";
    typingDiv.className = "flex items-start space-x-2";
    typingDiv.innerHTML = `
      <img src="/static/images/bot.jpg" class="w-8 h-8 rounded-full object-cover">
      <div class="bg-gray-100 text-gray-800 p-3 rounded-lg max-w-xs text-sm flex space-x-1">
        <span class="dot dot1"></span>
        <span class="dot dot2"></span>
        <span class="dot dot3"></span>
      </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTypingIndicator() {
    const typingDiv = document.getElementById("typing-indicator");
    if (typingDiv) typingDiv.remove();
  }

  function typeBotMessage(message) {
    removeTypingIndicator();

    const msgDiv = document.createElement("div");
    msgDiv.className = "flex items-start space-x-2";
    msgDiv.innerHTML = `
      <img src="/static/images/bot.jpg" class="w-8 h-8 rounded-full object-cover">
      <div class="bg-gray-100 text-gray-800 p-3 rounded-lg max-w-xs text-sm"></div>
    `;

    const textContainer = msgDiv.querySelector("div.bg-gray-100");
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    let i = 0;
    function typingStep() {
      if (i < message.length) {
        textContainer.textContent += message.charAt(i);
        i++;
        chatMessages.scrollTop = chatMessages.scrollHeight;
        setTimeout(typingStep, 30);
      }
    }
    typingStep();
  }

  // 🔹 Instead of overriding, intercept bot replies
  const originalAddMessage = window.addMessage;
  window.addMessage = function(message, isUser = false, save = true) {
    if (isUser) {
      originalAddMessage(message, true, save);
    } else {
      showTypingIndicator();
      setTimeout(() => {
        removeTypingIndicator();
        typeBotMessage(message);
      }, 600);
    }
  };
});
