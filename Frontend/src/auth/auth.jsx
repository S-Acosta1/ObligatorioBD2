import { NavLink } from "react-router-dom";
import "./auth.css";

export default function AuthLayout({ children }) {
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
          <NavLink to="/login" className={({ isActive }) => `auth-tab ${isActive ? "is-active" : ""}`} onClick={() => { /* error cleared by parent */ }}>
            Ingresar
          </NavLink>
          <NavLink to="/register" className={({ isActive }) => `auth-tab ${isActive ? "is-active" : ""}`}>
            Crear usuario
          </NavLink>
          <NavLink to="/recover" className={({ isActive }) => `auth-tab ${isActive ? "is-active" : ""}`}>
            Recuperar contraseña
          </NavLink>
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

      {children}
    </main>
  );
}
