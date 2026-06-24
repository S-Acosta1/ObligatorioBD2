import { useState } from "react";
import "./register.css";

export default function Register({ onRegisterUser, onBackToLogin, onShowRecover }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setFormError("Completá todos los datos para crear la cuenta.");
      return;
    }

    if (password.length < 6) {
      setFormError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Las contraseñas no coinciden.");
      return;
    }

    onRegisterUser?.({ name, email, password });
  };

  return (
    <div className="register-page">
      <div className="register-card auth-card">
        <div className="register-accentBar" />
        <div className="register-header">
          <div className="register-logoIcon">🎟️</div>
          <h1 className="register-title">Crear usuario</h1>
          <p className="register-subtitle">Crea tu perfil para comprar entradas y guardar tus partidos favoritos.</p>
        </div>

        <div className="register-note">
          <strong>Una cuenta, varias compras.</strong>
          <span>Guardá tu información para acelerar futuras adquisiciones.</span>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="register-field">
            <label className="register-label">Nombre completo</label>
            <input
              className="register-input"
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="register-field">
            <label className="register-label">Correo electrónico</label>
            <input
              className="register-input"
              type="email"
              placeholder="usuario@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="register-field">
            <label className="register-label">Contraseña</label>
            <input
              className="register-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div className="register-field">
            <label className="register-label">Confirmar contraseña</label>
            <input
              className="register-input"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>

          {formError && <p className="register-error">{formError}</p>}

          <button className="register-btn register-btn-primary" type="submit">
            Registrarme
          </button>
        </form>

        <div className="register-footer">
          <p>¿Ya tenés usuario?</p>
          <button type="button" className="register-link-button" onClick={onBackToLogin}>
            Volver al inicio de sesión
          </button>
        </div>

        <button type="button" className="register-link-button register-link-button-secondary" onClick={onShowRecover}>
          Olvidé mi contraseña
        </button>
      </div>
    </div>
  );
}
