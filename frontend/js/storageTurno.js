// Clave fija para guardar el turno en localStorage
const CLAVE_TURNO = "turno_actual";

// Estructura sugerida del turno:
// {
//   nombreCliente: string | null,
//   servicio: {
//     id: number | string,
//     nombre: string,
//     precio_base: number
//   },
//   vehiculo: {
//     patente: string,
//     id_tipo: number | string,
//     nombre_tipo: string,
//     ajuste: number // puede ser positivo (plus) o negativo (descuento)
//   },
//   total: number
// }

/**
 * Guarda el turno completo en localStorage.
 * turno: objeto con la estructura de arriba.
 */
function guardarTurno(turno) {
  localStorage.setItem(CLAVE_TURNO, JSON.stringify(turno));
}

/**
 * Lee el turno guardado en localStorage.
 * Devuelve el objeto o null si no hay nada.
 */
function leerTurno() {
  const raw = localStorage.getItem(CLAVE_TURNO);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error leyendo turno_actual de localStorage", e);
    return null;
  }
}

/**
 * Borra el turno guardado.
 */
function limpiarTurno() {
  localStorage.removeItem(CLAVE_TURNO);
}

// Exponer funciones en el objeto global para poder usarlas desde otros scripts
window.turnoStorage = {
  guardarTurno,
  leerTurno,
  limpiarTurno,
};
