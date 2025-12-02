// ==============================
// Pantalla 03 - Vehicle
// ==============================
//
// Acá el usuario ingresa la patente y elige el tipo de vehículo.
// Los tipos de vehículo vienen desde la BD por la API:
//   GET http://localhost:3000/api/tipos-vehiculo
// Si la API falla, usamos datos de prueba.
// ==============================

// URL de la API
const API_TIPOS_VEHICULO_URL = "http://localhost:3000/api/tipos-vehiculo";

// Datos hardcodeados por si la API falla
const TIPOS_VEHICULO_DE_PRUEBA = [
  { id_tipo: 1, nombre: "Hatchback",   ajuste:    0 },
  { id_tipo: 2, nombre: "Sedán",       ajuste:    0 },
  { id_tipo: 3, nombre: "SUV",         ajuste: 2000 },
  { id_tipo: 4, nombre: "Camioneta",   ajuste: 3000 },
  { id_tipo: 5, nombre: "Camión",      ajuste: 3000 },
  { id_tipo: 6, nombre: "Taxi",        ajuste: -1000 },
  { id_tipo: 7, nombre: "Especiales",  ajuste: 3000 },
];

// ==============================
// Manejo de error de patente
// ==============================
function limpiarErrorPatente() {
  const errorEl = document.getElementById("vh-error-patente");
  if (errorEl) {
    errorEl.textContent = "";
  }
}

function mostrarErrorPatente(mensaje) {
  const errorEl = document.getElementById("vh-error-patente");
  if (errorEl) {
    errorEl.textContent = mensaje;
  }
}

// ==============================
// Lectura / validación de patente
// ==============================
function obtenerPatente() {
  const input = document.getElementById("vh-input-patente");
  if (!input) {
    console.warn("No se encontró el input de patente (vh-input-patente)");
    return null;
  }

  const valor = (input.value || "").trim().toUpperCase();

  if (!valor) {
    mostrarErrorPatente("Ingresá la patente del vehículo.");
    return null;
  }

  limpiarErrorPatente();
  return valor;
}

// ==============================
// Seleccionar tipo de vehículo
// ==============================
function seleccionarVehiculo(tipoVehiculo) {
  const patente = obtenerPatente();
  if (!patente) {
    // sin patente no seguimos
    return;
  }

  if (
    !window.turnoStorage ||
    typeof window.turnoStorage.leerTurno !== "function" ||
    typeof window.turnoStorage.guardarTurno !== "function"
  ) {
    console.warn("turnoStorage no disponible en vehicle.js");
    return;
  }

  const turnoActual = window.turnoStorage.leerTurno() || {};

  const nuevoTurno = {
    ...turnoActual,
    vehiculo: {
      patente:     patente,
      id_tipo:     tipoVehiculo.id_tipo,
      nombre_tipo: tipoVehiculo.nombre,
      ajuste:      tipoVehiculo.ajuste,
    },
  };

  window.turnoStorage.guardarTurno(nuevoTurno);

  // Pasamos al resumen
  window.location.href = "04_summary.html";
}

// ==============================
// Crear UNA card igual a la harcodeada
// ==============================
//
// Estructura que reproducimos:
//   <article class="card card-cuadrada">
//     <div class="card__img" style="background-image:url('...')"></div>
//     <div class="card__title">Hatchback</div>
//     <div class="mensaje">dasd</div>
//     <button class="btn btn--primario">Seleccionar</button>
//   </article>
//
function crearCardTipoVehiculo(tipoVehiculo) {
  const card = document.createElement("article");
  card.className = "card card-cuadrada";

  // Imagen (usamos una genérica como en el ejemplo)
  const img = document.createElement("div");
  img.className = "card__img";
  img.style.backgroundImage =
    "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop')";
  card.appendChild(img);

  // Título con el nombre del tipo
  const titulo = document.createElement("div");
  titulo.className = "card__title";
  titulo.textContent = tipoVehiculo.nombre || "Tipo de vehículo";
  card.appendChild(titulo);

  // Mensaje (recargo / descuento / sin recargo)
  const nota = document.createElement("div");
  nota.className = "mensaje";

  if (typeof tipoVehiculo.ajuste === "number") {
    if (tipoVehiculo.ajuste > 0) {
      nota.textContent =
        "Recargo $ " + tipoVehiculo.ajuste.toLocaleString("es-AR");
    } else if (tipoVehiculo.ajuste < 0) {
      nota.textContent =
        "Descuento $ " + Math.abs(tipoVehiculo.ajuste).toLocaleString("es-AR");
    } else {
      nota.textContent = "Sin recargo";
    }
  } else {
    nota.textContent = "";
  }

  card.appendChild(nota);

  // Botón Seleccionar
  const btn = document.createElement("button");
  btn.className = "btn btn--primario";
  btn.textContent = "Seleccionar";
  btn.addEventListener("click", () => seleccionarVehiculo(tipoVehiculo));
  card.appendChild(btn);

  return card;
}

// ==============================
// Mostrar todas las cards en pantalla
// ==============================
function mostrarTiposVehiculoEnPantalla(tiposVehiculo) {
  const contenedor = document.getElementById("vh-tipos-container");
  if (!contenedor) {
    console.error("No se encontró el contenedor #vh-tipos-container en el DOM.");
    return;
  }

  // Limpiamos por las dudas
  contenedor.innerHTML = "";

  tiposVehiculo.forEach((tipo) => {
    if (!tipo) return;
    const card = crearCardTipoVehiculo(tipo);
    contenedor.appendChild(card);
  });
}

// ==============================
// Cargar tipos desde la API
// ==============================
async function obtenerTiposVehiculoDesdeAPI() {
  try {
    const respuesta = await fetch(API_TIPOS_VEHICULO_URL);

    if (!respuesta.ok) {
      console.warn(
        "La API de tipos de vehículo respondió con estado no OK:",
        respuesta.status
      );
      return null;
    }

    const tipos = await respuesta.json();
    return tipos;
  } catch (error) {
    console.error("Error al obtener tipos de vehículo desde la API:", error);
    return null;
  }
}

// ==============================
// Inicializar pantalla
// ==============================
async function inicializarPantallaVehiculo() {
  // limpiar error cuando escribo la patente
  const inputPatente = document.getElementById("vh-input-patente");
  if (inputPatente) {
    inputPatente.addEventListener("input", limpiarErrorPatente);
  }

  // Traer tipos desde la API
  let tipos = await obtenerTiposVehiculoDesdeAPI();

  // Si la API no devolvió nada útil, usamos los hardcodeados
  if (!Array.isArray(tipos) || tipos.length === 0) {
    console.warn(
      "No se pudieron obtener tipos de vehículo desde la API. Usamos datos de prueba."
    );
    tipos = TIPOS_VEHICULO_DE_PRUEBA;
  }

  mostrarTiposVehiculoEnPantalla(tipos);
}

// ==============================
// DOMContentLoaded
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  inicializarPantallaVehiculo();
});
