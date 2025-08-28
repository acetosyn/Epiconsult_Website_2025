document.addEventListener("DOMContentLoaded", () => {
  let synth = window.speechSynthesis;
  let firstClick = true;

  // Speak single message
  window.ttsSpeak = function (text) {
    if (!text || !synth) return;
    synth.cancel();
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1; // normal speed
    utterance.pitch = 1;
    synth.speak(utterance);
  };

  // Read summary + latest
  window.ttsReadChat = function (chatHistory) {
    if (!synth) return;
    synth.cancel();

    let textToRead = "";

    if (firstClick) {
      textToRead = "👋 Welcome to Epiconsult. How can I assist you today?";
      firstClick = false;
    } else {
      if (chatHistory.length > 0) {
        // Last bot message
        let lastBotMsg = [...chatHistory].reverse().find(item => !item.isUser);
        if (lastBotMsg) {
          textToRead = "Here’s the latest reply: " + lastBotMsg.message;
        } else {
          textToRead = "No messages from me yet.";
        }
      } else {
        textToRead = "The chat is currently empty.";
      }
    }

    window.ttsSpeak(textToRead);
  };
});
