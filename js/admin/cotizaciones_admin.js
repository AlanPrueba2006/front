document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("access_token");
  const tablaCotizaciones = document.getElementById("tablaCotizaciones");
  const modalPrecio = new bootstrap.Modal(
    document.getElementById("modalPrecio")
  );
  const formPrecio = document.getElementById("formActualizarPrecio");
  const inputId = document.getElementById("cotizacionIdPrecio");
  const inputPrecio = document.getElementById("nuevoPrecio");

  if (!token) {
    window.location.href = "../index.html";
    return;
  }

  async function obtenerCotizaciones() {
    try {
      const res = await fetch(
        "https://back-ww44.onrender.com/cotizacion/admin/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("No se pudieron obtener las cotizaciones");

      const cotizaciones = await res.json();
      renderCotizaciones(cotizaciones);
    } catch (err) {
      console.error(err);
      alert("Error al cargar cotizaciones");
    }
  }

  function renderCotizaciones(lista) {
    tablaCotizaciones.innerHTML = "";
    lista.forEach((c) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${c.cliente.username}</td>
        <td>${c.tipo_servicio.nombre}</td>
        <td>${c.numero_invitados}</td>
        <td>${c.fecha_evento}</td>
        <td>${c.mensaje || "-"}</td>
        <td>${c.servicios_adicionales || "-"}</td>
        <td>S/ ${c.precio ?? "No definido"}</td>
        <td><span class="badge ${getEstadoColor(c.estado)}">${
        c.estado
      }</span></td>
        <td>${
          c.comprobante_pago
            ? `<a href="${c.comprobante_pago}" target="_blank">Ver</a>`
            : "Sin archivo"
        }</td>
        <td>
          <button class="btn btn-sm btn-outline-success me-1" onclick="abrirModalPrecio(${
            c.id
          }, ${c.precio || 0})">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-outline-warning" onclick="cambiarEstadoPago(${
            c.id
          }, '${c.estado}')">
            <i class="fas fa-sync-alt"></i>
          </button>
        </td>
      `;
      tablaCotizaciones.appendChild(tr);
    });
  }

  function getEstadoColor(estado) {
    switch (estado) {
      case "abierta":
        return "bg-secondary";
      case "pendiente":
        return "bg-warning text-dark";
      case "pagada":
        return "bg-success";
      default:
        return "bg-light text-dark";
    }
  }

  window.abrirModalPrecio = (id, precioActual) => {
    inputId.value = id;
    inputPrecio.value = precioActual ?? "";
    modalPrecio.show();
  };

  formPrecio.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = inputId.value;
    const nuevoPrecio = inputPrecio.value;

    try {
      const res = await fetch(
        `https://back-ww44.onrender.com/cotizacion/${id}/precio/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ precio: parseFloat(nuevoPrecio) }),
        }
      );

      if (!res.ok) throw new Error("Error al actualizar precio");

      modalPrecio.hide();
      obtenerCotizaciones();
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el precio.");
    }
  });

  window.cambiarEstadoPago = async (id, estadoActual) => {
    const siguienteEstado =
      estadoActual === "abierta"
        ? "pendiente"
        : estadoActual === "pendiente"
        ? "pagada"
        : "pagada";

    try {
      const res = await fetch(
        `https://back-ww44.onrender.com/cotizacion/${id}/pago/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado: siguienteEstado }),
        }
      );

      if (!res.ok) throw new Error("Error al cambiar estado de pago");

      obtenerCotizaciones();
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el estado de pago.");
    }
  };

  const btnCerrarSesion = document.getElementById("cerrarSesionBtn");
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", () => {
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = "../index.html";
    });
  }

  obtenerCotizaciones();
});
