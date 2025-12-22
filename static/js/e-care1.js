/* ==========================================================================
   e-Care v2 — Smart Multi-Conversation Engine
   ChatGPT-style Sidebar + Typing Animation + Persistent History
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // ---------- DOM ELEMENTS ----------
  const userInput         = document.getElementById("user-input");
  const sendButton        = document.getElementById("send-btn");
  const messagesContainer = document.getElementById("messages");
  const chatWindow        = document.getElementById("chat-window");
  const newChatButton     = document.getElementById("new-chat-btn");
  const quickBar          = document.querySelector(".quick-bar");
  const conversationList  = document.getElementById("conversation-list");

  if (!userInput || !sendButton || !messagesContainer || !chatWindow) {
    console.warn("❗ e-Care init aborted — missing key DOM nodes");
    return;
  }

  // ---------- STATE ----------
  let threads = [];
  let activeThreadId = null;

  try {
    threads = JSON.parse(localStorage.getItem("ecare_threads")) || [];
  } catch {
    threads = [];
  }

  const saveThreads = () => {
    localStorage.setItem("ecare_threads", JSON.stringify(threads));
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: "smooth" });
    });
  };

  // ---------- RENDER HELPERS ----------
  const renderUserMessage = (text) => {
    const row = document.createElement("div");
    row.className = "chat-row user";
    row.innerHTML = `<div class="user-msg">${text}</div>`;
    messagesContainer.appendChild(row);
    scrollToBottom();
  };

  const createBotBubble = (text = "") => {
    const row = document.createElement("div");
    row.className = "chat-row bot";
    row.innerHTML = `
      <img src="/static/images/bot.jpg" class="chat-avatar" alt="bot">
      <div class="bot-msg">${text}</div>`;
    messagesContainer.appendChild(row);
    scrollToBottom();
    return row.querySelector(".bot-msg");
  };

  const createTyping = () => {
    const row = document.createElement("div");
    row.className = "chat-row bot";
    row.innerHTML = `
      <img src="/static/images/bot.jpg" class="chat-avatar" alt="bot">
      <div class="bot-msg">
        <span class="typing-dots">
          <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        </span>
      </div>`;
    messagesContainer.appendChild(row);
    scrollToBottom();
    return row.querySelector(".bot-msg");
  };

  const smartType = async (element, text) => {
    for (const ch of text) {
      element.textContent += ch;
      await new Promise((r) => setTimeout(r, ",.!?".includes(ch) ? 110 : 14));
      scrollToBottom();
    }
  };

const showWelcome = () => {
  // Avoid duplicates
  if (messagesContainer.querySelector(".bot-msg[data-initial='true']")) return;

  const row = document.createElement("div");
  row.className = "chat-row bot";
  const avatar = document.createElement("img");
  avatar.src = "/static/images/bot.jpg";
  avatar.className = "chat-avatar";

  const bubble = document.createElement("div");
  bubble.className = "bot-msg";
  bubble.dataset.initial = "true";
 bubble.innerHTML = "👋 Hi there! I’m <b>e-Care</b>, your personal health companion from Epiconsult. How can I support your wellbeing today?";


  row.appendChild(avatar);
  row.appendChild(bubble);
  messagesContainer.appendChild(row);
  scrollToBottom();
};

  // ---------- SIDEBAR ----------
  const renderThreadList = () => {
    conversationList
      .querySelectorAll(".history-thread, .history-separator")
      .forEach((el) => el.remove());

    // separator line
    const separator = document.createElement("div");
    separator.className = "history-separator";
    separator.style.cssText =
      "border-top:1px solid rgba(255,255,255,0.25); margin:6px 0;";
    conversationList.appendChild(separator);

    threads.forEach((t) => {
      const li = document.createElement("li");
      li.className = "history-thread flex justify-between items-center";

      const btn = document.createElement("button");
      btn.className = "conv-btn flex-1 truncate";
      btn.textContent = t.title;
      if (t.id === activeThreadId) btn.classList.add("active-thread");
      btn.onclick = () => loadThread(t.id);

      const actions = document.createElement("div");
      actions.className = "thread-actions ml-2 flex gap-1";

      const edit = document.createElement("span");
      edit.textContent = "✏️";
      edit.title = "Rename";
      edit.style.cursor = "pointer";
      edit.onclick = (e) => {
        e.stopPropagation();
        const newName = prompt("Rename Conversation:", t.title);
        if (newName && newName.trim() !== "") {
          t.title = newName.trim();
          saveThreads();
          renderThreadList();
        }
      };

      const del = document.createElement("span");
      del.textContent = "🗑";
      del.title = "Delete";
      del.style.cursor = "pointer";
      del.onclick = (e) => {
        e.stopPropagation();
        threads = threads.filter((x) => x.id !== t.id);
        if (activeThreadId === t.id) activeThreadId = null;
        saveThreads();
        renderThreadList();
        showWelcome();
      };

      actions.append(edit, del);
      li.append(btn, actions);
      conversationList.appendChild(li);
    });
  };

  const updateTitleFromFirstMessage = (text) => {
    const t = threads.find((x) => x.id === activeThreadId);
    if (!t || t.title !== "New Chat") return;
    const name = text.split(" ").slice(0, 6).join(" ");
    t.title = name.charAt(0).toUpperCase() + name.slice(1);
    saveThreads();
    renderThreadList();
  };

  // ---------- THREADS ----------
  const newThread = () => {
    const id = "C" + Date.now();
    threads.push({ id, title: "New Chat", messages: [] });
    activeThreadId = id;
    saveThreads();
    renderThreadList();
    messagesContainer.innerHTML = "";
    showWelcome();
  };

  const loadThread = (id) => {
    activeThreadId = id;
    const thread = threads.find((x) => x.id === id);
    messagesContainer.innerHTML = "";
    if (!thread || !thread.messages.length) return showWelcome();

    thread.messages.forEach((m) =>
      m.role === "user"
        ? renderUserMessage(m.content)
        : createBotBubble(m.content)
    );
    renderThreadList();
    scrollToBottom();
  };

  // ---------- SEND MESSAGE ----------
  const sendMessage = async (textOverride) => {
    const text = textOverride || userInput.value.trim();
    if (!text) return;

    if (!activeThreadId) newThread();
    const t = threads.find((x) => x.id === activeThreadId);
    if (!t) return;

    userInput.value = "";
    renderUserMessage(text);
    t.messages.push({ role: "user", content: text });
    updateTitleFromFirstMessage(text);
    saveThreads();

    const typing = createTyping();
    let response = "";

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok || !res.body) throw new Error("Stream error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let started = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        if (!started) {
          typing.textContent = "";
          started = true;
        }
        await smartType(typing, chunk);
        response += chunk;
      }
    } catch (err) {
      console.error("Chat stream error:", err);
      typing.innerHTML = "⚠️ Connection issue. Please try again.";
    }

    t.messages.push({ role: "assistant", content: response });
    saveThreads();
  };

  // ---------- EVENTS ----------
  sendButton.onclick = () => sendMessage();
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  if (quickBar) {
    quickBar.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (chip) sendMessage(chip.textContent);
    });
  }

  newChatButton.onclick = newThread;

  // ---------- INIT ----------
  renderThreadList();
  showWelcome();
});
