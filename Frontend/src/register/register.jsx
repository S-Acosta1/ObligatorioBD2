import "./register.css";

export default function Register({ onBackToLogin, onShowRecover }) {
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

        <form className="register-form" onSubmit={(event) => event.preventDefault()}>
          <div className="register-field">
            <label className="register-label">Nombre completo</label>
            <input className="register-input" type="text" placeholder="Tu nombre" />
          </div>

          <div className="register-field">
            <label className="register-label">Correo electrónico</label>
            <input className="register-input" type="email" placeholder="usuario@email.com" />
          </div>

          <div className="register-field">
            <label className="register-label">Contraseña</label>
            <input className="register-input" type="password" placeholder="••••••••" />
          </div>

          <div className="register-field">
            <label className="register-label">Confirmar contraseña</label>
            <input className="register-input" type="password" placeholder="••••••••" />
          </div>

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