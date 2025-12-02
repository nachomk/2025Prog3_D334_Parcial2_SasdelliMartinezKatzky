/*async function cargarLavados() {
  try {
    const res = await fetch("http://localhost:3000/api/lavados");
    const lavados = await res.json();

    // Referencias a las 3 tarjetas de la pantalla
    const cards = [
      {
        img: document.getElementById("card1-img"),
        name: document.getElementById("card1-name"),
        price: document.getElementById("card1-price"),
        btn: document.getElementById("card1-cta"),
      },
      {
        img: document.getElementById("card2-img"),
        name: document.getElementById("card2-name"),
        price: document.getElementById("card2-price"),
        btn: document.getElementById("card2-cta"),
      },
      {
        img: document.getElementById("card3-img"),
        name: document.getElementById("card3-name"),
        price: document.getElementById("card3-price"),
        btn: document.getElementById("card3-cta"),
      },
    ];

    const RUTAS_BASE_IMAGENES = "../utils/";

    // Tomamos como máximo la cantidad de tarjetas que hay en pantalla
    lavados.slice(0, cards.length).forEach((lavado, index) => {
      const card = cards[index];
      if (!card) return;

      // Texto de la tarjeta
      card.name.textContent = lavado.nombre;
      card.price.textContent = `$ ${Number(lavado.precio).toFixed(2)}`;

      // Imagen de fondo
      const rutaImagen = RUTAS_BASE_IMAGENES + lavado.imagen;
      card.img.style.backgroundImage = `url(${rutaImagen})`;
      card.img.style.backgroundSize = "cover";
      card.img.style.backgroundPosition = "center";

      // Habilitar botón Seleccionar y guardar turno al hacer clic
      if (card.btn) {
        card.btn.disabled = false;
        card.btn.addEventListener("click", () => {
          const nombreCliente = localStorage.getItem("nombre") || null;

          const turnoActual =
            window.turnoStorage && window.turnoStorage.leerTurno
              ? window.turnoStorage.leerTurno() || {}
              : {};

          const nuevoTurno = {
            ...turnoActual,
            nombreCliente,
            servicio: {
              id: lavado.id_lavado,
              nombre: lavado.nombre,
              precio_base: Number(lavado.precio),
            },
          };

          if (
            window.turnoStorage &&
            typeof window.turnoStorage.guardarTurno === "function"
          ) {
            window.turnoStorage.guardarTurno(nuevoTurno);
          } else {
            console.warn("turnoStorage no está disponible");
          }

          // Ir a la pantalla de vehículo
          window.location.href = "03_vehicle.html";
        });
      }
    });
  } catch (err) {
    console.error("Error al cargar los lavados en el front", err);
  }
}

document.addEventListener("DOMContentLoaded", cargarLavados);
*/
// DATOS DE PRUEBA (mientras no haya BD ni API real)
const LAVADOS_DE_PRUEBA = [
  {
    id_lavado: 1,
    nombre: "Lavado simple",
    precio: 8000,
    imagen: "lavado1.jpg",
  },
  {
    id_lavado: 2,
    nombre: "Lavado + Detallado",
    precio: 14000,
    imagen: "lavado2.jpg",
  },
  {
    id_lavado: 3,
    nombre: "Servicio premium",
    precio: 22000,
    imagen: "lavado3.jpg",
  },
];

function cargarLavados() {
  const cards = [
    {
      img: document.getElementById("card1-img"),
      name: document.getElementById("card1-name"),
      price: document.getElementById("card1-price"),
      btn: document.getElementById("card1-cta"),
    },
    {
      img: document.getElementById("card2-img"),
      name: document.getElementById("card2-name"),
      price: document.getElementById("card2-price"),
      btn: document.getElementById("card2-cta"),
    },
    {
      img: document.getElementById("card3-img"),
      name: document.getElementById("card3-name"),
      price: document.getElementById("card3-price"),
      btn: document.getElementById("card3-cta"),
    },
  ];

  const RUTAS_BASE_IMAGENES = "../utils/";

  LAVADOS_DE_PRUEBA.slice(0, cards.length).forEach((lavado, index) => {
    const card = cards[index];
    if (!card) return;

    // Texto de la tarjeta
    card.name.textContent = lavado.nombre;
    card.price.textContent = `$ ${Number(lavado.precio).toLocaleString("es-AR")}`;

    // Imagen de fondo (opcional)
    const rutaImagen = RUTAS_BASE_IMAGENES + (lavado.imagen || "");
    card.img.style.backgroundImage = `url(${rutaImagen})`;
    card.img.style.backgroundSize = "cover";
    card.img.style.backgroundPosition = "center";

    // Habilitar botón Seleccionar y guardar turno al hacer clic
    if (card.btn) {
      card.btn.disabled = false;
      card.btn.addEventListener("click", () => {
        const nombreCliente = localStorage.getItem("nombre") || null;

        const turnoActual =
          window.turnoStorage && window.turnoStorage.leerTurno
            ? window.turnoStorage.leerTurno() || {}
            : {};

        const nuevoTurno = {
          ...turnoActual,
          nombreCliente,
          servicio: {
            id: lavado.id_lavado,
            nombre: lavado.nombre,
            precio_base: Number(lavado.precio),
          },
        };

        if (
          window.turnoStorage &&
          typeof window.turnoStorage.guardarTurno === "function"
        ) {
          window.turnoStorage.guardarTurno(nuevoTurno);
        } else {
          console.warn("turnoStorage no está disponible");
        }

        // Ir a la pantalla de vehículo
        window.location.href = "03_vehicle.html";
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", cargarLavados);
