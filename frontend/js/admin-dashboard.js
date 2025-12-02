const API_BASE = "http://localhost:3000";

// Leer admin desde localStorage (guardado en el login)
function obtenerAdminActual() {
  const raw = localStorage.getItem("ADMIN_USUARIO");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error leyendo ADMIN_USUARIO de localStorage", e);
    return null;
  }
}


function asegurarAdmin() {
  const admin = obtenerAdminActual();

  if (!admin || admin.rol !== "ADMIN") {
    window.location.href = "01_login.html";
    return null;
  }

  return admin;
}

function setTituloModulo(texto) {
  const titulo = document.getElementById("titulo-modulo");
  if (titulo) {
    titulo.textContent = texto;
  }
}

//karcar el boton activo del menu
function activarBotonMenu(idBoton) {
  const botones = document.querySelectorAll(".sidebar .btn");
  botones.forEach(function (btn) {
    btn.classList.remove("btn--primario");
  });

  const activo = document.getElementById(idBoton);
  if (activo) {
    activo.classList.add("btn--primario");
  }
}

// Cargar y mostrar servicios (tipos de lavado) en la pantalla principal
async function cargarServicios() {
  setTituloModulo("Servicios (Tipos de lavado)");
  activarBotonMenu("m-servicios");

  const acciones = document.getElementById("acciones-modulo");
  const lienzo = document.getElementById("lienzo-modulo");
  const placeholder = document.getElementById("placeholder-modulo");

  // Acciones (por ahora solo "Nuevo servicio" a futuro)
  acciones.innerHTML = "";
  acciones.classList.remove("oculto");
  acciones.insertAdjacentHTML(
    "beforeend",
    '<button class="btn btn--primario" id="btn-nuevo-servicio">Nuevo servicio</button>'
  );

  // Limpiar lienzo
  placeholder.style.display = "none";
  lienzo.innerHTML = "";

  try {
    const res = await fetch(API_BASE + "/api/lavados");
    if (!res.ok) {
      throw new Error("Error HTTP " + res.status);
    }

    const lavados = await res.json();

    // Si no hay datos
    if (!Array.isArray(lavados) || lavados.length === 0) {
      lienzo.innerHTML =
        '<p class="listado__vacio">No hay servicios cargados.</p>';
      return;
    }

    // Crear tabla básica
    const tabla = document.createElement("table");
    tabla.className = "tabla"; // si no existe la clase, igual se ve como tabla básica

    tabla.innerHTML = `
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Imagen</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = tabla.querySelector("tbody");

    lavados.forEach(function (lav) {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${lav.id_lavado}</td>
        <td>${lav.nombre}</td>
        <td>$ ${Number(lav.precio).toFixed(2)}</td>
        <td>${lav.imagen || "-"}</td>
      `;
      tbody.appendChild(fila);
    });

    lienzo.appendChild(tabla);
  } catch (err) {
    console.error("Error al cargar servicios en admin", err);
    lienzo.innerHTML =
      '<p class="mensaje--error">No se pudieron cargar los servicios.</p>';
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const admin = asegurarAdmin();
  if (!admin) return; // si no hay admin, ya redirigí al login

  const btnUsuarios = document.getElementById("m-usuarios");
  const btnServicios = document.getElementById("m-servicios");
  const btnVehiculos = document.getElementById("m-vehiculos");
  const btnFacturacion = document.getElementById("m-facturacion");

  // Por ahora, solo implementamos Servicios.
  if (btnServicios) {
    btnServicios.addEventListener("click", cargarServicios);
  }

  // El resto queda “en construcción” por ahora
  if (btnUsuarios) {
    btnUsuarios.addEventListener("click", function () {
      setTituloModulo("Usuarios");
      activarBotonMenu("m-usuarios");
      const acciones = document.getElementById("acciones-modulo");
      const lienzo = document.getElementById("lienzo-modulo");
      const placeholder = document.getElementById("placeholder-modulo");

      acciones.classList.add("oculto");
      acciones.innerHTML = "";
      placeholder.style.display = "none";
      lienzo.innerHTML =
        '<p class="listado__vacio">Módulo Usuarios en construcción.</p>';
    });
  }

  if (btnVehiculos) {
    btnVehiculos.addEventListener("click", function () {
      setTituloModulo("Tipos de vehículos");
      activarBotonMenu("m-vehiculos");
      const acciones = document.getElementById("acciones-modulo");
      const lienzo = document.getElementById("lienzo-modulo");
      const placeholder = document.getElementById("placeholder-modulo");

      acciones.classList.add("oculto");
      acciones.innerHTML = "";
      placeholder.style.display = "none";
      lienzo.innerHTML =
        '<p class="listado__vacio">Módulo Vehículos en construcción.</p>';
    });
  }

  if (btnFacturacion) {
    btnFacturacion.addEventListener("click", function () {
      setTituloModulo("Reg. facturación");
      activarBotonMenu("m-facturacion");
      const acciones = document.getElementById("acciones-modulo");
      const lienzo = document.getElementById("lienzo-modulo");
      const placeholder = document.getElementById("placeholder-modulo");

      acciones.classList.add("oculto");
      acciones.innerHTML = "";
      placeholder.style.display = "none";
      lienzo.innerHTML =
        '<p class="listado__vacio">Módulo Ventas en construcción.</p>';
    });
  }
});