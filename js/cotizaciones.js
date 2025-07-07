document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("access_token");
  const userData = JSON.parse(sessionStorage.getItem("user_data"));
  const container = document.getElementById("cotizacionesContainer");

  if (!token || !userData) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("https://back-ww44.onrender.com/cotizacion/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Error al obtener cotizaciones");

    const cotizaciones = await res.json();
    const userCotizaciones = cotizaciones.filter(c => c.cliente === userData.dni);

    if (userCotizaciones.length === 0) {
      container.innerHTML = `<p class="text-muted">No tienes cotizaciones registradas.</p>`;
      return;
    }

    userCotizaciones.forEach(cot => {
      const card = document.createElement("div");
      const estado = cot.estado;
      const tienePrecio = !!cot.precio;

      let badgeClass = "secondary";
      let badgeText = "Desconocido";

      if (estado === "abierta") {
        if (tienePrecio) {
          badgeClass = "info";
          badgeText = "Precio asignado - Aún sin pagar";
        } else {
          badgeClass = "danger";
          badgeText = "Pendiente de revisión";
        }
      } else if (estado === "pendiente") {
        badgeClass = "warning";
        badgeText = "Pendiente de pago";
      } else if (estado === "pagada") {
        badgeClass = "success";
        badgeText = "Pagada";
      }

      card.className = `card mb-3 border-${badgeClass}`;
      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">Evento: ${cot.tipo_servicio}</h5>
          <span class="badge bg-${badgeClass}">${badgeText}</span>
          <p class="mb-1"><strong>Fecha:</strong> ${cot.fecha_evento}</p>
          <p class="mb-1"><strong>Invitados:</strong> ${cot.numero_invitados}</p>
          ${tienePrecio ? `<p class="mb-1"><strong>Precio:</strong> S/ ${cot.precio}</p>` : ""}
          ${
            tienePrecio && estado !== "pagada"
              ? `<a href="pago.html" class="btn btn-outline-dark btn-sm">Realizar pago</a>`
              : ""
          }
        </div>
      `;
      container.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = `<p class="text-danger">Hubo un error al cargar tus cotizaciones.</p>`;
  }
});

document.getElementById("cerrarSesionLateral")?.addEventListener("click", () => {
  sessionStorage.clear();
  localStorage.removeItem("session");
  window.location.href = "../index.html";
});
