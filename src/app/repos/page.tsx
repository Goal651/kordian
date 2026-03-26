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
    Clock,
    RefreshCw,
    Filter,
    Library,
    ChevronDown,
    ArrowUpDown,
    X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const StatusIcon = ({ status }: { status: string }) => {
    if (status === "healthy") return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (status === "warning") return <AlertTriangle className="h-4 w-4 text-warning" />;
    return <AlertTriangle className="h-4 w-4 text-destructive" />;
};

export default function Page() {
    const { state, setState, fetchOrgData, isLoading, loadingStates } = useGitHubApp();
    const router = useRouter();
    const [filter, setFilter] = useState<"all" | "healthy" | "warning" | "critical">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"pushed" | "stars" | "forks" | "name">("pushed");
    const [languageFilter, setLanguageFilter] = useState<string>("all");

    useEffect(() => {
        if (!isLoading && !state.installed) {
            router.push("/connect");
        }
    }, [isLoading, state.installed, router]);

    if (isLoading) return <LoadingScreen />;
    if (!state.installed) return null;

    // Filter repos if fetched
    const repositories = state.repos || [];

    // Get unique languages for filter
    const languages = Array.from(new Set(repositories.map(r => r.language))).sort().filter(Boolean) as string[];

    const filteredRepos = repositories.filter(repo => {
        const matchesStatus = filter === "all" ? true : repo.status === filter;
        const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLanguage = languageFilter === "all" ? true : repo.language === languageFilter;
        return matchesStatus && matchesSearch && matchesLanguage;
    }).sort((a, b) => {
        if (sortBy === "stars") return b.stars - a.stars;
        if (sortBy === "forks") return b.forks - a.forks;
        if (sortBy === "pushed") return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime();
        return a.name.localeCompare(b.name);
    });

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-sm">
                            <Library className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Repositories</h1>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                Managing <span className="font-black text-foreground">{repositories.length}</span> active codebase assets
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="glow"
                        size="sm"
                        className="flex-1 md:flex-none h-12 px-8 gap-2 bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all rounded-2xl"
                        onClick={() => fetchOrgData(true)}
                    >
                        <RefreshCw className={`h-4 w-4 ${loadingStates.fetchingRepos ? "animate-spin" : ""}`} />
                        <span>Sync Assets</span>
                    </Button>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="mb-10 space-y-4">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Find an asset..."
                            className="w-full pl-12 h-14 bg-secondary/20 border-border/40 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-2xl text-base font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary/50 rounded-lg transition-colors"
                            >
                                <X className="h-4 w-4 text-muted-foreground" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                        <div className="flex items-center h-14 bg-secondary/20 p-1.5 rounded-2xl border border-border/40 shrink-0">
                            {[
                                { id: "pushed", label: "Pushed", icon: Clock },
                                { id: "stars", label: "Stars", icon: Star },
                                { id: "forks", label: "Forks", icon: GitFork },
                                { id: "name", label: "Name", icon: ArrowUpDown }
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setSortBy(option.id as any)}
                                    className={`flex items-center gap-2 px-4 h-full rounded-xl text-xs font-black uppercase  transition-all ${sortBy === option.id
                                        ? "bg-background text-primary shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                                        }`}
                                >
                                    <option.icon className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">{option.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center h-14 bg-secondary/20 p-1.5 rounded-2xl border border-border/40 shrink-0">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 px-6 h-full rounded-xl text-xs font-black uppercase  text-muted-foreground hover:text-foreground transition-all">
                                        <Filter className="h-3.5 w-3.5" />
                                        <span>{languageFilter === 'all' ? 'All Languages' : languageFilter}</span>
                                        <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-xl border-border/50">
                                    <DropdownMenuItem onClick={() => setLanguageFilter("all")} className="font-bold">
                                        All Languages
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {languages.map((lang) => (
                                        <DropdownMenuItem key={lang} onClick={() => setLanguageFilter(lang)} className="font-medium">
                                            {lang}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
                    <Button
                        variant={filter === "all" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setFilter("all")}
                        className={`h-9 px-5 rounded-xl text-[10px] font-black uppercase  transition-all shrink-0 ${filter === "all" ? "bg-primary/20 text-primary border border-primary/30" : "text-muted-foreground hover:bg-secondary/40"}`}
                    >
                        All Assets
                    </Button>
                    {[
                        { id: "healthy", label: "Healthy", color: "success" },
                        { id: "warning", label: "Warnings", color: "warning" },
                        { id: "critical", label: "Critical", color: "destructive" }
                    ].map((f) => (
                        <Button
                            key={f.id}
                            variant={filter === f.id ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setFilter(f.id as any)}
                            className={`h-9 px-5 rounded-xl text-[10px] font-black uppercase  transition-all shrink-0 flex items-center gap-2 ${filter === f.id
                                ? `bg-${f.color}/10 border border-${f.color}/20 text-${f.color}`
                                : "text-muted-foreground hover:bg-secondary/40"
                                }`}
                        >
                            <StatusIcon status={f.id as any} />
                            <span>{f.label}</span>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Repository cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
                {loadingStates.fetchingRepos ? (
                    // Skeleton cards while repos load
                    [0, 1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="glass-card p-6 animate-pulse border-border/20">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-10 w-10 rounded-xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-48 rounded-lg" />
                                        <Skeleton className="h-3 w-24 rounded-lg" />
                                    </div>
                                </div>
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-full mb-2 rounded-lg" />
                            <Skeleton className="h-4 w-3/4 mb-6 rounded-lg" />
                            <div className="flex gap-4 pt-4 border-t border-border/20">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-4 w-12" />
                            </div>
                        </div>
                    ))
                ) : filteredRepos.length === 0 ? (
                    <div className="col-span-full py-24 text-center glass-card-medium border-dashed border-2 bg-secondary/5">
                        <div className="flex flex-col items-center gap-4 max-w-xs mx-auto">
                            <div className="p-4 bg-secondary/20 rounded-full">
                                <Search className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                            <p className="text-foreground font-black uppercase  text-sm">No match found</p>
                            <p className="text-muted-foreground text-sm">We couldn't find any repositories matching your current search and filters. Try adjusting them.</p>
                            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setLanguageFilter("all"); setFilter("all"); }} className="mt-2 rounded-xl">Clear All Filters</Button>
                        </div>
                    </div>
                ) : (
                    filteredRepos.map((repo, index) => (
                        <div
                            key={repo.name}
                            className="glass-card p-6 md:p-8 hover:border-primary/40 transition-all cursor-pointer animate-fade-in group relative overflow-hidden active:scale-[0.985]"
                            style={{ animationDelay: `${0.15 + index * 0.05}s` }}
                            onClick={() => router.push(`/repos/${repo.name}`)}
                        >
                            {/* Decorative background element */}
                            <div className="absolute -right-4 -top-4 h-24 w-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

                            <div className="flex flex-col h-full relative z-10">
                                <div className="flex items-start justify-between mb-6 gap-4">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        <div className="p-3 bg-secondary/30 rounded-2xl group-hover:bg-primary/10 transition-colors border border-border/50 shrink-0">
                                            <GitBranch className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h3 className="font-black text-xl text-foreground tracking-tight truncate group-hover:text-primary transition-colors">
                                                    {repo.name}
                                                </h3>
                                                {repo.visibility === "private" ? (
                                                    <div className="p-1 px-1.5 bg-secondary/50 rounded-lg border border-border/50" title="Private Repository">
                                                        <Lock className="h-3 w-3 text-muted-foreground" />
                                                    </div>
                                                ) : (
                                                    <div className="p-1 px-1.5 bg-secondary/50 rounded-lg border border-border/50" title="Public Repository">
                                                        <Unlock className="h-3 w-3 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full ${repo.status === 'healthy' ? 'bg-success shadow-[0_0_4px_hsl(var(--success))]' : repo.status === 'warning' ? 'bg-warning shadow-[0_0_4px_hsl(var(--warning))]' : 'bg-destructive shadow-[0_0_4px_hsl(var(--destructive))]'}`} />
                                                <span className="text-[10px] font-black uppercase  text-muted-foreground opacity-60">
                                                    {repo.status} asset
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {repo.alerts > 0 && (
                                        <div className={`shrink-0 px-3 py-1.5 rounded-xl border font-black text-[10px] uppercase  flex items-center gap-2 shadow-sm ${repo.status === "critical" ? "bg-destructive/10 border-destructive/20 text-destructive" : "bg-warning/10 border-warning/20 text-warning"
                                            }`}>
                                            <AlertTriangle className="h-3 w-3" />
                                            {repo.alerts}
                                        </div>
                                    )}
                                </div>

                                <p className="text-sm text-muted-foreground mb-8 line-clamp-2 min-h-[2.5rem] leading-relaxed group-hover:text-foreground/80 transition-colors">
                                    {repo.description || "No description provided for this repository."}
                                </p>

                                <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-border/40">
                                    <div className="flex flex-wrap items-center gap-5">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/30 rounded-xl border border-border/40 group-hover:bg-secondary/50 transition-colors">
                                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: repo.languageColor || '#71717a' }} />
                                            <span className="text-xs font-bold text-foreground/80">{repo.language || 'Unknown'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-amber-400 transition-colors">
                                            <Star className="h-4 w-4 fill-current opacity-40 group-hover:opacity-100 transition-opacity" />
                                            <span className="text-xs font-mono font-bold">{repo.stars || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-colors">
                                            <GitFork className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                                            <span className="text-xs font-mono font-bold">{repo.forks || 0}</span>
                                        </div>

                                        {repo.contributors && repo.contributors.length > 0 && (
                                            <div className="flex -space-x-2 overflow-hidden pl-2 border-l border-border/50">
                                                {repo.contributors.slice(0, 5).map((c: any) => (
                                                    <HoverCard key={c.login}>
                                                        <HoverCardTrigger asChild>
                                                            <img
                                                                className="inline-block h-6 w-6 rounded-full ring-2 ring-background grayscale hover:grayscale-0 transition-all cursor-pointer"
                                                                src={c.avatar}
                                                                alt={c.login}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    router.push(`/members/${c.login}`);
                                                                }}
                                                            />
                                                        </HoverCardTrigger>
                                                        <HoverCardContent className="w-80 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
                                                            <div className="flex justify-between space-x-4">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="rounded-2xl overflow-hidden h-12 w-12 border-2 border-primary/20 shadow-lg">
                                                                        <img src={c.avatar} alt={c.login} className="h-full w-full object-cover" />
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <h4 className="text-sm font-black text-foreground tracking-tight">@{c.login}</h4>
                                                                        <p className="text-[10px] text-muted-foreground font-black uppercase  opacity-60">
                                                                            Repository Contributor
                                                                        </p>
                                                                        <div className="flex items-center pt-1.5">
                                                                            <span className="text-[10px] text-muted-foreground font-medium">
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
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-background bg-secondary text-[10px] font-black text-muted-foreground border border-border/40">
                                                        +{repo.contributors.length - 5}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase  text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
                                        <Clock className="h-3 w-3" />
                                        <span>Active {repo.lastCommit || 'recently'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DashboardLayout>
    );
}
