import { useNavigate } from "react-router-dom";

export default function TabBar({ activeTab, futureMatchesCount, heldTicketsCount, pendingCount }) {
  const navigate = useNavigate();

  return (
    <nav className="home-tabBar" role="tablist" aria-label="Navegación principal">
      <button
        type="button"
        className={`home-tab ${activeTab === "matches" ? "is-active" : ""}`}
        onClick={() => navigate("/home")}
        role="tab"
        aria-selected={activeTab === "matches"}
      >
        Partidos
        <span className="home-tabCount">{futureMatchesCount}</span>
      </button>
      <button
        type="button"
        className={`home-tab ${activeTab === "tickets" ? "is-active" : ""}`}
        onClick={() => navigate("/home/entradas")}
        role="tab"
        aria-selected={activeTab === "tickets"}
      >
        Mis Entradas
        <span className="home-tabCount">{heldTicketsCount}</span>
        {pendingCount > 0 && (
          <span className="home-tabBadge">{pendingCount}</span>
        )}
      </button>
    </nav>
  );
}
