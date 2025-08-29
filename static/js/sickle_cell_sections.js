// sickle_cell_sections.js
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section:not(:first-of-type)"); 
  // Excludes the hero (first section)

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.2 }
  );

  sections.forEach((section) => {
    section.classList.add("fade-zoom"); // apply base style
    observer.observe(section);
  });
});
