// sickle_cell_sections.js
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section:not(:first-of-type)"); 
  // Excludes the hero (first section)

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");

          // 🔹 Stagger children (like tips cards or feature boxes)
          const children = entry.target.querySelectorAll(".stagger-item");
          children.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add("visible");
            }, index * 150); // 150ms stagger
          });
        }
      });
    },
    { threshold: 0.2 }
  );

  sections.forEach((section) => {
    section.classList.add("fade-zoom"); // base animation for section
    observer.observe(section);

    // Mark children for stagger
    const children = section.querySelectorAll(".stagger-item");
    children.forEach((child) => child.classList.add("fade-zoom"));
  });
});
