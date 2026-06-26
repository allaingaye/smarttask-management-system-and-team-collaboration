// src/pages/Auth/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/Card";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // ✅ Validate
    if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError("Please fill in all fields");
      toast.error("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      toast.error("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      console.log("📝 Attempting registration for:", formData.username);
      
      const response = await api.post("/auth/register/", {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      console.log("✅ Registration successful!", response.data);
      toast.success("Account created successfully! Please login.", {
        duration: 3000,
        icon: "🎉",
      });

      // ✅ Auto-login after registration
      const loginSuccess = await login(formData.username, formData.password);
      if (loginSuccess) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }

    } catch (err) {
      console.error("❌ Registration error:", err);
      
      let errorMessage = "Registration failed. Please try again.";
      if (err.response?.data?.username) {
        errorMessage = err.response.data.username[0] || "Username already exists";
      } else if (err.response?.data?.email) {
        errorMessage = err.response.data.email[0] || "Email already exists";
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
        icon: "❌",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Card variant="register">
        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full">
          {/* Logo / Brand */}
          <div className="mb-4 text-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-blue-500/25">
              <span className="text-2xl">✨</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Create Account</h2>
            <p className="text-xs text-gray-500 mt-1">Join SmartTask today</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="w-full mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}

          {/* Username Input */}
          <div className="w-full mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1 text-left">
              Username
            </label>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm text-sm"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Email Input */}
          <div className="w-full mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1 text-left">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm text-sm"
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div className="w-full mb-3">
            <label className="block text-xs font-medium text-gray-700 mb-1 text-left">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm text-sm"
              disabled={loading}
            />
            <p className="text-[10px] text-gray-400 mt-1 text-left">
              Must be at least 8 characters
            </p>
          </div>

          {/* Confirm Password */}
          <div className="w-full mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1 text-left">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm text-sm"
              disabled={loading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>

          {/* Login Link */}
          <p className="mt-4 text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">
              Sign in here
            </Link>
          </p>

          <p className="mt-3 text-[10px] text-gray-400">
            By registering, you agree to our Terms of Service
          </p>
        </form>
      </Card>
    </div>
  );
}