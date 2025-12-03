// backend/routes/ventasRoutes.js

const express = require('express');
const { registrarVenta, listarVentas, eliminarVenta } = require('../controllers/ventasController');

const router = express.Router();

// Obtener todas las ventas
router.get('/', listarVentas);

// Registrar una nueva venta (aceptada o rechazada)
router.post('/', registrarVenta);

// Eliminar una venta
router.delete('/:id', eliminarVenta);


module.exports = router;
