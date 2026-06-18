let currentEvent = null;

async function loadEventDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const container = document.getElementById("detailContainer");

  if (!id) {
    container.innerHTML = `<div class="message error">No se encontró el evento.</div>`;
    return;
  }

  try {
    const data = await apiFetch(`/events/${id}`);
    currentEvent = data.event;
    renderEvent(currentEvent);
  } catch (error) {
    container.innerHTML = `<div class="message error">${escapeHTML(error.message)}</div>`;
  }
}

function renderEvent(event) {
  const container = document.getElementById("detailContainer");
  const user = getUser();

  container.innerHTML = `
    <div class="grid cols-2">
      <div class="card event-card">
        <img class="event-img" style="height: 360px;" src="${escapeHTML(event.imagen || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80")}" alt="${escapeHTML(event.titulo)}">
      </div>
      <div class="card">
        <span class="badge">🎟️ Evento del auditorio</span>
        <h1 style="font-size: clamp(2rem, 5vw, 3.5rem);">${escapeHTML(event.titulo)}</h1>
        <p class="lead">${escapeHTML(event.descripcion || "")}</p>
        <div class="meta">
          <span class="pill">📅 ${formatDate(event.fecha)}</span>
          <span class="pill">⏰ ${String(event.hora).slice(0,5)}</span>
          <span class="pill">📍 ${escapeHTML(event.lugar)}</span>
          <span class="pill">🎀 ${event.cupos_disponibles} cupos disponibles</span>
        </div>
        <p class="price">${money(event.precio)}</p>

        ${user ? `
          <form id="buyForm">
            <div class="form-group">
              <label for="cantidad">Cantidad de boletos</label>
              <input type="number" id="cantidad" min="1" max="${event.cupos_disponibles}" value="1" required>
            </div>
            <div class="form-group">
              <label for="metodo_pago">Método de pago simulado</label>
              <select id="metodo_pago">
                <option value="tarjeta_simulada">Tarjeta simulada</option>
                <option value="pago_caja">Pago en caja</option>
                <option value="transferencia_simulada">Transferencia simulada</option>
              </select>
            </div>
            <button class="btn" type="submit">Comprar boleto 🎀</button>
          </form>
        ` : `
          <p class="message">Para comprar necesitas iniciar sesión.</p>
          <a class="btn" href="login.html">Iniciar sesión</a>
        `}
        <div id="msg" class="hidden"></div>
        <div id="ticketResult" style="margin-top:18px;"></div>
      </div>
    </div>
  `;

  const buyForm = document.getElementById("buyForm");
  if (buyForm) {
    buyForm.addEventListener("submit", buyTicket);
  }
}

async function buyTicket(event) {
  event.preventDefault();

  try {
    const data = await apiFetch("/tickets/buy", {
      method: "POST",
      body: JSON.stringify({
        evento_id: currentEvent.id,
        cantidad: document.getElementById("cantidad").value,
        metodo_pago: document.getElementById("metodo_pago").value
      })
    });

    showMessage("msg", data.message);

    const ticket = data.ticket;
    document.getElementById("ticketResult").innerHTML = `
      <div class="ticket">
        <h3>Tu boleto quedó listo 💖</h3>
        <p><strong>Folio:</strong> ${escapeHTML(ticket.folio)}</p>
        <p><strong>Cantidad:</strong> ${ticket.cantidad}</p>
        <p><strong>Total:</strong> ${money(ticket.total)}</p>
        <div class="qr-fake" title="QR simulado"></div>
        <p class="small">QR decorativo/simulado para demostración.</p>
      </div>
    `;

    await loadEventDetail();
  } catch (error) {
    showMessage("msg", error.message, true);
  }
}

document.addEventListener("DOMContentLoaded", loadEventDetail);
