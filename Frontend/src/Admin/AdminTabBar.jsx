import { useLocation, useNavigate } from "react-router-dom";

export default function AdminTabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const tabs = [
    { path: "/admin", label: "Dashboard", key: "dashboard" },
    { path: "/admin/eventos", label: "Eventos", key: "eventos" },
    { path: "/admin/config", label: "Configuración", key: "config" },
    { path: "/admin/reportes", label: "Reportes", key: "reportes" },
  ];

  return (
    <nav className="admin-tabBar" role="tablist" aria-label="Navegación administrativa">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={`admin-tab ${path === tab.path ? "is-active" : ""}`}
          onClick={() => navigate(tab.path)}
          role="tab"
          aria-selected={path === tab.path}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
