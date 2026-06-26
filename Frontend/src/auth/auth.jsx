import { useState } from "react";
import Login from "../login/login.jsx";
import Register from "../register/register.jsx";
import Recover from "../recover/recover.jsx";
import "./auth.css";

export default function Auth({ loginError, onLoginSuccess, onRegisterUser, onNotify, onClearLoginError }) {
  const [activeView, setActiveView] = useState("login");

  return (
    <main className="auth-shell">
      <section className="auth-hero" aria-label="Acceso al sistema">
        <div className="auth-brandMark">Mundial 2026 Ticketing</div>
        <p className="auth-kicker">Venta oficial de entradas</p>
        <h1 className="auth-title">Gestioná tu acceso desde una experiencia clara, elegante y directa.</h1>
        <p className="auth-description">
          Ingresá, creá tu usuario o recuperá la contraseña desde una interfaz separada por vista, lista para crecer con rutas reales y backend.
        </p>

        <div className="auth-tabs" role="tablist" aria-label="Opciones de autenticación">
          <button type="button" className={`auth-tab ${activeView === "login" ? "is-active" : ""}`} onClick={() => { setActiveView("login"); onClearLoginError?.(); }}>Ingresar</button>
          <button type="button" className={`auth-tab ${activeView === "register" ? "is-active" : ""}`} onClick={() => { setActiveView("register"); onClearLoginError?.(); }}>Crear usuario</button>
          <button type="button" className={`auth-tab ${activeView === "recover" ? "is-active" : ""}`} onClick={() => { setActiveView("recover"); onClearLoginError?.(); }}>Recuperar contraseña</button>
        </div>

        <div className="auth-highlights" aria-label="Beneficios">
          <article className="auth-highlightCard">
            <span>Partidos futuros</span>
            <strong>Filtrá por selección y fecha</strong>
          </article>
          <article className="auth-highlightCard">
            <span>Compra guiada</span>
            <strong>Checkout claro y ordenado</strong>
          </article>
        </div>
      </section>

      {activeView === "login" && (
        <Login
          error={loginError}
          onLoginSuccess={onLoginSuccess}
          onClearError={onClearLoginError}
          onShowRegister={() => setActiveView("register")}
          onShowRecover={() => setActiveView("recover")}
        />
      )}

      {activeView === "register" && (
        <Register
          onRegisterUser={onRegisterUser}
          onBackToLogin={() => setActiveView("login")}
          onShowRecover={() => setActiveView("recover")}
        />
      )}

      {activeView === "recover" && (
        <Recover
          onBackToLogin={() => setActiveView("login")}
          onShowRegister={() => setActiveView("register")}
        />
      )}
    </main>
  );
}
