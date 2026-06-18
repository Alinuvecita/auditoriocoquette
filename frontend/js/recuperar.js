document.getElementById("forgotForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const data = await apiFetch("/auth/forgot", {
      method: "POST",
      body: JSON.stringify({
        correo: document.getElementById("correo").value
      })
    });

    showMessage("msg", data.message);
    document.getElementById("forgotForm").reset();
  } catch (error) {
    showMessage("msg", error.message, true);
  }
});
