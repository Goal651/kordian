"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/" },
  { icon: Shield, label: "Security", path: "/security" },
  { icon: Users, label: "Members", path: "/members" },
  { icon: GitBranch, label: "Repositories", path: "/repos" },
  { icon: CheckCircle, label: "Compliance", path: "/compliance" },
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { state, disconnect } = useGitHubApp();

  return (
    <aside className={cn("fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar flex flex-col", className)}>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6 flex-shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
          <img src="/icon.png" alt="GitGuard Logo" className="h-full w-full object-cover" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-foreground">Nexus</h1>
          <p className="text-xs text-muted-foreground">Security & Activity Hub</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        <p className="mb-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const isBlocked = !state.installed && item.path !== "/";

          if (isBlocked) return null;

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onNavigate}
              className={`nav-link ${isActive ? "active" : ""}`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4 flex-shrink-0">
        <Link href="/settings" 
        className={`nav-link ${pathname === "/settings" ? "active" : ""}`}
          onClick={onNavigate}>
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
        <button
          onClick={() => {
            if (state.installed) {
              disconnect();
              onNavigate?.();
            }
          }}
          className="nav-link w-full text-left hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span>Disconnect</span>
        </button>
      </div>
    </aside>
  );
}
