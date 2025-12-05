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
  async function actualizarLavado(req, res) {
    try {
      const { id } = req.params;
      const { nombre, precio, imagen } = req.body;
  
      // Verificar que el lavado existe
      const [lavadoExistente] = await pool.query(
        'SELECT id_lavado FROM tipos_lavado WHERE id_lavado = ?',
        [id]
      );
  
      if (lavadoExistente.length === 0) {
        return res.status(404).json({ error: 'Lavado no encontrado' });
      }
  
      // Validaciones básicas
      if (!nombre || precio === undefined || precio === null) {
        return res.status(400).json({ 
          error: 'Faltan datos obligatorios: nombre y precio son requeridos.' 
        });
      }
  
      // Validar que precio sea un número válido
      const precioNumero = Number(precio);
      if (isNaN(precioNumero) || precioNumero < 0) {
        return res.status(400).json({ 
          error: 'El precio debe ser un número mayor o igual a 0.' 
        });
      }
  
      // Actualizar lavado
      await pool.query(
        'UPDATE tipos_lavado SET nombre = ?, precio = ?, imagen = ? WHERE id_lavado = ?',
        [nombre, precioNumero, imagen || null, id]
      );
  
      // Obtener el lavado actualizado
      const [lavadoActualizado] = await pool.query(
        'SELECT id_lavado, nombre, precio, imagen FROM tipos_lavado WHERE id_lavado = ?',
        [id]
      );
  
      return res.status(200).json(lavadoActualizado[0]);
    } catch (err) {
      console.error('Error al actualizar lavado', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
  
  module.exports = {
      obtenerLavados,
      crearLavado,
      actualizarLavado,
      eliminarLavado
  };