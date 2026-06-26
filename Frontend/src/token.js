import { jwtDecode } from "jwt-decode";

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function setSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function isTokenExpired(token) {
  try {
    const { exp } = jwtDecode(token);
    return exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

const roleMap = { admin: "admin", funcionario: "worker", usuario: "user" };

export function getRoleFromUser(user) {
  return roleMap[user?.role] || "user";
}

export function isAuthenticated() {
  const token = getToken();
  return !!token && !isTokenExpired(token);
}
