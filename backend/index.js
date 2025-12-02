const express = require('express');
const cors = require('cors');
const logRequest = require('./middlewares/logRequest');

const lavadosRoutes = require('./routes/lavadosRoutes');
const tiposVehiculoRoutes = require("./routes/tiposVehiculoRoutes"); 
const clientesRoutes = require('./routes/clientesRoutes');
const autosRoutes = require('./routes/autosRoutes');

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

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
});