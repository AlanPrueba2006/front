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
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return console.error(await res.text());

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
        <td><span class="badge ${u.is_active ? "bg-success" : "bg-secondary"}">${u.is_active ? "Activo" : "Inactivo"}</span></td>
        <td>
          <button class="btn ${u.is_active ? "btn-warning" : "btn-success"} btn-sm me-1"
                  onclick="cambiarEstadoUsuario('${u.dni}')">
            ${u.is_active ? "Desactivar" : "Activar"}
          </button>
          ${!u.is_active ? `
            <button class="btn btn-danger btn-sm" onclick="eliminarUsuario('${u.dni}')">
              <i class="fas fa-trash-alt"></i> Eliminar
            </button>
          ` : ''}
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
        headers: { "Content-Type": "application/json" },
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

  window.cambiarEstadoUsuario = async function (dni) {
    if (!confirm("¿Deseas cambiar el estado de este usuario?")) return;

    try {
      const res = await fetch(`https://back-ww44.onrender.com/usuarios/${dni}/change-state/`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
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

  window.eliminarUsuario = async function (dni) {
    if (!confirm("¿Eliminar definitivamente este usuario? Esta acción no se puede deshacer.")) return;

    try {
      const res = await fetch(`https://back-ww44.onrender.com/usuarios/${dni}/delete/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("Usuario eliminado permanentemente.");
        obtenerUsuarios();
      } else {
        const msg = await res.text();
        alert("Error al eliminar: " + msg);
      }
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
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
