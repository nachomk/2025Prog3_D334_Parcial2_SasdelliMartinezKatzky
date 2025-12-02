function formatearMonto(valor) {
  const numero = Number(valor) || 0;
  return `$ ${numero.toLocaleString("es-AR")}`;
}

function cargarDatosPago() {
  if (!window.turnoStorage || !window.turnoStorage.leerTurno) {
    console.warn("turnoStorage no disponible en pay");
    return;
  }

  const turno = window.turnoStorage.leerTurno();

  // Si no hay turno o falta servicio, volvemos para atrás
  if (!turno || !turno.servicio) {
    window.location.href = "02_home.html";
    return;
  }

  if (typeof turno.total !== "number") {
    // Si no tiene total calculado, volvemos al resumen
    window.location.href = "04_summary.html";
    return;
  }

  const contTotal = document.getElementById("out-total-a-pagar");
  if (contTotal) {
    contTotal.innerHTML = `<strong>${formatearMonto(turno.total)}</strong>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Detectar si viene en modo reintento (?retry=1)
  const params = new URLSearchParams(window.location.search);
  const esReintento = params.get("retry") === "1";

  if (window.turnoStorage && window.turnoStorage.leerTurno) {
    const t = window.turnoStorage.leerTurno();

    // Si no hay turno, al inicio
    if (!t) {
      window.location.href = "01_welcome.html";
      return;
    }

    // Si ya estaba aprobado, nunca dejamos volver a pay
    if (t.estadoPago === "PAGADO") {
      if (window.turnoStorage.limpiarTurno) {
        window.turnoStorage.limpiarTurno();
      }
      window.location.href = "01_welcome.html";
      return;
    }

    // Si estaba rechazado:
    if (t.estadoPago === "RECHAZADO") {
      if (!esReintento) {
        // Vino por flecha atrás → no se permite reintentar, se resetea todo
        if (window.turnoStorage.limpiarTurno) {
          window.turnoStorage.limpiarTurno();
        }
        window.location.href = "01_welcome.html";
        return;
      } else {
        // Vino desde "Probar otro método" → permitimos reintento
        const nuevoTurno = { ...t };
        delete nuevoTurno.estadoPago;
        delete nuevoTurno.metodoPago;
        window.turnoStorage.guardarTurno(nuevoTurno);
      }
    }
  } else {
    // Sin turnoStorage, no podemos seguir
    window.location.href = "01_welcome.html";
    return;
  }

  // A partir de acá, flujo normal de pay
  cargarDatosPago();

  const btnEfectivo = document.getElementById("pm-efectivo");
  const btnDebito = document.getElementById("pm-debito");
  const btnCredito = document.getElementById("pm-credito");
  const btnQr = document.getElementById("pm-qr");

  const btnAprobar = document.getElementById("btn-pago-aprobar");
  const btnRechazar = document.getElementById("btn-pago-rechazar");
  const btnVolver = document.getElementById("btn-volver-summary");
  const msgPago = document.getElementById("msg-pago");

  let metodoSeleccionado = null; // "Efectivo" | "Débito" | "Crédito" | "QR"

  const botonesMetodo = [btnEfectivo, btnDebito, btnCredito, btnQr];

  function marcarMetodoSeleccionado(botonSeleccionado) {
    botonesMetodo.forEach((btn) => {
      if (!btn) return;
      if (btn === botonSeleccionado) {
        btn.classList.add("metodo--seleccionado");
      } else {
        btn.classList.remove("metodo--seleccionado");
      }
    });
  }

  function setMensaje(texto) {
    if (msgPago) msgPago.textContent = texto || "";
  }

  function deshabilitarTodoDuranteCarga() {
    [...botonesMetodo, btnAprobar, btnRechazar, btnVolver].forEach((btn) => {
      if (btn) btn.disabled = true;
    });
  }

  // Métodos de pago
  if (btnEfectivo) {
    btnEfectivo.addEventListener("click", () => {
      metodoSeleccionado = "Efectivo";
      marcarMetodoSeleccionado(btnEfectivo);
      setMensaje("");
    });
  }

  if (btnDebito) {
    btnDebito.addEventListener("click", () => {
      metodoSeleccionado = "Débito";
      marcarMetodoSeleccionado(btnDebito);
      setMensaje("");
    });
  }

  if (btnCredito) {
    btnCredito.addEventListener("click", () => {
      metodoSeleccionado = "Crédito";
      marcarMetodoSeleccionado(btnCredito);
      setMensaje("");
    });
  }

  if (btnQr) {
    btnQr.addEventListener("click", () => {
      metodoSeleccionado = "QR";
      marcarMetodoSeleccionado(btnQr);
      setMensaje("");
    });
  }

  // Simular pago (aprobado / rechazado) y mandar directo al ticket
  function simularPago(estado) {
    if (!metodoSeleccionado) {
      setMensaje("Elegí primero un método de pago.");
      return;
    }

    if (!window.turnoStorage || !window.turnoStorage.leerTurno) {
      console.warn("turnoStorage no disponible en simularPago");
      return;
    }

    const turno = window.turnoStorage.leerTurno();
    if (!turno) {
      window.location.href = "01_welcome.html";
      return;
    }

    const nuevoTurno = {
      ...turno,
      estadoPago: estado, // "PAGADO" o "RECHAZADO"
      metodoPago: metodoSeleccionado,
    };

    window.turnoStorage.guardarTurno(nuevoTurno);

    // "Pensando..." / cargando
    setMensaje("Procesando pago...");
    deshabilitarTodoDuranteCarga();

    const status = estado === "PAGADO" ? "ok" : "error";

    // Simulamos demora de 1 segundo y vamos directo al ticket
    setTimeout(() => {
      window.location.href = `07_ticket.html?status=${status}`;
    }, 1000);
  }

  if (btnAprobar) {
    btnAprobar.addEventListener("click", () => simularPago("PAGADO"));
  }

  if (btnRechazar) {
    btnRechazar.addEventListener("click", () => simularPago("RECHAZADO"));
  }

  // Navegación
  if (btnVolver) {
    btnVolver.addEventListener("click", () => {
      window.location.href = "04_summary.html";
    });
  }
});
