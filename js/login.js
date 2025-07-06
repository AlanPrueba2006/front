document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const loginBtn = document.getElementById("loginBtn");
  const spinner = document.getElementById("spinner");

  loginBtn.disabled = true;
  spinner.classList.remove("d-none");

  try {
    const response = await fetch("https://back-ww44.onrender.com/usuarios/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      sessionStorage.setItem("access_token", data.access);
      sessionStorage.setItem("refresh_token", data.refresh);
      sessionStorage.setItem("usuario_encriptado", data.usuario_encriptado);
      window.location.href = "../index.html";
    } else {
      alert(data.error || "Error al iniciar sesión.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("No se pudo conectar con el servidor.");
  } finally {
    loginBtn.disabled = false;
    spinner.classList.add("d-none");
  }
});
