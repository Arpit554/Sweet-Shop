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

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
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

      // ✅ Redirect to login after registration
      navigate("/login");
    } catch (error) {
      addToast(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
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

        {/* Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="input-field"
              required
            />

            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="input-field"
              required
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="input-field pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>

            {/* Confirm Password */}
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="input-field"
              required
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? "Creating Account..." : "🎉 Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 text-center text-gray-500">
            Already have an account?
          </div>

          {/* Login */}
          <Link to="/login" className="btn-secondary w-full block text-center">
            Sign In Instead
          </Link>
        </div>
      </div>
    </div>
  );
}
