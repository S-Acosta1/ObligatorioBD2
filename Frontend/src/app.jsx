import "./app.css";
import { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { getToken, getUser, setSession, clearSession, isTokenExpired, getRoleFromUser } from "./token.js";
import AuthLayout from "./auth/auth.jsx";
import Login from "./login/login.jsx";
import Register from "./register/register.jsx";
import Home from "./home/home.jsx";
import Partidos from "./home/Partidos";
import Entradas from "./home/Entradas";
import AdminLayout from "./Admin/AdminLayout";
import AdminDashboard from "./Admin/AdminDashboard";
import AdminEventos from "./Admin/AdminEventos";
import AdminConfiguracion from "./Admin/AdminConfiguracion";
import AdminReportes from "./Admin/AdminReportes";
import Dashboard from "./dashboard/dashboard.jsx";
import Purchase from "./purchase/purchase.jsx";
import Profile from "./profile/profile.jsx";
import { login } from "./api.js";

function ProtectedRoute({ children, requiredRole }) {
  const token = getToken();

  if (!token || isTokenExpired(token)) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    try {
      const user = getUser();
      if (getRoleFromUser(user) !== requiredRole) {
        return <Navigate to="/" replace />;
      }
    } catch {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}

function RootRedirect() {
  const token = getToken();

  if (token && !isTokenExpired(token)) {
    return <Navigate to="/home" replace />;
  }

  return <Navigate to="/login" replace />;
}

export default function App() {
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState("user");
  const [currentUser, setCurrentUser] = useState(null);

  const [loginError, setLoginError] = useState(null);
  const [notification, setNotification] = useState(null);
  const notificationTimerRef = useRef(null);

  useEffect(() => {
    const token = getToken();
    const user = getUser();

    if (token && user && !isTokenExpired(token)) {
      setCurrentUser(user);
      setCurrentRole(getRoleFromUser(user));
      return;
    }

    clearSession();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      const token = getToken();
      if (token && isTokenExpired(token)) {
        clearSession();
        setCurrentUser(null);
        setCurrentRole("user");
        navigate("/login");
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [currentUser, navigate]);

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
    navigate(`/purchase/${match.id}`);
  };

  const handleLoginSuccess = async ({ email, password }) => {
    setLoginError(null);
    try {
      const data = await login(email, password);
      const user = { email: data.email, nombre: data.nombre, role: data.role };
      const nextRole = getRoleFromUser(user);

      setSession(data.token, user);

      setCurrentUser(user);
      setCurrentRole(nextRole);
      navigate(nextRole === "admin" ? "/admin" : nextRole === "worker" ? "/worker" : "/home");
    } catch (err) {
      setLoginError(err.message);
    }
  };

  const handleClearLoginError = () => setLoginError(null);

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    setCurrentRole("user");
    navigate("/login");
  };

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
                onBuyTicket={handleBuyTicket}
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
              <AdminLayout currentUser={currentUser} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="eventos" element={<AdminEventos />} />
          <Route path="config" element={<AdminConfiguracion />} />
          <Route path="reportes" element={<AdminReportes />} />
        </Route>
        <Route
          path="/worker"
          element={
            <ProtectedRoute requiredRole="worker">
              <Dashboard role="worker" onLogout={handleLogout} onNotify={showNotification} />
            </ProtectedRoute>
          }
        />
        <Route path="/purchase/:eventId" element={
          <ProtectedRoute>
            <Purchase
              currentUser={currentUser}
              onNotify={showNotification}
              onBackToHome={() => navigate("/home")}
            />
          </ProtectedRoute>
        } />
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
