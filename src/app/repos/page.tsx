"use client";

import { useEffect, useState } from "react";
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
import { useGitHubApp } from "@/hooks/useGitHubAuth";

const StatusIcon = ({ status }: { status: string }) => {
    if (status === "healthy") return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (status === "warning") return <AlertTriangle className="h-4 w-4 text-warning" />;
    return <AlertTriangle className="h-4 w-4 text-destructive" />;
};

export default function Page() {
    const { state, fetchOrgData, installApp } = useGitHubApp();
    const [filter, setFilter] = useState<"all" | "healthy" | "warning" | "critical">("all");

    // Auto-fetch org data when app is installed
    useEffect(() => {
        if (state.installed) {
            fetchOrgData();
        }
    }, [state.installed, fetchOrgData]);

    if (!state.installed) {
        return (
            <DashboardLayout>
                <div className="min-h-screen flex flex-col items-center justify-center">
                    <h2 className="text-xl font-semibold mb-4">GitHub App Not Installed</h2>
                    <p className="text-muted-foreground mb-6">
                        Please install the GitHub App to fetch your organization repositories.
                    </p>
                    <Button onClick={installApp}>Install GitHub App</Button>
                </div>
            </DashboardLayout>
        );
    }

    // Filter repos if fetched
    const repositories = state.repos || [];

    const filteredRepos = filter === "all" ? repositories : repositories.filter(r => r.status === filter);

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

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6 animate-fade-in">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search repositories..." className="pl-10" />
                </div>
                <div className="flex gap-2">
                    <Button variant={filter === "all" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("all")}>All</Button>
                    <Button variant={filter === "healthy" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("healthy")}>Healthy</Button>
                    <Button variant={filter === "warning" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("warning")}>Warnings</Button>
                    <Button variant={filter === "critical" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("critical")}>Critical</Button>
                </div>
            </div>

            {/* Repository cards */}
            <div className="grid gap-4">
                {filteredRepos.length === 0 ? (
                    <p className="text-center text-muted-foreground">No repositories found.</p>
                ) : (
                    filteredRepos.map((repo, index) => (
                        <div
                            key={repo.name}
                            className="glass-card p-6 hover:border-primary/30 transition-all cursor-pointer animate-fade-in"
                            style={{ animationDelay: `${0.25 + index * 0.05}s` }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <StatusIcon status={repo.status} />
                                        <h3 className="font-semibold text-foreground font-mono">{repo.name}</h3>
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
                                    <p className="text-sm text-muted-foreground mb-3">{repo.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: repo.languageColor }} />
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
                                <Button variant="ghost" size="sm">View Details</Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DashboardLayout>
    );
}
