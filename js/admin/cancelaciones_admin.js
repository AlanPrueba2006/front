document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("access_token");
  const tabla = document.getElementById("tablaCancelaciones");

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("https://back-ww44.onrender.com/cancelaciones/admin/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Error al obtener cancelaciones");

    const cancelaciones = await res.json();
    cancelaciones.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.reserva.cotizacion.cliente_username}</td>
        <td>${item.reserva.cotizacion.tipo_servicio}</td>
        <td>${item.motivo_cliente}</td>
        <td>${item.reserva.cotizacion.fecha_evento}</td>
        <td>S/ ${item.reserva.cotizacion.precio}</td>
        <td><button class="btn btn-sm btn-success" onclick="aceptarCancelacion(${item.id})">Aceptar</button></td>
      `;
      tabla.appendChild(row);
    });
  } catch (err) {
    console.error(err);
    tabla.innerHTML = `<tr><td colspan="6">Error al cargar cancelaciones.</td></tr>`;
  }
});

async function aceptarCancelacion(id) {
  const token = sessionStorage.getItem("access_token");
  if (!confirm("¿Seguro que deseas aceptar esta cancelación?")) return;

  try {
    const res = await fetch(`https://back-ww44.onrender.com/cancelaciones/${id}/aceptar/`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("No se pudo aceptar la cancelación");
    alert("Cancelación aceptada correctamente");
    location.reload();
  } catch (err) {
    console.error(err);
    alert("Error al aceptar cancelación");
  }
}
