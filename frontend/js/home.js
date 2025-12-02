// ==============================
// Pantalla 02 - Home (Servicios)
// ==============================
//
// En esta pantalla mostramos las tarjetas de servicios (lavados).
// ==============================

// URL de la API de lavados (backend)
const API_LAVADOS_URL = "http://localhost:3000/api/lavados";

// Carpeta donde están las imágenes de los lavados en el frontend
const RUTAS_BASE_IMAGENES = "../utils/";

// Datos de prueba (hardcodeados)
const LAVADOS_DE_PRUEBA = [
  {
    id_lavado: 1,
    nombre: "Lavado simple",
    precio: 8000,
    imagen: "lavado_simple.jpg",
  },
  {
    id_lavado: 2,
    nombre: "Lavado + Detallado",
    precio: 14000,
    imagen: "lavado_detallado.jpg",
  },
  {
    id_lavado: 3,
    nombre: "Servicio premium",
    precio: 22000,
    imagen: "lavado_premium.jpg",
  },
];

// ==============================
// Funciones de ayuda
// ==============================

// Intentamos obtener los lavados desde la API.
// Si algo falla, pasamos null y después vamos a los datos de prueba.
async function obtenerLavadosDesdeAPI() {
  try {
    const respuesta = await fetch(API_LAVADOS_URL);

    if (respuesta.ok) {
      const lavados = await respuesta.json();
      return lavados;
    } else {
      console.error(
        "La API de lavados respondió con un estado no OK:",
        respuesta.status
      );
      return null;
    }
  } catch (error) {
    console.error("Error al intentar obtener lavados desde la API:", error);
    return null;
  }
}

// Crea una tarjeta de lavado (article.card) a partir de un objeto lavado
// y devuelve el nodo ya armado (todavía sin agregar al DOM).
function crearCardLavado(lavado) {
  const article = document.createElement("article");
  article.className = "card";

  // Imagen de la card
  const divImg = document.createElement("div");
  divImg.className = "card__img";

  if (lavado.imagen) {
    const nombreImagen = lavado.imagen;
    const rutaImagen = RUTAS_BASE_IMAGENES + nombreImagen;
    divImg.style.backgroundImage = `url(${rutaImagen})`;
    divImg.style.backgroundSize = "cover";
    divImg.style.backgroundPosition = "center";
  }

  // Título (nombre del servicio)
  const divTitle = document.createElement("div");
  divTitle.className = "card__title";
  divTitle.textContent = lavado.nombre || "Servicio";

  // Precio
  const divPrice = document.createElement("div");
  divPrice.className = "card__price";
  const precioNumero = Number(lavado.precio) || 0;
  divPrice.textContent = `$ ${precioNumero.toLocaleString("es-AR")}`;

  // Acciones
  const divActions = document.createElement("div");
  divActions.className = "card__actions";

  const btnSeleccionar = document.createElement("button");
  btnSeleccionar.className = "btn btn--primario";
  btnSeleccionar.textContent = "Seleccionar";
  btnSeleccionar.disabled = false;

  divActions.appendChild(btnSeleccionar);

  // Armamos la card
  article.appendChild(divImg);
  article.appendChild(divTitle);
  article.appendChild(divPrice);
  article.appendChild(divActions);

  // Configuramos el botón con tu lógica de turno
  configurarBotonSeleccion(btnSeleccionar, lavado);

  return article;
}

// Configuramos el botón "Seleccionar" de cada tarjeta.
// cuando hacemos click, lee el nombre del cliente y el turno del localstorage
// Actualizamos el turno con el servicio elegido
// Guardamos el turno en el storage y vamos a 03_vehicle.html
function configurarBotonSeleccion(boton, lavado) {
  boton.disabled = false;

  boton.addEventListener("click", function () {
    // Leemos el nombre del cliente desde localStorage (pantalla 01)
    const nombreCliente = localStorage.getItem("nombre") || null;

    // Leemos el turno actual desde nuestro helper de storage
    let turnoActual = {};

    if (
      window.turnoStorage &&
      typeof window.turnoStorage.leerTurno === "function"
    ) {
      const turnoGuardado = window.turnoStorage.leerTurno();

      if (turnoGuardado !== null && turnoGuardado !== undefined) {
        turnoActual = turnoGuardado;
      }
    }

    const nuevoTurno = {};
    if (turnoActual && typeof turnoActual === "object") {
      if (turnoActual.vehiculo) {
        nuevoTurno.vehiculo = turnoActual.vehiculo;
      }

      if (turnoActual.estadoPago) {
        nuevoTurno.estadoPago = turnoActual.estadoPago;
      }

      if (typeof turnoActual.total !== "undefined") {
        nuevoTurno.total = turnoActual.total;
      }
    }

    nuevoTurno.nombreCliente = nombreCliente;
    nuevoTurno.servicio = {
      id: lavado.id_lavado,
      nombre: lavado.nombre,
      precio_base: Number(lavado.precio) || 0,
    };

    if (
      window.turnoStorage &&
      typeof window.turnoStorage.guardarTurno === "function"
    ) {
      window.turnoStorage.guardarTurno(nuevoTurno);
    } else {
      console.warn("turnoStorage no está disponible en home.js");
    }

    // cambio de pantalla
    window.location.href = "03_vehicle.html";
  });
}


//Leemos los lavados desde la API, sino responde usa los hardcodeados.

async function cargarLavados() {
  const contenedor = document.getElementById("cards-servicios");

  if (!contenedor) {
    console.error("No se encontró el contenedor #cards-servicios en el DOM.");
    return;
  }
// limpiar para que no traiga info anterior
  contenedor.innerHTML = "";

  // API
  let lavados = await obtenerLavadosDesdeAPI();

  // Hardcodeados si la API no responde o devuelve algo inválido
  if (!Array.isArray(lavados) || lavados.length === 0) {
    console.warn(
      "No se pudieron obtener lavados desde la API. Usamos datos de prueba."
    );
    lavados = LAVADOS_DE_PRUEBA;
  }

  // Creamos una card por cada lavado
  for (let index = 0; index < lavados.length; index++) {
    const lavado = lavados[index];
    if (!lavado) continue;

    const card = crearCardLavado(lavado);
    contenedor.appendChild(card);
  }
}

// Cuando el DOM está listo, cargamos los lavados en la pantalla
document.addEventListener("DOMContentLoaded", function () {
  cargarLavados();
});
