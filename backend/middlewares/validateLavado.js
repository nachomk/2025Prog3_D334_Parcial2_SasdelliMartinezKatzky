function validateLavado(req, res, next) {
    const { nombre, precio, imagen } = req.body;

    // Datos necesarios para la creación de un nuevo tipo de lavado
    if(!nombre || !precio || !imagen) {
        return res.json(400).json({
            error: 'Faltan datos obligatorios: nombre, precio o imagen.'
        })
    }

    // Validación del precio de un lavado
    if(typeof precio !== 'number' || isNaN(precio) || precio <= 0) {
        return res.status(400).json({
            error: 'El precio debe ser un número mayor o igual a 0.'
        })
    }

    next();
}

module.exports = validateLavado;