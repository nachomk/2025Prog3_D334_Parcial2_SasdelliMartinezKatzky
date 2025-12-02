function obtenerStatusDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("status"); // "ok" o "error"
}

function formatearMonto(valor) {
  const numero = Number(valor) || 0;
  return `$ ${numero.toLocaleString("es-AR")}`;
}

function mostrarResultado() {
  if (!window.turnoStorage || !window.turnoStorage.leerTurno) {
    console.warn("turnoStorage no disponible en result");
    return;
  }

  const turno = window.turnoStorage.leerTurno();

  if (!turno || !turno.servicio) {
    // Si no hay turno armado, volvemos al inicio del flujo
    window.location.href = "02_home.html";
    return;
  }

  const status = obtenerStatusDesdeURL(); // "ok" o "error"

  const elEstado = document.getElementById("out-estado");
  const elTotal = document.getElementById("out-total");
  const elMetodo = document.getElementById("out-metodo");
  const elMsg = document.getElementById("rs-msg");

  const btnTicket = document.getElementById("btn-ir-ticket");
  const btnReintentar = document.getElementById("btn-reintentar");
  const btnCambiarMetodo = document.getElementById("btn-cambiar-metodo");

  const total = typeof turno.total === "number" ? turno.total : 0;

  if (elTotal) elTotal.textContent = formatearMonto(total);
  if (elMetodo) elMetodo.textContent = "Simulado";

  if (status === "ok") {
    // PAGO APROBADO
    if (elEstado) elEstado.textContent = "PAGO APROBADO";
    if (elMsg)
      elMsg.textContent =
        "Tu pago fue procesado correctamente. Podés ver el ticket del servicio.";

    // Mostrar solo botón Ver ticket
    if (btnTicket) btnTicket.style.display = "inline-block";
    if (btnReintentar) btnReintentar.style.display = "none";
    if (btnCambiarMetodo) btnCambiarMetodo.style.display = "none";
  } else {
    // PAGO RECHAZADO
    if (elEstado) elEstado.textContent = "PAGO RECHAZADO";
    if (elMsg)
      elMsg.textContent =
        "Hubo un problema con el pago. Podés reintentar o volver al resumen para cambiar algún dato.";

    // No hay ticket si fue rechazado
    if (btnTicket) btnTicket.style.display = "none";
    if (btnReintentar) btnReintentar.style.display = "inline-block";
    if (btnCambiarMetodo) btnCambiarMetodo.style.display = "inline-block";
  }

  // Eventos de los botones
  if (btnTicket) {
    btnTicket.addEventListener("click", () => {
      // Solo debería estar visible en caso de OK
      window.location.href = "07_ticket.html";
    });
  }

  if (btnReintentar) {
    btnReintentar.addEventListener("click", () => {
      // Volver a intentar el pago con el mismo turno
      window.location.href = "05_pay.html";
    });
  }

  if (btnCambiarMetodo) {
    btnCambiarMetodo.addEventListener("click", () => {
      // Por ahora lo mandamos al resumen; más adelante podrías tener varios métodos
      window.location.href = "04_summary.html";
    });
  }
}

document.addEventListener("DOMContentLoaded", mostrarResultado);
