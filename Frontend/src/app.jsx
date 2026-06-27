import "./app.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "./auth/auth.jsx";
import Login from "./login/login.jsx";
import Register from "./register/register.jsx";
import Home from "./home/home.jsx";
import Partidos from "./home/Partidos";
import Entradas from "./home/Entradas";
import HomeA from "./home/homeA.jsx";
import AdminEventos from "./Admin/AdminEventos";
import AdminConfiguracion from "./Admin/AdminConfiguracion";
import AdminReportes from "./Admin/AdminReportes";
import Dashboard from "./dashboard/dashboard.jsx";
import Purchase from "./purchase/purchase.jsx";
import Profile from "./profile/profile.jsx";
import { login } from "./api.js";

const seedUsers = [
  { email: "usuario@email.com", password: "123456", name: "Usuario General", role: "user" },
  { email: "receptor@email.com", password: "123456", name: "Usuario Receptor", role: "user" },
  { email: "funcionario@email.com", password: "123456", name: "Funcionario Mundial", role: "worker" },
  { email: "admin@email.com", password: "123456", name: "Administrador Mundial", role: "admin" },
];

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");

  const isExpired = () => {
    try {
      const { exp } = jwtDecode(token);
      return exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  if (!token || isExpired()) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const roleMap = { admin: "admin", funcionario: "worker", usuario: "user" };
      const role = roleMap[user.role] || "user";
      if (role !== requiredRole) {
        return <Navigate to="/" replace />;
      }
    } catch {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}

function RootRedirect() {
  const token = localStorage.getItem("token");

  if (token) {
    try {
      const { exp } = jwtDecode(token);
      if (exp * 1000 > Date.now()) {
        return <Navigate to="/home" replace />;
      }
    } catch {}
  }

  return <Navigate to="/login" replace />;
}

export default function App() {
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState("user");
  const [currentUser, setCurrentUser] = useState(null);
  const [adminSection, setAdminSection] = useState("home");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [ownedTickets, setOwnedTickets] = useState([]);
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
        navigate("/login");
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [currentUser, navigate]);

  const users = useMemo(() => [...seedUsers], []);

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
    navigate("/purchase");
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
      navigate(nextRole === "admin" ? "/admin" : nextRole === "worker" ? "/worker" : "/home");
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleClearLoginError = () => setLoginError(null);

  const handleConfirmPurchase = (ticketData) => {
    if (!currentUser) {
      showNotification("Iniciá sesión para comprar entradas.", "error");
      navigate("/login");
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
    navigate("/home");
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
    navigate("/login");
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

      <Routes>
        <Route
          path="/login"
          element={
            <AuthLayout>
              <Login
                error={loginError}
                onLoginSuccess={handleLoginSuccess}
                onClearError={handleClearLoginError}
                onShowRegister={() => { setLoginError(null); navigate("/register"); }}
              />
            </AuthLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AuthLayout>
              <Register onBackToLogin={() => navigate("/login")} />
            </AuthLayout>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
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
            </ProtectedRoute>
          }
        >
          <Route index element={<Partidos />} />
          <Route path="entradas" element={<Entradas />} />
        </Route>
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              {adminSection === "home" && (
                <HomeA
                  currentUser={currentUser}
                  stats={{ users: 0, matches: 0, tickets: 0, sales: 0 }}
                  onUsers={() => setAdminSection("config")}
                  onMatches={() => setAdminSection("eventos")}
                  onTickets={() => setAdminSection("eventos")}
                  onReports={() => setAdminSection("reportes")}
                  onConfiguration={() => setAdminSection("config")}
                  onLogout={handleLogout}
                />
              )}
              {adminSection === "eventos" && <AdminEventos onBack={() => setAdminSection("home")} />}
              {adminSection === "config" && <AdminConfiguracion onBack={() => setAdminSection("home")} />}
              {adminSection === "reportes" && <AdminReportes onBack={() => setAdminSection("home")} />}
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker"
          element={
            <ProtectedRoute requiredRole="worker">
              <Dashboard role="worker" onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase"
          element={
            <ProtectedRoute>
              <Purchase
                selectedMatch={selectedMatch}
                onConfirmPurchase={handleConfirmPurchase}
                onNotify={showNotification}
                onBackToHome={() => navigate("/home")}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile currentUser={currentUser} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
