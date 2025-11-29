const express = require('express');
const cors = require('cors');

const lavadosRoutes = require('./routes/lavadosRoutes');

const app = express();

const PORT = 3000;

app.use(cors());
app.use(express.json());


app.use('/api/lavados', lavadosRoutes)

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`)
});