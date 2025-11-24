// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import BlogDetails from "./pages/BlogDetails";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import DashboardHome from "./pages/Dashboard/DashboardHome";
import WriteBlog from "./pages/Dashboard/WriteBlog";
import ViewBlogs from "./pages/Dashboard/ViewBlogs";
import Comments from "./pages/Dashboard/Comments";
import Tags from "./pages/Dashboard/Tags";
import Categories from "./pages/Dashboard/Categories";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { useTheme } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { hexToRgba } from "./lib/utils";

/**
 * Global SVG Filter for "Gooey" effects.
 * Hidden from layout flow.
 */
const GooeyFilter = () => (
  <svg className="gooey-filter">
    <defs>
      <filter id="gooey">
        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
        <feColorMatrix 
          in="blur" 
          mode="matrix" 
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" 
          result="goo" 
        />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
);

const PublicLayout = () => (
  <div className="relative z-10 flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 w-full max-w-[1200px] mx-auto px-5 md:px-8 py-16">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export default function App() {
  const { currentTheme } = useTheme();

  // Memoize this if performance becomes an issue, but it's cheap.
  const accentGradient = `linear-gradient(120deg, ${hexToRgba(currentTheme.primary, 0.08)}, rgba(255,255,255,0))`;

  return (
    <AuthProvider>
      <div 
        className="min-h-screen flex flex-col relative bg-background text-foreground transition-colors duration-700 ease-out overflow-x-hidden"
        style={{ fontFamily: currentTheme.font }}
      >
        {/* Strict Page Accent (No Blobs) */}
        <div 
          className="page-accent"
          style={{ background: accentGradient }}
        />

        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/blog/:slug" element={<BlogDetails />} />
          </Route>

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="write-blog" element={<WriteBlog />} />
            <Route path="view-blogs" element={<ViewBlogs />} />
            <Route path="comments" element={<Comments />} />
            <Route path="tags" element={<Tags />} />
            <Route path="categories" element={<Categories />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <GooeyFilter />
      </div>
    </AuthProvider>
  );
}