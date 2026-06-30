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
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    // ✅ Validate all fields
    const errors = {};
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstError = Object.values(errors)[0];
      setError(firstError);
      toast.error(firstError);
      setLoading(false);
      return;
    }

    try {
      console.log("📝 Attempting registration for:", formData.username);
      
      // ✅ Only send fields that the backend expects
      const requestData = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };
      
      console.log("📤 Sending registration data:", {
        username: requestData.username,
        email: requestData.email,
        password: "***hidden***",
      });

      // ✅ Use the api service (which already has the correct base URL)
      const response = await api.post("/auth/register/", requestData);

      console.log("✅ Registration successful!", response.data);
      
      toast.success("Account created successfully! 🎉", {
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
      console.error("❌ Error response:", err.response);
      console.error("❌ Error data:", err.response?.data);
      
      let errorMessage = "Registration failed. Please try again.";
      
      // ✅ Parse Django REST Framework validation errors
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Check for field-specific errors
        const fieldErrorsObj = {};
        let firstMessage = "";
        
        // ✅ Handle { errors: { field: [messages] } } format
        if (errorData.errors) {
          for (const [field, messages] of Object.entries(errorData.errors)) {
            if (Array.isArray(messages)) {
              const msg = messages.join(', ');
              fieldErrorsObj[field] = msg;
              if (!firstMessage) firstMessage = msg;
            } else if (typeof messages === 'string') {
              fieldErrorsObj[field] = messages;
              if (!firstMessage) firstMessage = messages;
            } else if (typeof messages === 'object' && messages !== null) {
              // Handle nested errors
              for (const [subField, subMessages] of Object.entries(messages)) {
                if (Array.isArray(subMessages)) {
                  const msg = subMessages.join(', ');
                  fieldErrorsObj[`${field}.${subField}`] = msg;
                  if (!firstMessage) firstMessage = msg;
                }
              }
            }
          }
        } else {
          // ✅ Handle { field: [messages] } or { field: "message" } format
          for (const [field, messages] of Object.entries(errorData)) {
            if (field === 'status' || field === 'message' || field === 'detail' || field === 'error') continue;
            
            if (Array.isArray(messages)) {
              const msg = messages.join(', ');
              fieldErrorsObj[field] = msg;
              if (!firstMessage) firstMessage = msg;
            } else if (typeof messages === 'string') {
              fieldErrorsObj[field] = messages;
              if (!firstMessage) firstMessage = messages;
            }
          }
        }
        
        // If we have field errors, display them
        if (Object.keys(fieldErrorsObj).length > 0) {
          setFieldErrors(fieldErrorsObj);
          errorMessage = firstMessage || "Please check the form for errors";
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
        
        // If the error is HTML (backend misconfiguration)
        if (errorMessage.includes('<!doctype html>')) {
          errorMessage = "Server configuration error. Please contact support.";
          console.error("❌ Backend returned HTML instead of JSON. Check registration endpoint.");
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 5000,
        icon: "❌",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card variant="register">
        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-md">
          {/* Logo / Brand */}
          <div className="mb-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/25">
              <span className="text-3xl">✨</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create Account</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Join SmartTask today</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="w-full mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
              <span className="font-medium">Error:</span> {error}
            </div>
          )}

          {/* Username Input */}
          <div className="w-full mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 text-left">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full p-3 rounded-xl border ${
                fieldErrors.username ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-sm dark:text-white`}
              disabled={loading}
              autoFocus
              autoComplete="username"
            />
            {fieldErrors.username && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.username}</p>
            )}
          </div>

          {/* Email Input */}
          <div className="w-full mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 text-left">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 rounded-xl border ${
                fieldErrors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-sm dark:text-white`}
              disabled={loading}
              autoComplete="email"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="w-full mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 text-left">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-3 rounded-xl border ${
                fieldErrors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-sm dark:text-white`}
              disabled={loading}
              autoComplete="new-password"
            />
            {fieldErrors.password ? (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                Must be at least 8 characters
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="w-full mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 text-left">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full p-3 rounded-xl border ${
                fieldErrors.confirmPassword ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-sm dark:text-white`}
              disabled={loading}
              autoComplete="new-password"
            />
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
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
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline font-medium transition-colors">
              Sign in here
            </Link>
          </p>

          <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-center">
            By registering, you agree to our Terms of Service
          </p>
        </form>
      </Card>
    </div>
  );
}
