"use client";

import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, AlertTriangle, ExternalLink, Users, Clock, Eye, GitPullRequest, Info } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Repository, SecurityAlert } from "@/types";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Skeleton } from "@/components/ui/skeleton";


export default function RepoDetailView() {
    const params = useParams();
    const { state, setState, isLoading, loadingStates, fetchSecurityAlerts } = useGitHubApp();
    const [repo, setRepo] = useState<Repository | null>(null);
    const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !state.installed) {
            router.push("/connect");
            return;
        }
        if (!isLoading && state.installed && state.alerts.length === 0) {
            fetchSecurityAlerts();
        }
    }, [isLoading, state.installed, router, fetchSecurityAlerts, state.alerts.length]);

    useEffect(() => {
        const found = state.repos.find(r => r.name === params.name);
        if (found) {
            setRepo(found);
            setAlerts(state.alerts.filter(a => a.repo === params.name));
        }
    }, [params, state.repos, state.alerts]);

    if (isLoading) return <LoadingScreen />;
    if (!state.installed) return null;

    if (!repo && loadingStates.fetchingRepos) {
        return (
            <div className="animate-fade-in p-4">
                <div className="mb-8 flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                    {[0,1,2,3,4,5].map(i => <StatCard key={i} title="" value="" icon={Shield} loading={true} />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 glass-card p-6 space-y-4">
                        {[0,1,2].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
                    </div>
                    <div className="space-y-6">
                        <div className="glass-card p-6 space-y-4">
                             {[0,1,2,3].map(i => <Skeleton key={i} className="h-6 w-full" />)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!repo) return (
        <div className="p-4 text-center">
            <p className="text-muted-foreground">Repository not found.</p>
            <Button variant="link" onClick={() => router.push("/")}>Back to Dashboard</Button>
        </div>
    );

    const backToDashboard =()=> router.back()

    return (
        <div className="animate-fade-in p-4">
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
                        {repo.license && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary text-muted-foreground">
                                {repo.license}
                            </span>
                        )}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                <StatCard title="Health Status" value={repo.status.toUpperCase()} icon={Shield} loading={loadingStates.fetchingRepos} />
                <StatCard title="Security Alerts" value={repo.alerts.toString()} icon={AlertTriangle} loading={loadingStates.fetchingAlerts} />
                <StatCard title="Contributors" value={repo.contributors.length.toString()} icon={Users} loading={loadingStates.fetchingRepos} />
                <StatCard title="Watchers" value={(repo.watchers || 0).toString()} icon={Eye} loading={loadingStates.fetchingRepos} />
                <StatCard title="Open PRs" value={(repo.openPRs || 0).toString()} icon={GitPullRequest} loading={loadingStates.fetchingRepos} />
                <StatCard title="Issues" value={(repo.openIssues || 0).toString()} icon={Info} loading={loadingStates.fetchingRepos} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-destructive" />
                            Security Vulnerabilities
                        </h2>
                        {loadingStates.fetchingAlerts ? (
                            <div className="space-y-4">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="p-4 rounded-xl bg-secondary/20 border border-border/50">
                                        <div className="flex items-center justify-between mb-4">
                                            <Skeleton className="h-4 w-20 rounded-full" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                        <Skeleton className="h-5 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-full mb-4" />
                                        <div className="flex gap-3">
                                            <Skeleton className="h-8 w-32 rounded-md" />
                                            <Skeleton className="h-8 w-32 rounded-md" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : alerts.length > 0 ? (
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
                        <h2 className="text-lg font-semibold mb-3">Languages</h2>
                        <div className="space-y-3">
                            {repo.allLanguages && repo.allLanguages.length > 0 ? (
                                repo.allLanguages.map((lang, i) => (
                                    <div key={lang} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: i === 0 ? repo.languageColor : '#555' }} />
                                            <span className="text-sm text-foreground/80">{lang}</span>
                                        </div>
                                        {i === 0 && <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded uppercase">Primary</span>}
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: repo.languageColor }} />
                                    <span className="font-medium">{repo.language}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
