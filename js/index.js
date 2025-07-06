document.addEventListener("DOMContentLoaded", async () => {
  const navList = document.getElementById("navbarLinks");
  const token = sessionStorage.getItem("access_token");
  const encryptedUser = sessionStorage.getItem("usuario_encriptado");

  if (!token || !encryptedUser) {
    const loginItem = document.createElement("li");
    loginItem.className = "nav-item";
    loginItem.innerHTML = `
      <a href="../html/login.html" class="btn btn-outline-light btn-sm me-2">Iniciar Sesión</a>
    `;
    navList.appendChild(loginItem);
    return;
  }

  try {
    const response = await fetch("https://back-ww44.onrender.com/decrypt-user/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ usuario_encriptado: encryptedUser }),
    });

    const user = await response.json();

    if (response.ok) {
      const agendaLinks = navList.querySelectorAll('a[href*="agenda.html"]');
      if (agendaLinks.length > 1) {
        for (let i = 1; i < agendaLinks.length; i++) {
          agendaLinks[i].closest("li")?.remove();
        }
      }

      const agendaItem = document.createElement("li");
      agendaItem.className = "nav-item";
      agendaItem.innerHTML = `<a class="nav-link" href="../html/agenda.html">Agendar</a>`;
      navList.appendChild(agendaItem);

      const userItem = document.createElement("li");
      userItem.className = "nav-item dropdown";
      userItem.innerHTML = `
        <a class="nav-link dropdown-toggle text-white" href="#" id="perfilDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
          Perfil
        </a>
        <ul class="dropdown-menu dropdown-menu-end bg-dark" aria-labelledby="perfilDropdown">
          <li><span class="dropdown-item text-white">Hola, ${user.nombre}</span></li>
          <li><a class="dropdown-item text-white" href="../html/perfil.html">Ver Perfil</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><button class="dropdown-item text-danger" id="logoutBtn">Cerrar Sesión</button></li>
        </ul>
      `;
      navList.appendChild(userItem);

      localStorage.setItem("session", "true");

      document.getElementById("logoutBtn").addEventListener("click", () => {
        sessionStorage.clear();
        localStorage.removeItem("session");
        location.reload();
      });
    } else {
      sessionStorage.clear();
      localStorage.removeItem("session");
      location.reload();
    }
  } catch (error) {
    sessionStorage.clear();
    localStorage.removeItem("session");
    location.reload();
  }
});
