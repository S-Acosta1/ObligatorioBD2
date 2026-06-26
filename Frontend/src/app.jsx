import { useEffect, useMemo, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Auth from "./auth/auth.jsx";
import Home from "./home/home.jsx";
import Dashboard from "./dashboard/dashboard.jsx";
import Purchase from "./purchase/purchase.jsx";
import { login } from "./api.js";
import "./app.css";

const seedUsers = [
  { email: "usuario@email.com", password: "123456", name: "Usuario General", role: "user" },
  { email: "receptor@email.com", password: "123456", name: "Usuario Receptor", role: "user" },
  { email: "funcionario@email.com", password: "123456", name: "Funcionario Mundial", role: "worker" },
  { email: "admin@email.com", password: "123456", name: "Administrador Mundial", role: "admin" },
];

export default function App() {
  const [page, setPage] = useState("auth");
  const [currentRole, setCurrentRole] = useState("user");
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [ownedTickets, setOwnedTickets] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loginError, setLoginError] = useState(null);
  const [notification, setNotification] = useState(null);
  const notificationTimerRef = useRef(null);

  const isTokenExpired = (token) => {
    try {
      const { exp } = jwtDecode(token);
      return exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");

    if (token && userJson && !isTokenExpired(token)) {
      const user = JSON.parse(userJson);
      const roleMap = { admin: "admin", funcionario: "worker", usuario: "user" };
      const nextRole = roleMap[user.role] || "user";
      setCurrentUser(user);
      setCurrentRole(nextRole);
      setPage(nextRole === "admin" ? "admin" : nextRole === "worker" ? "worker" : "home");
      return;
    }

    clearSession();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      const token = localStorage.getItem("token");
      if (token && isTokenExpired(token)) {
        clearSession();
        setCurrentUser(null);
        setCurrentRole("user");
        setPage("auth");
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const users = useMemo(() => [...seedUsers, ...registeredUsers], [registeredUsers]);

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

  const handleLoginSuccess = async ({ email, password }) => {
    setLoginError(null);
    try {
      const data = await login(email, password);
      const roleMap = { admin: "admin", funcionario: "worker", usuario: "user" };
      const nextRole = roleMap[data.role] || "user";
      const user = { email: data.email, nombre: data.nombre, role: data.role };

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));

      setCurrentUser(user);
      setCurrentRole(nextRole);
      setPage(nextRole === "admin" ? "admin" : nextRole === "worker" ? "worker" : "home");
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleClearLoginError = () => setLoginError(null);

  const handleRegisterUser = ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = users.some((user) => user.email === normalizedEmail);

    if (existingUser) {
      showNotification("Ya existe una cuenta registrada con ese correo.", "error");
      return false;
    }

    const newUser = {
      email: normalizedEmail,
      password,
      name: name.trim(),
      role: "user",
    };

    setRegisteredUsers((currentUsers) => [...currentUsers, newUser]);
    setCurrentUser(newUser);
    setCurrentRole("user");
    setPage("home");
    showNotification("Usuario registrado correctamente.", "success");
    return true;
  };

  const handleConfirmPurchase = (ticketData) => {
    if (!currentUser) {
      showNotification("Iniciá sesión para comprar entradas.", "error");
      setPage("auth");
      return;
    }

    setOwnedTickets((currentTickets) => [
      ...currentTickets,
      {
        ...ticketData,
        id: `${ticketData.matchId}-${Date.now()}`,
        purchasedByEmail: currentUser.email,
        purchasedByName: currentUser.name,
        currentHolderEmail: currentUser.email,
        currentHolder: currentUser.name,
        transferHistory: [],
        pendingTransfer: null,
      },
    ]);
    setSelectedMatch(null);
    setPage("home");
  };

  const handleTransferTicket = (ticketId, recipient) => {
    const normalizedRecipient = recipient.trim().toLowerCase();
    const recipientUser = users.find((user) => user.email === normalizedRecipient);

    if (!recipientUser) {
      showNotification("El usuario receptor no existe o no está registrado.", "error");
      return;
    }

    if (recipientUser.email === currentUser?.email) {
      showNotification("No podés transferirte una entrada a tu propia cuenta.", "error");
      return;
    }

    setOwnedTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              pendingTransfer: {
                id: `${ticketId}-${Date.now()}`,
                fromEmail: currentUser.email,
                fromName: currentUser.name,
                toEmail: recipientUser.email,
                toName: recipientUser.name,
                requestedAt: new Date().toISOString(),
              },
            }
          : ticket,
      ),
    );
    showNotification("Transferencia enviada. El receptor debe aceptarla.", "success");
  };

  const handleAcceptTransfer = (ticketId) => {
    setOwnedTickets((currentTickets) =>
      currentTickets.map((ticket) => {
        if (ticket.id !== ticketId || ticket.pendingTransfer?.toEmail !== currentUser?.email) {
          return ticket;
        }

        const acceptedTransfer = {
          ...ticket.pendingTransfer,
          acceptedAt: new Date().toISOString(),
        };

        return {
          ...ticket,
          currentHolderEmail: currentUser.email,
          currentHolder: currentUser.name,
          pendingTransfer: null,
          transferHistory: [...(ticket.transferHistory || []), acceptedTransfer],
        };
      }),
    );
    showNotification("Transferencia aceptada. La entrada ahora está en tu poder.", "success");
  };

  const handleRejectTransfer = (ticketId) => {
    setOwnedTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === ticketId && ticket.pendingTransfer?.toEmail === currentUser?.email
          ? {
              ...ticket,
              pendingTransfer: null,
            }
          : ticket,
      ),
    );
    showNotification("Transferencia rechazada.", "success");
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    setCurrentRole("user");
    setPage("auth");
  };

  const currentUserTickets = useMemo(() => {
    if (!currentUser) {
      return {
        purchasedTickets: [],
        heldTickets: [],
        pendingReceivedTransfers: [],
        transferHistory: [],
      };
    }

    const purchasedTickets = ownedTickets.filter((ticket) => ticket.purchasedByEmail === currentUser.email);
    const heldTickets = ownedTickets.filter((ticket) => ticket.currentHolderEmail === currentUser.email);
    const pendingReceivedTransfers = ownedTickets.filter((ticket) => ticket.pendingTransfer?.toEmail === currentUser.email);
    const transferHistory = ownedTickets.flatMap((ticket) =>
      (ticket.transferHistory || [])
        .filter((transfer) => transfer.toEmail === currentUser.email || transfer.fromEmail === currentUser.email)
        .map((transfer) => ({
          ...transfer,
          ticketId: ticket.id,
          matchName: `${ticket.selection} vs ${ticket.rival}`,
          competition: ticket.competition,
          date: ticket.date,
          time: ticket.time,
        })),
    );

    return { purchasedTickets, heldTickets, pendingReceivedTransfers, transferHistory };
  }, [currentUser, ownedTickets]);

  return (
    <>
      {notification && (
        <div className={`app-notification app-notification--${notification.type}`} role="status" aria-live="polite">
          {notification.message}
        </div>
      )}

      {page === "auth" && (
        <Auth
          loginError={loginError}
          onLoginSuccess={handleLoginSuccess}
          onRegisterUser={handleRegisterUser}
          onNotify={showNotification}
          onClearLoginError={handleClearLoginError}
        />
      )}

      {page === "home" && (
        <Home
          currentUser={currentUser}
          purchasedTickets={currentUserTickets.purchasedTickets}
          heldTickets={currentUserTickets.heldTickets}
          pendingReceivedTransfers={currentUserTickets.pendingReceivedTransfers}
          transferHistory={currentUserTickets.transferHistory}
          onBuyTicket={handleBuyTicket}
          onTransferTicket={handleTransferTicket}
          onAcceptTransfer={handleAcceptTransfer}
          onRejectTransfer={handleRejectTransfer}
          onNotify={showNotification}
          onLogout={handleLogout}
        />
      )}

      {(page === "worker" || page === "admin") && (
        <Dashboard
          role={currentRole}
          onLogout={handleLogout}
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
