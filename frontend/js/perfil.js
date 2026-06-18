async function loadProfile() {
  requireLogin();

  const container = document.getElementById("profileContainer");

  try {
    const data = await apiFetch("/auth/me");
    const user = data.user;

    container.innerHTML = `
      <div class="card">
        <span class="badge">👤 Mi cuenta</span>
        <h2>${escapeHTML(user.nombre)}</h2>
        <p><strong>Correo:</strong> ${escapeHTML(user.correo)}</p>
        <p><strong>Rol:</strong> ${escapeHTML(user.rol)}</p>
        <p><strong>Verificado:</strong> ${user.verificado ? "Sí 🎀" : "No"}</p>
        <p><strong>Registro:</strong> ${new Date(user.fecha_creacion).toLocaleString("es-MX")}</p>
        <div class="actions">
          <a class="btn" href="historial.html">Ver mis boletos</a>
          <a class="btn secondary" href="eventos.html">Ver eventos</a>
        </div>
      </div>
    `;
  } catch (error) {
    container.innerHTML = `<div class="message error">${escapeHTML(error.message)}</div>`;
  }
}

document.addEventListener("DOMContentLoaded", loadProfile);
