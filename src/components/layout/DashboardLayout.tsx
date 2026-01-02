import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="hero-glow fixed inset-0 pointer-events-none" />
        <div className="relative p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
