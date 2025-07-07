document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("access_token");
  const encryptedUser = sessionStorage.getItem("usuario_encriptado");
  const userData = JSON.parse(sessionStorage.getItem("user_data"));

  if (!token || !encryptedUser || userData?.rol !== "admin") {
    window.location.href = "../index.html";
    return;
  }

  const tablaUsuarios = document.getElementById("tablaUsuarios");
  const formCrear = document.getElementById("formCrearUsuario");
  const modalCrear = new bootstrap.Modal(document.getElementById("modalCrearUsuario"));

  async function obtenerUsuarios() {
    try {
      const res = await fetch("https://back-ww44.onrender.com/usuarios/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("Error en la respuesta:", await res.text());
        return;
      }

      const data = await res.json();
      renderUsuarios(data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    }
  }

  function renderUsuarios(usuarios) {
    tablaUsuarios.innerHTML = "";
    usuarios.forEach((u) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${u.dni}</td>
        <td>${u.username}</td>
        <td>${u.nombre}</td>
        <td>${u.apellidos}</td>
        <td>${u.email}</td>
        <td>${u.phone || "-"}</td>
        <td>${u.rol}</td>
        <td>
          <span class="badge ${u.is_active ? 'bg-success' : 'bg-secondary'}">
            ${u.is_active ? 'Activo' : 'Inactivo'}
          </span>
        </td>
        <td>
          <button class="btn ${u.is_active ? 'btn-warning' : 'btn-success'} btn-sm"
                  onclick="cambiarEstadoUsuario('${u.dni}', ${u.is_active})">
            ${u.is_active ? 'Desactivar' : 'Activar'}
          </button>
        </td>
      `;
      tablaUsuarios.appendChild(fila);
    });
  }

  formCrear.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(formCrear);
    const nuevoUsuario = Object.fromEntries(formData.entries());
    nuevoUsuario.rol = "admin";

    try {
      const res = await fetch("https://back-ww44.onrender.com/usuarios/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevoUsuario),
      });

      if (res.ok) {
        modalCrear.hide();
        formCrear.reset();
        obtenerUsuarios();
      } else {
        const error = await res.json();
        alert("Error al crear usuario: " + JSON.stringify(error));
      }
    } catch (err) {
      console.error("Error al registrar:", err);
    }
  });

  window.cambiarEstadoUsuario = async function (dni, estadoActual) {
    const accion = estadoActual ? "desactivar" : "activar";
    if (!confirm(`¿Deseas ${accion} a este usuario?`)) return;

    try {
      const res = await fetch(`https://back-ww44.onrender.com/usuarios/change-state/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dni, is_active: !estadoActual }),
      });

      if (res.ok) {
        obtenerUsuarios();
      } else {
        const msg = await res.text();
        alert("Error al cambiar estado: " + msg);
      }
    } catch (err) {
      console.error("Error al cambiar estado:", err);
    }
  };

  const cerrarSesionBtn = document.getElementById("cerrarSesionBtn");
  if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener("click", () => {
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = "../index.html";
    });
  }
  obtenerUsuarios();
});
