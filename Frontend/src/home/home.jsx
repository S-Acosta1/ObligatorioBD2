import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TabBar from "./TabBar";
import Entradas from "./Entradas";
import "./home.css";

const matches = [
  { id: 1, selection: "Argentina", rival: "Brasil", competition: "Cuartos de final", stadium: "Estadio Azteca", city: "Ciudad de México", date: "2026-07-12", time: "19:00", price: 120 },
  { id: 2, selection: "Uruguay", rival: "Francia", competition: "Fase de grupos", stadium: "Estadio BBVA", city: "Monterrey", date: "2026-07-08", time: "16:30", price: 95 },
  { id: 3, selection: "España", rival: "Alemania", competition: "Semifinal", stadium: "SoFi Stadium", city: "Los Angeles", date: "2026-07-15", time: "21:00", price: 140 },
  { id: 4, selection: "México", rival: "Inglaterra", competition: "Octavos de final", stadium: "Estadio Akron", city: "Guadalajara", date: "2026-07-10", time: "20:45", price: 110 },
];

const selectionOptions = ["Todas", "Argentina", "Uruguay", "España", "México"];

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short", day: "2-digit", month: "short",
  }).format(new Date(`${dateValue}T00:00:00`));
}

export default function Home({
  currentUser,
  purchasedTickets = [],
  heldTickets = [],
  pendingReceivedTransfers = [],
  transferHistory = [],
  onBuyTicket,
  onTransferTicket,
  onAcceptTransfer,
  onRejectTransfer,
  onNotify,
  onLogout,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname === "/home/entradas" ? "tickets" : "matches";
  const [selectionFilter, setSelectionFilter] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");

  const futureMatches = useMemo(() => matches.filter((match) => {
    const matchesSelection = selectionFilter === "Todas" || match.selection === selectionFilter;
    const text = `${match.selection} ${match.rival} ${match.competition} ${match.stadium} ${match.city}`.toLowerCase();
    return matchesSelection && text.includes(searchTerm.toLowerCase());
  }), [selectionFilter, searchTerm]);

  return (
    <main className="home-page">
      <header className="home-topBar">
        <TabBar
          activeTab={activeTab}
          futureMatchesCount={futureMatches.length}
          heldTicketsCount={heldTickets.length}
          pendingCount={pendingReceivedTransfers.length}
        />

        <div className="home-topBarRight">
          {pendingReceivedTransfers.length > 0 && (
            <button type="button" className="home-pendingBadge" onClick={() => { navigate("/home/entradas"); }}>
              {pendingReceivedTransfers.length} pendiente{pendingReceivedTransfers.length !== 1 ? "s" : ""}
            </button>
          )}
          <button type="button" className="home-userButton" onClick={() => navigate("/profile")}>
            <span className="home-userIcon">👤</span>
            <span className="home-userName">{currentUser?.name || currentUser?.nombre || "Usuario"}</span>
          </button>
          <button type="button" className="home-logout" onClick={onLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <Outlet context={{ currentUser, purchasedTickets, heldTickets, pendingReceivedTransfers, transferHistory, onBuyTicket, onTransferTicket, onAcceptTransfer, onRejectTransfer, onNotify }} />
    </main>
  );
}
