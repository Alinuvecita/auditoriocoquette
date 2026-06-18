const express = require("express");
const crypto = require("crypto");

const pool = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

function generarFolio() {
  return "AUD-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

router.post("/buy", requireAuth, async (req, res) => {
  const client = await pool.connect();

  try {
    const { evento_id, cantidad, metodo_pago } = req.body;
    const cantidadNum = Number(cantidad || 1);

    if (!evento_id || cantidadNum < 1) {
      return res.status(400).json({ ok: false, message: "Evento y cantidad válida son obligatorios" });
    }

    await client.query("BEGIN");

    const eventResult = await client.query(
      "SELECT * FROM eventos WHERE id = $1 AND estado = 'activo' FOR UPDATE",
      [evento_id]
    );

    if (eventResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ ok: false, message: "Evento no disponible" });
    }

    const event = eventResult.rows[0];

    if (event.cupos_disponibles < cantidadNum) {
      await client.query("ROLLBACK");
      return res.status(400).json({ ok: false, message: "No hay cupos suficientes" });
    }

    const total = Number(event.precio) * cantidadNum;
    const folio = generarFolio();

    await client.query(
      "UPDATE eventos SET cupos_disponibles = cupos_disponibles - $1 WHERE id = $2",
      [cantidadNum, evento_id]
    );

    const ticketResult = await client.query(
      `INSERT INTO boletos (usuario_id, evento_id, folio, cantidad, total, metodo_pago, estado)
       VALUES ($1,$2,$3,$4,$5,$6,'pagado_simulado')
       RETURNING *`,
      [
        req.user.id,
        evento_id,
        folio,
        cantidadNum,
        total,
        metodo_pago || "tarjeta_simulada"
      ]
    );

    await client.query("COMMIT");

    res.status(201).json({
      ok: true,
      message: "Boleto comprado correctamente con pago simulado",
      ticket: ticketResult.rows[0]
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error comprando boleto:", error);
    res.status(500).json({ ok: false, message: "No se pudo comprar el boleto" });
  } finally {
    client.release();
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, e.titulo, e.fecha, e.hora, e.lugar
       FROM boletos b
       INNER JOIN eventos e ON e.id = b.evento_id
       WHERE b.usuario_id = $1
       ORDER BY b.fecha_compra DESC`,
      [req.user.id]
    );

    res.json({ ok: true, tickets: result.rows });
  } catch (error) {
    console.error("Error en historial:", error);
    res.status(500).json({ ok: false, message: "No se pudo cargar el historial" });
  }
});

router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.nombre AS usuario_nombre, u.correo, e.titulo AS evento_titulo
       FROM boletos b
       INNER JOIN usuarios u ON u.id = b.usuario_id
       INNER JOIN eventos e ON e.id = b.evento_id
       ORDER BY b.fecha_compra DESC`
    );

    res.json({ ok: true, tickets: result.rows });
  } catch (error) {
    console.error("Error listando boletos:", error);
    res.status(500).json({ ok: false, message: "No se pudieron cargar los boletos" });
  }
});

module.exports = router;
