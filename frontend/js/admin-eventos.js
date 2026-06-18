let editingId = null;

document.addEventListener("DOMContentLoaded", () => {
  requireLogin();
  requireAdmin();

  document.getElementById("eventForm").addEventListener("submit", saveEvent);
  document.getElementById("cancelEdit").addEventListener("click", resetForm);

  loadAdminEvents();
  loadTickets();
});

async function loadAdminEvents() {
  const table = document.getElementById("eventsTableBody");
  table.innerHTML = `<tr><td colspan="8">Cargando eventos...</td></tr>`;

  try {
    const data = await apiFetch("/events?all=true");
    const events = data.events || [];

    if (events.length === 0) {
      table.innerHTML = `<tr><td colspan="8">No hay eventos.</td></tr>`;
      return;
    }

    table.innerHTML = events.map((event) => `
      <tr>
        <td>${event.id}</td>
        <td>${escapeHTML(event.titulo)}</td>
        <td>${formatDate(event.fecha)}</td>
        <td>${String(event.hora).slice(0,5)}</td>
        <td>${money(event.precio)}</td>
        <td>${event.cupos_disponibles}</td>
        <td>${escapeHTML(event.estado)}</td>
        <td>
          <button class="btn secondary" onclick='editEvent(${JSON.stringify(event).replaceAll("'", "&apos;")})'>Editar</button>
          <button class="btn danger" onclick="deleteEvent(${event.id})">Eliminar</button>
        </td>
      </tr>
    `).join("");
  } catch (error) {
    table.innerHTML = `<tr><td colspan="8">${escapeHTML(error.message)}</td></tr>`;
  }
}

async function loadTickets() {
  const table = document.getElementById("ticketsTableBody");
  table.innerHTML = `<tr><td colspan="7">Cargando boletos...</td></tr>`;

  try {
    const data = await apiFetch("/tickets");
    const tickets = data.tickets || [];

    if (tickets.length === 0) {
      table.innerHTML = `<tr><td colspan="7">Todavía no hay boletos vendidos.</td></tr>`;
      return;
    }

    table.innerHTML = tickets.map((ticket) => `
      <tr>
        <td>${escapeHTML(ticket.folio)}</td>
        <td>${escapeHTML(ticket.usuario_nombre)}</td>
        <td>${escapeHTML(ticket.correo)}</td>
        <td>${escapeHTML(ticket.evento_titulo)}</td>
        <td>${ticket.cantidad}</td>
        <td>${money(ticket.total)}</td>
        <td>${new Date(ticket.fecha_compra).toLocaleString("es-MX")}</td>
      </tr>
    `).join("");
  } catch (error) {
    table.innerHTML = `<tr><td colspan="7">${escapeHTML(error.message)}</td></tr>`;
  }
}

async function saveEvent(event) {
  event.preventDefault();

  const payload = {
    titulo: document.getElementById("titulo").value,
    descripcion: document.getElementById("descripcion").value,
    fecha: document.getElementById("fecha").value,
    hora: document.getElementById("hora").value,
    lugar: document.getElementById("lugar").value,
    precio: document.getElementById("precio").value,
    cupos_disponibles: document.getElementById("cupos").value,
    imagen: document.getElementById("imagen").value,
    estado: document.getElementById("estado").value
  };

  try {
    const path = editingId ? `/events/${editingId}` : "/events";
    const method = editingId ? "PUT" : "POST";

    const data = await apiFetch(path, {
      method,
      body: JSON.stringify(payload)
    });

    showMessage("msg", data.message);
    resetForm();
    loadAdminEvents();
  } catch (error) {
    showMessage("msg", error.message, true);
  }
}

function editEvent(event) {
  editingId = event.id;

  document.getElementById("titulo").value = event.titulo || "";
  document.getElementById("descripcion").value = event.descripcion || "";
  document.getElementById("fecha").value = String(event.fecha).slice(0,10);
  document.getElementById("hora").value = String(event.hora).slice(0,5);
  document.getElementById("lugar").value = event.lugar || "";
  document.getElementById("precio").value = event.precio || 0;
  document.getElementById("cupos").value = event.cupos_disponibles || 0;
  document.getElementById("imagen").value = event.imagen || "";
  document.getElementById("estado").value = event.estado || "activo";

  document.getElementById("formTitle").textContent = "Editar evento 🎀";
  document.getElementById("saveButton").textContent = "Guardar cambios";
  document.getElementById("cancelEdit").classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteEvent(id) {
  const confirmDelete = confirm("¿Seguro que quieres eliminar este evento?");
  if (!confirmDelete) return;

  try {
    const data = await apiFetch(`/events/${id}`, { method: "DELETE" });
    showMessage("msg", data.message);
    loadAdminEvents();
  } catch (error) {
    showMessage("msg", error.message, true);
  }
}

function resetForm() {
  editingId = null;
  document.getElementById("eventForm").reset();
  document.getElementById("estado").value = "activo";
  document.getElementById("formTitle").textContent = "Crear evento nuevo 🎀";
  document.getElementById("saveButton").textContent = "Crear evento";
  document.getElementById("cancelEdit").classList.add("hidden");
}
