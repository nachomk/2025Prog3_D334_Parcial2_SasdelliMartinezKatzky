const pool = require('../db/pool');

// ============================
// Funciones de ayuda internas
// ============================

function calcularTotal(items) {
    let total = 0;

    for (const item of items) {
        const cantidad = Number(item.cantidad) || 0;
        const precio = Number(item.precioUnitario) || 0;
        total = total + (cantidad * precio);
    }

    return total;
}

function formatearTicket(puntoVenta, numero) {
    const numeroStr = String(numero).padStart(8, '0'); // 00000057
    return `${puntoVenta}-${numeroStr}`;               // 0001-00000057
}

/**
 * Lee y actualiza la secuencia para un punto de venta dentro de UNA transacción.
 * IMPORTANTE: usa la misma connection que la transacción de la venta.
 */
async function obtenerSiguienteTicket(connection, puntoVenta) {
    const selectSql = `
        SELECT ultimo_numero 
        FROM secuencias_comprobantes 
        WHERE punto_venta = ? 
        FOR UPDATE
    `;

    const [rows] = await connection.query(selectSql, [puntoVenta]);

    if (rows.length === 0) {
        throw new Error('Punto de venta no encontrado en secuencias_comprobantes');
    }

    const ultimo = rows[0].ultimo_numero;
    const nuevo = ultimo + 1;

    const updateSql = `
        UPDATE secuencias_comprobantes
        SET ultimo_numero = ?
        WHERE punto_venta = ?
    `;
    await connection.query(updateSql, [nuevo, puntoVenta]);

    const ticket = formatearTicket(puntoVenta, nuevo);
    return ticket;
}

// ============================
// Controller principal
// ============================

/**
 * POST /api/ventas
 * 
 * Espera en req.body algo como:
 * {
 *   "clienteNombre": "Hernán",
 *   "estado": "accepted" | "rejected",
 *   "metodoPago": "efectivo",
 *   "motivoRechazo": "tarjeta rechazada",   // solo si estado = rejected
 *   "items": [
 *     {
 *       "productoId": 1,
 *       "titulo": "Lavado Full",
 *       "cantidad": 1,
 *       "precioUnitario": 12000
 *     },
 *     ...
 *   ]
 * }
 */
async function registrarVenta(req, res) {
    const {
        clienteNombre,
        estado,
        metodoPago,
        motivoRechazo,
        items
    } = req.body;

    // ============================
    // Validaciones básicas
    // ============================

    if (!clienteNombre || typeof clienteNombre !== 'string') {
        return res.status(400).json({ error: 'clienteNombre es obligatorio' });
    }

    if (estado !== 'accepted' && estado !== 'rejected') {
        return res.status(400).json({ error: 'estado debe ser accepted o rejected' });
    }

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'La venta debe tener al menos un ítem' });
    }

    let motivoRechazoFinal = motivoRechazo || null;
    if (estado === 'rejected' && (!motivoRechazoFinal || motivoRechazoFinal.trim() === '')) {
        motivoRechazoFinal = 'N/D';
    }

    // ============================
    // Calcular total
    // ============================

    const total = calcularTotal(items);

    // ============================
    // Transacción en MySQL
    // ============================

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const PUNTO_VENTA = '0001';
        let ticket = null;

        // Solo generamos ticket si la venta fue aceptada
        if (estado === 'accepted') {
            ticket = await obtenerSiguienteTicket(connection, PUNTO_VENTA);
        }

        // Insert en tabla ventas
        const insertVentaSql = `
            INSERT INTO ventas
                (ticket, cliente_nombre, estado, total, metodo_pago, motivo_rechazo)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [resultVenta] = await connection.query(insertVentaSql, [
            ticket,
            clienteNombre,
            estado,
            total,
            metodoPago || null,
            motivoRechazoFinal
        ]);

        const idVenta = resultVenta.insertId;

        const insertDetalleSql = `
            INSERT INTO detalle_venta
                (id_venta, producto_id, titulo, cantidad, precio_unitario, subtotal)
            VALUES ?
        `;

        const valuesDetalle = items.map((item) => {
            const cantidad = Number(item.cantidad) || 0;
            const precio = Number(item.precioUnitario) || 0;
            const subtotal = cantidad * precio;

            return [
                idVenta,
                item.productoId || null,
                item.titulo,
                cantidad,
                precio,
                subtotal
            ];
        });

        await connection.query(insertDetalleSql, [valuesDetalle]);

       
        await connection.commit();

        const fechaCreacion = new Date();

        return res.status(201).json({
            ok: true,
            venta: {
                id_venta: idVenta,
                ticket: ticket,         
                estado: estado,
                total: total,
                cliente_nombre: clienteNombre,
                metodo_pago: metodoPago || null,
                motivo_rechazo: motivoRechazoFinal,
                fecha_creacion: fechaCreacion
            }
        });
    } catch (error) {
        console.error('Error al registrar la venta:', error);
        await connection.rollback();
        return res.status(500).json({ error: 'Error interno al registrar la venta' });
    } finally {
        connection.release();
    }
}

// Listar todas las ventas
async function listarVentas(req, res) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          v.id_venta,
          v.ticket,
          v.cliente_nombre,
          v.estado,
          v.total,
          v.metodo_pago,
          v.motivo_rechazo,
          v.fecha_creacion
        FROM ventas v
        ORDER BY v.fecha_creacion DESC
      `);
      
      return res.status(200).json(rows);
    } catch (err) {
      console.error('Error al listar las ventas', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async function eliminarVenta(req, res) {
    try {
      const { id } = req.params;
      const connection = await pool.getConnection();
      
      try {
        await connection.beginTransaction();
        
        // Primero eliminar el detalle
        await connection.query(
          'DELETE FROM detalle_venta WHERE id_venta = ?',
          [id]
        );
        
        // Luego eliminar la venta
        const [result] = await connection.query(
          'DELETE FROM ventas WHERE id_venta = ?',
          [id]
        );
        
        if (result.affectedRows === 0) {
          await connection.rollback();
          return res.status(404).json({ error: 'Venta no encontrada' });
        }
        
        await connection.commit();
        return res.status(200).json({ message: 'Venta eliminada correctamente' });
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    } catch (err) {
      console.error('Error al eliminar venta', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

module.exports = {
    registrarVenta,
    listarVentas,
    eliminarVenta
};
