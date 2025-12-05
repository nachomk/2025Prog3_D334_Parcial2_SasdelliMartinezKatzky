function validateCliente(req, res, next) {
    const { nombre, apellido, telefono } = req.body;

    // Datos necesarios para la creación de un cliente
    if(!nombre || !apellido || !telefono) {
        return res.status(400).json({
            error: 'Faltan valores obligatorios del cliente: nombre, apellido o telefono.'
        })
    };

    // Validación del número de telefono
    if(typeof telefono !== 'string' || telefono.trim() === '') {
        return res.status(400).json({
            error: 'El formato del número de telefono es incorrecto o invalido.'
        })
    };

    next();
}

module.exports = validateCliente;