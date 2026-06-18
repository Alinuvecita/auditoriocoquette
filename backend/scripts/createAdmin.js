require("dotenv").config();

const bcrypt = require("bcryptjs");
const pool = require("../db");

async function createAdmin() {
  try {
    const nombre = process.env.ADMIN_NAME || "Admin Auditorio";
    const correo = (process.env.ADMIN_EMAIL || "admin@uni.edu").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "Admin123*";

    const exists = await pool.query("SELECT id FROM usuarios WHERE correo = $1", [correo]);

    const passwordHash = await bcrypt.hash(password, 10);

    if (exists.rows.length > 0) {
      await pool.query(
        `UPDATE usuarios
         SET nombre = $1, password_hash = $2, rol = 'admin', verificado = true
         WHERE correo = $3`,
        [nombre, passwordHash, correo]
      );
      console.log("Admin actualizado correctamente:", correo);
    } else {
      await pool.query(
        `INSERT INTO usuarios (nombre, correo, password_hash, rol, verificado)
         VALUES ($1, $2, $3, 'admin', true)`,
        [nombre, correo, passwordHash]
      );
      console.log("Admin creado correctamente:", correo);
    }
  } catch (error) {
    console.error("No se pudo crear el admin:", error);
  } finally {
    await pool.end();
  }
}

createAdmin();
