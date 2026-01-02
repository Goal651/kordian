import { AlertTriangle, Bug, Key, Package } from "lucide-react";

const alerts = [
  {
    type: "Dependabot",
    icon: Package,
    critical: 3,
    high: 8,
    medium: 12,
  },
  {
    type: "Code Scanning",
    icon: Bug,
    critical: 1,
    high: 4,
    medium: 7,
  },
  {
    type: "Secret Scanning",
    icon: Key,
    critical: 2,
    high: 0,
    medium: 1,
  },
];

export function SecurityAlertsCard() {
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
        {alerts.map((alert) => (
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
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Alerts</span>
          <span className="font-mono font-semibold text-foreground">38</span>
        </div>
      </div>
    </div>
  );
}
