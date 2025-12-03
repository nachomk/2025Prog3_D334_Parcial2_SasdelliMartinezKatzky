// pool de conexiones proveniente de la base de datos
const pool = require('../db/pool');

// Obtener los lavados de autos disponibles en la BD
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

// Crear un nuevo lavado de auto
async function crearLavado(req, res) {
    try {
        const { nombre, precio, imagen } = req.body;

        const [resultado] = await pool.query(
            'INSERT INTO tipos_lavado (nombre, precio, imagen) VALUES (?, ?, ?)',
            [nombre, precio, imagen]
        );

        const nuevoLavado = {
            id_lavado: resultado.insertId,
            nombre,
            precio,
            imagen
        };

        res.status(201).json(nuevoLavado)
    } catch(err) {
        console.error('Error al crear un nuevo lavado', err);
        res.status(500).json({ error: 'Error interno del servido' });
    }
}

async function eliminarLavado(req, res) {
    try {
      const { id } = req.params;
      
      const [result] = await pool.query(
        'DELETE FROM tipos_lavado WHERE id_lavado = ?',
        [id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Lavado no encontrado' });
      }
      
      return res.status(200).json({ message: 'Lavado eliminado correctamente' });
    } catch (err) {
      console.error('Error al eliminar lavado', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

module.exports = {
    obtenerLavados,
    crearLavado,
    eliminarLavado
};