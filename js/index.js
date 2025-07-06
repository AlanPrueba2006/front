document.addEventListener("DOMContentLoaded", async () => {
  const navList = document.getElementById("navbarLinks");

  const token = sessionStorage.getItem("access_token");
  const encryptedUser = sessionStorage.getItem("usuario_encriptado");

  if (token && encryptedUser) {
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
        const loginLinks = navList.querySelectorAll("a");
        loginLinks.forEach((link) => {
          if (link.href.includes("login.html")) {
            link.closest("li")?.remove();
          }
        });

        const agendaLinks = navList.querySelectorAll('a[href*="agenda.html"]');
        if (agendaLinks.length > 1) {
          for (let i = 1; i < agendaLinks.length; i++) {
            agendaLinks[i].closest("li")?.remove();
          }
        }

        const userItem = document.createElement("li");
        userItem.className = "nav-item dropdown";
        userItem.innerHTML = `
          <a class="nav-link dropdown-toggle text-white" href="#" id="perfilDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Perfil
          </a>
          <ul class="dropdown-menu dropdown-menu-end bg-dark" aria-labelledby="perfilDropdown">
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
      }

    } catch (error) {
      console.error("Error al descifrar usuario:", error);
      sessionStorage.clear();
      localStorage.removeItem("session");
    }
  }
});
