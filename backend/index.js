const express = require('express');
const cors = require('cors');
const logRequest = require('./src/api/middlewares/logRequest');

const lavadosRoutes = require('./src/api/routes/lavadosRoutes');
const tiposVehiculoRoutes = require("./src/api/routes/tiposVehiculoRoutes"); 
const clientesRoutes = require('./src/api/routes/clientesRoutes');
const autosRoutes = require('./src/api/routes/autosRoutes');
const ventasRoutes = require('./src/api/routes/ventasRoutes');
const authRoutes = require('./src/api/routes/authRoutes');
const usuariosRoutes = require('./src/api/routes/usuariosRoutes');


const app = express();
const PORT = 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(logRequest);

// Rutas propias
app.use('/api/lavados', lavadosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/autos', autosRoutes);
app.use("/api/tipos-vehiculo", tiposVehiculoRoutes); 
app.use('/api/ventas', ventasRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', authRoutes);

// Middleware para manejar rutas no encontradas (debe ir al final)
app.use((req, res, next) => {
  console.log(`⚠️  Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    method: req.method,
    path: req.originalUrl,
    message: `La ruta ${req.method} ${req.originalUrl} no existe`
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

app.listen(PORT, () => {
    console.log(`✅ Servidor escuchando en el puerto ${PORT}`);
    console.log(`📋 Rutas disponibles:`);
    console.log(`   GET    /api/usuarios`);
    console.log(`   POST   /api/usuarios`);
    console.log(`   PUT    /api/usuarios/:id`);
    console.log(`   DELETE /api/usuarios/:id`);
    console.log(`   GET    /api/lavados`);
    console.log(`   POST   /api/lavados`);
    console.log(`   PUT    /api/lavados/:id`);
    console.log(`   DELETE /api/lavados/:id`);
    console.log(`   GET    /api/tipos-vehiculo`);
    console.log(`   POST   /api/tipos-vehiculo`);
    console.log(`   PUT    /api/tipos-vehiculo/:id`);
    console.log(`   DELETE /api/tipos-vehiculo/:id`);
});