const pool = require('../db/pool');

// Listar todos los usuarios
async function listarUsuarios(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id_usuario, nombre, apellido, email, rol, activo FROM usuarios'
    );
    
    return res.status(200).json(rows);
  } catch (err) {
    console.error('Error al listar los usuarios', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  listarUsuarios
};