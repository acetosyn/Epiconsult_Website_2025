// Optional: Enhance smooth hover-out zoom
document.querySelectorAll('.zoom-effect').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.classList.add('active-zoom');
  });
  card.addEventListener('mouseleave', () => {
    card.classList.remove('active-zoom');
  });
});
