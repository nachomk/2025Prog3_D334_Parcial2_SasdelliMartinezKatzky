const express = require("express");
const router = express.Router();

const {
  listarTiposVehiculo,
} = require("../controllers/tiposVehiculoController");


router.get("/", listarTiposVehiculo);

module.exports = router;
