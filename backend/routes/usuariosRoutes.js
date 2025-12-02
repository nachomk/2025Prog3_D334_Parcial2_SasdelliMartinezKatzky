const express = require('express');
const { listarUsuarios } = require('../controllers/usuariosController');

const router = express.Router();

// Obtener todos los usuarios
router.get('/', listarUsuarios);

module.exports = router;