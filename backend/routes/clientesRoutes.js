const express = require('express');
const { crearCliente, listarClientes } = require('../controllers/clientesController');
const validateCliente = require('../middlewares/validateCliente');

const router = express.Router();

// Obtener todos los clientes
router.get('/', listarClientes);

// Registrar un nuevo cliente con validaciones
router.post('/', validateCliente, crearCliente);

module.exports = router