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

export async function registerUser(data) {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.mensaje || "Error del servidor. Intentalo de nuevo más tarde.");
  }

  return body;
}

export async function fetchTiposDocumento() {
  const response = await fetch(`${API_URL}/api/tipos-documento`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener los tipos de documento.");
  }

  return response.json();
}

export async function fetchPaises() {
  const response = await fetch(`${API_URL}/api/paises`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener los países.");
  }

  return response.json();
}

export async function fetchEstadios() {
  const response = await fetch(`${API_URL}/api/estadios`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener los estadios.");
  }

  return response.json();
}

export async function fetchEventos() {
  const response = await fetch(`${API_URL}/api/eventos`);

  if (!response.ok) {
    throw new Error("No se pudieron obtener los eventos.");
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
