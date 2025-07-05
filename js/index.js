document.addEventListener("DOMContentLoaded", () => {
  const navList = document.getElementById("navbarLinks");

  if (navList && localStorage.getItem("session") === "true") {
    const agendaItem = document.createElement("li");
    agendaItem.className = "nav-item";
    agendaItem.innerHTML = `
      <li class="nav-item"><a class="nav-link" href="./html/agenda.html">Agendar</a></li>
    `;

    // Busca el <li> que contiene el enlace a login.html
    const loginLink = navList.querySelector('a[href="./html/login.html"]');
    const loginLi = loginLink?.closest("li");

    if (loginLi) {
      navList.insertBefore(agendaItem, loginLi);
    } else {
      navList.appendChild(agendaItem);
    }
  }
});
