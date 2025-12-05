const express = require("express");
const router = express.Router();

const {
  listarTiposVehiculo,
  crearTipoVehiculo,
  actualizarTipoVehiculo,
  eliminarTipoVehiculo
} = require("../controllers/tiposVehiculoController");

// Obtener todos los tipos de vehículos disponibles
router.get("/", listarTiposVehiculo);

// Crear un nuevo tipo de vehículo
router.post("/", crearTipoVehiculo);

// Actualizar un tipo de vehículo
router.put("/:id", actualizarTipoVehiculo);

// Eliminar un tipo de vehículo
router.delete("/:id", eliminarTipoVehiculo);

module.exports = router;
