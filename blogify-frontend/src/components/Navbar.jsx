import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

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
  
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl transition-all duration-500">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between px-6 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-xl shadow-lg shadow-primary/20 bg-gradient-to-br from-primary to-secondary"
          />
          <span className="text-h3 font-bold tracking-tight text-foreground">
            Blogify
          </span>
        </div>
        <nav className="flex gap-2">
          <NavLink to="/" label="Home" />
          <NavLink to="/dashboard" label="Dashboard" />
          <NavLink to="/profile" label="Profile" />
          <NavLink to="/auth" label="Login" />
        </nav>
      </div>
    </header>
  );
}
