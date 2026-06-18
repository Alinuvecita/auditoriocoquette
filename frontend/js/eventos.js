async function loadEvents() {
  const container = document.getElementById("eventsContainer");
  container.innerHTML = `<div class="card">Cargando eventos bonitos... 🎀</div>`;

  try {
    const data = await apiFetch("/events");
    const events = data.events || [];

    if (events.length === 0) {
      container.innerHTML = `<div class="card">Todavía no hay eventos disponibles.</div>`;
      return;
    }

    container.innerHTML = events.map((event) => `
      <article class="card event-card">
        <img class="event-img" src="${escapeHTML(event.imagen || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80")}" alt="${escapeHTML(event.titulo)}">
        <div class="event-body">
          <h3>${escapeHTML(event.titulo)}</h3>
          <p>${escapeHTML(event.descripcion || "Evento universitario en el auditorio.")}</p>
          <div class="meta">
            <span class="pill">📅 ${formatDate(event.fecha)}</span>
            <span class="pill">⏰ ${String(event.hora).slice(0,5)}</span>
            <span class="pill">📍 ${escapeHTML(event.lugar)}</span>
            <span class="pill">🎟️ ${event.cupos_disponibles} cupos</span>
          </div>
          <p class="price">${money(event.precio)}</p>
          <a class="btn" href="detalle-evento.html?id=${event.id}">Ver detalles</a>
        </div>
      </article>
    `).join("");
  } catch (error) {
    container.innerHTML = `<div class="message error">${escapeHTML(error.message)}</div>`;
  }
}

document.addEventListener("DOMContentLoaded", loadEvents);
