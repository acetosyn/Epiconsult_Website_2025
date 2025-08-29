document.addEventListener("DOMContentLoaded", () => {
  const chatbotBtn = document.getElementById("chatbot-toggle");

  // Ripple effect on click
  chatbotBtn.addEventListener("click", function (e) {
    let ripple = document.createElement("span");
    ripple.classList.add("ripple");
    this.appendChild(ripple);

    let rect = this.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;

    setTimeout(() => ripple.remove(), 600);
  });

  // Parallax tilt on hover
  chatbotBtn.addEventListener("mousemove", (e) => {
    const rect = chatbotBtn.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    chatbotBtn.style.transform = `scale(1.15) rotateX(${y * 10}deg) rotateY(${x * 10}deg)`;
  });

  chatbotBtn.addEventListener("mouseleave", () => {
    chatbotBtn.style.transform = "scale(1)";
  });
});
