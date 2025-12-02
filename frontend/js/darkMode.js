const THEME_KEY = 'saMaKa-theme';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

// Función para obtener el tema actual
function obtenerTemaActual() {
  const temaGuardado = localStorage.getItem(THEME_KEY);
  if (temaGuardado) {
    return temaGuardado;
  }
  return THEME_LIGHT;
}

// Función para aplicar el tema
function aplicarTema(tema) {
  const html = document.documentElement;
  if (tema === THEME_DARK) {
    html.setAttribute('data-theme', THEME_DARK);
  } else {
    html.removeAttribute('data-theme');
  }
  localStorage.setItem(THEME_KEY, tema);
  actualizarTextoBoton();
}

// Función para cambiar el tema
function cambiarTema() {
  const temaActual = obtenerTemaActual();
  const nuevoTema = temaActual === THEME_DARK ? THEME_LIGHT : THEME_DARK;
  aplicarTema(nuevoTema);
}

// Función para actualizar el texto del botón
function actualizarTextoBoton() {
  const botones = document.querySelectorAll('[data-toggle-theme]');
  const temaActual = obtenerTemaActual();
  
  botones.forEach(boton => {
    if (temaActual === THEME_DARK) {
      boton.textContent = 'Modo Claro';
      boton.setAttribute('aria-label', 'Cambiar a modo claro');
    } else {
      boton.textContent = 'Modo Oscuro';
      boton.setAttribute('aria-label', 'Cambiar a modo oscuro');
    }
  });
}

// Aplicar el tema inmediatamente (antes de que cargue el DOM) para evitar parpadeo
const temaInicial = obtenerTemaActual();
if (temaInicial === THEME_DARK) {
  document.documentElement.setAttribute('data-theme', THEME_DARK);
} else {
  document.documentElement.removeAttribute('data-theme');
}

// Usar delegación de eventos como método principal (funciona incluso si el botón se carga después)
document.addEventListener('click', (event) => {
  const boton = event.target.closest('[data-toggle-theme]');
  if (boton) {
    event.preventDefault();
    event.stopPropagation();
    cambiarTema();
  }
});

// Función para inicializar el tema
function inicializarTema() {
  const tema = obtenerTemaActual();
  aplicarTema(tema);
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarTema);
} else {
  inicializarTema();
}

// Reintentar después de un tiempo para asegurar que el header se cargó (para include.js)
setTimeout(() => {
  actualizarTextoBoton();
}, 800);

// Exportar funciones para uso global
window.darkMode = {
  cambiar: cambiarTema,
  obtener: obtenerTemaActual,
  aplicar: aplicarTema
};