document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("access_token");
  const tabla = document.getElementById("tablaReservas");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("https://back-ww44.onrender.com/reservas/admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Error al obtener reservas");

    const reservas = await res.json();
    reservas.forEach((reserva) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${reserva.cotizacion.cliente_username}</td>
        <td>${reserva.cotizacion.tipo_servicio}</td>
        <td>${reserva.cotizacion.fecha_evento}</td>
        <td>S/ ${reserva.cotizacion.precio}</td>
        <td><span class="badge bg-${getBadge(reserva.estado)}">${reserva.estado}</span></td>
      `;
      tabla.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    tabla.innerHTML = `<tr><td colspan="5">Error al cargar las reservas.</td></tr>`;
  }
});

function getBadge(estado) {
  switch (estado) {
    case "confirmada":
      return "success";
    case "cancelacion_solicitada":
      return "warning";
    case "cancelada":
      return "danger";
    default:
      return "secondary";
  }
}