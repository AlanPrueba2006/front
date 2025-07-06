document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const data = {
    nombre: document.getElementById("nombre").value.trim(),
    apellidos: document.getElementById("apellido").value.trim(),
    dni: document.getElementById("dni").value.trim(),
    phone: document.getElementById("celular").value.trim(),
    address: document.getElementById("direccion").value.trim(),
    email: document.getElementById("correo").value.trim(),
    username: document.getElementById("username").value.trim(),
    password: document.getElementById("password").value.trim()
  };

  try {
    const response = await fetch("https://back-ww44.onrender.com/usuarios/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      alert("¡Registro exitoso! ✅");
      window.location.href = "../html/login.html";
    } else {
      const error = await response.json();
      alert("Error al registrarse ❌: " + (error.detail || JSON.stringify(error)));
    }
  } catch (err) {
    alert("Error de red ❌");
    console.error(err);
  }
});
