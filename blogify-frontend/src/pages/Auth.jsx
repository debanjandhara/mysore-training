
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { authService } from "../services/authService";
import { cn } from "../lib/utils";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

// Button Component
const Button = ({ className, children, isLoading, ...props }) => (
  <button
    className={cn(
      "w-full py-3 px-6 rounded-lg text-white font-semibold transition-all duration-300 transform active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2",
      className
    )}
    disabled={isLoading}
    {...props}
  >
    {isLoading && <Loader2 className="animate-spin w-5 h-5" />}
    {children}
  </button>
);

// Input Component
const Input = ({ label, error, ...props }) => (
  <div className="w-full mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
      {label}
    </label>
    <input
      className={cn(
        "w-full px-4 py-3 rounded-lg border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-opacity-50 transition-all outline-none",
        error
          ? "border-red-500 focus:ring-red-500"
          : "border-gray-200 focus:border-purple-500 focus:ring-purple-500"
      )}
      {...props}
    />
    {error && <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>}
  </div>
);

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  // Form States
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const loginSuccess = params.get("loginSuccess");

    if (loginSuccess) {
      // Force reload to ensure AuthContext picks up the new token from cookie
      window.location.href = "/dashboard";
    }
  }, [location]);

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  // Toggle function
  const toggleState = () => {
    setIsLogin(!isLogin);
    // Reset states when switching
    setLoginData({ email: "", password: "" });
    setRegisterData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setError(null);
    setSuccess(null);
  };


  // Handlers
  const handleLoginChange = (e) =>
    setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const handleRegisterChange = (e) =>
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await login(loginData);
      if (res && res.success) {
        setSuccess(res.message);
        setTimeout(() => {
        // Ideally redirect here
        navigate("/"); // Redirect to Home/Landing
        }, 1000);
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.register(registerData);
      setSuccess(res.message);
      // Optional: Switch to login view after success
      setTimeout(() => {
        toggleState();
        setSuccess(null); // Clear success message from register screen when switching
      }, 1500);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex items-center justify-center py-10">
      {/* Main Card Container */}
      <div className="relative w-full max-w-[900px] h-[600px] bg-white text-gray-900 rounded-2xl shadow-2xl overflow-hidden flex">
        
        {/* 
           Left Section (Register Form Area) 
           Visible when Overlay slides to Right
        */}
        <div className="absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center items-center p-10 z-10">
          <form className="w-full max-w-xs flex flex-col" onSubmit={handleRegisterSubmit}>
            <h2 className="text-3xl font-bold mb-6 text-primary text-center">Create Account</h2>
            
            {/* Error/Success Messages for Register */}
             {!isLogin && error && (
              <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            {!isLogin && success && (
              <div className="bg-green-100 text-green-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                <CheckCircle size={16} /> {success}
              </div>
            )}

            <Input
              label="Name"
              name="name"
              placeholder="John Doe"
              value={registerData.name}
              onChange={handleRegisterChange}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={registerData.email}
              onChange={handleRegisterChange}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={registerData.password}
              onChange={handleRegisterChange}
              required
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={registerData.confirmPassword}
              onChange={handleRegisterChange}
              required
            />
            <Button type="submit" className="bg-primary hover:bg-primary/90 mt-2" isLoading={isLoading}>
              Sign Up
            </Button>
          </form>
        </div>

        {/* 
           Right Section (Login Form Area) 
           Visible when Overlay is on Left (Default)
        */}
        <div className="absolute top-0 right-0 w-1/2 h-full flex flex-col justify-center items-center p-10 z-10">
           <form className="w-full max-w-xs flex flex-col" onSubmit={handleLoginSubmit}>
            <h2 className="text-3xl font-bold mb-6 text-primary text-center">Sign In</h2>
            
            {/* Error/Success Messages for Login */}
            {isLogin && error && (
              <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            {isLogin && success && (
              <div className="bg-green-100 text-green-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                <CheckCircle size={16} /> {success}
              </div>
            )}

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="test@example.com"
              value={loginData.email}
              onChange={handleLoginChange}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
            />
            <div className="text-right mb-6">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot Password?</Link>
            </div>
            <Button type="submit" className="bg-primary hover:bg-primary/90" isLoading={isLoading}>
              Login
            </Button>
          </form>
        </div>

        {/* 
           Overlay / Info Panel
           Slides back and forth
        */}
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: isLogin ? "0%" : "100%" }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="absolute top-0 left-0 w-1/2 h-full z-20 overflow-hidden rounded-2xl"
        >
          {/* Inner Container for Background Image/Gradient */}
          <div className="w-full h-full relative bg-primary text-primary-foreground flex items-center justify-center">
             
             <div className="relative w-full h-full">
               {/* Content for Left Position (Visible when isLogin is true) */}
               <motion.div 
                 className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
                 animate={{ opacity: isLogin ? 1 : 0, x: isLogin ? 0 : -50 }}
                 transition={{ duration: 0.5 }}
                 style={{ pointerEvents: isLogin ? 'auto' : 'none' }}
               >
                 <h1 className="text-4xl font-bold mb-4">Hello, Friend!</h1>
                 <p className="text-lg mb-6 opacity-90">
                   Enter your personal details and start your journey with us today.
                 </p>
                 <button 
                    onClick={toggleState}
                    className="border-2 border-white text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-white hover:text-primary transition-colors mb-6"
                 >
                   Register
                 </button>

                 <div className="relative w-full max-w-[200px] flex items-center justify-center gap-2 mb-4">
                   <div className="h-px bg-white/30 w-full"></div>
                   <span className="text-xs uppercase text-white/70">OR</span>
                   <div className="h-px bg-white/30 w-full"></div>
                 </div>

                 <button
                   type="button"
                   onClick={handleGoogleLogin}
                   className="w-[260px] py-2.5 px-4 rounded-full bg-white text-primary font-semibold hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-lg mx-auto"
                 >
                   <svg className="w-5 h-5" viewBox="0 0 24 24">
                     <path
                       d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                       fill="#4285F4"
                     />
                     <path
                       d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                       fill="#34A853"
                     />
                     <path
                       d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                       fill="#FBBC05"
                     />
                     <path
                       d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                       fill="#EA4335"
                     />
                   </svg>
                   Continue with Google
                 </button>
               </motion.div>

               {/* Content for Right Position (Visible when isLogin is false -> Overlay moved Right) */}
               <motion.div 
                 className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
                 animate={{ opacity: isLogin ? 0 : 1, x: isLogin ? 50 : 0 }}
                 transition={{ duration: 0.5 }}
                 style={{ pointerEvents: !isLogin ? 'auto' : 'none' }}
               >
                 <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
                 <p className="text-lg mb-6 opacity-90">
                   To keep connected with us please login with your personal info.
                 </p>
                 <button 
                    onClick={toggleState}
                    className="border-2 border-white text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-white hover:text-primary transition-colors mb-6"
                 >
                   Login
                 </button>

                 <div className="relative w-full max-w-[200px] flex items-center justify-center gap-2 mb-4">
                   <div className="h-px bg-white/30 w-full"></div>
                   <span className="text-xs uppercase text-white/70">OR</span>
                   <div className="h-px bg-white/30 w-full"></div>
                 </div>

                 <button
                   type="button"
                   onClick={handleGoogleLogin}
                   className="w-[260px] py-2.5 px-4 rounded-full bg-white text-primary font-semibold hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-lg mx-auto"
                 >
                   <svg className="w-5 h-5" viewBox="0 0 24 24">
                     <path
                       d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                       fill="#4285F4"
                     />
                     <path
                       d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                       fill="#34A853"
                     />
                     <path
                       d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                       fill="#FBBC05"
                     />
                     <path
                       d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                       fill="#EA4335"
                     />
                   </svg>
                   Continue with Google
                 </button>
               </motion.div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
