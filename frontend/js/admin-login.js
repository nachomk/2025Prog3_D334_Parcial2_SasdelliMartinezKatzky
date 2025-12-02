const API_BASE = "http://localhost:3000";

async function manejarLoginAdmin(evento) {
  evento.preventDefault();

  const inputEmail = document.getElementById("adm-email");
  const inputPassword = document.getElementById("adm-password");
  const msgError = document.getElementById("adm-error");

  // Limpiar mensaje de error para que no quede en la pantalla por siempre
  msgError.style.display = "none";
  msgError.textContent = "";

  const email = inputEmail.value.trim();
  const password = inputPassword.value.trim();

  
  if (email === "" || password === "") {
    msgError.textContent = "Completá email y contraseña.";
    msgError.style.display = "block";
    return;
  }

  try {
    const respuesta = await fetch(API_BASE + "/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    });

    const datos = await respuesta.json();

   //manejo de errores
    if (!respuesta.ok || !datos.ok) {
      const mensaje = datos.error || "Credenciales inválidas.";
      msgError.textContent = mensaje;
      msgError.style.display = "block";
      return;
    }

    
    localStorage.setItem("ADMIN_USUARIO", JSON.stringify(datos.usuario));

    // Redirigir al dashboard de admin
    window.location.href = "02_dashboard.html";
  } catch (err) {
    console.error("Error al hacer login admin", err);
    msgError.textContent = "Error de conexión con el servidor.";
    msgError.style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("adm-login-form");
  form.addEventListener("submit", manejarLoginAdmin);

  const btnVolver = document.getElementById("adm-volver");
  btnVolver.addEventListener("click", function () {
    window.location.href = "../screens/01_welcome.html";
  });
});
