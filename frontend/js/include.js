// Incluir header / footer donde haya data-include
document.querySelectorAll("[data-include]").forEach(async (el) => {
  const url = el.getAttribute("data-include");
  const html = await fetch(url).then((r) => r.text());
  el.outerHTML = html;
});

// Actualizar mensaje de bienvenida en HOME (si existe ese elemento)
function actualizarBienvenidaHome() {
  const nombre = localStorage.getItem("nombre");
  const tituloBienvenida = document.getElementById("hm-bienvenida");
  if (nombre && tituloBienvenida) {
    tituloBienvenida.textContent = `Bienvenido, ${nombre}. Elija su servicio`;
  }
}

// Cuando termine de cargar todo el DOM, intentamos actualizar la bienvenida
document.addEventListener("DOMContentLoaded", () => {
  // Damos un pequeño margen para que se hayan cargado los includes
  setTimeout(actualizarBienvenidaHome, 150);
});

// Delegación global para el botón SALIR del header
document.addEventListener("click", (event) => {
  const botonSalir = event.target.closest("#hd-salir");
  if (!botonSalir) return;

  localStorage.removeItem("nombre");

  if (window.turnoStorage && window.turnoStorage.limpiarTurno) {
    window.turnoStorage.limpiarTurno();
  }

  window.location.href = "01_welcome.html";
});
