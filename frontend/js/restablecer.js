document.getElementById("resetForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) {
    showMessage("msg", "No se encontró token de recuperación.", true);
    return;
  }

  try {
    const data = await apiFetch("/auth/reset", {
      method: "POST",
      body: JSON.stringify({
        token,
        password: document.getElementById("password").value
      })
    });

    showMessage("msg", data.message);
    document.getElementById("resetForm").reset();
  } catch (error) {
    showMessage("msg", error.message, true);
  }
});
