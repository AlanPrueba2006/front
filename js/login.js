document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("https://back-ww44.onrender.com/usuarios/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Guarda el token y el usuario encriptado
      sessionStorage.setItem("access_token", data.access);
      sessionStorage.setItem("refresh_token", data.refresh);
      sessionStorage.setItem("usuario_encriptado", data.usuario_encriptado);

      // Redirige al index
      window.location.href = "../index.html";
    } else {
      alert(data.error || "Error al iniciar sesión.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("No se pudo conectar con el servidor.");
  }
});
