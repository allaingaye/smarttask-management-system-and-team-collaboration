// src/pages/Auth/Login.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Card from "../../components/Card";
import api from "../../services/api";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, userRole, clearAuthData } = useAuth();

  // ✅ Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("🔄 Already authenticated, redirecting...");
      const redirectPath = userRole === "Manager" 
        ? "/manager/dashboard" 
        : userRole === "Member"
        ? "/member/dashboard"
        : "/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);

  // ✅ Get redirect path from location state
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // ✅ Trim and validate inputs
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      setError("Please enter both username and password");
      toast.error("Please enter both username and password", {
        duration: 3000,
        icon: "⚠️",
      });
      setLoading(false);
      return;
    }

    try {
      console.log("🔐 Attempting login for:", trimmedUsername);
      
      // ✅ Clear any stale auth data before login
      clearAuthData();
      
      // ✅ Use the auth context login
      const success = await login(trimmedUsername, trimmedPassword);
      
      if (success) {
        console.log("✅ Login successful via AuthContext");
        // Navigation is handled inside AuthContext login
      } else {
        // ❌ Fallback should not be needed if AuthContext login works
        // But keep it as a safety net
        console.warn("⚠️ AuthContext login returned false, using fallback...");
        await handleFallbackLogin(trimmedUsername, trimmedPassword);
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      
      let errorMessage = "Login failed. Please check your credentials.";
      if (err.response?.status === 401) {
        errorMessage = "Invalid username or password. Please try again.";
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage, { 
        duration: 4000, 
        icon: "❌",
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fallback login method (if AuthContext login fails)
  const handleFallbackLogin = async (username, password) => {
    try {
      console.log("🔄 Fallback: Direct API call...");
      const res = await api.post("/auth/login/", {
        username: username,
        password: password,
      });

      // Store tokens
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);

      // Fetch user data
      const userResponse = await api.get("/me/", {
        headers: { Authorization: `Bearer ${res.data.access}` },
      });

      const userData = userResponse.data;
      
      // Store user data
      localStorage.setItem("user_role", userData.role);
      localStorage.setItem("username", userData.username);
      localStorage.setItem("user_id", userData.id);
      localStorage.setItem("user_email", userData.email || "");

      toast.success(`Welcome back, ${userData.username}!`, {
        duration: 3000,
        icon: "👋",
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      
      // ✅ Redirect based on role
      const redirectPath = userData.role === "Manager" 
        ? "/manager/dashboard" 
        : userData.role === "Member"
        ? "/member/dashboard"
        : "/dashboard";
      
      console.log(`🔀 Redirecting to: ${redirectPath} (Role: ${userData.role})`);
      navigate(redirectPath, { replace: true });
      
    } catch (err) {
      console.error("❌ Fallback login failed:", err);
      throw err;
    }
  };

  // ✅ Fill demo credentials
  const fillDemoCredentials = () => {
    setUsername("lucien");
    setPassword("Admin123!");
    toast.success("Demo credentials filled!", { 
      duration: 2000, 
      icon: "✨",
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  // ✅ Fill manager demo credentials (optional)
  const fillManagerCredentials = () => {
    setUsername("manager");
    setPassword("Manager123!");
    toast.success("Manager credentials filled!", { 
      duration: 2000, 
      icon: "👤",
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  // ✅ Go back to home
  const goToHome = () => {
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card variant="default" className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full">
          {/* Logo / Brand */}
          <div className="mb-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/25">
              <span className="text-3xl">✨</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-sm text-gray-500 mt-1">Sign in to your SmartTask account</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-shake">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}

          {/* Username Input */}
          <div className="w-full mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm"
              disabled={loading}
              autoFocus
              aria-label="Username"
            />
          </div>

          {/* Password Input */}
          <div className="w-full mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/80 backdrop-blur-sm"
              disabled={loading}
              aria-label="Password"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleSubmit(e);
                }
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Demo Credentials Buttons */}
          <div className="flex gap-2 w-full mt-3">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="flex-1 text-xs text-gray-400 hover:text-blue-600 transition-colors py-1 border border-gray-200 rounded-lg hover:border-blue-300"
              disabled={loading}
            >
              🔑 Admin Demo
            </button>
            <button
              type="button"
              onClick={fillMemberCredentials}
              className="flex-1 text-xs text-gray-400 hover:text-green-600 transition-colors py-1 border border-gray-200 rounded-lg hover:border-green-300"
              disabled={loading}
            >
              👤 Member Demo
            </button>
          </div>

          {/* Register Link */}
          <p className="mt-6 text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">
              Register here
            </Link>
          </p>

          {/* ✅ Single "Back to Home" Link - Bottom */}
          <Link 
            to="/" 
            className="mt-3 text-xs text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            <ArrowLeftIcon className="w-3 h-3" />
            Back to Home
          </Link>

          <p className="mt-4 text-xs text-gray-400">SmartTask v1.0 • Secure Login</p>
        </form>
      </Card>
    </div>
  );
}
