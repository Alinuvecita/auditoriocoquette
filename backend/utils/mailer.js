async function sendMail({ to, subject, html }) {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    throw new Error("EmailJS no está configurado correctamente");
  }

  const linkMatch = html.match(/https?:\/\/[^\s"'<]+/);
  const link = linkMatch ? linkMatch[0] : "";

  const message = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      to_email: to,
      subject: subject,
      message: message,
      link: link
    }
  };

  if (privateKey) {
    payload.accessToken = privateKey;
  }

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`EmailJS error ${response.status}: ${text}`);
  }

  return { ok: true, response: text };
}

module.exports = { sendMail };
