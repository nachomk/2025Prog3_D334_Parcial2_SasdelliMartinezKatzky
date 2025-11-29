const express = require('express');

const { obtenerLavados } = require('../controllers/lavadosController');

const router = express.Router();

router.get('/', obtenerLavados);

module.exports = router;