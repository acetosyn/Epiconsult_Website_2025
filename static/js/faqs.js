document.addEventListener("DOMContentLoaded", async () => {
  const faqContainer = document.querySelector(".faq-container");

  try {
    const response = await fetch("/faqs");
    if (!response.ok) throw new Error("Failed to fetch FAQs.");
    const faqs = await response.json();
    renderFaqs(faqs);
  } catch (error) {
    console.error("Error loading FAQs:", error);
    const fallbackFaqs = [
      { question: "What is sickle cell disease?", answer: "A group of inherited red blood cell disorders that cause cells to become rigid and sickle-shaped." },
      { question: "What days are consultations available?", answer: "Wednesdays and Saturdays from 10AM – 5PM." },
      { question: "How can I prevent a crisis?", answer: "Stay hydrated, avoid extreme temperatures, manage stress, and follow prescribed medication." },
    ];
    renderFaqs(fallbackFaqs);
  }

  function renderFaqs(faqs) {
    faqs.forEach(faq => {
      const faqItem = document.createElement("div");
      faqItem.className = "faq-item border rounded-lg p-4 cursor-pointer bg-white shadow-sm transition hover:shadow-md";

      const header = document.createElement("div");
      header.className = "flex justify-between items-center";
      const question = document.createElement("h4");
      question.className = "font-semibold text-navy";
      question.textContent = faq.question;
      const toggleIcon = document.createElement("span");
      toggleIcon.className = "toggle-icon text-red-600 font-bold text-2xl transition-transform duration-300";
      toggleIcon.textContent = "+";
      header.appendChild(question);
      header.appendChild(toggleIcon);

      const answer = document.createElement("div");
      answer.className = "faq-answer max-h-0 overflow-hidden transition-all duration-500 ease-in-out";
      answer.innerHTML = `<p class="mt-3 text-gray-600 transform transition-transform duration-300">${faq.answer}</p>`;

      faqItem.appendChild(header);
      faqItem.appendChild(answer);

      header.addEventListener("click", () => {
        const isOpen = faqItem.classList.toggle("open");

        if (isOpen) {
          answer.style.maxHeight = answer.scrollHeight + "px";
          toggleIcon.textContent = "−";
          toggleIcon.classList.add("rotate-180");
        } else {
          answer.style.maxHeight = "0";
          toggleIcon.textContent = "+";
          toggleIcon.classList.remove("rotate-180");
        }
      });

      // Hover zoom effect
      answer.addEventListener("mouseenter", () => {
        answer.querySelector("p").classList.add("scale-105");
      });
      answer.addEventListener("mouseleave", () => {
        answer.querySelector("p").classList.remove("scale-105");
      });

      faqContainer.appendChild(faqItem);
    });
  }
});
