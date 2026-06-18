import "./recover.css";

export default function Recover({ onBackToLogin, onShowRegister }) {
  return (
    <div className="recover-page">
      <div className="recover-card auth-card">
        <div className="recover-accentBar" />
        <div className="recover-header">
          <div className="recover-logoIcon">🔒</div>
          <h1 className="recover-title">Recuperar contraseña</h1>
          <p className="recover-subtitle">Te enviamos un enlace seguro para volver a entrar sin fricción.</p>
        </div>

        <div className="recover-note">
          <strong>Acceso protegido</strong>
          <span>Solo necesitás tu correo para iniciar el proceso de recuperación.</span>
        </div>

        <form className="recover-form" onSubmit={(event) => event.preventDefault()}>
          <div className="recover-field">
            <label className="recover-label">Correo electrónico</label>
            <input className="recover-input" type="email" placeholder="usuario@email.com" />
          </div>

          <button className="recover-btn recover-btn-primary" type="submit">
            Enviar enlace
          </button>
        </form>

        <div className="recover-footer">
          <p>¿Recordaste tu contraseña?</p>
          <button type="button" className="recover-link-button" onClick={onBackToLogin}>
            Volver al inicio de sesión
          </button>
        </div>

        <button type="button" className="recover-link-button recover-link-button-secondary" onClick={onShowRegister}>
          Crear usuario
        </button>
      </div>
    </div>
  );
}