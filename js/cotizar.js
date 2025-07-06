document.addEventListener("DOMContentLoaded", async () => {
  const token = sessionStorage.getItem("access_token");
  const encryptedUser = sessionStorage.getItem("usuario_encriptado");
  const cachedUser = sessionStorage.getItem("user_data");

  // Si no hay sesión, redirigir a login
  if (!token || !encryptedUser) {
    alert("Debes iniciar sesión para cotizar.");
    window.location.href = "../html/login.html";
    return;
  }

  let user = cachedUser ? JSON.parse(cachedUser) : null;

  if (!user) {
    try {
      const res = await fetch("https://back-ww44.onrender.com/decrypt-user/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ usuario_encriptado: encryptedUser }),
      });

      if (!res.ok) throw new Error("Fallo al validar el usuario");

      user = await res.json();
      sessionStorage.setItem("user_data", JSON.stringify(user));
    } catch (error) {
      console.error("Error al validar usuario:", error);
      sessionStorage.clear();
      alert("Tu sesión ha expirado, vuelve a iniciar sesión.");
      window.location.href = "../html/login.html";
      return;
    }
  }

  // Redirigir si es admin
  if (user.rol === "admin") {
    window.location.href = "../html/admin.html";
    return;
  }

  // Cargar servicios al <select>
  try {
    const select = document.getElementById("tipoShow");
    const resp = await fetch("https://back-ww44.onrender.com/servicios/");
    const servicios = await resp.json();

    select.innerHTML = '<option selected disabled>—Selecciona un servicio—</option>';
    servicios.forEach(servicio => {
      const option = document.createElement("option");
      option.value = servicio.id;
      option.textContent = servicio.titulo;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar servicios:", error);
    alert("No se pudieron cargar los servicios.");
  }

  // Evento al botón "Cotizar"
  const btnCotizar = document.getElementById("btnCotizar");
  btnCotizar.addEventListener("click", async () => {
    const tipoServicioId = document.getElementById("tipoShow").value;
    const numeroInvitados = document.getElementById("numInvitados").value;
    const fechaEvento = document.getElementById("fechaEvento").value;
    const mensaje = document.getElementById("mensaje").value;
    const acepta = document.getElementById("acepto").checked;

    if (!acepta) {
      alert("Debes aceptar el uso de tus datos.");
      return;
    }

    if (!tipoServicioId || !numeroInvitados || !fechaEvento) {
      alert("Completa todos los campos obligatorios.");
      return;
    }

    // Recolectar servicios adicionales marcados
    const adicionales = Array.from(
      document.querySelectorAll("input[type='checkbox']:checked")
    ).map(cb => cb.nextElementSibling.innerText.trim()).join(", ");

    const data = {
      tipo_servicio_id: tipoServicioId,
      numero_invitados: numeroInvitados,
      fecha_evento: fechaEvento,
      servicios_adicionales: adicionales,
      mensaje: mensaje
    };

    try {
      const res = await fetch("https://back-ww44.onrender.com/cotizacion/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        alert("¡Cotización enviada con éxito!");
        window.location.href = "../html/pago.html";
      } else {
        const errData = await res.json();
        console.error("Error en cotización:", errData);
        alert("Hubo un error al enviar la cotización.");
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("No se pudo conectar con el servidor.");
    }
  });
});
