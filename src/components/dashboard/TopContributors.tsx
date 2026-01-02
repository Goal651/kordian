import { TrendingUp, TrendingDown } from "lucide-react";

const contributors = [
  {
    name: "Sarah Chen",
    avatar: "SC",
    commits: 156,
    prs: 24,
    reviews: 45,
    trend: "up",
  },
  {
    name: "Alex Rivera",
    avatar: "AR",
    commits: 134,
    prs: 18,
    reviews: 32,
    trend: "up",
  },
  {
    name: "Jordan Kim",
    avatar: "JK",
    commits: 98,
    prs: 15,
    reviews: 28,
    trend: "down",
  },
  {
    name: "Morgan Liu",
    avatar: "ML",
    commits: 87,
    prs: 12,
    reviews: 19,
    trend: "up",
  },
  {
    name: "Casey Park",
    avatar: "CP",
    commits: 72,
    prs: 9,
    reviews: 15,
    trend: "down",
  },
];

export function TopContributors() {
  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <div className="mb-6">
        <h3 className="font-semibold text-foreground">Top Contributors</h3>
        <p className="text-sm text-muted-foreground">Last 30 days</p>
      </div>

      <div className="space-y-3">
        {contributors.map((contributor, index) => (
          <div
            key={contributor.name}
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
                  {contributor.commits} commits · {contributor.prs} PRs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">
                #{index + 1}
              </span>
              {contributor.trend === "up" ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
