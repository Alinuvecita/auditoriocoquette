document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    nombre: document.getElementById("nombre").value,
    correo: document.getElementById("correo").value,
    password: document.getElementById("password").value
  };

  try {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    showMessage("msg", data.message);
    document.getElementById("registerForm").reset();
  } catch (error) {
    showMessage("msg", error.message, true);
  }
});
