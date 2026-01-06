import { CheckCircle2, XCircle, AlertCircle, AlertTriangle, Lock, Unlock, Clock } from "lucide-react";
import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { Button } from "@/components/ui/button";

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "healthy")
    return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (status === "warning")
    return <AlertTriangle className="h-4 w-4 text-warning" />;
  return <AlertTriangle className="h-4 w-4 text-destructive" />;
};

export function RepoHealthCard() {
  const { state } = useGitHubApp();

  state.repos.map(repo => {
    const data = state.alerts.filter(alert => alert.repo == repo.name)[0]
    if (data && (data.severity == 'critical' || data.severity == 'high')) {
      repo.status = 'critical' 
    }
    return repo
  })


  // Filter for repos that need attention (critical or warning)
  const unhealthyRepos = state.repos
    .filter(r => r.status !== "healthy")
    .sort((a, b) => b.alerts - a.alerts)
    .slice(0, 5); // Show top 5

  const hasIssues = unhealthyRepos.length > 0;

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-foreground">Repository Health</h3>
          <p className="text-sm text-muted-foreground">
            {hasIssues ? "Repositories requiring attention" : "All systems operational"}
          </p>
        </div>
        {!hasIssues && (
          <div className="flex items-center gap-2 text-success bg-success/10 px-3 py-1 rounded-full text-xs font-medium">
            <CheckCircle2 className="h-3 w-3" />
            <span>100% Compliant</span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-3 font-medium text-muted-foreground">Repository</th>
              <th className="pb-3 font-medium text-muted-foreground text-center">Status</th>
              <th className="pb-3 font-medium text-muted-foreground text-center">Open Alerts</th>
              <th className="pb-3 font-medium text-muted-foreground text-right">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {!hasIssues ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                  No repositories currently have critical or warning status.
                </td>
              </tr>
            ) : (
              unhealthyRepos.map((repo) => (
                <tr key={repo.name} className="hover:bg-secondary/30 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {repo.visibility === "private" ? <Lock className="h-3 w-3 text-muted-foreground" /> : <Unlock className="h-3 w-3 text-muted-foreground" />}
                      <span className="font-mono text-foreground">{repo.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <div className="flex justify-center">
                      <StatusIcon status={repo.status} />
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`font-mono font-medium ${repo.status === 'critical' ? 'text-destructive' : 'text-warning'}`}>
                      {repo.alerts}
                    </span>
                  </td>
                  <td className="py-3 text-right text-muted-foreground text-xs font-mono">
                    {repo.lastCommit.split(',')[0]}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
