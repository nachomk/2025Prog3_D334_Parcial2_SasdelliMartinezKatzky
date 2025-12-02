// Configuración de tipos de vehículo

//json para precargar..
const TIPOS_VEHICULO = {
  HATCH: { id: "HATCH", nombre: "Hatchback", ajuste: 0 },
  SEDAN: { id: "SEDAN", nombre: "Sedán", ajuste: 0 },
  SUV: { id: "SUV", nombre: "SUV", ajuste: 2000 },
  CAMIONETA: { id: "CAMIONETA", nombre: "Camioneta", ajuste: 3000 },
  CAMION: { id: "CAMION", nombre: "Camión", ajuste: 3000 },
  TAXI: { id: "TAXI", nombre: "Taxi", ajuste: -1000 },
  ESPECIALES: { id: "ESPECIALES", nombre: "Especiales", ajuste: 3000 },
};

function limpiarErrorPatente() {
  const errorEl = document.getElementById("vh-error-patente");
  if (errorEl) errorEl.textContent = "";
}

function mostrarErrorPatente(mensaje) {
  const errorEl = document.getElementById("vh-error-patente");
  if (errorEl) errorEl.textContent = mensaje;
}

function obtenerPatente() {
  const input = document.getElementById("vh-input-patente");
  if (!input) return null;

  const valor = (input.value || "").trim().toUpperCase();

  if (!valor) {
    mostrarErrorPatente("Ingresá la patente del vehículo.");
    return null;
  }

  limpiarErrorPatente();
  return valor;
}

function seleccionarVehiculo(tipoClave) {
  const patente = obtenerPatente();
  if (!patente) return;

  if (!window.turnoStorage || !window.turnoStorage.leerTurno) {
    console.warn("turnoStorage no disponible");
    return;
  }

  const turnoActual = window.turnoStorage.leerTurno() || {};

  // Si por alguna razón llegamos sin servicio elegido, volvemos a la home
  if (!turnoActual.servicio) {
    window.location.href = "02_home.html";
    return;
  }

  const tipo = TIPOS_VEHICULO[tipoClave];
  if (!tipo) {
    console.warn("Tipo de vehículo no definido:", tipoClave);
    return;
  }

  const nuevoTurno = {
    ...turnoActual,
    vehiculo: {
      patente,
      id_tipo: tipo.id,
      nombre_tipo: tipo.nombre,
      ajuste: tipo.ajuste,
    },
  };

  window.turnoStorage.guardarTurno(nuevoTurno);

  // Ir al resumen
  window.location.href = "04_summary.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const mapBotones = {
    "btn-veh-hatch": "HATCH",
    "btn-veh-sedan": "SEDAN",
    "btn-veh-suv": "SUV",
    "btn-veh-camioneta": "CAMIONETA",
    "btn-veh-camion": "CAMION",
    "btn-veh-taxi": "TAXI",
    "btn-veh-especiales": "ESPECIALES",
  };

  Object.entries(mapBotones).forEach(([idBtn, tipoClave]) => {
    const btn = document.getElementById(idBtn);
    if (!btn) return;

    btn.addEventListener("click", () => seleccionarVehiculo(tipoClave));
  });

  const inputPatente = document.getElementById("vh-input-patente");
  if (inputPatente) {
    inputPatente.addEventListener("input", limpiarErrorPatente);
  }
});
