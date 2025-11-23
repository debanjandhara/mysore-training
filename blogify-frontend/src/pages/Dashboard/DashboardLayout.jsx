
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, PenTool, FileText, MessageSquare, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';

const SidebarItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    end={to === "/dashboard"} // Only exact match for dashboard root
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
        isActive
          ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )
    }
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </NavLink>
);

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-700">
      {/* Sidebar */}
      <aside className="w-64 bg-card/80 backdrop-blur-xl border-r border-border flex-shrink-0 fixed h-full z-30 hidden md:flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-primary tracking-tight">Dashboard</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Overview" />
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Blog</p>
          </div>
          <SidebarItem to="/dashboard/write-blog" icon={PenTool} label="Write New" />
          <SidebarItem to="/dashboard/view-blogs" icon={FileText} label="All Posts" />
          
          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Community</p>
          </div>
          <SidebarItem to="/dashboard/comments" icon={MessageSquare} label="Comments" />
        </nav>

        <div className="p-4 border-t border-border">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
