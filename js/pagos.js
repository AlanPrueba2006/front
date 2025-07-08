document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("access_token");
  const userData = JSON.parse(sessionStorage.getItem("user_data"));
  const formPago = document.getElementById("formPago");
  const inputFile = document.getElementById("comprobantePago");
  const totalCotizacion = document.getElementById("totalCotizacion");

  if (!token || !userData) {
    window.location.href = "login.html";
    return;
  }

  let ultimaCotizacion = null;

  async function obtenerCotizaciones() {
    try {
      const res = await fetch("https://back-ww44.onrender.com/cotizacion/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al obtener cotizaciones");

      const cotizaciones = await res.json();
      const cotUser = cotizaciones
        .filter(c => c.cliente === userData.dni && c.estado !== "pagada")
        .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));

      if (cotUser.length === 0) {
        alert("No tienes cotizaciones pendientes para pagar.");
        window.location.href = "mis-cotizaciones.html";
        return;
      }

      ultimaCotizacion = cotUser[0];
      totalCotizacion.textContent = `S/ ${ultimaCotizacion.precio ?? "--"}`;
    } catch (err) {
      console.error(err);
      alert("Error al cargar tus cotizaciones.");
    }
  }

  formPago.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!ultimaCotizacion) {
      alert("No se ha cargado ninguna cotización válida.");
      return;
    }

    const archivo = inputFile.files[0];
    if (!archivo) {
      alert("Debes seleccionar un archivo.");
      return;
    }

    const formData = new FormData();
    formData.append("comprobante_pago", archivo);

    try {
      const res = await fetch(
        `https://back-ww44.onrender.com/cotizacion/${ultimaCotizacion.id}/pago/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Error al enviar el comprobante");

      alert("¡Pago enviado correctamente!");
      window.location.href = "reservas.html";
    } catch (err) {
      console.error(err);
      alert("No se pudo enviar el comprobante.");
    }
  });

  obtenerCotizaciones();
});
