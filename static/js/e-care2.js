/* ==========================================================================
   e-Care v2 — Voice Interaction Enhancements (No duplicate bot speech)
   Epiconsult Clinic & Diagnostics, Abuja
   --------------------------------------------------------------------------
   Features:
     • Text-to-Speech for new bot messages only
     • Real-time Speech Recognition input (microphone)
     • Auto-send after speech pause
     • Clear Chat memory + UI reset
     • Feedback loop prevention (bot voice ≠ mic input)
   Works seamlessly with e-care1.js
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // ---------- ELEMENTS ----------
  const micButton = document.getElementById("voice-toggle") || document.getElementById("mic-button");
  const micIcon = micButton?.querySelector("i");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-btn");
  const messagesContainer = document.getElementById("messages");
  const conversationRef = window.conversation || [];

  /* ==========================================================
     VOICE OUTPUT (Text-to-Speech)
  ========================================================== */
  let bestVoice = null;
  let isSpeaking = false;
  const spokenBubbles = new WeakSet();

  const selectBestAvailableVoice = () => {
    const voices = speechSynthesis.getVoices();
    const preferred = [
      "Google UK English Female",
      "Google US English",
      "Microsoft Aria Online",
      "Microsoft Jenny Online",
      "Microsoft Zira Desktop",
      "Samantha",
    ];

    bestVoice =
      voices.find((v) => preferred.some((n) => v.name.includes(n))) ||
      voices.find((v) => v.lang.startsWith("en") && /female/i.test(v.name)) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0] ||
      null;
  };
  speechSynthesis.onvoiceschanged = selectBestAvailableVoice;

  const cleanSpeechOutput = (text) =>
    (text || "").replace(/[\u231A-\uDFFF]/g, "").replace(/\s{2,}/g, " ").trim();

  const speakBotResponse = (text, bubble) => {
    if (!window.speechSynthesis) return;
    if (spokenBubbles.has(bubble)) return; // 🧠 prevent duplicates
    const clean = cleanSpeechOutput(text);
    if (!clean) return;

    const utter = new SpeechSynthesisUtterance(clean);
    utter.voice = bestVoice;
    utter.pitch = 1.05;
    utter.rate = 1.03;
    utter.volume = 1;

    utter.onstart = () => (isSpeaking = true);
    utter.onend = () => {
      isSpeaking = false;
      spokenBubbles.add(bubble); // ✅ mark as spoken once fully done
    };

    try {
      speechSynthesis.cancel();
      speechSynthesis.speak(utter);
    } catch (err) {
      console.warn("TTS playback failed:", err);
    }
  };
  window.speakBotResponse = speakBotResponse;

  /* ==========================================================
     OBSERVE BOT MESSAGES (speak only once)
  ========================================================== */
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const bubble = mutation.target.closest(".bot-msg");
      if (!bubble || spokenBubbles.has(bubble)) continue;

      // Ensure it’s a bot message with a bot avatar in same row
      const row = bubble.closest(".chat-row.bot");
      if (!row || !row.querySelector("img[src*='bot']")) continue;

      // If text is final (no typing dots)
      const text = bubble.textContent.trim();
      if (text && !bubble.querySelector(".typing-dots")) {
        // delay slightly to ensure final chunk done
        clearTimeout(bubble._speakTimer);
        bubble._speakTimer = setTimeout(() => speakBotResponse(text, bubble), 500);
      }
    }
  });

  if (messagesContainer) {
    observer.observe(messagesContainer, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  /* ==========================================================
     SPEECH RECOGNITION (User → Bot)
  ========================================================== */
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let listening = false;
  let idleTimer = null;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      listening = true;
      micButton?.classList.add("recording");
      micIcon?.classList.add("text-red-500");
    };

    recognition.onend = () => {
      listening = false;
      micButton?.classList.remove("recording");
      micIcon?.classList.remove("text-red-500");
      const msg = userInput.value.trim();
      if (msg) sendButton.click();
    };

    recognition.onerror = (err) => {
      console.warn("🎙️ Speech Recognition Error:", err.error || err);
      listening = false;
      micButton?.classList.remove("recording");
      micIcon?.classList.remove("text-red-500");
    };

    recognition.onresult = (e) => {
      if (isSpeaking) return; // avoid bot feedback
      const transcript = [...e.results].map((r) => r[0].transcript).join(" ").trim();
      if (!transcript) return;

      userInput.value = transcript;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => recognition.stop(), 1000);
    };
  }

  const requestMicAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch {
      alert("⚠️ Please allow microphone access to use voice input.");
      return false;
    }
  };

  const toggleMic = async () => {
    if (!recognition) return alert("⚠️ Voice input not supported in this browser.");
    if (!listening) {
      const ok = await requestMicAccess();
      if (ok) recognition.start();
    } else {
      recognition.stop();
    }
  };

  micButton?.addEventListener("click", toggleMic);
  micIcon?.addEventListener("click", toggleMic);

  /* ==========================================================
     CLEAR CHAT BUTTON
  ========================================================== */
  const setupClearChat = () => {
    let btn = document.getElementById("clear-chat");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "clear-chat";
      btn.textContent = "Clear Chat";
      btn.className =
        "absolute bottom-3 right-3 px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm shadow-md hidden";
      messagesContainer.parentElement.style.position = "relative";
      messagesContainer.parentElement.appendChild(btn);
    }

    const updateVisibility = () => {
      const count = messagesContainer.querySelectorAll(".chat-row").length;
      btn.classList.toggle("hidden", count <= 1);
    };

    const clearObserver = new MutationObserver(updateVisibility);
    clearObserver.observe(messagesContainer, { childList: true });
    updateVisibility();

    btn.addEventListener("click", () => {
      if (confirm("Clear this chat history?")) {
        messagesContainer.innerHTML = "";
        localStorage.removeItem("ecare_threads");
        conversationRef.length = 0;
        btn.classList.add("hidden");
        if (typeof window.showWelcome === "function") {
          window.showWelcome();
        }
      }
    });
  };
  setupClearChat();
});
