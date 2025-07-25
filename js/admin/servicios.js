document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("access_token");
  const tabla = document.getElementById("tablaServicios");

  if (!token) {
    window.location.href = "../index.html";
    return;
  }

  const cargarServicios = () => {
    fetch("https://back-ww44.onrender.com/servicios/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(servicios => {
        tabla.innerHTML = "";
        servicios.forEach(s => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${s.titulo}</td>
            <td class="limited-cell">${s.descripcion}</td>
          `;
          tabla.appendChild(tr);
        });
      })
      .catch(err => {
        console.error(err);
        alert("Error al cargar los servicios.");
      });
  };

  cargarServicios();

  const formCrearServicio = document.getElementById("formCrearServicio");
  const guardarServicioBtn = document.getElementById("guardarServicioBtn");

  guardarServicioBtn.addEventListener("click", () => {
    const titulo = document.getElementById("titulo").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();

    if (!titulo || !descripcion) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    const nuevoServicio = { titulo, descripcion };

    fetch("https://back-ww44.onrender.com/servicios/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(nuevoServicio)
    })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          cargarServicios();
          alert("Servicio creado correctamente.");
          formCrearServicio.reset();
          const modal = bootstrap.Modal.getInstance(document.getElementById('modalCrearServicio'));
          modal.hide();
        } else {
          alert("Error al crear el servicio.");
        }
      })
      .catch(err => {
        console.error(err);
        alert("Hubo un error al crear el servicio.");
      });
  });

  const btnCerrarSesion = document.getElementById("cerrarSesionBtn");
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", () => {
      sessionStorage.clear();
      localStorage.clear();
      window.location.href = "../index.html";
    });
  }
});
