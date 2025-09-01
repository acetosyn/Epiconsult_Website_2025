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
      {
        question: "What is sickle cell disease?",
        answer:
          "A group of inherited red blood cell disorders that cause cells to become rigid and sickle-shaped."
      },
      {
        question: "What days are consultations available?",
        answer: "Wednesdays and Saturdays from 10AM – 5PM."
      },
      {
        question: "How can I prevent a crisis?",
        answer:
          "Stay hydrated, avoid extreme temperatures, manage stress, and follow prescribed medication."
      }
    ];
    renderFaqs(fallbackFaqs);
  }

  function renderFaqs(faqs) {
    faqs.forEach(faq => {
      const faqItem = document.createElement("div");
      faqItem.className =
        "faq-item zoom-effect border rounded-lg p-5 mb-3 cursor-pointer bg-white shadow-sm transition hover:shadow-md";

      const header = document.createElement("div");
      header.className = "flex justify-between items-center";

      const question = document.createElement("h4");
      question.className = "font-semibold text-lg text-gray-900";
      question.textContent = faq.question;

      const toggleIcon = document.createElement("span");
      toggleIcon.className =
        "toggle-icon text-red-600 font-bold text-2xl transition-transform duration-300";
      toggleIcon.textContent = "+";

      header.appendChild(question);
      header.appendChild(toggleIcon);

      const answer = document.createElement("div");
      answer.className =
        "faq-answer max-h-0 overflow-hidden transition-all duration-500 ease-in-out";

      // Format long answers into paragraphs for readability
      const formattedAnswer = faq.answer
        .split(/\n{2,}|\. (?=[A-Z])/)
        .map(
          sentence =>
            `<p class="mt-3 text-gray-700 leading-relaxed text-base faq-text">${sentence.trim()}</p>`
        )
        .join("");
      answer.innerHTML = formattedAnswer;

      faqItem.appendChild(header);
      faqItem.appendChild(answer);

      header.addEventListener("click", () => {
        const isOpen = faqItem.classList.contains("open");

        // Close all other open FAQs
        document.querySelectorAll(".faq-item.open").forEach(openItem => {
          if (openItem !== faqItem) {
            openItem.classList.remove("open");
            const openAnswer = openItem.querySelector(".faq-answer");
            const openIcon = openItem.querySelector(".toggle-icon");
            openAnswer.style.maxHeight = "0";
            openIcon.textContent = "+";
            openIcon.classList.remove("rotate-180");
          }
        });

        // Toggle current FAQ
        if (isOpen) {
          faqItem.classList.remove("open");
          answer.style.maxHeight = "0";
          toggleIcon.textContent = "+";
          toggleIcon.classList.remove("rotate-180");
        } else {
          faqItem.classList.add("open");
          answer.style.maxHeight = answer.scrollHeight + "px";
          toggleIcon.textContent = "−";
          toggleIcon.classList.add("rotate-180");
        }
      });

      // ✅ Fixed Hover zoom effect on text (no clipping)
      answer.addEventListener("mouseenter", () => {
        answer.querySelectorAll("p").forEach(p => {
          p.style.transformOrigin = "left top"; // zoom direction
          p.classList.add("scale-105");
        });
      });

      answer.addEventListener("mouseleave", () => {
        answer.querySelectorAll("p").forEach(p =>
          p.classList.remove("scale-105")
        );
      });

      faqContainer.appendChild(faqItem);
    });
  }
});
