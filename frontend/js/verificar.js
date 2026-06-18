document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (!token) {
    showMessage("msg", "No se encontró token de verificación.", true);
    return;
  }

  try {
    const data = await apiFetch(`/auth/verify/${token}`);
    showMessage("msg", data.message);
  } catch (error) {
    showMessage("msg", error.message, true);
  }
});
