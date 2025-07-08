document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("access_token");
  const userData = JSON.parse(sessionStorage.getItem("user_data"));
  const contentArea = document.querySelector(".content-area");

  if (!token || !userData) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("https://back-ww44.onrender.com/reservas/", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Error al obtener reservas");

    const reservas = await res.json();

    if (reservas.length === 0) {
      contentArea.innerHTML += `<p class="text-muted">No tienes reservas activas.</p>`;
      return;
    }

    reservas.forEach(reserva => {
      const estado = reserva.estado;
      let badgeClass = "secondary";
      let badgeText = "Desconocido";

      if (estado === "confirmada") {
        badgeClass = "success";
        badgeText = "Confirmada";
      } else if (estado === "cancelacion_solicitada") {
        badgeClass = "secondary";
        badgeText = "Solicitud de cancelación enviada";
      } else if (estado === "cancelada") {
        badgeClass = "danger";
        badgeText = "Cancelada";
      }

      const card = document.createElement("div");
      card.className = `card mb-3 border-${badgeClass}`;
      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">Evento: ${reserva.tipo_servicio}</h5>
          <span class="badge bg-${badgeClass}">${badgeText}</span>
          <p class="mb-1"><strong>Fecha:</strong> ${reserva.fecha_evento}</p>
          <p class="mb-1"><strong>Invitados:</strong> ${reserva.numero_invitados}</p>
          <p class="mb-1"><strong>Pago:</strong> S/ ${reserva.precio}</p>
          ${
            estado === "confirmada"
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
    contentArea.innerHTML += `<p class="text-danger">Ocurrió un error al cargar tus reservas.</p>`;
  }
});

let reservaSeleccionada = null;
const cancelModal = document.getElementById("cancelModal");

cancelModal.addEventListener("show.bs.modal", function (event) {
  const button = event.relatedTarget;
  reservaSeleccionada = button.getAttribute("data-reserva-id");
});

document.getElementById("confirmCancelBtn").addEventListener("click", async () => {
  const token = sessionStorage.getItem("access_token");
  if (!reservaSeleccionada || !token) return;

  try {
    const response = await fetch("https://back-ww44.onrender.com/solicitar-cancelacion/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ reserva_id: reservaSeleccionada })
    });

    if (response.ok) {
      alert("Tu solicitud fue enviada correctamente.");
      location.reload();
    } else {
      alert("Ocurrió un error al solicitar la cancelación.");
    }
  } catch (error) {
    console.error("Error de red:", error);
    alert("No se pudo conectar con el servidor.");
  }
});
