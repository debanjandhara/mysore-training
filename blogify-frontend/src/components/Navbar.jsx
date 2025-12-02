import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function NavLink({ to, label }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={
        "px-4 py-2 rounded-full text-small font-medium transition-all duration-300 " +
        (active
          ? "text-primary bg-primary/10 shadow-sm ring-1 ring-primary/20"
          : "text-foreground/60 hover:text-foreground hover:bg-foreground/5")
      }
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const { currentTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };
  
  return (
    <header className={`sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl transition-all duration-500 ${isDashboard ? "w-full border-border" : ""}`}>
      <div className={`flex items-center justify-between px-6 py-4 md:px-8 ${isDashboard ? "w-full" : "max-w-[1200px] mx-auto"}`}>
        {!isDashboard ? (
          <Link to="/" className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-xl shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-secondary"
            />
            <span className="text-h3 font-bold tracking-tight text-foreground">
              Blogify
            </span>
          </Link>
        ) : (
          <div /> /* Spacer */
        )}
        <nav className="flex items-center gap-2">
          <NavLink to="/" label="Home" />
          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" label="Dashboard" />
              <Link 
                to="/profile" 
                className="ml-2 relative group"
                title={user?.name || "Profile"}
              >
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.name} 
                    className="w-9 h-9 rounded-full object-cover border border-white/10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-300"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 border border-white/10 flex items-center justify-center text-primary font-bold text-sm ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-300">
                    {getInitials(user?.name)}
                  </div>
                )}
              </Link>
            </>
          )}
          {!isAuthenticated && <NavLink to="/auth" label="Login" />}
        </nav>
      </div>
    </header>
  );
}
