document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("access_token");
  const userData = JSON.parse(sessionStorage.getItem("user_data"));
  const contentArea = document.querySelector(".content-area");

  if (!token || !userData) {
    window.location.href = "login.html";
    return;
  }

  try {
    // 1. Obtener reservas
    const resReservas = await fetch("https://back-ww44.onrender.com/reservas/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!resReservas.ok) throw new Error("Error al obtener reservas");
    const reservas = await resReservas.json();

    if (reservas.length === 0) {
      contentArea.innerHTML += `<p class="text-muted">No tienes reservas aún.</p>`;
      return;
    }

    // 2. Obtener cotizaciones para mapear por ID
    const resCots = await fetch("https://back-ww44.onrender.com/cotizacion/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!resCots.ok) throw new Error("Error al obtener cotizaciones");
    const cotizaciones = await resCots.json();

    const cotMap = {};
    cotizaciones.forEach(c => {
      cotMap[c.id] = c;
    });

    reservas.forEach(reserva => {
      const cot = cotMap[reserva.cotizacion];
      if (!cot) return;

      const estado = reserva.estado || "confirmado"; // en caso no tengas campo estado todavía
      const badgeClass = estado === "confirmado" ? "success" : "secondary";
      const badgeText = estado === "confirmado" ? "Confirmado" : "Solicitud de cancelación enviada";

      const card = document.createElement("div");
      card.className = `card mb-3 border-${badgeClass}`;
      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">Evento: ${cot.tipo_servicio}</h5>
          <span class="badge bg-${badgeClass}">${badgeText}</span>
          <p class="mb-1"><strong>Fecha:</strong> ${reserva.fecha_reservada}</p>
          <p><strong>Invitados:</strong> ${cot.numero_invitados}</p>
          <p><strong>Pago:</strong> S/ ${cot.precio ?? "--"}</p>
          ${
            estado === "confirmado"
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
    contentArea.innerHTML += `<p class="text-danger">Hubo un error al cargar tus reservas.</p>`;
  }
});

// Modal de cancelación (solo UI, sin backend todavía)
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
    const response = await fetch("https://tu-backend.com/api/solicitar-cancelacion/", {
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
      alert("Ocurrió un error al solicitar la cancelación.");
    }
  } catch (error) {
    console.error("Error de red:", error);
    alert("No se pudo conectar con el servidor.");
  }
});
