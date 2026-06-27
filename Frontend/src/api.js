import { getToken } from "./token.js";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5167") + "/api";

async function request(url, options = {}) {
  const { auth = false, ...fetchOptions } = options;
  const headers = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers || {}),
  };

  if (auth) {
    headers.Authorization = `Bearer ${getToken()}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    let message = body || "Error en la petición";
    try {
      const parsed = JSON.parse(body);
      if (parsed.mensaje) message = parsed.mensaje;
    } catch {}
    throw new Error(message);
  }

  return response.status === 204 ? null : response.json();
}

// ── Auth ──

export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
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
  const response = await fetch(`${API_URL}/auth/register`, {
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

// ── Paises / Tipo Documento (public) ──

export async function fetchPaises() {
  return request("/paises");
}

export async function fetchTiposDocumento() {
  return request("/tipos-documento");
}

// ── Eventos (public reads, auth writes) ──

export async function fetchEventos() {
  return request("/eventos");
}

export async function getEventos() {
  return request("/eventos", { auth: true });
}

export async function fetchEvento(id) {
  return request(`/eventos/${id}`);
}

export async function crearEvento(data) {
  return request("/eventos", { method: "POST", body: JSON.stringify(data), auth: true });
}

export async function modificarEvento(id, data) {
  return request(`/eventos/${id}`, { method: "PUT", body: JSON.stringify(data), auth: true });
}

export async function eliminarEvento(id) {
  return request(`/eventos/${id}`, { method: "DELETE", auth: true });
}

// ── Sectores habilitados ──

export async function fetchEventSectors(eventId) {
  return request(`/eventos/${eventId}/sectores-habilitados`);
}

export async function getSectoresHabilitados(idEvento) {
  return request(`/eventos/${idEvento}/sectores-habilitados`);
}

export async function habilitarSector(data) {
  return request(`/eventos/${data.idEvento}/sectores-habilitados`, {
    method: "POST",
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function deshabilitarSector(idEvento, idSector) {
  return request(`/eventos/${idEvento}/sectores-habilitados/${idSector}`, {
    method: "DELETE",
    auth: true,
  });
}

// ── Equipos (public reads, auth writes) ──

export async function fetchEquipos() {
  return request("/equipos");
}

// ── Estadios (public reads, auth writes) ──

export async function fetchEstadios() {
  return request("/estadios");
}

export async function getEstadios() {
  return request("/estadios", { auth: true });
}

export async function crearEstadio(data) {
  return request("/estadios", { method: "POST", body: JSON.stringify(data), auth: true });
}

export async function modificarEstadio(nombre, data) {
  return request(`/estadios/${nombre}`, { method: "PUT", body: JSON.stringify(data), auth: true });
}

export async function eliminarEstadio(nombre) {
  return request(`/estadios/${nombre}`, { method: "DELETE", auth: true });
}

// ── Sectores ──

export async function getSectores(nombreEstadio) {
  return request(`/estadios/${nombreEstadio}/sectores`, { auth: true });
}

export async function crearSector(nombreEstadio, data) {
  return request(`/estadios/${nombreEstadio}/sectores`, {
    method: "POST",
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function modificarSector(nombreEstadio, idSector, data) {
  return request(`/estadios/${nombreEstadio}/sectores/${idSector}`, {
    method: "PUT",
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function eliminarSector(nombreEstadio, idSector) {
  return request(`/estadios/${nombreEstadio}/sectores/${idSector}`, {
    method: "DELETE",
    auth: true,
  });
}

// ── Equipos ──

export async function getEquipos() {
  return request("/equipos", { auth: true });
}

export async function crearEquipo(data) {
  return request("/equipos", { method: "POST", body: JSON.stringify(data), auth: true });
}

export async function modificarEquipo(nombre, codPais, data) {
  return request(`/equipos/${nombre}/${codPais}`, {
    method: "PUT",
    body: JSON.stringify(data),
    auth: true,
  });
}

export async function eliminarEquipo(nombre, codPais) {
  return request(`/equipos/${nombre}/${codPais}`, { method: "DELETE", auth: true });
}

// ── Escaners ──

export async function getEscaners() {
  return request("/escaners", { auth: true });
}

export async function crearEscaner(data) {
  return request("/escaners", { method: "POST", body: JSON.stringify(data), auth: true });
}

export async function eliminarEscaner(id, nombreEstadio) {
  return request(`/escaners/${id}/${nombreEstadio}`, { method: "DELETE", auth: true });
}

// ── Funcionarios ──

export async function getFuncionarios() {
  return request("/admin/funcionarios", { auth: true });
}

export async function crearFuncionario(data) {
  return request("/admin/funcionarios", { method: "POST", body: JSON.stringify(data), auth: true });
}

export async function eliminarFuncionario(email) {
  return request(`/admin/funcionarios/${email}`, { method: "DELETE", auth: true });
}

export async function modificarFuncionario(email, data) {
  return request(`/admin/funcionarios/${email}`, { method: "PUT", body: JSON.stringify(data), auth: true });
}

// ── Asignaciones ──

export async function asignarFuncionario(data) {
  return request("/admin/asignaciones", { method: "POST", body: JSON.stringify(data), auth: true });
}

export async function desasignarFuncionario(data) {
  return request("/admin/asignaciones", { method: "DELETE", body: JSON.stringify(data), auth: true });
}

// ── Reportes ──

export async function getRankingCompradores() {
  return request("/admin/reportes/ranking-compradores", { auth: true });
}

export async function getEventosMayorVenta() {
  return request("/admin/reportes/eventos-mayores-ventas", { auth: true });
}

// ── Entradas / Compras ──

export async function createPurchase(data) {
  return request("/compras", { method: "POST", body: JSON.stringify(data), auth: true });
}

export async function fetchEntradas(email) {
  return request(`/usuarios/${encodeURIComponent(email)}/entradas`, { auth: true });
}

export async function fetchEntradasCompradas(email) {
  return request(`/usuarios/${encodeURIComponent(email)}/compras`, { auth: true });
}

// ── Usuarios ──

export async function fetchUserByEmail(email) {
  return request(`/usuarios/buscar/${encodeURIComponent(email)}`, { auth: true });
}

export async function fetchProfile(email) {
  return request(`/usuarios/${encodeURIComponent(email)}`, { auth: true });
}

// ── Transferencias ──

export async function createTransferencia(idEntrada, emailRecibe) {
  return request("/transferencias", {
    method: "POST",
    body: JSON.stringify({ IdEntrada: idEntrada, EmailRecibe: emailRecibe }),
    auth: true,
  });
}

export async function fetchPendientesRecibidas() {
  return request("/transferencias/pendientes-recibidas", { auth: true });
}

export async function fetchHistorialTransferencias() {
  return request("/transferencias/historial", { auth: true });
}

export async function acceptTransferencia(id) {
  return request(`/transferencias/${id}/aceptar`, { method: "PUT", auth: true });
}

export async function rejectTransferencia(id) {
  return request(`/transferencias/${id}/rechazar`, { method: "PUT", auth: true });
}

// ── QR ──

export async function fetchQrCode(ticketId) {
  return request(`/entradas/${ticketId}/qr`, { auth: true });
}
