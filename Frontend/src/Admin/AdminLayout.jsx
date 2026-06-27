import { useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import AdminTabBar from "./AdminTabBar";
import "./Admin.css";

export default function AdminLayout({ currentUser, onLogout }) {
  const navigate = useNavigate();

  return (
    <main className="admin-page">
      <header className="admin-topBar">
        <AdminTabBar />

        <div className="admin-topBarRight">
          <button type="button" className="admin-userButton" onClick={() => navigate("/profile")}>
            <span className="admin-userIcon">👤</span>
            <span className="admin-userName">{currentUser?.name || currentUser?.nombre || "Admin"}</span>
          </button>
          <button type="button" className="admin-logout" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <Outlet context={{ currentUser, onLogout }} />
    </main>
  );
}
