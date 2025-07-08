document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("access_token");
  const userData = JSON.parse(sessionStorage.getItem("user_data"));
  const contentArea = document.querySelector(".content-area");

  if (!token || !userData) {
    window.location.href = "login.html";
    return;
  }

  async function obtenerReservas() {
    try {
      const res = await fetch("https://back-ww44.onrender.com/reservas/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("No se pudieron obtener las reservas");

      const reservas = await res.json();

      if (reservas.length === 0) {
        contentArea.innerHTML += `
          <p class="text-muted mt-4">No tienes reservas registradas.</p>
        `;
        return;
      }

      reservas.forEach((reserva) => {
        const badge = obtenerBadgeEstado(reserva.estado);

        const card = document.createElement("div");
        card.className = `card mb-3 border-${badge.clase}`;

        card.innerHTML = `
          <div class="card-body">
            <h5 class="card-title">Evento: ${reserva.cotizacion?.tipo_servicio || "Evento"}</h5>
            <span class="badge bg-${badge.clase}">${badge.texto}</span>
            <p class="mb-1"><strong>Fecha:</strong> ${reserva.fecha_reservada}</p>
            <p class="mb-1"><strong>Invitados:</strong> ${reserva.cotizacion?.numero_invitados || "--"}</p>
            <p><strong>Pago:</strong> S/ ${reserva.cotizacion?.precio ?? "--"}</p>
            ${
              reserva.estado === "confirmada"
                ? `<button class="btn btn-outline-danger btn-sm" data-bs-toggle="modal" data-bs-target="#cancelModal" data-reserva-id="${reserva.id}">
                     Cancelar reserva
                   </button>`
                : ""
            }
          </div>
        `;

        contentArea.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      contentArea.innerHTML += `<p class="text-danger mt-4">Error al cargar reservas.</p>`;
    }
  }

  function obtenerBadgeEstado(estado) {
    switch (estado) {
      case "confirmada":
        return { texto: "Confirmada", clase: "success" };
      case "cancelacion_solicitada":
        return { texto: "Solicitud de cancelación enviada", clase: "secondary" };
      case "cancelada":
        return { texto: "Cancelada", clase: "danger" };
      default:
        return { texto: "Desconocido", clase: "light text-dark" };
    }
  }

  let reservaSeleccionada = null;

  const cancelModal = document.getElementById("cancelModal");
  cancelModal.addEventListener("show.bs.modal", function (event) {
    const button = event.relatedTarget;
    reservaSeleccionada = button.getAttribute("data-reserva-id");
  });

  document.getElementById("confirmCancelBtn").addEventListener("click", async () => {
    if (!reservaSeleccionada || !token) return;

    try {
      const response = await fetch("https://back-ww44.onrender.com/solicitar-cancelacion/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reserva_id: reservaSeleccionada }),
      });

      if (response.ok) {
        alert("Tu solicitud fue enviada correctamente.");
        location.reload();
      } else {
        const data = await response.json();
        alert(data?.error || "Ocurrió un error al solicitar la cancelación.");
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("No se pudo conectar con el servidor.");
    }
  });

  obtenerReservas();
});
