document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("access_token");
  const encryptedUser = sessionStorage.getItem("usuario_encriptado");
  const userData = JSON.parse(sessionStorage.getItem("user_data"));

  if (!token || !encryptedUser || userData?.rol !== "admin") {
    window.location.href = "../index.html";
    return;
  }

  const tablaUsuarios = document.getElementById("usuariosTabla");
  const formCrear = document.getElementById("formCrearUsuario");
  const modalCrear = new bootstrap.Modal(document.getElementById("crearUsuarioModal"));

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
    const tbody = tablaUsuarios.querySelector("tbody");
    tbody.innerHTML = "";
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
          <button class="btn btn-danger btn-sm" onclick="eliminarUsuario('${u.dni}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(fila);
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

  window.eliminarUsuario = async function (dni) {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

    try {
      const res = await fetch(`https://back-ww44.onrender.com/usuarios/${dni}/delete/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        obtenerUsuarios();
      } else {
        alert("Error al eliminar el usuario.");
      }
    } catch (err) {
      console.error("Error al eliminar:", err);
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
