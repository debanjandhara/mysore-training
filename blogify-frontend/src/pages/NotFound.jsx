import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function NotFound() {
  const { currentTheme } = useTheme();

  return (
    <div className="w-full flex flex-col items-center justify-center py-16">
      <div className="text-center max-w-xl">
        <p className="text-sm font-semibold tracking-[0.2em] text-primary mb-4">
          404 - PAGE NOT FOUND
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Oops! This page disappeared.
        </h1>
        <p className="text-muted-foreground mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
          Check the URL, or head back to the homepage.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-colors bg-primary hover:bg-primary/90"
          >
            Go to Homepage
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold border border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
