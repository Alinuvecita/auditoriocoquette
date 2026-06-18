const express = require("express");
const pool = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const includeAll = req.query.all === "true";
    const query = includeAll
      ? `SELECT * FROM eventos ORDER BY fecha ASC, hora ASC`
      : `SELECT * FROM eventos WHERE estado = 'activo' ORDER BY fecha ASC, hora ASC`;

    const result = await pool.query(query);
    res.json({ ok: true, events: result.rows });
  } catch (error) {
    console.error("Error listando eventos:", error);
    res.status(500).json({ ok: false, message: "No se pudieron cargar los eventos" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM eventos WHERE id = $1", [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Evento no encontrado" });
    }

    res.json({ ok: true, event: result.rows[0] });
  } catch (error) {
    console.error("Error obteniendo evento:", error);
    res.status(500).json({ ok: false, message: "No se pudo cargar el evento" });
  }
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { titulo, descripcion, fecha, hora, lugar, precio, cupos_disponibles, imagen, estado } = req.body;

    if (!titulo || !fecha || !hora || !lugar || precio === undefined || cupos_disponibles === undefined) {
      return res.status(400).json({ ok: false, message: "Faltan datos obligatorios del evento" });
    }

    const result = await pool.query(
      `INSERT INTO eventos (titulo, descripcion, fecha, hora, lugar, precio, cupos_disponibles, imagen, estado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        titulo,
        descripcion || "",
        fecha,
        hora,
        lugar,
        Number(precio),
        Number(cupos_disponibles),
        imagen || "",
        estado || "activo"
      ]
    );

    res.status(201).json({ ok: true, message: "Evento creado correctamente", event: result.rows[0] });
  } catch (error) {
    console.error("Error creando evento:", error);
    res.status(500).json({ ok: false, message: "No se pudo crear el evento" });
  }
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { titulo, descripcion, fecha, hora, lugar, precio, cupos_disponibles, imagen, estado } = req.body;

    const result = await pool.query(
      `UPDATE eventos
       SET titulo = $1,
           descripcion = $2,
           fecha = $3,
           hora = $4,
           lugar = $5,
           precio = $6,
           cupos_disponibles = $7,
           imagen = $8,
           estado = $9,
           actualizado_en = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        titulo,
        descripcion || "",
        fecha,
        hora,
        lugar,
        Number(precio),
        Number(cupos_disponibles),
        imagen || "",
        estado || "activo",
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Evento no encontrado" });
    }

    res.json({ ok: true, message: "Evento actualizado correctamente", event: result.rows[0] });
  } catch (error) {
    console.error("Error actualizando evento:", error);
    res.status(500).json({ ok: false, message: "No se pudo actualizar el evento" });
  }
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM eventos WHERE id = $1 RETURNING *", [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Evento no encontrado" });
    }

    res.json({ ok: true, message: "Evento eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando evento:", error);
    res.status(500).json({ ok: false, message: "No se pudo eliminar. Revisa si tiene boletos asociados." });
  }
});

module.exports = router;
