const express = require('express');
const { obtenerLavados, crearLavado, actualizarLavado, eliminarLavado } = require('../controllers/lavadosController');
const validateLavado = require('../middlewares/validateLavado');

const router = express.Router();

// Obtener todos los lavados de auto disponibles
router.get('/', obtenerLavados);

// Crear un nuevo lavado de auto con validaciones
router.post('/', validateLavado, crearLavado);

// Actualizar un lavado
router.put('/:id', actualizarLavado);

// Eliminar un tipo de lavado
router.delete('/:id', eliminarLavado);

module.exports = router;