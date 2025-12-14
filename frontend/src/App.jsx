import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";

import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import LoadingSpinner from "./components/LoadingSpinner";

import { AuthContext } from "./context/AuthContext";
import { ToastContext } from "./context/ToastContext";

/* =========================
   PROTECTED ROUTE
========================= */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useContext(AuthContext);

  if (loading) return <LoadingSpinner fullScreen />;

  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && !isAdmin()) return <Navigate to="/" replace />;

  return children;
};

/* =========================
   PUBLIC ROUTE
========================= */
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <LoadingSpinner fullScreen />;

  if (user) return <Navigate to="/dashboard" replace />;

  return children;
};

/* =========================
   APP
========================= */
export default function App() {
  const { toasts, removeToast } = useContext(ToastContext);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        {/* TOASTS */}
        <div className="fixed top-20 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>

        {/* MAIN */}
        <main className="container mx-auto px-4 py-8 flex-1">
          <Routes>
            {/* HOME (PUBLIC) */}
            <Route path="/" element={<Home />} />

            {/* AUTH */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* DASHBOARD */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* ADMIN */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              }
            />

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* FOOTER */}
        <footer className="bg-gradient-to-r from-amber-800 to-orange-800 text-white py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="text-amber-100">
              © {new Date().getFullYear()} Sweet Shop. Made with 🍬 and ❤
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
