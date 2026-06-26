const API_URL = import.meta.env.VITE_API_URL || null;
if (API_URL == null) {
	console.error("Missing VITE_API_URL");
}

export async function login(email, password) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Correo o contraseña incorrectos.");
    }
    throw new Error("Error del servidor. Intentalo de nuevo más tarde.");
  }

  return response.json();
}

export async function fetchProfile(email) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/api/usuarios/${encodeURIComponent(email)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener el perfil.");
  }

  return response.json();
}
