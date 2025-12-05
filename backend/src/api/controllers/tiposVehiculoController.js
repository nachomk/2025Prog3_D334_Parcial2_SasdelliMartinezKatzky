const pool = require("../db/pool");

// Devuelve el listado de tipos de vehículo desde la BD
async function listarTiposVehiculo(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT id_tipo, nombre, ajuste, imagen FROM tipos_vehiculo"
    );

    res.json(rows);
  } catch (error) {
    console.error("Error al obtener tipos de vehículo:", error);
    res.status(500).json({
      mensaje: "Error interno al obtener tipos de vehículo",
    });
  }
}

// Crear un nuevo tipo de vehículo
async function crearTipoVehiculo(req, res) {
  try {
    const { nombre, ajuste, imagen } = req.body;

    // Validaciones básicas
    if (!nombre) {
      return res.status(400).json({ 
        error: 'El nombre es obligatorio' 
      });
    }

    // Validar que ajuste sea un número si se proporciona
    const ajusteNumero = ajuste !== undefined && ajuste !== null 
      ? Number(ajuste) 
      : 0;

    if (isNaN(ajusteNumero)) {
      return res.status(400).json({ 
        error: 'El ajuste debe ser un número válido' 
      });
    }

    // Insertar tipo de vehículo
    const [resultado] = await pool.query(
      'INSERT INTO tipos_vehiculo (nombre, ajuste, imagen) VALUES (?, ?, ?)',
      [nombre, ajusteNumero, imagen || null]
    );

    const nuevoTipo = {
      id_tipo: resultado.insertId,
      nombre,
      ajuste: ajusteNumero,
      imagen: imagen || null
    };

    return res.status(201).json(nuevoTipo);
  } catch (err) {
    console.error('Error al crear tipo de vehículo', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function eliminarTipoVehiculo(req, res) {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query(
      'DELETE FROM tipos_vehiculo WHERE id_tipo = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tipo de vehículo no encontrado' });
    }
    
    return res.status(200).json({ message: 'Tipo de vehículo eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar tipo de vehículo', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

async function actualizarTipoVehiculo(req, res) {
  try {
    const { id } = req.params;
    const { nombre, ajuste, imagen } = req.body;

    // Verificar que el tipo de vehículo existe
    const [tipoExistente] = await pool.query(
      'SELECT id_tipo FROM tipos_vehiculo WHERE id_tipo = ?',
      [id]
    );

    if (tipoExistente.length === 0) {
      return res.status(404).json({ error: 'Tipo de vehículo no encontrado' });
    }

    // Validaciones básicas
    if (!nombre) {
      return res.status(400).json({ 
        error: 'El nombre es obligatorio' 
      });
    }

    // Validar que ajuste sea un número si se proporciona
    const ajusteNumero = ajuste !== undefined && ajuste !== null 
      ? Number(ajuste) 
      : 0;

    if (isNaN(ajusteNumero)) {
      return res.status(400).json({ 
        error: 'El ajuste debe ser un número válido' 
      });
    }

    // Actualizar tipo de vehículo
    await pool.query(
      'UPDATE tipos_vehiculo SET nombre = ?, ajuste = ?, imagen = ? WHERE id_tipo = ?',
      [nombre, ajusteNumero, imagen || null, id]
    );

    // Obtener el tipo de vehículo actualizado
    const [tipoActualizado] = await pool.query(
      'SELECT id_tipo, nombre, ajuste, imagen FROM tipos_vehiculo WHERE id_tipo = ?',
      [id]
    );

    return res.status(200).json(tipoActualizado[0]);
  } catch (err) {
    console.error('Error al actualizar tipo de vehículo', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

module.exports = {
  listarTiposVehiculo,
  crearTipoVehiculo,
  actualizarTipoVehiculo,
  eliminarTipoVehiculo
};