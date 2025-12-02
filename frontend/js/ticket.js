// ==============================
// Pantalla 07 - Ticket
// ==============================
//
//Se muestra el comprobante del turno, por rechazado, o aceptado
// ==============================

// Formateo de montos a moneda argentina
function formatearMonto(valor) {
  const numero = Number(valor) || 0;
  return `$ ${numero.toLocaleString("es-AR")}`;
}

// Leemos el status de la URL 
//  con esto logramos ver que pantalla mostrar despues
// "ok" | "error" | null
function obtenerStatusDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("status"); 
}

// Número de ticket simulado: 0001-XXXXXXXX // cuando implementemos la base hay que hacer la funcion para 
//que lea el ultimo numero y le agregue uno

function generarNumeroTicket() {
  const puntoVenta = "0001";
  const secuencia = Date.now().toString().slice(-8);
  return puntoVenta + "-" + secuencia;
}


function generarTurnoCorto(nroTicket) {
  const soloDigitos = nroTicket.replace(/\D/g, "");
  const ultimosTres = soloDigitos.slice(-3) || "001";
  return "A" + ultimosTres.padStart(3, "0");
}


function mostrarTicket() {
  
  if (!window.turnoStorage || !window.turnoStorage.leerTurno) {
    console.warn("turnoStorage no disponible en ticket");
    window.location.href = "01_welcome.html";
    return;
  }

  const turno = window.turnoStorage.leerTurno();

  // Si no hay turno o faltan datos básicos, volvemos al inicio
  if (!turno || !turno.servicio || !turno.vehiculo) {
    window.location.href = "01_welcome.html";
    return;
  }

  // Determinamos el estado de pago
  const statusURL = obtenerStatusDesdeURL(); // "ok" | "error" | null
  let estadoPago = turno.estadoPago;

  if (!estadoPago) {
    if (statusURL === "ok") {
      estadoPago = "PAGADO";
    } else if (statusURL === "error") {
      estadoPago = "RECHAZADO";
    } else {
      // Si no viene nada, por seguridad consideramos rechazado
      estadoPago = "RECHAZADO";
    }
  }

  const metodoPago = turno.metodoPago || "—";
  const total = typeof turno.total === "number" ? turno.total : 0;

  const nroTicket = generarNumeroTicket();
  const turnoCorto = generarTurnoCorto(nroTicket);
  const fechaHora = new Date().toLocaleString("es-AR");

  // Elementos del DOM
  const elTurnoLinea = document.getElementById("tk-turno-linea");
  const elSubmensaje = document.getElementById("tk-submensaje");
  const elNro = document.getElementById("tk-nro");
  const elFecha = document.getElementById("tk-fecha");
  const elEstado = document.getElementById("tk-estado");
  const elMetodo = document.getElementById("tk-metodo");

  const elCliente = document.getElementById("tk-cliente");
  const elServicio = document.getElementById("tk-servicio");
  const elVehiculo = document.getElementById("tk-vehiculo");
  const elPatente = document.getElementById("tk-patente");
  const elTotal = document.getElementById("tk-total");

  const btnImprimir = document.getElementById("btn-tk-imprimir");
  const btnOtroMetodo = document.getElementById("btn-tk-otro-metodo");
  const btnFinalizar = document.getElementById("btn-tk-finalizar");

  // Texto grande con el turno o mensaje de rechazo
  if (estadoPago === "PAGADO") {
    if (elTurnoLinea) {
      elTurnoLinea.textContent = "Su turno es " + turnoCorto;
    }
    if (elSubmensaje) {
      elSubmensaje.textContent = "Aguarde a ser llamado.";
    }
  } else {
    if (elTurnoLinea) {
      elTurnoLinea.textContent = "Pago rechazado";
    }
    if (elSubmensaje) {
      elSubmensaje.textContent =
        "Probá con otro método de pago o finalizá.";
    }
  }

  // Datos generales del ticket
  if (elNro) elNro.textContent = nroTicket;
  if (elFecha) elFecha.textContent = fechaHora;

  if (elEstado) {
    if (estadoPago === "PAGADO") {
      elEstado.textContent = "PAGO APROBADO";
    } else {
      elEstado.textContent = "PAGO RECHAZADO";
    }
  }

  if (elMetodo) {
    elMetodo.textContent = metodoPago;
  }

  // Datos del cliente y servicio
  if (elCliente) {
    elCliente.textContent = turno.nombreCliente || "—";
  }

  if (elServicio) {
    if (turno.servicio && turno.servicio.nombre) {
      elServicio.textContent = turno.servicio.nombre;
    } else {
      elServicio.textContent = "—";
    }
  }

  // Datos del vehículo
  const nombreVehiculo =
    turno.vehiculo && turno.vehiculo.nombre_tipo
      ? turno.vehiculo.nombre_tipo
      : "—";

  const patente =
    turno.vehiculo && turno.vehiculo.patente
      ? turno.vehiculo.patente
      : "—";

  if (elVehiculo) elVehiculo.textContent = nombreVehiculo;
  if (elPatente) elPatente.textContent = patente;

  // Importe total
  if (elTotal) {
    elTotal.textContent = formatearMonto(total);
  }

  // Mostrar / ocultar botones según estado del pago
  if (estadoPago === "PAGADO") {
    // Pago aprobado: se puede imprimir y finalizar
    if (btnImprimir) btnImprimir.style.display = "inline-block";
    if (btnOtroMetodo) btnOtroMetodo.style.display = "none";
  } else {
    // Pago rechazado: no tiene sentido imprimir, solo probar otro método o finalizar
    if (btnImprimir) btnImprimir.style.display = "none";
    if (btnOtroMetodo) btnOtroMetodo.style.display = "inline-block";
  }

  // ==========================
  // Eventos de los botones
  // ==========================

  // Imprimir
  if (btnImprimir) {
    btnImprimir.addEventListener("click", function () {
      window.print();
    });
  }

  // Probar otro método de pago
  if (btnOtroMetodo) {
    btnOtroMetodo.addEventListener("click", function () {
      // Volvemos a la pantalla de pago en modo reintento (?retry=1)
      window.location.href = "05_pay.html?retry=1";
    });
  }

  // Finalizar
  if (btnFinalizar) {
    btnFinalizar.addEventListener("click", function () {
      // Limpiamos el turno actual y volvemos al welcome
      if (window.turnoStorage && window.turnoStorage.limpiarTurno) {
        window.turnoStorage.limpiarTurno();
      }
      window.location.href = "01_welcome.html";
    });
  }
}

// Ejecutamos la lógica cuando el DOM está listo
document.addEventListener("DOMContentLoaded", function () {
  mostrarTicket();
});
