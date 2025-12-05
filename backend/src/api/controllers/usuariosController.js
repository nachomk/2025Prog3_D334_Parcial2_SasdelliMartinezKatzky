const pool = require('../db/pool');
const bcrypt = require('bcryptjs');

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

// Crear un nuevo usuario
async function crearUsuario(req, res) {
  try {
    const { nombre, apellido, email, password, rol, activo } = req.body;

    // Validaciones básicas
    if (!nombre || !apellido || !email || !password) {
      return res.status(400).json({ 
        error: 'Faltan datos obligatorios: nombre, apellido, email y password son requeridos.' 
      });
    }

    // Validar email único
    const [existentes] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE email = ?',
      [email]
    );

    if (existentes.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Asegurar que el rol tenga un valor por defecto si no se proporciona
    const rolFinal = rol && rol.trim() !== '' ? rol.trim().toUpperCase() : 'CLIENTE';

    // Hash de la contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insertar usuario
    const [resultado] = await pool.query(
      'INSERT INTO usuarios (nombre, apellido, email, password_hash, rol, activo) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, apellido, email, password_hash, rolFinal, activo !== undefined ? activo : true]
    );

    // Obtener el usuario recién creado para asegurar que tenemos todos los datos
    const [usuarioCreado] = await pool.query(
      'SELECT id_usuario, nombre, apellido, email, rol, activo FROM usuarios WHERE id_usuario = ?',
      [resultado.insertId]
    );

    return res.status(201).json(usuarioCreado[0]);
  } catch (err) {
    console.error('Error al crear usuario', err);
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
async function actualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, password, rol, activo } = req.body;

    // Verificar que el usuario existe
    const [usuarioExistente] = await pool.query(
      'SELECT id_usuario, email FROM usuarios WHERE id_usuario = ?',
      [id]
    );

    if (usuarioExistente.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validaciones básicas
    if (!nombre || !apellido || !email) {
      return res.status(400).json({ 
        error: 'Faltan datos obligatorios: nombre, apellido y email son requeridos.' 
      });
    }

    // Validar email único (excepto el mismo usuario)
    const [existentes] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario != ?',
      [email, id]
    );

    if (existentes.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado por otro usuario' });
    }

    // Asegurar que el rol tenga un valor válido
    const rolFinal = rol && rol.trim() !== '' ? rol.trim().toUpperCase() : 'CLIENTE';

    // Si se proporciona password, hashearlo
    let password_hash = null;
    if (password && password.trim() !== '') {
      const saltRounds = 10;
      password_hash = await bcrypt.hash(password, saltRounds);
    }

    // Construir la consulta UPDATE dinámicamente
    let updateQuery = 'UPDATE usuarios SET nombre = ?, apellido = ?, email = ?, rol = ?, activo = ?';
    let updateParams = [nombre, apellido, email, rolFinal, activo !== undefined ? activo : true];

    if (password_hash) {
      updateQuery += ', password_hash = ?';
      updateParams.push(password_hash);
    }

    updateQuery += ' WHERE id_usuario = ?';
    updateParams.push(id);

    await pool.query(updateQuery, updateParams);

    // Obtener el usuario actualizado
    const [usuarioActualizado] = await pool.query(
      'SELECT id_usuario, nombre, apellido, email, rol, activo FROM usuarios WHERE id_usuario = ?',
      [id]
    );

    return res.status(200).json(usuarioActualizado[0]);
  } catch (err) {
    console.error('Error al actualizar usuario', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
};