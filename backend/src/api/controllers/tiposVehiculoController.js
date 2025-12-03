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

module.exports = {
  listarTiposVehiculo,
  eliminarTipoVehiculo
};