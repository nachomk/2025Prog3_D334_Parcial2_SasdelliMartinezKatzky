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
app.use('/api/ventas', ventasRoutes); //http://localhost:3000/api/ventas
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', authRoutes); //http://localhost:3000/api/auth/login




app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
});