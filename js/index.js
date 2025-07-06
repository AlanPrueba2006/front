document.addEventListener("DOMContentLoaded", async () => {
  const navList = document.getElementById("navbarLinks");

  const token = sessionStorage.getItem("access_token");
  const encryptedUser = sessionStorage.getItem("usuario_encriptado");

  // Si el usuario está logueado, solicita sus datos descifrados
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
        // Elimina el botón de login
        const loginLink = navList.querySelector('a[href="./html/login.html"]');
        const loginLi = loginLink?.closest("li");
        loginLi?.remove();

        // Agrega botón de "Agendar"
        const agendaItem = document.createElement("li");
        agendaItem.className = "nav-item";
        agendaItem.innerHTML = `<a class="nav-link" href="./html/agenda.html">Agendar</a>`;
        navList.insertBefore(agendaItem, navList.lastElementChild); // Justo antes del último (puede ajustarse según orden)

        // Agrega nombre del usuario y botón de cerrar sesión
        const userItem = document.createElement("li");
        userItem.className = "nav-item d-flex align-items-center";
        userItem.innerHTML = `
          <span class="nav-link text-white fw-semibold">${user.first_name} ${user.last_name}</span>
          <button class="btn btn-sm btn-outline-light ms-2" id="logoutBtn">Cerrar Sesión</button>
        `;
        navList.appendChild(userItem);

        // Habilitar sesión (por compatibilidad con tu lógica antigua)
        localStorage.setItem("session", "true");

        // Botón de logout
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
