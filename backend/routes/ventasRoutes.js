// backend/routes/ventasRoutes.js

const express = require('express');
const { registrarVenta } = require('../controllers/ventasController');

const router = express.Router();

// Registrar una nueva venta (aceptada o rechazada)
router.post('/', registrarVenta);

module.exports = router;
