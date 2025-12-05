const express = require('express');
const { listarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } = require('../controllers/usuariosController');

const router = express.Router();

// Obtener todos los usuarios
router.get('/', listarUsuarios);

// Crear un nuevo usuario
router.post('/', crearUsuario);

// Actualizar un usuario
router.put('/:id', actualizarUsuario);

// Eliminar un usuario
router.delete('/:id', eliminarUsuario);

module.exports = router;