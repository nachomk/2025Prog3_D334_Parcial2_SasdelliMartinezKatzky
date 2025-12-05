const pool = require('../db/pool');

async function crearCliente(req, res) {
    try {
        const { nombre, apellido, telefono } = req.body;

        const [resultado] = await pool.query(
            'INSERT INTO clientes (nombre, apellido, telefono) VALUES (?, ?, ?)',
            [nombre, apellido, telefono]
        );

        const nuevoCliente = {
            id_cliente: resultado.insertId,
            nombre,
            apellido,
            telefono
        };

        res.status(201).json(nuevoCliente);
    } catch (err) {
        console.error('Error al crear un nuevo cliente', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}

async function listarClientes(req, res) {
    try {
        const [rows] = await pool.query(
            'SELECT id_cliente, nombre, apellido, telefono FROM clientes'
        );
        
        return res.status(200).json(rows);

    } catch (err) {
        console.error('Error al listar los clientes', err);
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}

module.exports = {
    crearCliente,
    listarClientes
};