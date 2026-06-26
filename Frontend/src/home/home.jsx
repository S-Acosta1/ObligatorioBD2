import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Outlet } from "react-router-dom";
import TabBar from "./TabBar";
import { fetchEventos } from "../api";
import "./home.css";

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
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    fetchEventos()
      .then(setEventos)
      .catch(() => setEventos([]));
  }, []);

  return (
    <main className="home-page">
      <header className="home-topBar">
        <TabBar
          activeTab={activeTab}
          futureMatchesCount={eventos.length}
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

      <Outlet context={{ currentUser, purchasedTickets, heldTickets, pendingReceivedTransfers, transferHistory, onBuyTicket, onTransferTicket, onAcceptTransfer, onRejectTransfer, onNotify, eventos }} />
    </main>
  );
}
