import { useNavigate } from "react-router-dom";
import "./profile.css";

export default function Profile({ currentUser, onLogout }) {
  const navigate = useNavigate();

  return (
    <main className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">👤</div>
        <h1 className="profile-name">{currentUser?.name || currentUser?.nombre || "Usuario"}</h1>
        <p className="profile-email">{currentUser?.email || ""}</p>

        <div className="profile-actions">
          <button type="button" className="profile-btn profile-btn--home" onClick={() => navigate("/home")}>
            Volver al inicio
          </button>
          <button type="button" className="profile-btn profile-btn--logout" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </main>
  );
}
