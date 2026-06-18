const nodemailer = require("nodemailer");

function createTransporter() {
  const secureValue = String(process.env.SMTP_SECURE || "true").toLowerCase() === "true";

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: secureValue,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

async function sendMail({ to, subject, html }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP no configurado. No se pudo enviar correo real.");
    console.warn("Correo destino:", to);
    console.warn("Asunto:", subject);
    return { skipped: true };
  }

  const transporter = createTransporter();

  return transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html
  });
}

module.exports = { sendMail };
