import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProfile } from "../api";
import "./profile.css";

export default function Profile({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.email) {
      setLoading(false);
      return;
    }

    fetchProfile(currentUser.email)
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [currentUser?.email]);

  const u = profile || currentUser;

  return (
    <main className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">👤</div>
        <h1 className="profile-name">{u?.name || u?.nombre || "Usuario"}</h1>
        <p className="profile-email">{u?.email || ""}</p>

        <div className="profile-details">
          <div className="profile-field">
            <span className="profile-label">Rol</span>
            <span className="profile-value">{currentUser?.role === "funcionario" ? "Funcionario" : currentUser?.role === "admin" ? "Administrador" : "Usuario"}</span>
          </div>

          {profile && (
            <>
              <div className="profile-divider" />
              <p className="profile-sectionTitle">Documento</p>
              <div className="profile-field">
                <span className="profile-label">Tipo</span>
                <span className="profile-value">{profile.tipoDocumento === "passport" ? "Pasaporte" : "DNI / CI"}</span>
              </div>
              <div className="profile-field">
                <span className="profile-label">Número</span>
                <span className="profile-value">{profile.numeroDocumento}</span>
              </div>
              <div className="profile-field">
                <span className="profile-label">País del documento</span>
                <span className="profile-value">{profile.codPaisDocumento}</span>
              </div>

              {profile.calle && (
                <>
                  <div className="profile-divider" />
                  <p className="profile-sectionTitle">Dirección</p>
                  <div className="profile-field">
                    <span className="profile-label">Calle</span>
                    <span className="profile-value">{profile.calle}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-label">Localidad</span>
                    <span className="profile-value">{profile.localidad}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-label">Código postal</span>
                    <span className="profile-value">{profile.codigoPostal}</span>
                  </div>
                  <div className="profile-field">
                    <span className="profile-label">País</span>
                    <span className="profile-value">{profile.codPaisDireccion}</span>
                  </div>
                </>
              )}

              {profile.estadoVerificacion && (
                <>
                  <div className="profile-divider" />
                  <div className="profile-field">
                    <span className="profile-label">Estado de verificación</span>
                    <span className="profile-value profile-value--verify">{profile.estadoVerificacion}</span>
                  </div>
                </>
              )}
            </>
          )}

          {loading && <p className="profile-loading">Cargando datos del perfil…</p>}
        </div>

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
