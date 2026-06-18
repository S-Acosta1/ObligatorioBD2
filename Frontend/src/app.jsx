import { useRef, useState } from "react";
import Auth from "./auth/auth.jsx";
import Home from "./home/home.jsx";
import Dashboard from "./dashboard/dashboard.jsx";
import Purchase from "./purchase/purchase.jsx";
import "./app.css";

export default function App() {
  const [page, setPage] = useState("auth");
  const [currentRole, setCurrentRole] = useState("user");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [ownedTickets, setOwnedTickets] = useState([]);
  const [notification, setNotification] = useState(null);
  const notificationTimerRef = useRef(null);

  const showNotification = (message, type = "success") => {
    if (notificationTimerRef.current) {
      window.clearTimeout(notificationTimerRef.current);
    }

    setNotification({ message, type });
    notificationTimerRef.current = window.setTimeout(() => {
      setNotification(null);
      notificationTimerRef.current = null;
    }, 3200);
  };

  const handleBuyTicket = (match) => {
    setSelectedMatch(match);
    setPage("purchase");
  };

  const handleLoginSuccess = (role) => {
    const nextRole = role || "user";
    setCurrentRole(nextRole);
    setPage(nextRole === "admin" ? "admin" : nextRole === "worker" ? "worker" : "home");
  };

  const handleConfirmPurchase = (ticketData) => {
    setOwnedTickets((currentTickets) => [
      ...currentTickets,
      {
        ...ticketData,
        id: `${ticketData.matchId}-${Date.now()}`,
        currentHolder: ticketData.buyerName || ticketData.buyerEmail || "Titular",
      },
    ]);
    setSelectedMatch(null);
    setPage("home");
  };

  const handleTransferTicket = (ticketId, recipient) => {
    setOwnedTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              currentHolder: recipient,
              transferredTo: recipient,
            }
          : ticket,
      ),
    );
  };

  return (
    <>
      {notification && (
        <div className={`app-notification app-notification--${notification.type}`} role="status" aria-live="polite">
          {notification.message}
        </div>
      )}

      {page === "auth" && <Auth onLoginSuccess={handleLoginSuccess} />}

      {page === "home" && (
        <Home
          ownedTickets={ownedTickets}
          onBuyTicket={handleBuyTicket}
          onTransferTicket={handleTransferTicket}
          onNotify={showNotification}
          onLogout={() => setPage("auth")}
        />
      )}

      {(page === "worker" || page === "admin") && (
        <Dashboard
          role={currentRole}
          onLogout={() => setPage("auth")}
          onNotify={showNotification}
        />
      )}

      {page === "purchase" && (
        <Purchase
          selectedMatch={selectedMatch}
          onConfirmPurchase={handleConfirmPurchase}
          onNotify={showNotification}
          onBackToHome={() => setPage("home")}
        />
      )}
    </>
  );
}