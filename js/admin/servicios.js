document.addEventListener("DOMContentLoaded", () => {
  const token = sessionStorage.getItem("access_token");
  const tabla = document.getElementById("tablaServicios");

  if (!token) {
    window.location.href = "../index.html";
    return;
  }

  fetch("https://back-ww44.onrender.com/servicios/", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((servicios) => {
      tabla.innerHTML = "";
      servicios.forEach((s) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
              <td>${s.titulo}</td>
              <td class="limited-cell">${s.descripcion}</td>
              <td>S/ ${s.precio_base ?? "-"}</td>
              <td>${s.duracion ?? "-"}</td>
              <td>
                <button class="btn btn-sm btn-warning"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger"><i class="fas fa-trash-alt"></i></button>
              </td>
            `;
        tabla.appendChild(tr);
      });
    })
    .catch((err) => {
      console.error(err);
      alert("Error al cargar servicios.");
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
