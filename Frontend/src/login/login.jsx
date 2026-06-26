import { useState } from "react";
import "./login.css";

export default function Login({ error, onShowRegister, onShowRecover, onLoginSuccess, onClearError }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onClearError?.();
    onLoginSuccess?.({ email: correo.trim().toLowerCase(), password });
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
          
        </div>
        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label">Correo electrónico</label>
            <input
              className="login-input"
              type="email"
              placeholder="usuario@email.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
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
              required
            />
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
