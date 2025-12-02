// backend/controllers/authController.js

const pool = require('../db/pool');
const bcrypt = require('bcryptjs');

// POST /api/auth/login
async function loginAdmin(req, res) {
  const { email, password } = req.body;

  //Validacion basica
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  try {
    // Buscamos el usuario por email
    const [rows] = await pool.query(
      'SELECT id_usuario, nombre, apellido, email, password_hash, rol, activo FROM usuarios WHERE email = ? LIMIT 1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const usuario = rows[0];

    // Verificar que este activo
    if (!usuario.activo) {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    // Comparar contraseña enviada con el hash
    const coincide = await bcrypt.compare(password, usuario.password_hash);

    if (!coincide) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    //Sacar el hash antes de devolver
    const { password_hash, ...usuarioSinPassword } = usuario;

    // Respuesta true
    return res.json({
      ok: true,
      usuario: usuarioSinPassword,
    });

  } catch (err) {
    console.error('Error en loginAdmin', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  loginAdmin,
};
/*EXPORTAMOS el obejeto con la propiedad login admin, todo NODE se maneja en modulos*/
//esto permite que pueda usarlo en otro arhivo