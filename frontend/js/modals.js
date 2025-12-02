// Abrir modal
document.querySelectorAll('.link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault(); // evita el salto de ancla
    const modal = document.querySelector(link.getAttribute('href'));
    modal.classList.add('show');
  });
});


document.querySelectorAll('.modal .close').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.modal').classList.remove('show');
  });
});

// Cerrar clickeando afuera
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });
});
