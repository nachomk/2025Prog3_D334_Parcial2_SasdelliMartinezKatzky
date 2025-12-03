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

// Marcar el botón activo del menú
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

// ==============================
// Funciones auxiliares para iconos
// ==============================

// Función auxiliar para crear icono de eliminar con FontAwesome
function crearIconoEliminar(id, tipo, callback) {
  const btn = document.createElement('button');
  btn.className = 'btn-icono btn-icono--eliminar';
  btn.setAttribute('aria-label', 'Eliminar');
  btn.innerHTML = '<i class="fas fa-trash-alt"></i>';
  btn.onclick = (e) => {
    e.stopPropagation();
    callback(id, tipo);
  };
  return btn;
}

// Función auxiliar para crear icono de agregar con FontAwesome
function crearIconoAgregar(callback) {
  const btn = document.createElement('button');
  btn.className = 'btn-icono btn-icono--agregar';
  btn.setAttribute('aria-label', 'Agregar nuevo');
  btn.innerHTML = '<i class="fas fa-plus"></i>';
  btn.onclick = (e) => {
    e.stopPropagation();
    callback();
  };
  return btn;
}

// Función genérica para eliminar registros
async function eliminarRegistro(id, tipo) {
  const nombres = {
    usuario: { singular: 'usuario', plural: 'usuarios', endpoint: 'usuarios' },
    servicio: { singular: 'servicio', plural: 'servicios', endpoint: 'lavados' },
    vehiculo: { singular: 'tipo de vehículo', plural: 'tipos de vehículo', endpoint: 'tipos-vehiculo' },
    venta: { singular: 'venta', plural: 'ventas', endpoint: 'ventas' }
  };
  
  const info = nombres[tipo];
  if (!info) return;
  
  const confirmar = confirm(`¿Estás seguro de que deseas eliminar este ${info.singular}? Esta acción no se puede deshacer.`);
  if (!confirmar) return;
  
  try {
    const res = await fetch(`${API_BASE}/api/${info.endpoint}/${id}`, {
      method: 'DELETE'
    });
    
    if (!res.ok) {
      // Verificar si la respuesta es JSON antes de intentar parsearla
      const contentType = res.headers.get('content-type');
      let errorMessage = `Error ${res.status}: ${res.statusText}`;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const error = await res.json();
          errorMessage = error.error || error.message || errorMessage;
        } catch (parseError) {
          console.error('Error al parsear respuesta JSON:', parseError);
        }
      } else {
        // Si no es JSON, leer como texto para debugging
        const textResponse = await res.text();
        console.error('Respuesta no JSON del servidor:', textResponse.substring(0, 200));
        errorMessage = `Error ${res.status}: El servidor no respondió con JSON válido`;
      }
      
      throw new Error(errorMessage);
    }
    
    // Intentar parsear la respuesta exitosa como JSON
    let responseData;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await res.json();
    }
    
    alert(`${info.singular.charAt(0).toUpperCase() + info.singular.slice(1)} eliminado correctamente`);
    
    // Recargar la lista correspondiente
    switch(tipo) {
      case 'usuario':
        await cargarClientes();
        break;
      case 'servicio':
        await cargarServicios();
        break;
      case 'vehiculo':
        await cargarTiposVehiculo();
        break;
      case 'venta':
        await cargarFacturacion();
        break;
    }
  } catch (err) {
    console.error(`Error al eliminar ${info.singular}:`, err);
    alert(`Error al eliminar ${info.singular}: ${err.message}`);
  }
}

// ==============================
// Cargar y mostrar USUARIOS
// ==============================
async function cargarClientes() {
  setTituloModulo("Usuarios");
  activarBotonMenu("m-usuarios");

  const acciones = document.getElementById("acciones-modulo");
  const lienzo = document.getElementById("lienzo-modulo");
  const placeholder = document.getElementById("placeholder-modulo");

  acciones.innerHTML = "";
  acciones.classList.remove("oculto");
  
  // Botón agregar usuario con FontAwesome
  const btnAgregar = document.createElement('button');
  btnAgregar.className = 'btn btn--primario';
  btnAgregar.innerHTML = '<i class="fas fa-plus"></i> Agregar usuario';
  btnAgregar.onclick = () => {
    // TODO: Implementar formulario para agregar usuario
    alert('Funcionalidad de agregar usuario pendiente de implementar');
  };
  acciones.appendChild(btnAgregar);
  
  // Ocultar placeholder ANTES de limpiar el lienzo
  if (placeholder) {
    placeholder.style.display = "none";
  }
  
  lienzo.innerHTML = "";

  try {
    console.log("🔄 Consultando /api/usuarios...");
    const res = await fetch(API_BASE + "/api/usuarios");
    
    console.log("📡 Respuesta recibida:", res.status, res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Error HTTP:", res.status, errorText);
      throw new Error("Error HTTP " + res.status);
    }

    const usuarios = await res.json();
    console.log("✅ Usuarios recibidos:", usuarios);

    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      lienzo.innerHTML =
        '<p class="listado__vacio">No hay usuarios registrados.</p>';
      return;
    }

    const tabla = document.createElement("table");
    tabla.className = "tabla";

    tabla.innerHTML = `
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Activo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = tabla.querySelector("tbody");

    usuarios.forEach(function (usuario) {
      const fila = document.createElement("tr");
      const celdaAcciones = document.createElement("td");
      celdaAcciones.className = "acciones-celda";
      
      const btnEliminar = crearIconoEliminar(usuario.id_usuario, 'usuario', eliminarRegistro);
      celdaAcciones.appendChild(btnEliminar);
      
      fila.innerHTML = `
        <td>${usuario.id_usuario}</td>
        <td>${usuario.nombre || "-"}</td>
        <td>${usuario.apellido || "-"}</td>
        <td>${usuario.email || "-"}</td>
        <td>${usuario.rol || "-"}</td>
        <td>${usuario.activo ? "Sí" : "No"}</td>
      `;
      fila.appendChild(celdaAcciones);
      tbody.appendChild(fila);
    });

    lienzo.appendChild(tabla);
    console.log("✅ Tabla de usuarios creada correctamente");
  } catch (err) {
    console.error("❌ Error al cargar usuarios en admin", err);
    lienzo.innerHTML =
      '<p class="mensaje--error">No se pudieron cargar los usuarios. Verifica que el servidor esté corriendo y que el endpoint /api/usuarios exista.</p>';
  }
}

// ==============================
// Cargar y mostrar SERVICIOS (tipos de lavado)
// ==============================
async function cargarServicios() {
  setTituloModulo("Servicios (Tipos de lavado)");
  activarBotonMenu("m-servicios");

  const acciones = document.getElementById("acciones-modulo");
  const lienzo = document.getElementById("lienzo-modulo");
  const placeholder = document.getElementById("placeholder-modulo");

  acciones.innerHTML = "";
  acciones.classList.remove("oculto");
  
  // Botón agregar servicio con FontAwesome
  const btnAgregar = document.createElement('button');
  btnAgregar.className = 'btn btn--primario';
  btnAgregar.id = 'btn-nuevo-servicio';
  btnAgregar.innerHTML = '<i class="fas fa-plus"></i> Nuevo servicio';
  acciones.appendChild(btnAgregar);

  // Ocultar placeholder ANTES de limpiar el lienzo
  if (placeholder) {
    placeholder.style.display = "none";
  }
  
  lienzo.innerHTML = "";

  try {
    console.log("🔄 Consultando /api/lavados...");
    const res = await fetch(API_BASE + "/api/lavados");
    
    console.log("📡 Respuesta recibida:", res.status, res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Error HTTP:", res.status, errorText);
      throw new Error("Error HTTP " + res.status);
    }

    const lavados = await res.json();
    console.log("✅ Lavados recibidos:", lavados);

    if (!Array.isArray(lavados) || lavados.length === 0) {
      lienzo.innerHTML =
        '<p class="listado__vacio">No hay servicios cargados.</p>';
      return;
    }

    const tabla = document.createElement("table");
    tabla.className = "tabla";

    tabla.innerHTML = `
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Imagen</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = tabla.querySelector("tbody");

    lavados.forEach(function (lav) {
      const fila = document.createElement("tr");
      const celdaAcciones = document.createElement("td");
      celdaAcciones.className = "acciones-celda";
      
      const btnEliminar = crearIconoEliminar(lav.id_lavado, 'servicio', eliminarRegistro);
      celdaAcciones.appendChild(btnEliminar);
      
      fila.innerHTML = `
        <td>${lav.id_lavado}</td>
        <td>${lav.nombre}</td>
        <td>$ ${Number(lav.precio).toLocaleString("es-AR")}</td>
        <td>${lav.imagen || "-"}</td>
      `;
      fila.appendChild(celdaAcciones);
      tbody.appendChild(fila);
    });

    lienzo.appendChild(tabla);
    console.log("✅ Tabla de servicios creada correctamente");
  } catch (err) {
    console.error("❌ Error al cargar servicios en admin", err);
    lienzo.innerHTML =
      '<p class="mensaje--error">No se pudieron cargar los servicios. Error: ' + err.message + '</p>';
  }
}

// ==============================
// Cargar y mostrar TIPOS DE VEHÍCULOS
// ==============================
async function cargarTiposVehiculo() {
  setTituloModulo("Tipos de vehículos");
  activarBotonMenu("m-vehiculos");

  const acciones = document.getElementById("acciones-modulo");
  const lienzo = document.getElementById("lienzo-modulo");
  const placeholder = document.getElementById("placeholder-modulo");

  acciones.innerHTML = "";
  acciones.classList.remove("oculto");
  
  // Botón agregar tipo de vehículo con FontAwesome
  const btnAgregar = document.createElement('button');
  btnAgregar.className = 'btn btn--primario';
  btnAgregar.innerHTML = '<i class="fas fa-plus"></i> Agregar tipo de vehículo';
  btnAgregar.onclick = () => {
    // TODO: Implementar formulario para agregar tipo de vehículo
    alert('Funcionalidad de agregar tipo de vehículo pendiente de implementar');
  };
  acciones.appendChild(btnAgregar);
  
  // Ocultar placeholder ANTES de limpiar el lienzo
  if (placeholder) {
    placeholder.style.display = "none";
  }
  
  lienzo.innerHTML = "";

  try {
    console.log("🔄 Consultando /api/tipos-vehiculo...");
    const res = await fetch(API_BASE + "/api/tipos-vehiculo");
    
    console.log("📡 Respuesta recibida:", res.status, res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Error HTTP:", res.status, errorText);
      throw new Error("Error HTTP " + res.status);
    }

    const tipos = await res.json();
    console.log("✅ Tipos de vehículo recibidos:", tipos);

    if (!Array.isArray(tipos) || tipos.length === 0) {
      lienzo.innerHTML =
        '<p class="listado__vacio">No hay tipos de vehículo cargados.</p>';
      return;
    }

    const tabla = document.createElement("table");
    tabla.className = "tabla";

    tabla.innerHTML = `
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Ajuste</th>
          <th>Imagen</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = tabla.querySelector("tbody");

    tipos.forEach(function (tipo) {
      const fila = document.createElement("tr");
      const celdaAcciones = document.createElement("td");
      celdaAcciones.className = "acciones-celda";
      
      const btnEliminar = crearIconoEliminar(tipo.id_tipo, 'vehiculo', eliminarRegistro);
      celdaAcciones.appendChild(btnEliminar);
      
      const ajusteTexto =
        tipo.ajuste === 0
          ? "Sin ajuste"
          : tipo.ajuste > 0
          ? `+$ ${tipo.ajuste.toLocaleString("es-AR")}`
          : `-$ ${Math.abs(tipo.ajuste).toLocaleString("es-AR")}`;

      fila.innerHTML = `
        <td>${tipo.id_tipo}</td>
        <td>${tipo.nombre}</td>
        <td>${ajusteTexto}</td>
        <td>${tipo.imagen || "-"}</td>
      `;
      fila.appendChild(celdaAcciones);
      tbody.appendChild(fila);
    });

    lienzo.appendChild(tabla);
    console.log("✅ Tabla de tipos de vehículo creada correctamente");
  } catch (err) {
    console.error("❌ Error al cargar tipos de vehículo en admin", err);
    lienzo.innerHTML =
      '<p class="mensaje--error">No se pudieron cargar los tipos de vehículo. Error: ' + err.message + '</p>';
  }
}

// ==============================
// Cargar y mostrar FACTURACIÓN (ventas)
// ==============================
async function cargarFacturacion() {
  setTituloModulo("Reg. facturación");
  activarBotonMenu("m-facturacion");

  const acciones = document.getElementById("acciones-modulo");
  const lienzo = document.getElementById("lienzo-modulo");
  const placeholder = document.getElementById("placeholder-modulo");

  acciones.innerHTML = "";
  acciones.classList.add("oculto");
  
  // Ocultar placeholder ANTES de limpiar el lienzo
  if (placeholder) {
    placeholder.style.display = "none";
  }
  
  lienzo.innerHTML = "";

  try {
    console.log("🔄 Consultando /api/ventas...");
    const res = await fetch(API_BASE + "/api/ventas");
    
    console.log("📡 Respuesta recibida:", res.status, res.statusText);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Error HTTP:", res.status, errorText);
      throw new Error("Error HTTP " + res.status);
    }

    const ventas = await res.json();
    console.log("✅ Ventas recibidas:", ventas);

    if (!Array.isArray(ventas) || ventas.length === 0) {
      lienzo.innerHTML =
        '<p class="listado__vacio">No hay ventas registradas.</p>';
      return;
    }

    const tabla = document.createElement("table");
    tabla.className = "tabla";

    tabla.innerHTML = `
      <thead>
        <tr>
          <th>ID</th>
          <th>Ticket</th>
          <th>Cliente</th>
          <th>Estado</th>
          <th>Total</th>
          <th>Método de pago</th>
          <th>Fecha</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = tabla.querySelector("tbody");

    ventas.forEach(function (venta) {
      const fila = document.createElement("tr");
      const celdaAcciones = document.createElement("td");
      celdaAcciones.className = "acciones-celda";
      
      const btnEliminar = crearIconoEliminar(venta.id_venta, 'venta', eliminarRegistro);
      celdaAcciones.appendChild(btnEliminar);
      
      const fecha = venta.fecha_creacion 
        ? new Date(venta.fecha_creacion).toLocaleString("es-AR")
        : "-";
      
      fila.innerHTML = `
        <td>${venta.id_venta}</td>
        <td>${venta.ticket || "-"}</td>
        <td>${venta.cliente_nombre || "-"}</td>
        <td>${venta.estado || "-"}</td>
        <td>$ ${Number(venta.total || 0).toLocaleString("es-AR")}</td>
        <td>${venta.metodo_pago || "-"}</td>
        <td>${fecha}</td>
      `;
      fila.appendChild(celdaAcciones);
      tbody.appendChild(fila);
    });

    lienzo.appendChild(tabla);
    console.log("✅ Tabla de ventas creada correctamente");
  } catch (err) {
    console.error("❌ Error al cargar facturación en admin", err);
    lienzo.innerHTML =
      '<p class="mensaje--error">No se pudieron cargar las ventas. Error: ' + err.message + '</p>';
  }
}

// ==============================
// Inicialización
// ==============================
document.addEventListener("DOMContentLoaded", function () {
  const admin = asegurarAdmin();
  if (!admin) return;

  const btnUsuarios = document.getElementById("m-usuarios");
  const btnServicios = document.getElementById("m-servicios");
  const btnVehiculos = document.getElementById("m-vehiculos");
  const btnFacturacion = document.getElementById("m-facturacion");

  if (btnUsuarios) {
    btnUsuarios.addEventListener("click", cargarClientes);
  }

  if (btnServicios) {
    btnServicios.addEventListener("click", cargarServicios);
  }

  if (btnVehiculos) {
    btnVehiculos.addEventListener("click", cargarTiposVehiculo);
  }

  if (btnFacturacion) {
    btnFacturacion.addEventListener("click", cargarFacturacion);
  }
});