import { TrendingUp, TrendingDown } from "lucide-react";

import { useGitHubApp } from "@/hooks/useGitHubAuth";

export function TopContributors() {
  const { state } = useGitHubApp();
  const members = state.members.slice(0, 5);

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <div className="mb-6">
        <h3 className="font-semibold text-foreground">Top Contributors</h3>
        <p className="text-sm text-muted-foreground">Last 30 days</p>
      </div>

      <div className="space-y-3">
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No data available</p>
        ) : (
          members.map((contributor, index) => (
            <div
              key={contributor.username}
              className="flex items-center justify-between rounded-lg bg-secondary/30 p-3 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  {contributor.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {contributor.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {contributor.commits || 0} commits · {contributor.prs || 0} PRs
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-muted-foreground">
                  #{index + 1}
                </span>
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
