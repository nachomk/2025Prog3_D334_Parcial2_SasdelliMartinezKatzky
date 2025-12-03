// backend/routes/authRoutes.js

const express = require('express');
const { loginAdmin } = require('../controllers/authController');

const router = express.Router();

// NO se llama loginAdmin(), se pasa la función como handler
router.post('/login', loginAdmin);

module.exports = router;
