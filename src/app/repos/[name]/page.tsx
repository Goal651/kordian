"use client";

import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, AlertTriangle, ExternalLink, Users, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Repository, SecurityAlert } from "@/types";


export default function RepoDetailView() {
    const params = useParams();
    const { state, setState } = useGitHubApp();
    const [repo, setRepo] = useState<Repository | null>(null);
    const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
    const router = useRouter()

    useEffect(() => {
        const repo = state.repos.find(r => r.name === params.name);
        if (repo) {
            setRepo(repo);
            setAlerts(state.alerts.filter(a => a.repo === params.name));
        }
    }, [params]);

    if (!repo) return null;

    const backToDashboard =()=> router.back()

    return (
        <div className="animate-fade-in">
            <div className="mb-8 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={backToDashboard} className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-foreground">{repo.name}</h1>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${repo.visibility === 'public' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                            }`}>
                            {repo.visibility}
                        </span>
                    </div>
                    <p className="text-muted-foreground mt-1 line-clamp-1">{repo.description}</p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(repo.url, '_blank')}>
                        <ExternalLink className="h-4 w-4" />
                        GitHub
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <StatCard title="Health Status" value={repo.status.toUpperCase()} icon={Shield} loading={false} />
                <StatCard title="Security Alerts" value={repo.alerts.toString()} icon={AlertTriangle} loading={false} />
                <StatCard title="Contributors" value={repo.contributors.length.toString()} icon={Users} loading={false} />
                <StatCard title="Last Push" value={repo.lastCommit} icon={Clock} loading={false} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-destructive" />
                            Security Vulnerabilities
                        </h2>
                        {alerts.length > 0 ? (
                            <div className="space-y-4">
                                {alerts.map(alert => (
                                    <div key={alert.id} className="p-4 rounded-xl bg-secondary/20 border border-border/50 hover:border-primary/30 transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${alert.severity === 'critical' ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'
                                                }`}>
                                                {alert.severity}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{alert.detected}</span>
                                        </div>
                                        <h3 className="font-semibold text-foreground mb-1">{alert.title}</h3>
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{alert.description}</p>
                                        <div className="flex items-center gap-3">
                                            <Button variant="glow" size="sm" className="bg-primary text-primary-foreground text-xs" onClick={() => window.open(alert.url, '_blank')}>
                                                Apply Fix on GitHub
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-xs">
                                                View Documentation
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Shield className="h-12 w-12 text-success mx-auto mb-4 opacity-50" />
                                <p className="text-muted-foreground">No open security vulnerabilities detected.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Contributors
                        </h2>
                        <div className="space-y-4">
                            {repo.contributors.map(contributor => (
                                <div key={contributor.login} className="flex items-center gap-3 group">
                                    <img src={contributor.avatar} className="h-8 w-8 rounded-full border border-border/50" alt={contributor.login} />
                                    <span className="text-sm font-medium group-hover:text-primary transition-colors cursor-pointer" onClick={() => setState(prev => ({ ...prev, selectedRepoName: null, selectedMemberId: contributor.login }))}>
                                        {contributor.name || contributor.login}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold mb-2">Primary Language</h2>
                        <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: repo.languageColor }} />
                            <span className="font-medium">{repo.language}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
