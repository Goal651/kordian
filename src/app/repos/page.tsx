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

import { useRouter } from "next/navigation";

import { LoadingScreen } from "@/components/ui/LoadingScreen";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { RepoDetailView } from "@/components/dashboard/RepoDetailView";

export default function Page() {
    const { state, setState, fetchOrgData, isLoading } = useGitHubApp();
    const router = useRouter();
    const [filter, setFilter] = useState<"all" | "healthy" | "warning" | "critical">("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!isLoading && !state.installed) {
            router.push("/connect");
        } else if (!isLoading && state.installed) {
            fetchOrgData();
        }
    }, [isLoading, state.installed, fetchOrgData, router]);

    if (isLoading) return <LoadingScreen />;
    if (!state.installed) return null;

    // Filter repos if fetched
    const repositories = state.repos || [];

    const filteredRepos = repositories.filter(repo => {
        const matchesStatus = filter === "all" ? true : repo.status === filter;
        const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    if (state.selectedRepoName) {
        return (
            <DashboardLayout>
                <RepoDetailView />
            </DashboardLayout>
        );
    }

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
                    <Input
                        placeholder="Search repositories..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant={filter === "all" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("all")}>All</Button>
                    <Button variant={filter === "healthy" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("healthy")}>Healthy</Button>
                    <Button variant={filter === "warning" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("warning")}>Warnings</Button>
                    <Button variant={filter === "critical" ? "secondary" : "ghost"} size="sm" onClick={() => setFilter("critical")}>Critical</Button>
                </div>
            </div>

            {/* Repository cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
                                        {repo.contributors && repo.contributors.length > 0 && (
                                            <div className="flex -space-x-2 overflow-hidden pl-2 border-l border-border/50">
                                                {repo.contributors.slice(0, 5).map((c) => (
                                                    <HoverCard key={c.login}>
                                                        <HoverCardTrigger asChild>
                                                              <img
                                                                  className="inline-block h-5 w-5 rounded-full ring-2 ring-background grayscale hover:grayscale-0 transition-all cursor-pointer"
                                                                  src={c.avatar}
                                                                  alt={c.login}
                                                                  onClick={(e) => {
                                                                      e.stopPropagation();
                                                                      setState(prev => ({ ...prev, selectedMemberId: c.login }));
                                                                  }}
                                                              />
                                                        </HoverCardTrigger>
                                                        <HoverCardContent className="w-80 bg-background/80">
                                                            <div className="flex justify-between space-x-4 ">
                                                                <div className="flex items-center space-x-4">
                                                                    <div className="rounded-full overflow-hidden h-10 w-10 border border-border">
                                                                        <img src={c.avatar} alt={c.login} className="h-full w-full object-cover" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <h4 className="text-sm font-semibold">@{c.login}</h4>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            Repository Contributor
                                                                        </p>
                                                                        <div className="flex items-center pt-2">
                                                                            <span className="text-xs text-muted-foreground">
                                                                                Active in {repo.name}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </HoverCardContent>
                                                    </HoverCard>
                                                ))}
                                                {repo.contributors.length > 5 && (
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-background bg-secondary text-[10px] font-medium text-muted-foreground">
                                                        +{repo.contributors.length - 5}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setState(prev => ({ ...prev, selectedRepoName: repo.name }));
                                    }}
                                >View Details</Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DashboardLayout>
    );
}
