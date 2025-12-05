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
  
  const url = `${API_BASE}/api/${info.endpoint}/${id}`;
  console.log(`🗑️  Intentando eliminar ${info.singular} con ID ${id} desde: ${url}`);
  
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📡 Respuesta recibida: ${res.status} ${res.statusText}`);
    console.log(`📋 Headers:`, Object.fromEntries(res.headers.entries()));
    
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
        console.error('Respuesta no JSON del servidor:', textResponse.substring(0, 500));
        errorMessage = `Error ${res.status}: El servidor no respondió con JSON válido. Verifica la consola para más detalles.`;
      }
      
      throw new Error(errorMessage);
    }
    
    // Intentar parsear la respuesta exitosa como JSON
    let responseData;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await res.json();
      console.log('✅ Respuesta exitosa:', responseData);
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
    console.error(`❌ Error al eliminar ${info.singular}:`, err);
    alert(`Error al eliminar ${info.singular}: ${err.message}`);
  }
}

// ==============================
// Funciones para formularios modales
// ==============================

// Función para crear y mostrar un modal
function crearModal(titulo, contenidoHTML, onConfirm, onCancel) {
  // Remover modal existente si hay
  const modalExistente = document.getElementById('modal-formulario');
  if (modalExistente) {
    modalExistente.remove();
  }

  const modal = document.createElement('div');
  modal.id = 'modal-formulario';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-contenido">
      <div class="modal-header">
        <h2>${titulo}</h2>
        <button class="modal-cerrar" aria-label="Cerrar">&times;</button>
      </div>
      <div class="modal-body">
        ${contenidoHTML}
      </div>
      <div class="modal-footer">
        <button class="btn btn--fantasma btn-cancelar">Cancelar</button>
        <button class="btn btn--primario btn-confirmar">Guardar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listeners
  const btnCerrar = modal.querySelector('.modal-cerrar');
  const btnCancelar = modal.querySelector('.btn-cancelar');
  const btnConfirmar = modal.querySelector('.btn-confirmar');

  const cerrarModal = () => {
    modal.remove();
    if (onCancel) onCancel();
  };

  btnCerrar.addEventListener('click', cerrarModal);
  btnCancelar.addEventListener('click', cerrarModal);
  btnConfirmar.addEventListener('click', () => {
    if (onConfirm) {
      onConfirm();
    }
  });

  // Cerrar al hacer click fuera del modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      cerrarModal();
    }
  });

  return modal;
}

// Función para mostrar formulario de nuevo usuario
function mostrarFormularioUsuario() {
  const contenido = `
    <form id="form-usuario" class="form-modal">
      <div class="form-group">
        <label for="usuario-nombre">Nombre *</label>
        <input type="text" id="usuario-nombre" name="nombre" required>
      </div>
      <div class="form-group">
        <label for="usuario-apellido">Apellido *</label>
        <input type="text" id="usuario-apellido" name="apellido" required>
      </div>
      <div class="form-group">
        <label for="usuario-email">Email *</label>
        <input type="email" id="usuario-email" name="email" required>
      </div>
      <div class="form-group">
        <label for="usuario-password">Contraseña *</label>
        <input type="password" id="usuario-password" name="password" required minlength="6">
      </div>
      <div class="form-group">
        <label for="usuario-rol">Rol *</label>
        <select id="usuario-rol" name="rol" required>
          <option value="CLIENTE">CLIENTE</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" id="usuario-activo" name="activo" checked>
          Usuario activo
        </label>
      </div>
    </form>
  `;

  crearModal('Nuevo Usuario', contenido, async () => {
    const form = document.getElementById('form-usuario');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    
    const datos = {
      nombre: formData.get('nombre'),
      apellido: formData.get('apellido'),
      email: formData.get('email'),
      password: formData.get('password'),
      rol: formData.get('rol'),
      activo: document.getElementById('usuario-activo').checked
    };

    const url = `${API_BASE}/api/usuarios`;
    console.log(`➕ Intentando crear usuario:`, { ...datos, password: '***' });
    console.log(`📡 URL: ${url}`);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`📡 Respuesta recibida: ${res.status} ${res.statusText}`);
      console.log(`📋 Headers:`, Object.fromEntries(res.headers.entries()));

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
          console.error('Respuesta no JSON del servidor:', textResponse.substring(0, 500));
          errorMessage = `Error ${res.status}: El servidor no respondió con JSON válido. Verifica la consola para más detalles.`;
        }
        
        throw new Error(errorMessage);
      }

      // Intentar parsear la respuesta exitosa como JSON
      let nuevoUsuario;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        nuevoUsuario = await res.json();
        console.log('✅ Usuario creado exitosamente:', nuevoUsuario);
      } else {
        console.warn('⚠️ Respuesta exitosa pero no es JSON');
      }

      alert('Usuario creado correctamente');
      document.getElementById('modal-formulario')?.remove();
      await cargarClientes();
    } catch (err) {
      console.error('❌ Error al crear usuario:', err);
      alert(`Error al crear usuario: ${err.message}`);
    }
  });
}

// Función para mostrar formulario de nuevo servicio
function mostrarFormularioServicio() {
  const contenido = `
    <form id="form-servicio" class="form-modal">
      <div class="form-group">
        <label for="servicio-nombre">Nombre *</label>
        <input type="text" id="servicio-nombre" name="nombre" required>
      </div>
      <div class="form-group">
        <label for="servicio-precio">Precio *</label>
        <input type="number" id="servicio-precio" name="precio" required min="0" step="0.01">
      </div>
      <div class="form-group">
        <label for="servicio-imagen">Imagen (ruta o URL)</label>
        <input type="text" id="servicio-imagen" name="imagen" placeholder="Ej: lavado_simple.jpg">
      </div>
    </form>
  `;

  crearModal('Nuevo Servicio', contenido, async () => {
    const form = document.getElementById('form-servicio');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    
    const datos = {
      nombre: formData.get('nombre'),
      precio: Number(formData.get('precio')),
      imagen: formData.get('imagen') || null
    };

    const url = `${API_BASE}/api/lavados`;
    console.log(`➕ Intentando crear servicio:`, datos);
    console.log(`📡 URL: ${url}`);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`📡 Respuesta recibida: ${res.status} ${res.statusText}`);
      console.log(`📋 Headers:`, Object.fromEntries(res.headers.entries()));

      if (!res.ok) {
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
          const textResponse = await res.text();
          console.error('Respuesta no JSON del servidor:', textResponse.substring(0, 500));
          errorMessage = `Error ${res.status}: El servidor no respondió con JSON válido. Verifica la consola para más detalles.`;
        }
        
        throw new Error(errorMessage);
      }

      let nuevoServicio;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        nuevoServicio = await res.json();
        console.log('✅ Servicio creado exitosamente:', nuevoServicio);
      }

      alert('Servicio creado correctamente');
      document.getElementById('modal-formulario')?.remove();
      await cargarServicios();
    } catch (err) {
      console.error('❌ Error al crear servicio:', err);
      alert(`Error al crear servicio: ${err.message}`);
    }
  });
}

// Función para mostrar formulario de nuevo tipo de vehículo
function mostrarFormularioTipoVehiculo() {
  const contenido = `
    <form id="form-vehiculo" class="form-modal">
      <div class="form-group">
        <label for="vehiculo-nombre">Nombre *</label>
        <input type="text" id="vehiculo-nombre" name="nombre" required>
      </div>
      <div class="form-group">
        <label for="vehiculo-ajuste">Ajuste de precio</label>
        <input type="number" id="vehiculo-ajuste" name="ajuste" value="0" step="0.01">
        <small>Valor positivo aumenta el precio, negativo lo disminuye</small>
      </div>
      <div class="form-group">
        <label for="vehiculo-imagen">Imagen (ruta o URL)</label>
        <input type="text" id="vehiculo-imagen" name="imagen" placeholder="Ej: vehiculo_sedan.jpg">
      </div>
    </form>
  `;

  crearModal('Nuevo Tipo de Vehículo', contenido, async () => {
    const form = document.getElementById('form-vehiculo');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    
    const datos = {
      nombre: formData.get('nombre'),
      ajuste: formData.get('ajuste') ? Number(formData.get('ajuste')) : 0,
      imagen: formData.get('imagen') || null
    };

    const url = `${API_BASE}/api/tipos-vehiculo`;
    console.log(`➕ Intentando crear tipo de vehículo:`, datos);
    console.log(`📡 URL: ${url}`);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });

      console.log(`📡 Respuesta recibida: ${res.status} ${res.statusText}`);
      console.log(`📋 Headers:`, Object.fromEntries(res.headers.entries()));

      if (!res.ok) {
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
          const textResponse = await res.text();
          console.error('Respuesta no JSON del servidor:', textResponse.substring(0, 500));
          errorMessage = `Error ${res.status}: El servidor no respondió con JSON válido. Verifica la consola para más detalles.`;
        }
        
        throw new Error(errorMessage);
      }

      let nuevoTipo;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        nuevoTipo = await res.json();
        console.log('✅ Tipo de vehículo creado exitosamente:', nuevoTipo);
      }

      alert('Tipo de vehículo creado correctamente');
      document.getElementById('modal-formulario')?.remove();
      await cargarTiposVehiculo();
    } catch (err) {
      console.error('❌ Error al crear tipo de vehículo:', err);
      alert(`Error al crear tipo de vehículo: ${err.message}`);
    }
  });
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
  btnAgregar.onclick = mostrarFormularioUsuario;
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
      
      const btnEditar = crearIconoEditar(usuario.id_usuario, 'usuario', usuario, mostrarFormularioEditarUsuario);
      const btnEliminar = crearIconoEliminar(usuario.id_usuario, 'usuario', eliminarRegistro);
      
      celdaAcciones.appendChild(btnEditar);
      celdaAcciones.appendChild(btnEliminar);
      
      // Asegurar que el rol se muestre correctamente
      const rolMostrar = usuario.rol && usuario.rol.trim() !== '' ? usuario.rol : 'CLIENTE';
      
      fila.innerHTML = `
        <td>${usuario.id_usuario}</td>
        <td>${usuario.nombre || "-"}</td>
        <td>${usuario.apellido || "-"}</td>
        <td>${usuario.email || "-"}</td>
        <td>${rolMostrar}</td>
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
  btnAgregar.onclick = mostrarFormularioServicio;
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
      
      const btnEditar = crearIconoEditar(lav.id_lavado, 'servicio', lav, mostrarFormularioEditarServicio);
      const btnEliminar = crearIconoEliminar(lav.id_lavado, 'servicio', eliminarRegistro);
      
      celdaAcciones.appendChild(btnEditar);
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
  btnAgregar.onclick = mostrarFormularioTipoVehiculo;
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
      
      const btnEditar = crearIconoEditar(tipo.id_tipo, 'vehiculo', tipo, mostrarFormularioEditarTipoVehiculo);
      const btnEliminar = crearIconoEliminar(tipo.id_tipo, 'vehiculo', eliminarRegistro);
      
      celdaAcciones.appendChild(btnEditar);
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

function crearIconoEditar(id, tipo, datos, callback) {
  const btn = document.createElement('button');
  btn.className = 'btn-icono btn-icono--editar';
  btn.setAttribute('aria-label', 'Editar');
  btn.innerHTML = '<i class="fas fa-edit"></i>';
  btn.onclick = (e) => {
    e.stopPropagation();
    callback(id, tipo, datos);
  };
  return btn;
}

async function actualizarRegistro(id, tipo, datos) {
  const nombres = {
    usuario: { singular: 'usuario', plural: 'usuarios', endpoint: 'usuarios' },
    servicio: { singular: 'servicio', plural: 'servicios', endpoint: 'lavados' },
    vehiculo: { singular: 'tipo de vehículo', plural: 'tipos de vehículo', endpoint: 'tipos-vehiculo' }
  };
  
  const info = nombres[tipo];
  if (!info) return;
  
  const url = `${API_BASE}/api/${info.endpoint}/${id}`;
  console.log(`✏️  Intentando actualizar ${info.singular} con ID ${id}:`, datos);
  console.log(`📡 URL: ${url}`);
  
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    });
    
    console.log(`📡 Respuesta recibida: ${res.status} ${res.statusText}`);
    console.log(`📋 Headers:`, Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
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
        const textResponse = await res.text();
        console.error('Respuesta no JSON del servidor:', textResponse.substring(0, 500));
        errorMessage = `Error ${res.status}: El servidor no respondió con JSON válido. Verifica la consola para más detalles.`;
      }
      
      throw new Error(errorMessage);
    }
    
    let responseData;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await res.json();
      console.log('✅ Registro actualizado exitosamente:', responseData);
    }
    
    alert(`${info.singular.charAt(0).toUpperCase() + info.singular.slice(1)} actualizado correctamente`);
    
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
    }
  } catch (err) {
    console.error(`❌ Error al actualizar ${info.singular}:`, err);
    alert(`Error al actualizar ${info.singular}: ${err.message}`);
  }
}

function mostrarFormularioEditarUsuario(id, usuario) {
  // Escapar valores para evitar problemas con comillas en el HTML
  const escapar = (str) => (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  
  const contenido = `
    <form id="form-usuario-editar" class="form-modal">
      <div class="form-group">
        <label for="usuario-editar-nombre">Nombre *</label>
        <input type="text" id="usuario-editar-nombre" name="nombre" value="${escapar(usuario.nombre)}" required>
      </div>
      <div class="form-group">
        <label for="usuario-editar-apellido">Apellido *</label>
        <input type="text" id="usuario-editar-apellido" name="apellido" value="${escapar(usuario.apellido)}" required>
      </div>
      <div class="form-group">
        <label for="usuario-editar-email">Email *</label>
        <input type="email" id="usuario-editar-email" name="email" value="${escapar(usuario.email)}" required>
      </div>
      <div class="form-group">
        <label for="usuario-editar-password">Contraseña (dejar vacío para no cambiar)</label>
        <input type="password" id="usuario-editar-password" name="password" minlength="6">
      </div>
      <div class="form-group">
        <label for="usuario-editar-rol">Rol *</label>
        <select id="usuario-editar-rol" name="rol" required>
          <option value="CLIENTE" ${usuario.rol === 'CLIENTE' ? 'selected' : ''}>CLIENTE</option>
          <option value="ADMIN" ${usuario.rol === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
        </select>
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" id="usuario-editar-activo" name="activo" ${usuario.activo ? 'checked' : ''}>
          Usuario activo
        </label>
      </div>
    </form>
  `;

  crearModal('Editar Usuario', contenido, async () => {
    const form = document.getElementById('form-usuario-editar');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    
    const datos = {
      nombre: formData.get('nombre'),
      apellido: formData.get('apellido'),
      email: formData.get('email'),
      rol: formData.get('rol'),
      activo: document.getElementById('usuario-editar-activo').checked
    };

    // Solo incluir password si se proporcionó
    const password = formData.get('password');
    if (password && password.trim() !== '') {
      datos.password = password;
    }

    await actualizarRegistro(id, 'usuario', datos);
    document.getElementById('modal-formulario')?.remove();
  });
}

// Función para mostrar formulario de edición de servicio
function mostrarFormularioEditarServicio(id, servicio) {
  const escapar = (str) => (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  
  const contenido = `
    <form id="form-servicio-editar" class="form-modal">
      <div class="form-group">
        <label for="servicio-editar-nombre">Nombre *</label>
        <input type="text" id="servicio-editar-nombre" name="nombre" value="${escapar(servicio.nombre)}" required>
      </div>
      <div class="form-group">
        <label for="servicio-editar-precio">Precio *</label>
        <input type="number" id="servicio-editar-precio" name="precio" value="${servicio.precio || 0}" required min="0" step="0.01">
      </div>
      <div class="form-group">
        <label for="servicio-editar-imagen">Imagen (ruta o URL)</label>
        <input type="text" id="servicio-editar-imagen" name="imagen" value="${escapar(servicio.imagen)}" placeholder="Ej: lavado_simple.jpg">
      </div>
    </form>
  `;

  crearModal('Editar Servicio', contenido, async () => {
    const form = document.getElementById('form-servicio-editar');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    
    const datos = {
      nombre: formData.get('nombre'),
      precio: Number(formData.get('precio')),
      imagen: formData.get('imagen') || null
    };

    await actualizarRegistro(id, 'servicio', datos);
    document.getElementById('modal-formulario')?.remove();
  });
}

// Función para mostrar formulario de edición de tipo de vehículo
function mostrarFormularioEditarTipoVehiculo(id, tipo) {
  const escapar = (str) => (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  
  const contenido = `
    <form id="form-vehiculo-editar" class="form-modal">
      <div class="form-group">
        <label for="vehiculo-editar-nombre">Nombre *</label>
        <input type="text" id="vehiculo-editar-nombre" name="nombre" value="${escapar(tipo.nombre)}" required>
      </div>
      <div class="form-group">
        <label for="vehiculo-editar-ajuste">Ajuste de precio</label>
        <input type="number" id="vehiculo-editar-ajuste" name="ajuste" value="${tipo.ajuste || 0}" step="0.01">
        <small>Valor positivo aumenta el precio, negativo lo disminuye</small>
      </div>
      <div class="form-group">
        <label for="vehiculo-editar-imagen">Imagen (ruta o URL)</label>
        <input type="text" id="vehiculo-editar-imagen" name="imagen" value="${escapar(tipo.imagen)}" placeholder="Ej: vehiculo_sedan.jpg">
      </div>
    </form>
  `;

  crearModal('Editar Tipo de Vehículo', contenido, async () => {
    const form = document.getElementById('form-vehiculo-editar');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    
    const datos = {
      nombre: formData.get('nombre'),
      ajuste: formData.get('ajuste') ? Number(formData.get('ajuste')) : 0,
      imagen: formData.get('imagen') || null
    };

    await actualizarRegistro(id, 'vehiculo', datos);
    document.getElementById('modal-formulario')?.remove();
  });
}