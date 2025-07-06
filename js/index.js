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
        // Elimina botón de login si existe
        const loginLink = navList.querySelector('a[href="../html/login.html"]');
        loginLink?.closest("li")?.remove();

        // Elimina "Agendar" duplicado si existe ya en HTML
        const agendaLinks = navList.querySelectorAll('a[href="../html/agenda.html"]');
        if (agendaLinks.length > 1) {
          agendaLinks.forEach((link, index) => {
            if (index > 0) link.closest("li")?.remove(); // Deja solo el primero
          });
        }

        // Agrega el nombre y botón cerrar sesión
        const userItem = document.createElement("li");
        userItem.className = "nav-item d-flex align-items-center";
        userItem.innerHTML = `
          <span class="nav-link text-white fw-semibold">${user.nombre} ${user.apellidos}</span>
          <button class="btn btn-sm btn-outline-light ms-2" id="logoutBtn">Cerrar Sesión</button>
        `;
        navList.appendChild(userItem);

        // Marca sesión activa (opcional)
        localStorage.setItem("session", "true");

        // Logout
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
