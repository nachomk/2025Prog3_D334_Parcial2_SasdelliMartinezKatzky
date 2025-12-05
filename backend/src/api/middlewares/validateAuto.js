function validateAuto(req, res, next) {
    const { patente, anio, modelo, id_cliente } = req.body;

    // Datos necesarios para la creación de un auto
    if(!patente || !anio || !modelo || !id_cliente) {
        return res.status(400).json({
            error: 'Faltan datos obligatorios del cliente: patente, anio, modelo o id_cliente.'
        })
    };

    // Validación del año del auto
    if(typeof anio !== 'number' || isNaN(anio) || anio <= 1950 || anio >= 2100) {
        return res.status(400).json({
            error: 'El año debe ser un número valido.'
        })
    };

    // Validación del id_cliente
    if(typeof id_cliente !== 'number' || isNaN(id_cliente) || id_cliente <= 0) {
        return res.status(400).json({
            error: 'El formato del id_cliente no es valido.'
        })
    };

    next();
}

module.exports = validateAuto;