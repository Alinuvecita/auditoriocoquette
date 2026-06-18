function getToken() {
  return localStorage.getItem("auditorio_token");
}

function getUser() {
  const raw = localStorage.getItem("auditorio_user");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function saveSession(token, user) {
  localStorage.setItem("auditorio_token", token);
  localStorage.setItem("auditorio_user", JSON.stringify(user));
}

function logout() {
  localStorage.removeItem("auditorio_token");
  localStorage.removeItem("auditorio_user");
  window.location.href = "login.html";
}

async function apiFetch(path, options = {}) {
  const headers = options.headers || {};
  const token = getToken();

  const response = await fetch(`${window.API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Ocurrió un error");
  }

  return data;
}

function showMessage(elementId, text, isError = false) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.textContent = text;
  element.className = isError ? "message error" : "message";
  element.classList.remove("hidden");
}

function money(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN"
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function requireLogin() {
  if (!getToken()) {
    window.location.href = "login.html";
  }
}

function requireAdmin() {
  const user = getUser();

  if (!user || user.rol !== "admin") {
    window.location.href = "eventos.html";
  }
}
