document.getElementById("loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    correo: document.getElementById("correo").value,
    password: document.getElementById("password").value
  };

  try {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    saveSession(data.token, data.user);
    showMessage("msg", "Inicio de sesión correcto. Redirigiendo...");

    setTimeout(() => {
      window.location.href = data.user.rol === "admin" ? "admin-eventos.html" : "eventos.html";
    }, 700);
  } catch (error) {
    showMessage("msg", error.message, true);
  }
});
