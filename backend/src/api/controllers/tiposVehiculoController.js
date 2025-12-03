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

module.exports = {
  listarTiposVehiculo,
};