const pool = require('../db/pool');

async function obtenerLavados(req, res) {
    try {

        const [rows] = await pool.query(
            'SELECT id_lavado, nombre, precio, imagen FROM tipos_lavado'
        );

        res.json(rows);
    } catch (err) {
        console.error("Error al obtener los lavados", err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = {
    obtenerLavados
};