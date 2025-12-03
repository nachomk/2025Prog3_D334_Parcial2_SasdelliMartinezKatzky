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

async function eliminarUsuario(req, res) {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query(
      'DELETE FROM usuarios WHERE id_usuario = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    return res.status(200).json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar usuario', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  listarUsuarios,
  eliminarUsuario
};