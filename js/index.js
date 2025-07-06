document.addEventListener("DOMContentLoaded", async () => {
  const navList = document.getElementById("navbarLinks");
  if (!navList) return;

  const pathPrefix = window.location.pathname.includes("/html/") ? "../" : "./";

  const baseItems = [
    { label: "Inicio", href: `${pathPrefix}index.html` },
    { label: "Nosotros", href: `${pathPrefix}html/nosotros.html` },
    { label: "Servicios", href: `${pathPrefix}html/servicios.html` },
  ];

  baseItems.forEach((item) => {
    const li = document.createElement("li");
    li.className = "nav-item";
    li.innerHTML = `<a class="nav-link" href="${item.href}">${item.label}</a>`;
    navList.appendChild(li);
  });

  const token = sessionStorage.getItem("access_token");
  const encryptedUser = sessionStorage.getItem("usuario_encriptado");
  const cachedUser = sessionStorage.getItem("user_data");

  if (token && encryptedUser) {
    let user = null;

    if (cachedUser) {
      user = JSON.parse(cachedUser);
    } else {
      try {
        const response = await fetch(
          "https://back-ww44.onrender.com/decrypt-user/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ usuario_encriptado: encryptedUser }),
          }
        );

        if (response.ok) {
          user = await response.json();
          sessionStorage.setItem("user_data", JSON.stringify(user));
        } else {
          sessionStorage.clear();
          localStorage.removeItem("session");
        }
      } catch (error) {
        console.error("Error:", error);
        sessionStorage.clear();
        localStorage.removeItem("session");
      }
    }

    if (user?.rol === "admin") {
      window.location.href = `${pathPrefix}html/admin.html`;
      return;
    }

    const agendaItem = document.createElement("li");
    agendaItem.className = "nav-item";
    agendaItem.innerHTML = `<a class="nav-link" href="${pathPrefix}html/agenda.html">Agendar</a>`;
    navList.appendChild(agendaItem);

    const userItem = document.createElement("li");
    userItem.className = "nav-item dropdown";
    userItem.innerHTML = `
      <a class="nav-link dropdown-toggle text-white" href="#" id="perfilDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
        Perfil
      </a>
      <ul class="dropdown-menu dropdown-menu-end bg-dark" aria-labelledby="perfilDropdown">
        <li><a class="dropdown-item text-white" href="${pathPrefix}html/perfil.html">Ver Perfil</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><button class="dropdown-item text-danger" id="logoutBtn">Cerrar Sesión</button></li>
      </ul>
    `;
    navList.appendChild(userItem);

    localStorage.setItem("session", "true");

    document.getElementById("logoutBtn").addEventListener("click", () => {
      sessionStorage.clear();
      localStorage.removeItem("session");
      window.location.href = `${pathPrefix}index.html`;
    });
  } else {
    const loginBtn = document.createElement("li");
    loginBtn.className = "nav-item";
    loginBtn.innerHTML = `<a href="${pathPrefix}html/login.html" class="btn btn-outline-light btn-sm me-2">Iniciar Sesión</a>`;
    navList.appendChild(loginBtn);
  }
});
