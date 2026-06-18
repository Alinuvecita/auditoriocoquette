async function sendMail({ to, subject, html }) {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY no configurada en Render");
  }

  const senderEmail = process.env.MAIL_SENDER_EMAIL || "glowpass.alixho@gmail.com";
  const senderName = process.env.MAIL_SENDER_NAME || "Auditorio Uni";

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail
      },
      to: [
        {
          email: to
        }
      ],
      subject: subject,
      htmlContent: html
    })
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Brevo error ${response.status}: ${text}`);
  }

  return text ? JSON.parse(text) : {};
}

module.exports = { sendMail };
