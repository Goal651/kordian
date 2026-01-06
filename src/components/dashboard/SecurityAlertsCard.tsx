import { AlertTriangle, Bug, Key, Loader2, Package } from "lucide-react";

import { useGitHubApp } from "@/hooks/useGitHubAuth";

export function SecurityAlertsCard({ loading }: { loading: boolean }) {
  const { state } = useGitHubApp();

  const totalCritical = state.alerts.filter(a => a.severity === "critical").length;
  const totalHigh = state.alerts.filter(a => a.severity === "high").length;
  const totalMedium = state.alerts.filter(a => a.severity === "medium").length;
  const totalLow = state.alerts.filter(a => a.severity === "low").length;

  const dependabotCritical = state.alerts.filter(a => a.type === "Dependency" && a.severity === "critical").length;
  const dependabotHigh = state.alerts.filter(a => a.type === "Dependency" && a.severity === "high").length;
  const dependabotMedium = state.alerts.filter(a => a.type === "Dependency" && a.severity === "medium").length;

  const alertsDisplay = [
    {
      type: "Dependabot",
      icon: Package,
      critical: dependabotCritical,
      high: dependabotHigh,
      medium: dependabotMedium,
    },
    {
      type: "Code Scanning",
      icon: Bug,
      critical: 0,
      high: 0,
      medium: 0,
    },
    {
      type: "Secret Scanning",
      icon: Key,
      critical: 0,
      high: 0,
      medium: 0,
    },
  ];

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-lg bg-destructive/10 p-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Security Alerts</h3>
          <p className="text-sm text-muted-foreground">Across all repositories</p>
        </div>
      </div>

      <div className="space-y-4">
        { loading ? <Loader2 className="w-8 h-8 animate-spin" /> : alertsDisplay.map((alert) => (
          <div
            key={alert.type}
            className="flex items-center justify-between rounded-lg bg-secondary/50 p-4"
          >
            <div className="flex items-center gap-3">
              <alert.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {alert.type}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {alert.critical > 0 && (
                <span className="badge-critical">{alert.critical} Critical</span>
              )}
              {alert.high > 0 && (
                <span className="badge-warning">{alert.high} High</span>
              )}
              {alert.medium > 0 && (
                <span className="badge-info">{alert.medium} Medium</span>
              )}
              {alert.critical === 0 && alert.high === 0 && alert.medium === 0 && (
                <span className="text-xs text-muted-foreground">No open alerts</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Alerts</span>
          <span className="font-mono font-semibold text-foreground">{state.alerts.length}</span>
        </div>
      </div>
    </div>
  );
}
