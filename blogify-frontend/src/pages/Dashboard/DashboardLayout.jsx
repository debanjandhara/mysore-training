import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PenTool, 
  FileText, 
  MessageSquare, 
  LogOut, 
  Tags, 
  FolderTree 
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { cn } from '../../lib/utils';
import { useAuth } from "../../context/AuthContext";

// 1. Reusable Sidebar Item Component
const SidebarItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    end={to === "/dashboard"}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 font-medium text-sm",
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )
    }
  >
    <Icon size={18} />
    <span>{label}</span>
  </NavLink>
);

// 2. Reusable Section Header
const SectionHeader = ({ label }) => (
  <div className="px-3 pt-4 pb-2">
    <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
      {label}
    </p>
  </div>
);

export default function DashboardLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* 
        Navbar is assumed to be sticky/fixed. 
        If Navbar is fixed, add 'pt-16' (navbar height) to the div below.
      */}
      <Navbar />

      <div className="flex flex-1 relative">
        
        {/* 
          Sidebar:
          - Fixed position to stay on screen while scrolling content
          - Hidden on mobile (hidden) / Visible on desktop (md:flex)
          - Adjusted 'top' value to account for Navbar (approx 4rem/64px)
          - Height calculated to fill remainder of screen
        */}
        <aside className="hidden md:flex fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border flex-col z-30">
          
          {/* Scrollable Navigation Area */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
            <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Overview" />

            <SectionHeader label="Content" />
            <SidebarItem to="/dashboard/write-blog" icon={PenTool} label="Write New" />
            <SidebarItem to="/dashboard/view-blogs" icon={FileText} label="All Posts" />
            
            <SectionHeader label="Management" />
            <SidebarItem to="/dashboard/tags" icon={Tags} label="Tags" />
            <SidebarItem to="/dashboard/categories" icon={FolderTree} label="Categories" />
            
            <SectionHeader label="Community" />
            <SidebarItem to="/dashboard/comments" icon={MessageSquare} label="Comments" />
          </nav>

          {/* Footer / Logout */}
          <div className="p-4 border-t border-border bg-card">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* 
          Main Content:
          - md:ml-64 pushes content right on desktop to accommodate fixed sidebar
          - min-h-[calc(100vh-4rem)] ensures footer/bottom isn't weirdly cut off
        */}
        <main className="flex-1 w-full md:ml-64 p-6 bg-muted/5">
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      
      </div>
    </div>
  );
}