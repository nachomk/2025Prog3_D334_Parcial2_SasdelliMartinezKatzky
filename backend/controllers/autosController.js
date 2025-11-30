const pool = require('../db/pool');

async function crearAuto(req, res) {
    try {
        const { patente, anio, modelo, id_cliente } = req.body;
        
        // primero verificamos que exista el cliente antes de crear el auto
        const [clientes] = await pool.query(
            'SELECT id_cliente FROM clientes WHERE id_cliente = ?',
            [id_cliente]
        );

        if(clientes.length === 0) {
            return res.status(404).json({
                error: 'El cliente especificado no existe'
            });
        }

        const [resultado] = await pool.query(
            'INSERT INTO autos (patente, anio, modelo, id_cliente) VALUES (?, ?, ?, ?)',
            [patente, anio, modelo, id_cliente]
        );

        const nuevoAuto = {
            id_auto: resultado.insertId,
            patente,
            anio,
            modelo,
            id_cliente
        };

        res.status(201).json(nuevoAuto);
    } catch(err) {
        console.error('Error al crear un nuevo auto', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function listarAutos(req, res) {
    try {
        const [rows] = await pool.query(
            `SELECT
                a.id_auto,
                a.patente,
                a.anio,
                a.modelo,
                a.id_cliente,
                c.nombre AS nombre_cliente,
                c.apellido AS apellido_cliente
            FROM autos a
            INNER JOIN clientes c ON a.id_cliente = c.id_cliente`
        );

        res.json(rows);
    } catch(err) {
        console.error('Error al listar todos los autos', err);
        res.stauts(500).json({ error: 'Error interno del servidor' });
    }
}

module.exports = {
    crearAuto,
    listarAutos
};