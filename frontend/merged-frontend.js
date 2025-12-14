
// FILE: C:\Users\arpit\Desktop\Sweet shop\frontend\src\api\axios.js
// FILE: frontend/src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// FILE: C:\Users\arpit\Desktop\Sweet shop\frontend\src\App.jsx
// FILE: src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import LoadingSpinner from "./components/LoadingSpinner";
import { AuthContext } from "./context/AuthContext";
import { ToastContext } from "./context/ToastContext";

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  const { toasts, removeToast } = useContext(ToastContext);

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar />
        
        {/* Toast Container */}
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

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
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
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-amber-800 to-orange-800 text-white py-6 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p className="text-amber-100">
              © 2024 Sweet Shop. Made with 🍬 and ❤
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

// FILE: C:\Users\arpit\Desktop\Sweet shop\frontend\src\components\LoadingSpinner.jsx
// FILE: src/components/LoadingSpinner.jsx
export default function LoadingSpinner({ fullScreen = false, size = "md" }) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizeClasses[size]} border-4 border-amber-200 border-t-amber-500 
                    rounded-full animate-spin`}
      />
      <span className="text-amber-600 font-medium animate-pulse">
        Loading delicious sweets...
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 z-50">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center py-12">{spinner}</div>;
}

// FILE: C:\Users\arpit\Desktop\Sweet shop\frontend\src\components\Navbar.jsx
// FILE: src/components/Navbar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext";

export default function Navbar() {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    addToast("Logged out successfully", "success");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children }) => (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        isActive(to)
          ? "bg-white/20 text-white"
          : "text-amber-100 hover:text-white hover:bg-white/10"
      }`}
      onClick={() => setMobileMenuOpen(false)}
    >
      {children}
    </Link>
  );

  return (
    <nav className="bg-gradient-to-r from-amber-600 via-orange-500 to-rose-500 shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-3xl animate-float">🍬</span>
            <span className="text-xl font-bold text-white tracking-wide">
              Sweet Shop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <>
                <NavLink to="/">
                  <span className="flex items-center gap-2">
                    🏠 Dashboard
                  </span>
                </NavLink>
                
                {isAdmin() && (
                  <NavLink to="/admin">
                    <span className="flex items-center gap-2">
                      ⚙ Admin Panel
                    </span>
                  </NavLink>
                )}
                
                <div className="flex items-center ml-4 pl-4 border-l border-white/30">
                  <div className="flex items-center gap-2 text-white mr-4">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm hidden lg:block">
                      {user.email}
                    </span>
                    {isAdmin() && (
                      <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg 
                             font-medium transition-all duration-200 flex items-center gap-2"
                  >
                    🚪 Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <Link
                  to="/register"
                  className="bg-white text-amber-600 px-4 py-2 rounded-lg font-semibold 
                           hover:bg-amber-50 transition-all duration-200 shadow-md"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-white/20">
            {user ? (
              <>
                <NavLink to="/">🏠 Dashboard</NavLink>
                {isAdmin() && <NavLink to="/admin">⚙ Admin Panel</NavLink>}
                <div className="pt-2 border-t border-white/20">
                  <p className="text-amber-100 text-sm px-4 py-2">
                    {user.email}
                  </p>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-lg"
                  >
                    🚪 Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/register">Register</NavLink>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

// FILE: C:\Users\arpit\Desktop\Sweet shop\frontend\src\components\SweetCard.jsx
// FILE: frontend/src/components/SweetCard.jsx
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function SweetCard({
  sweet,
  onPurchase,
  onEdit,
  onDelete,
  onRestock,
  purchasing,
}) {
  const { isAdmin } = useContext(AuthContext);
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = sweet.quantity === 0;

  const getCategoryEmoji = (category) => {
    const emojis = {
      chocolate: "🍫",
      candy: "🍬",
      cake: "🎂",
      cookie: "🍪",
      ice_cream: "🍦",
      traditional: "🪔",
      pastry: "🥐",
      default: "🍭",
    };
    return emojis[category?.toLowerCase()] || emojis.default;
  };

  const getCategoryColor = (category) => {
    const colors = {
      chocolate: "from-amber-700 to-yellow-800",
      candy: "from-pink-500 to-rose-500",
      cake: "from-purple-500 to-pink-500",
      cookie: "from-amber-500 to-orange-500",
      ice_cream: "from-cyan-400 to-blue-500",
      traditional: "from-orange-500 to-red-500",
      pastry: "from-yellow-500 to-amber-500",
      default: "from-gray-400 to-gray-500",
    };
    return colors[category?.toLowerCase()] || colors.default;
  };

  const handlePurchase = () => {
    if (quantity > 0 && quantity <= sweet.quantity) {
      onPurchase(sweet._id, quantity);
    }
  };

  return (
    <div className="card group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      {/* Category Banner */}
      <div
        className={`bg-gradient-to-r ${getCategoryColor(
          sweet.category
        )} p-4 text-white`}
      >
        <div className="flex items-center justify-between">
          <span className="text-3xl">{getCategoryEmoji(sweet.category)}</span>
          <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full capitalize">
            {sweet.category || "Sweet"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-amber-600 transition-colors">
          {sweet.name}
        </h3>

        {sweet.description && (
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">
            {sweet.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gradient">
              ₹{sweet.price}
            </span>
            <span className="text-gray-400 text-sm">/piece</span>
          </div>

          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
              isOutOfStock
                ? "bg-red-100 text-red-600"
                : sweet.quantity < 10
                ? "bg-amber-100 text-amber-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOutOfStock
                  ? "bg-red-500"
                  : sweet.quantity < 10
                  ? "bg-amber-500"
                  : "bg-green-500"
              }`}
            />
            {isOutOfStock ? "Out of Stock" : `${sweet.quantity} left`}
          </div>
        </div>

        {/* Quantity Selector */}
        {!isOutOfStock && (
          <div className="flex items-center gap-2 mb-3">
            <label className="text-sm text-gray-600">Qty:</label>
            <div className="flex items-center border rounded-lg">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 hover:bg-gray-100"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    Math.max(
                      1,
                      Math.min(
                        sweet.quantity,
                        parseInt(e.target.value) || 1
                      )
                    )
                  )
                }
                className="w-12 text-center border-x py-1"
              />
              <button
                type="button"
                onClick={() =>
                  setQuantity(Math.min(sweet.quantity, quantity + 1))
                }
                className="px-3 py-1 hover:bg-gray-100"
              >
                +
              </button>
            </div>
            <span className="text-sm text-gray-500">
              Total: ₹{(sweet.price * quantity).toFixed(2)}
            </span>
          </div>
        )}

        {/* Buttons */}
        <button
          disabled={isOutOfStock || purchasing}
          onClick={handlePurchase}
          className={`w-full py-3 rounded-xl font-semibold ${
            isOutOfStock || purchasing
              ? "bg-gray-200 text-gray-400"
              : "btn-primary"
          }`}
        >
          {purchasing
            ? "Processing..."
            : isOutOfStock
            ? "Out of Stock"
            : "Purchase Now"}
        </button>

        {isAdmin() && (
          <div className="flex gap-2 pt-2 border-t">
            <button onClick={() => onEdit(sweet)}>✏ Edit</button>
            <button onClick={() => onRestock(sweet)}>📦 Restock</button>
            <button onClick={() => onDelete(sweet._id)}>🗑 Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}


// FILE: C:\Users\arpit\Desktop\Sweet shop\frontend\src\components\SweetModal.jsx
// FILE: src/components/SweetModal.jsx
import { useState, useEffect } from "react";

export default function SweetModal({ isOpen, onClose, onSubmit, sweet, mode }) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  const categories = [
    { value: "chocolate", label: "🍫 Chocolate" },
    { value: "candy", label: "🍬 Candy" },
    { value: "cake", label: "🎂 Cake" },
    { value: "cookie", label: "🍪 Cookie" },
    { value: "ice_cream", label: "🍦 Ice Cream" },
    { value: "traditional", label: "🪔 Traditional" },
    { value: "pastry", label: "🥐 Pastry" },
  ];

  useEffect(() => {
    if (sweet && mode === "edit") {
      setForm({
        name: sweet.name || "",
        category: sweet.category || "",
        price: sweet.price?.toString() || "",
        quantity: sweet.quantity?.toString() || "",
        description: sweet.description || "",
      });
    } else {
      setForm({
        name: "",
        category: "",
        price: "",
        quantity: "",
        description: "",
      });
    }
    setErrors({});
  }, [sweet, mode, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.category) newErrors.category = "Category is required";
    if (!form.price || Number(form.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!form.quantity || Number(form.quantity) < 0)
      newErrors.quantity = "Valid quantity is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...form,
      price: Number(form.price),
      quantity: Number(form.quantity),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {mode === "edit" ? "✏ Edit Sweet" : "➕ Add New Sweet"}
            </h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sweet Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`input-field ${
                errors.name ? "border-red-500 focus:border-red-500" : ""
              }`}
              placeholder="Enter sweet name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={`input-field ${
                errors.category ? "border-red-500 focus:border-red-500" : ""
              }`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Price and Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={`input-field ${
                  errors.price ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="0"
                min="0"
                step="0.01"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className={`input-field ${
                  errors.quantity ? "border-red-500 focus:border-red-500" : ""
                }`}
                placeholder="0"
                min="0"
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="input-field resize-none h-24"
              placeholder="Enter a description (optional)"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {mode === "edit" ? "Update Sweet" : "Add Sweet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// FILE: C:\Users\arpit\Desktop\Sweet shop\frontend\src\components\Toast.jsx
// FILE: src/components/Toast.jsx
import { useEffect, useState } from "react";

export default function Toast({ message, type = "success", onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 2700);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-amber-500",
    info: "bg-blue-500",
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`${typeStyles[type]} text-white px-4 py-3 rounded-lg shadow-lg 
                    flex items-center gap-3 min-w-[280px]`}
      >
        <span className="text-xl">{icons[type]}</span>
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// FILE: C:\Users\arpit\Desktop\Sweet shop\frontend\src\context\AuthContext.jsx
// FILE: frontend/src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Auth restore failed:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = ({ token, user }) => {
    if (!token || !user) {
      console.error("Invalid login payload", { token, user });
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // ✅ Fixed: Check for "ADMIN" (uppercase) to match backend
  const isAdmin = () => {
    return user?.role === "ADMIN";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// FILE: C:\Users\arpit\Desktop\Sweet shop\frontend\src\context\ToastContext.jsx
// FILE: src/context/ToastContext.jsx
import { createContext, useState, useCallback } from "react";

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

// FILE: C:\Users\arpit\Desktop\Sweet shop\frontend\src\main.jsx
// FILE: src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
);

// FILE: C:\Users\arpit\Desktop\Sweet shop\frontend\src\pages\Admin.jsx
import { useState, useEffect, useContext } from "react";
import api from "../api/axios";
import SweetModal from "../components/SweetModal";
import LoadingSpinner from "../components/LoadingSpinner";
import { ToastContext } from "../context/ToastContext";
import { AuthContext } from "../context/AuthContext";

export default function Admin() {
  const [sweets, setSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSweet, setEditingSweet] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { user } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);

  // Fetch sweets
  useEffect(() => {
    if (user) fetchSweets();
  }, [user]);

  const fetchSweets = async () => {
    try {
      setLoading(true);
      const res = await api.get("/sweets");
      setSweets(res.data.sweets || res.data);
    } catch {
      addToast("Failed to load sweets", "error");
    } finally {
      setLoading(false);
    }
  };

  // Add sweet
  const handleAddSweet = async (data) => {
    try {
      setActionLoading(true);
      const res = await api.post("/sweets", data);
      setSweets((prev) => [res.data.sweet, ...prev]);
      setModalOpen(false);
      addToast("Sweet added successfully 🍬", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Add failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Update sweet
  const handleUpdateSweet = async (data) => {
    try {
      setActionLoading(true);
      const res = await api.put(`/sweets/${editingSweet._id}`, data);
      setSweets((prev) =>
        prev.map((s) => (s._id === editingSweet._id ? res.data.sweet : s))
      );
      setEditingSweet(null);
      setModalOpen(false);
      addToast("Sweet updated ✏", "success");
    } catch {
      addToast("Update failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete sweet
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this sweet?")) return;

    try {
      await api.delete(`/sweets/${id}`);
      setSweets((prev) => prev.filter((s) => s._id !== id));
      addToast("Sweet deleted 🗑", "success");
    } catch {
      addToast("Delete failed", "error");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gradient">⚙ Admin Panel</h1>
        <button
          onClick={() => {
            setEditingSweet(null);
            setModalOpen(true);
          }}
          className="btn-primary"
        >
          ➕ Add Sweet
        </button>
      </div>

      {/* Sweets Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-amber-500 text-white">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sweets.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  No sweets found 🍭
                </td>
              </tr>
            ) : (
              sweets.map((sweet) => (
                <tr key={sweet._id} className="border-t">
                  <td className="p-3">{sweet.name}</td>
                  <td className="p-3 capitalize">{sweet.category}</td>
                  <td className="p-3">₹{sweet.price}</td>
                  <td className="p-3">{sweet.quantity}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingSweet(sweet);
                        setModalOpen(true);
                      }}
                      className="btn-secondary"
                    >
                      ✏
                    </button>
                    <button
                      onClick={() => handleDelete(sweet._id)}
                      className="btn-danger"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <SweetModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSweet(null);
        }}
        onSubmit={editingSweet ? handleUpdateSweet : handleAddSweet}
        sweet={editingSweet}
        mode={editingSweet ? "edit" : "add"}
        loading={actionLoading}
      />
    </div>
  );
}


// FILE: C:\Users\arpit\Desktop\Sweet shop\frontend\src\pages\Dashboard.jsx
// FILE: frontend/src/pages/Dashboard.jsx
import { useEffect, useState, useContext, useCallback } from "react";
import api from "../api/axios";
import SweetCard from "../components/SweetCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext";

export default function Dashboard() {
  const [sweets, setSweets] = useState([]);
  const [filteredSweets, setFilteredSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  const { user } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);

  const fetchSweets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/sweets");
      const sweetsData = res.data.sweets || res.data;
      setSweets(sweetsData);
      setFilteredSweets(sweetsData);
    } catch (err) {
      addToast("Failed to load sweets", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (user) {
      fetchSweets();
    }
  }, [user, fetchSweets]);

  const handlePurchase = async (id, quantity = 1) => {
    try {
      setPurchasing(id);
      const res = await api.post(`/sweets/${id}/purchase`, { quantity });

      setSweets((prev) =>
        prev.map((s) => (s._id === id ? res.data.sweet : s))
      );
      setFilteredSweets((prev) =>
        prev.map((s) => (s._id === id ? res.data.sweet : s))
      );

      addToast("Purchase successful 🍬", "success");
    } catch {
      addToast("Purchase failed", "error");
    } finally {
      setPurchasing(null);
    }
  };

  // ✅ CONDITIONAL RENDERING (VALID)
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gradient">🍬 Our Sweets</h1>
        <p className="text-gray-500">
          Showing {filteredSweets.length} sweets
        </p>
      </div>

      {/* Grid */}
      {filteredSweets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No sweets available
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSweets.map((sweet) => (
            <SweetCard
              key={sweet._id}
              sweet={sweet}
              onPurchase={handlePurchase}
              purchasing={purchasing === sweet._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}


// FILE: C:\Users\arpit\Desktop\Sweet shop\frontend\src\pages\Login.jsx
// FILE: src/pages/Login.jsx
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../context/ToastContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      addToast("Please fill in all fields", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });

      // 🔍 DEBUG: check backend response
      console.log("LOGIN RESPONSE:", res.data);

      /**
       * SUPPORT MULTIPLE BACKEND RESPONSE SHAPES
       * Case 1: { token, user }
       * Case 2: { accessToken, user }
       */
      const token = res.data.token || res.data.accessToken;
      const user = res.data.user;

      if (!token || !user) {
        throw new Error("Invalid login response");
      }

      // Save auth data
      login({ token, user });

      addToast("Welcome back! 🍬", "success");
      navigate("/");
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      addToast(
        error.response?.data?.message || "Login failed. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-float">🍬</div>
          <h1 className="text-3xl font-bold text-gradient mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-600">
            Sign in to continue to Sweet Shop
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  📧
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  🔒
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12 pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>🚀 Sign In</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                New to Sweet Shop?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="btn-secondary w-full block text-center"
          >
            Create an Account
          </Link>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-sm text-amber-800 font-medium mb-2">
            🎯 Demo Credentials:
          </p>
          <div className="text-sm text-amber-700 space-y-1">
            <p>
              <strong>User:</strong> user@example.com / password123
            </p>
            <p>
              <strong>Admin:</strong> admin@example.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


// FILE: C:\Users\arpit\Desktop\Sweet shop\frontend\src\pages\Register.jsx
// FILE: src/pages/Register.jsx
import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { ToastContext } from "../context/ToastContext";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { addToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      addToast("Please fill in all required fields", "error");
      return;
    }

    if (form.password !== form.confirmPassword) {
      addToast("Passwords do not match", "error");
      return;
    }

    if (form.password.length < 6) {
      addToast("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      addToast("Account created successfully! 🎉", "success");
      navigate("/login");
    } catch (error) {
      addToast(
        error.response?.data?.message || "Registration failed. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🍭</div>
          <h1 className="text-3xl font-bold text-gradient mb-2">
            Join Sweet Shop
          </h1>
          <p className="text-gray-600">
            Create your account and start exploring delicious sweets!
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  👤
                </span>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="input-field pl-12"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  📧
                </span>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input-field pl-12"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  🔒
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field pl-12 pr-12"
                  placeholder="Min. 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  🔐
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-12"
                  placeholder="Repeat your password"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  🎉 Create Account
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link to="/login" className="btn-secondary w-full block text-center">
            Sign In Instead
          </Link>
        </div>
      </div>
    </div>
  );
}
