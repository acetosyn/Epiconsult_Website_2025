document.addEventListener("DOMContentLoaded", async () => {
  const faqContainer = document.querySelector(".faq-container");

  try {
    const response = await fetch("/faqs");
    if (!response.ok) throw new Error("Failed to fetch FAQs.");
    const faqs = await response.json();
    renderFaqs(faqs);
  } catch (error) {
    console.error("Error loading FAQs:", error);
    // fallback demo FAQs
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
      toggleIcon.className = "toggle-icon text-red-600 font-bold text-xl";
      toggleIcon.textContent = "+";
      header.appendChild(question);
      header.appendChild(toggleIcon);

      const answer = document.createElement("p");
      answer.className = "mt-3 text-gray-600 hidden";
      answer.textContent = faq.answer;

      faqItem.appendChild(header);
      faqItem.appendChild(answer);

      faqItem.addEventListener("click", () => {
        const isActive = answer.classList.toggle("hidden") === false;
        toggleIcon.textContent = isActive ? "−" : "+";
      });

      faqContainer.appendChild(faqItem);
    });
  }
});
