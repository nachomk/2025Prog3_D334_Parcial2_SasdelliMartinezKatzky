document.querySelectorAll('[data-include]').forEach(async (el) => {
  const url = el.getAttribute('data-include');
  const html = await fetch(url).then(r => r.text());
  el.outerHTML = html;
});

// Logica que agrega el nombre ingresado en welcome en el saludo de la HOME
setTimeout(() => { // se agrego un timeout para agregarle prolijidad a la hora de querer salir y volver al login inicial
  const nombre = localStorage.getItem('nombre');
  if (nombre) {
    document.getElementById('hm-bienvenida').textContent = `Bienvenido, ${nombre}. Elija su servicio`;
  }

  const botonSalir = document.getElementById('hd-salir');
  if (botonSalir) {
    botonSalir.addEventListener('click', function () {
      localStorage.removeItem('nombre');
      window.location.href = '01_welcome.html';
    });
  }
}, 100);
