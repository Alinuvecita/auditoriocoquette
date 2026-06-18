document.addEventListener("DOMContentLoaded", () => {
  const user = getUser();
  const loginLink = document.querySelector("[data-login-link]");
  const registerLink = document.querySelector("[data-register-link]");
  const profileLink = document.querySelector("[data-profile-link]");
  const historyLink = document.querySelector("[data-history-link]");
  const adminLink = document.querySelector("[data-admin-link]");
  const logoutButton = document.querySelector("[data-logout-button]");
  const userName = document.querySelector("[data-user-name]");

  if (user) {
    if (loginLink) loginLink.classList.add("hidden");
    if (registerLink) registerLink.classList.add("hidden");
    if (profileLink) profileLink.classList.remove("hidden");
    if (historyLink) historyLink.classList.remove("hidden");
    if (logoutButton) logoutButton.classList.remove("hidden");
    if (userName) userName.textContent = `Hola, ${user.nombre} 🎀`;

    if (adminLink && user.rol === "admin") {
      adminLink.classList.remove("hidden");
    }
  } else {
    if (profileLink) profileLink.classList.add("hidden");
    if (historyLink) historyLink.classList.add("hidden");
    if (adminLink) adminLink.classList.add("hidden");
    if (logoutButton) logoutButton.classList.add("hidden");
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => {
      console.warn("No se pudo registrar el service worker:", error);
    });
  }
});
