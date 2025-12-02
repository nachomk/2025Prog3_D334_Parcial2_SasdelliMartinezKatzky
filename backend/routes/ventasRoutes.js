// backend/routes/ventasRoutes.js

const express = require('express');
const { registrarVenta, listarVentas } = require('../controllers/ventasController');

const router = express.Router();

// Obtener todas las ventas
router.get('/', listarVentas);

// Registrar una nueva venta (aceptada o rechazada)
router.post('/', registrarVenta);

module.exports = router;
