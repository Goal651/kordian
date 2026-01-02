import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Shield,
  Users,
  GitBranch,
  CheckCircle,
  Settings,
  Github,
  LogOut,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/" },
  { icon: Shield, label: "Security", path: "/security" },
  { icon: Users, label: "Members", path: "/members" },
  { icon: GitBranch, label: "Repositories", path: "/repos" },
  { icon: CheckCircle, label: "Compliance", path: "/compliance" },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Github className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">GitGuard</h1>
            <p className="text-xs text-muted-foreground">Security Dashboard</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          <p className="mb-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Navigation
          </p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-border p-4">
          <Link to="/settings" className="nav-link">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
          <button className="nav-link w-full text-left hover:text-destructive">
            <LogOut className="h-4 w-4" />
            <span>Disconnect</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
