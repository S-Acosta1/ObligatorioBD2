import { useState } from "react";
import "./login.css";

export default function Login({ onShowRegister, onShowRecover, onLoginSuccess }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [accountRole, setAccountRole] = useState("user");

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Login:", correo, password);
    onLoginSuccess?.(accountRole);
  };

  return (
    <div className="login-page">
      <div className="login-card auth-card">
        <div className="login-accentBar" aria-hidden="true" />

        <div className="login-brandMark">
          <span className="login-logoIcon">🎫</span>
        </div>

        <div className="login-header">
          <p className="login-kicker">Mundial 2026</p>
          <h1 className="login-title">Tu acceso a los partidos más esperados.</h1>
          <p className="login-subtitle">
            Ingresá para comprar entradas, gestionar tu cuenta o recuperar el acceso si lo necesitás.
          </p>
        </div>

        <div className="login-intro">
          <p>Elegí el perfil con el que querés entrar para acceder a la experiencia de usuario, funcionario o administrador.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label">Perfil de acceso</label>
            <select
              className="login-input login-select"
              value={accountRole}
              onChange={(e) => setAccountRole(e.target.value)}
            >
              <option value="user">Usuario general</option>
              <option value="worker">Funcionario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="login-field">
            <label className="login-label">Correo electrónico</label>
            <input
              className="login-input"
              type="email"
              placeholder="usuario@email.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label className="login-label">Contraseña</label>
            <input
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="login-note">
            <span>Vistas por rol</span>
            <strong>Usuario, funcionario y administrador</strong>
          </div>

          <button className="login-btn login-btn-primary" type="submit">
            Iniciar sesión
          </button>
        </form>

        <div className="login-linksRow">
          <button type="button" className="login-link-button" onClick={onShowRegister}>
            Crear usuario
          </button>
          <button type="button" className="login-link-button" onClick={onShowRecover}>
            Olvidé mi contraseña
          </button>
        </div>
      </div>
    </div>
  );
}