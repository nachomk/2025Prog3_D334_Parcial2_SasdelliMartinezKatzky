// ==============================
// Pantalla 04 - Resumen del turno
// ==============================
//
// En esta pantalla mostramos el resumen del turno:
// - Leemos el turno desde el storage
// - Calculamos recargo / descuento / total
// ==============================

// Si el turno ya tiene un estado de pago cargado, no dejamos usar el resumen.
// Limpiamos el turno y volvemos al welcome.
function protegerResumenSiPagoFinalizado() {
  if (window.turnoStorage && window.turnoStorage.leerTurno) {
    const turno = window.turnoStorage.leerTurno();

    if (turno !== null && turno !== undefined && turno.estadoPago) {
      if (window.turnoStorage.limpiarTurno) {
        window.turnoStorage.limpiarTurno();
      }
      window.location.href = "01_welcome.html";
    }
  } else {
    console.warn("turnoStorage no disponible en resumen (protegerResumenSiPagoFinalizado)");
  }
}

// Formateo de montos a moneda argentina. Agregado
function formatearMonto(valor) {
  const numero = Number(valor) || 0;
  return `$ ${numero.toLocaleString("es-AR")}`;
}


// esta funcion lee el turno, calcula montos,
// guardamos el total y mostramos los datos en la pantalla.
function mostrarTurnoEnResumen() {
  const turno = leerTurnoParaResumen();

  // Si leerTurnoParaResumen devuelve null, es porque redirigimos.
  if (turno === null) {
    return;
  }

  const montos = calcularMontosResumen(turno.servicio, turno.vehiculo);

  guardarTotalEnTurno(turno, montos.total);

  mostrarDatosResumen(turno, montos);
}

// Acá leemos el turno desde el storage y verificamos que tenga lo básico
// para poder mostrar el resumen.
function leerTurnoParaResumen() {
  if (window.turnoStorage && window.turnoStorage.leerTurno) {
    const turno = window.turnoStorage.leerTurno();

    // Si no hay turno o falta el servicio, volvemos a home.
    if (turno === null || turno === undefined ||
        turno.servicio === null || turno.servicio === undefined) {
      window.location.href = "02_home.html";
      return null;
    }

    return turno;
  } else {
    console.warn("turnoStorage no disponible en resumen (leerTurnoParaResumen)");
    return null;
  }
}


function calcularMontosResumen(servicio, vehiculo) {
  const precioBase = Number(servicio.precio_base) || 0;
  const ajuste = Number(vehiculo.ajuste) || 0;

  let recargo = 0;
  let descuento = 0;

  if (ajuste > 0) {
    recargo = ajuste;
  } else if (ajuste < 0) {
    descuento = Math.abs(ajuste);
  }

  const total = precioBase + ajuste;

  return {
    precioBase: precioBase,
    recargo: recargo,
    descuento: descuento,
    total: total,
  };
}

//operador spread de js ...turno,, copia exacto el objeto en vez de hacer servicio =turno.servicio.
function guardarTotalEnTurno(turno, total) {
  const nuevoTurno = {
    ...turno,
    total: total,
  };

  if (window.turnoStorage && window.turnoStorage.guardarTurno) {
    window.turnoStorage.guardarTurno(nuevoTurno);
  } else {
    console.warn("turnoStorage no disponible en resumen (guardarTotalEnTurno)");
  }
}

// mostramoslos datos en el HTML del resumen.
function mostrarDatosResumen(turno, montos) {
  const nombreCliente = turno.nombreCliente || "—";
  const servicio = turno.servicio;
  const vehiculo = turno.vehiculo;

  const elCliente = document.getElementById("out-cliente");
  const elServicio = document.getElementById("out-servicio");
  const elSegmento = document.getElementById("out-segmento");
  const elPrecioBase = document.getElementById("out-precio-base");
  const elRecargo = document.getElementById("out-recargo");
  const elDescuento = document.getElementById("out-descuento");
  const elTotal = document.getElementById("out-total");


  if (elCliente) {
    elCliente.textContent = nombreCliente;
  }

  if (elServicio) {
    elServicio.textContent = servicio.nombre || "—";
  }

  if (elSegmento) {
    const nombreTipo = vehiculo.nombre_tipo || "—";
    const patente = vehiculo.patente || "";
    elSegmento.textContent = `${nombreTipo} (${patente})`.trim();
  }

  
  if (elPrecioBase) {
    elPrecioBase.textContent = formatearMonto(montos.precioBase);
  }

  if (elRecargo) {
    elRecargo.textContent = formatearMonto(montos.recargo);
  }

  if (elDescuento) {
    elDescuento.textContent = formatearMonto(montos.descuento);
  }

  if (elTotal) {
    elTotal.textContent = formatearMonto(montos.total);
  }
}

// -----------------------------
// Eventos de la pantalla
// -----------------------------

function configurarEventosResumen() {
  const chkConfirma = document.getElementById("inp-confirma");
  const btnIrPago = document.getElementById("btn-ir-pago");
  const btnVolver = document.getElementById("btn-volver-vehiculo");
  const msg = document.getElementById("msg-summary");

  // Habilitamos / deshabilitamos el botón "Ir a pago" según el check.(TODO SIMULADO)
  if (chkConfirma && btnIrPago) {
    chkConfirma.addEventListener("change", function () {
      if (chkConfirma.checked === true) {
        btnIrPago.disabled = false;
      } else {
        btnIrPago.disabled = true;
      }

      if (msg) {
        msg.textContent = "";
      }
    });
  }

  // Botón para volver a la pantalla de vehículo.
  if (btnVolver) {
    btnVolver.addEventListener("click", function () {
      window.location.href = "03_vehicle.html";
    });
  }

  // Botón para ir a la pantalla de pago.
  if (btnIrPago) {
    btnIrPago.addEventListener("click", function () {
      if (chkConfirma && chkConfirma.checked === true) {
        window.location.href = "05_pay.html";
      } else {
        if (msg) {
          msg.textContent = "Tenés que confirmar los datos antes de seguir.";
        }
      }
    });
  }
}

// Cuando el DOM está listo, ejecutamos todo lo que tiene que pasar en esta pantalla.
document.addEventListener("DOMContentLoaded", function () {
  protegerResumenSiPagoFinalizado();
  mostrarTurnoEnResumen();
  configurarEventosResumen();
});
