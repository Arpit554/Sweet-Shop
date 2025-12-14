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
          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-3xl">🍬</span>
            <span className="text-xl font-bold text-white tracking-wide">
              Sweet Shop
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-2">
            {/* HOME (always visible) */}
            <NavLink to="/">🏠 Home</NavLink>

            {user ? (
              <>
                {/* DASHBOARD */}
                <NavLink to="/dashboard">🛒 Dashboard</NavLink>

                {/* ADMIN */}
                {isAdmin() && (
                  <NavLink to="/admin">⚙ Admin Panel</NavLink>
                )}

                {/* USER INFO */}
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

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-white/20">
            <NavLink to="/">🏠 Home</NavLink>

            {user ? (
              <>
                <NavLink to="/dashboard">🛒 Dashboard</NavLink>
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
