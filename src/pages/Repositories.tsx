import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  GitBranch, 
  Star, 
  GitFork, 
  Lock, 
  Unlock, 
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const repositories = [
  {
    name: "frontend-app",
    description: "Main web application built with React and TypeScript",
    language: "TypeScript",
    languageColor: "#3178c6",
    visibility: "private",
    stars: 12,
    forks: 3,
    alerts: 0,
    lastCommit: "2 hours ago",
    status: "healthy",
  },
  {
    name: "api-gateway",
    description: "GraphQL API gateway service",
    language: "Go",
    languageColor: "#00ADD8",
    visibility: "private",
    stars: 8,
    forks: 2,
    alerts: 5,
    lastCommit: "5 hours ago",
    status: "warning",
  },
  {
    name: "data-pipeline",
    description: "ETL data processing pipeline",
    language: "Python",
    languageColor: "#3572A5",
    visibility: "private",
    stars: 4,
    forks: 1,
    alerts: 12,
    lastCommit: "1 day ago",
    status: "critical",
  },
  {
    name: "mobile-sdk",
    description: "Cross-platform mobile SDK",
    language: "Kotlin",
    languageColor: "#A97BFF",
    visibility: "public",
    stars: 45,
    forks: 12,
    alerts: 0,
    lastCommit: "3 hours ago",
    status: "healthy",
  },
  {
    name: "infrastructure",
    description: "Terraform and Kubernetes configs",
    language: "HCL",
    languageColor: "#844FBA",
    visibility: "private",
    stars: 2,
    forks: 0,
    alerts: 3,
    lastCommit: "6 hours ago",
    status: "warning",
  },
  {
    name: "docs",
    description: "Documentation and guides",
    language: "MDX",
    languageColor: "#fcb32c",
    visibility: "public",
    stars: 18,
    forks: 5,
    alerts: 0,
    lastCommit: "12 hours ago",
    status: "healthy",
  },
];

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "healthy") return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (status === "warning") return <AlertTriangle className="h-4 w-4 text-warning" />;
  return <AlertTriangle className="h-4 w-4 text-destructive" />;
};

export default function Repositories() {
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <GitBranch className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Repositories</h1>
        </div>
        <p className="text-muted-foreground">
          Repository analytics and activity metrics
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-card animate-fade-in">
          <p className="text-sm text-muted-foreground mb-1">Total Repos</p>
          <p className="text-2xl font-bold text-foreground">47</p>
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <p className="text-sm text-muted-foreground mb-1">Private</p>
          <p className="text-2xl font-bold text-foreground">38</p>
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <p className="text-sm text-muted-foreground mb-1">Public</p>
          <p className="text-2xl font-bold text-primary">9</p>
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <p className="text-sm text-muted-foreground mb-1">Archived</p>
          <p className="text-2xl font-bold text-muted-foreground">5</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search repositories..." className="pl-10" />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">All</Button>
          <Button variant="ghost" size="sm">Healthy</Button>
          <Button variant="ghost" size="sm">Warnings</Button>
          <Button variant="ghost" size="sm">Critical</Button>
        </div>
      </div>

      {/* Repository cards */}
      <div className="grid gap-4">
        {repositories.map((repo, index) => (
          <div
            key={repo.name}
            className="glass-card p-6 hover:border-primary/30 transition-all cursor-pointer animate-fade-in"
            style={{ animationDelay: `${0.25 + index * 0.05}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <StatusIcon status={repo.status} />
                  <h3 className="font-semibold text-foreground font-mono">
                    {repo.name}
                  </h3>
                  {repo.visibility === "private" ? (
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <Unlock className="h-3 w-3 text-muted-foreground" />
                  )}
                  {repo.alerts > 0 && (
                    <span className={repo.status === "critical" ? "badge-critical" : "badge-warning"}>
                      {repo.alerts} alerts
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {repo.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: repo.languageColor }}
                    />
                    <span>{repo.language}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" />
                    <span>{repo.stars}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="h-3.5 w-3.5" />
                    <span>{repo.forks}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{repo.lastCommit}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
