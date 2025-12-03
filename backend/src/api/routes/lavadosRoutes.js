const express = require('express');
const { obtenerLavados, crearLavado } = require('../controllers/lavadosController');
const validateLavado = require('../middlewares/validateLavado');

const router = express.Router();

// Obtener todos los lavados de auto disponibles
router.get('/', obtenerLavados);

// Crear un nuevo lavado de auto con validaciones
router.post('/', validateLavado, crearLavado);

module.exports = router;