function logRequests(req, res, next) {
    const mensaje = [`${ new Date().toISOString()} ${req.method} ${req.originalUrl}`];

    console.log(mensaje);

    next();
}

module.exports = logRequests;