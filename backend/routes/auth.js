const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const pool = require("../db");
const { requireAuth } = require("../middleware/auth");
const { sendMail } = require("../utils/mailer");

const router = express.Router();

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function buildJwt(user) {
  return jwt.sign(
    {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol
    },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({ ok: false, message: "Nombre, correo y contraseña son obligatorios" });
    }

    if (password.length < 6) {
      return res.status(400).json({ ok: false, message: "La contraseña debe tener mínimo 6 caracteres" });
    }

    const correoNormalizado = correo.trim().toLowerCase();

    const exists = await pool.query("SELECT id FROM usuarios WHERE correo = $1", [correoNormalizado]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ ok: false, message: "Ese correo ya está registrado" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = generateToken();

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, correo, password_hash, rol, verificado, token_verificacion)
       VALUES ($1, $2, $3, 'usuario', false, $4)
       RETURNING id, nombre, correo, rol, verificado`,
      [nombre.trim(), correoNormalizado, passwordHash, verificationToken]
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://127.0.0.1:5500/frontend";
    const verifyLink = `${frontendUrl}/verificar.html?token=${verificationToken}`;

    await sendMail({
      to: correoNormalizado,
      subject: "Verifica tu cuenta - Auditorio Coquette 🎀",
      html: `
        <div style="font-family:Arial,sans-serif;background:#fff0f6;padding:24px;border-radius:18px;color:#5b2741;">
          <h2>🎀 Bienvenida/o a Auditorio Coquette</h2>
          <p>Hola ${nombre}, gracias por registrarte.</p>
          <p>Para activar tu cuenta, presiona este botón:</p>
          <p>
            <a href="${verifyLink}" style="display:inline-block;background:#ff7eb6;color:white;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:bold;">
              Verificar mi cuenta
            </a>
          </p>
          <p>Si el botón no funciona, copia este enlace:</p>
          <p>${verifyLink}</p>
        </div>
      `
    });

    res.status(201).json({
      ok: true,
      message: "Registro exitoso. Revisa tu correo para verificar tu cuenta.",
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ ok: false, message: "No se pudo registrar el usuario" });
  }
});

router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const result = await pool.query(
      `UPDATE usuarios
       SET verificado = true, token_verificacion = NULL
       WHERE token_verificacion = $1
       RETURNING id, nombre, correo, verificado`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ ok: false, message: "Token de verificación inválido o ya utilizado" });
    }

    res.json({ ok: true, message: "Cuenta verificada correctamente. Ya puedes iniciar sesión." });
  } catch (error) {
    console.error("Error en verificación:", error);
    res.status(500).json({ ok: false, message: "No se pudo verificar la cuenta" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ ok: false, message: "Correo y contraseña son obligatorios" });
    }

    const correoNormalizado = correo.trim().toLowerCase();

    const result = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [correoNormalizado]);
    if (result.rows.length === 0) {
      return res.status(401).json({ ok: false, message: "Credenciales incorrectas" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ ok: false, message: "Credenciales incorrectas" });
    }

    if (!user.verificado) {
      return res.status(403).json({ ok: false, message: "Primero verifica tu correo para activar la cuenta" });
    }

    const token = buildJwt(user);

    res.json({
      ok: true,
      message: "Inicio de sesión correcto",
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ ok: false, message: "No se pudo iniciar sesión" });
  }
});

router.post("/forgot", async (req, res) => {
  try {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({ ok: false, message: "El correo es obligatorio" });
    }

    const correoNormalizado = correo.trim().toLowerCase();
    const resetToken = generateToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    const result = await pool.query(
      `UPDATE usuarios
       SET token_recuperacion = $1, token_recuperacion_expira = $2
       WHERE correo = $3
       RETURNING id, nombre, correo`,
      [resetToken, expiresAt, correoNormalizado]
    );

    // Respuesta genérica para no revelar si el correo existe.
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const frontendUrl = process.env.FRONTEND_URL || "http://127.0.0.1:5500/frontend";
      const resetLink = `${frontendUrl}/restablecer.html?token=${resetToken}`;

      await sendMail({
        to: user.correo,
        subject: "Recupera tu contraseña - Auditorio Coquette 🎀",
        html: `
          <div style="font-family:Arial,sans-serif;background:#fff0f6;padding:24px;border-radius:18px;color:#5b2741;">
            <h2>🔐 Recuperación de contraseña</h2>
            <p>Hola ${user.nombre}, recibimos una solicitud para cambiar tu contraseña.</p>
            <p>Este enlace vence en 30 minutos.</p>
            <p>
              <a href="${resetLink}" style="display:inline-block;background:#ff7eb6;color:white;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:bold;">
                Restablecer contraseña
              </a>
            </p>
            <p>Si no solicitaste esto, ignora este mensaje.</p>
            <p>${resetLink}</p>
          </div>
        `
      });
    }

    res.json({ ok: true, message: "Si el correo existe, recibirás un enlace de recuperación." });
  } catch (error) {
    console.error("Error en forgot:", error);
    res.status(500).json({ ok: false, message: "No se pudo procesar la recuperación" });
  }
});

router.post("/reset", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ ok: false, message: "Token y contraseña son obligatorios" });
    }

    if (password.length < 6) {
      return res.status(400).json({ ok: false, message: "La contraseña debe tener mínimo 6 caracteres" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
  `UPDATE usuarios
   SET password_hash = $1,
       token_recuperacion = NULL,
       token_recuperacion_expira = NULL
   WHERE token_recuperacion = $2
   RETURNING id, correo`,
  [passwordHash, token]
);

    if (result.rows.length === 0) {
      return res.status(400).json({ ok: false, message: "Token inválido o expirado" });
    }

    res.json({ ok: true, message: "Contraseña restablecida correctamente. Ya puedes iniciar sesión." });
  } catch (error) {
    console.error("Error en reset:", error);
    res.status(500).json({ ok: false, message: "No se pudo restablecer la contraseña" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nombre, correo, rol, verificado, fecha_creacion FROM usuarios WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Usuario no encontrado" });
    }

    res.json({ ok: true, user: result.rows[0] });
  } catch (error) {
    console.error("Error en /me:", error);
    res.status(500).json({ ok: false, message: "No se pudo obtener el perfil" });
  }
});

module.exports = router;
