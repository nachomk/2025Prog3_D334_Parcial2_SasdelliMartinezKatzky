const express = require('express');
const { crearAuto, listarAutos } = require('../controllers/autosController');
const validateAuto = require('../middlewares/validateAuto');

const router = express.Router();

// Obtener todos los autos
router.get('/', listarAutos);

// Registrar un nuevo vehiculo con validaciones
router.post('/', validateAuto, crearAuto);

module.exports = router;