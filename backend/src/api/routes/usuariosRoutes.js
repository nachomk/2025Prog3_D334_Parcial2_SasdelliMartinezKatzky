const express = require('express');
const { listarUsuarios, eliminarUsuario } = require('../controllers/usuariosController');

const router = express.Router();

// Obtener todos los usuarios
router.get('/', listarUsuarios);

// Eliminar un usuario
router.delete('/:id', eliminarUsuario);

module.exports = router;