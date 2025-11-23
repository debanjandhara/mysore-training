
import React, { useState } from "react";
import { motion } from "framer-motion";
import { authService } from "../services/authService";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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
      const res = await authService.login(loginData);
      setSuccess(res.message);
      setTimeout(() => {
        // Ideally redirect here
        navigate("/"); // Redirect to Home/Landing
      }, 1000);
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
              <a href="#" className="text-sm text-primary hover:underline">Forgot Password?</a>
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
             
             {/* 
                We need two content blocks inside the overlay that swap opacity/position
                depending on the state. 
                
                When isLogin is true (Overlay Left): Show "New here? Register"
                When isLogin is false (Overlay Right): Show "Welcome Back! Login"
             */}
             
             <div className="relative w-full h-full">
               {/* Content for Left Position (Visible when isLogin is true) */}
               <motion.div 
                 className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
                 animate={{ opacity: isLogin ? 1 : 0, x: isLogin ? 0 : -50 }}
                 transition={{ duration: 0.5 }}
                 style={{ pointerEvents: isLogin ? 'auto' : 'none' }}
               >
                 <h1 className="text-4xl font-bold mb-4">Hello, Friend!</h1>
                 <p className="text-lg mb-8 opacity-90">
                   Enter your personal details and start your journey with us today.
                 </p>
                 <button 
                    onClick={toggleState}
                    className="border-2 border-white text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-white hover:text-primary transition-colors"
                 >
                   Register
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
                 <p className="text-lg mb-8 opacity-90">
                   To keep connected with us please login with your personal info.
                 </p>
                 <button 
                    onClick={toggleState}
                    className="border-2 border-white text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-white hover:text-primary transition-colors"
                 >
                   Login
                 </button>
               </motion.div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
