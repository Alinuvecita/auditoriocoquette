async function loadHistory() {
  requireLogin();

  const container = document.getElementById("historyContainer");
  container.innerHTML = `<div class="card">Cargando historial... 🎀</div>`;

  try {
    const data = await apiFetch("/tickets/me");
    const tickets = data.tickets || [];

    if (tickets.length === 0) {
      container.innerHTML = `<div class="card">Aún no tienes boletos comprados.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="grid">
        ${tickets.map((ticket) => `
          <div class="ticket">
            <h3>${escapeHTML(ticket.titulo)}</h3>
            <p><strong>Folio:</strong> ${escapeHTML(ticket.folio)}</p>
            <p><strong>Fecha:</strong> ${formatDate(ticket.fecha)} · ${String(ticket.hora).slice(0,5)}</p>
            <p><strong>Lugar:</strong> ${escapeHTML(ticket.lugar)}</p>
            <p><strong>Cantidad:</strong> ${ticket.cantidad}</p>
            <p><strong>Total:</strong> ${money(ticket.total)}</p>
            <p><strong>Estado:</strong> ${escapeHTML(ticket.estado)}</p>
            <div class="qr-fake"></div>
          </div>
        `).join("")}
      </div>
    `;
  } catch (error) {
    container.innerHTML = `<div class="message error">${escapeHTML(error.message)}</div>`;
  }
}

document.addEventListener("DOMContentLoaded", loadHistory);
