document.addEventListener("DOMContentLoaded", () => {
  const chatMessages = document.getElementById("chat-messages");

  // Show typing indicator
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

  // Remove typing indicator
  function removeTypingIndicator() {
    const typingDiv = document.getElementById("typing-indicator");
    if (typingDiv) typingDiv.remove();
  }

  // Simulate bot typing
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
        setTimeout(typingStep, 30); // typing speed
      }
    }
    typingStep();
  }

  // 🔹 Hook into global addMessage for bot replies
  const originalAddMessage = window.addMessage;
  window.addMessage = function(message, isUser = false) {
    if (isUser) {
      originalAddMessage(message, true);
    } else {
      showTypingIndicator();
      setTimeout(() => {
        typeBotMessage(message);
      }, 1000); // delay before typing starts
    }
  };
});



