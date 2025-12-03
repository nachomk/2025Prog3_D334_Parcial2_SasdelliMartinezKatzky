const express = require("express");
const router = express.Router();

const {
  listarTiposVehiculo,
  eliminarTipoVehiculo
} = require("../controllers/tiposVehiculoController");

// Obtener todos los tipos de vehciulos disponibles
router.get("/", listarTiposVehiculo);

// Eliminar un tipo de laavdo
router.delete("/:id", eliminarTipoVehiculo);

module.exports = router;
