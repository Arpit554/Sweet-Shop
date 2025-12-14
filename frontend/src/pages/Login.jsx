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

      // Support multiple backend response shapes
      const token = res.data.token || res.data.accessToken;
      const user = res.data.user;

      if (!token || !user) {
        throw new Error("Invalid login response");
      }

      // Save auth data
      login({ token, user });

      addToast("Welcome back! 🍬", "success");

      // ✅ Redirect to dashboard (correct route)
      navigate("/dashboard");
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
          <div className="text-6xl mb-4">🍬</div>
          <h1 className="text-3xl font-bold text-gradient mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-600">
            Sign in to continue to Sweet Shop
          </p>
        </div>

        {/* Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Signing in..." : "🚀 Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 text-center text-gray-500">
            New to Sweet Shop?
          </div>

          {/* Register */}
          <Link to="/register" className="btn-secondary w-full block text-center">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
