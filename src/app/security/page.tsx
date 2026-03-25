"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    Shield,
    AlertTriangle,
    Bug,
    Key,
    Package,
    ExternalLink,
    ChevronRight,
    Clock,
    Search,
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Page() {
    const { state, fetchSecurityAlerts, isLoading, loadingStates } = useGitHubApp();
    const router = useRouter();
    const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isRemediating, setIsRemediating] = useState(false);

    useEffect(() => {
        if (!isLoading && !state.installed) {
            router.push("/connect");
        } else if (!isLoading && state.installed) {
            fetchSecurityAlerts();
        }
    }, [isLoading, state.installed, fetchSecurityAlerts, router]);

    if (isLoading) return <LoadingScreen />;
    if (!state.installed) return null;

    const allAlerts = state.alerts || [];
    const filteredAlerts = allAlerts.filter(a => {
        const matchesSeverity = filter === "all" ? true : a.severity === filter;
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             a.repo.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSeverity && matchesSearch;
    });

    const alertStats = [
        { label: "Critical", count: state.alerts.filter(a => a.severity === "critical").length, color: "bg-destructive", value: "critical" },
        { label: "High", count: state.alerts.filter(a => a.severity === "high").length, color: "bg-warning", value: "high" },
        { label: "Medium", count: state.alerts.filter(a => a.severity === "medium").length, color: "bg-primary", value: "medium" },
        { label: "Low", count: state.alerts.filter(a => a.severity === "low").length, color: "bg-muted-foreground", value: "low" },
    ];

    const totalAlertsCount = state.alerts.length;

    const alertTypes = [
        { icon: Package, label: "Dependabot", count: state.alerts.filter(a => a.type === "Dependency").length, active: state.alerts.filter(a => a.type === "Dependency").length },
        { icon: Bug, label: "Code Scanning", count: state.alerts.filter(a => a.type === "Code").length, active: state.alerts.filter(a => a.type === "Code").length },
        { icon: Key, label: "Secret Scanning", count: state.alerts.filter(a => a.type === "Secret").length, active: state.alerts.filter(a => a.type === "Secret").length },
    ];
    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 via-background to-background rounded-2xl border border-primary/20 shadow-lg shadow-primary/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="h-7 w-7 text-primary" />
                            <h1 className="text-3xl font-bold text-foreground">Security Overview</h1>
                        </div>
                        <p className="text-muted-foreground max-w-xl">
                            Real-time security vulnerability tracking and vulnerability remediation across your entire organization.
                        </p>
                    </div>
                    <Button 
                        variant="glow" 
                        size="lg" 
                        className="bg-primary text-primary-foreground font-semibold shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                        onClick={async () => {
                            setIsRemediating(true);
                            await new Promise(r => setTimeout(r, 1500));
                            setIsRemediating(false);
                            toast.success("Security remediation workflow initiated!");
                        }}
                        disabled={isRemediating}
                    >
                        {isRemediating ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : null}
                        {isRemediating ? "Initializing..." : "Remediate Vulnerabilities"}
                    </Button>
                </div>

                {/* Filter and Search */}
                <div className="flex flex-col lg:flex-row gap-4 pt-4 border-t border-border/50">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by vulnerability title or repository..."
                            className="pl-10 h-10 bg-secondary/30 border-border focus:border-primary/50 transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={filter === "all" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setFilter("all")}
                            className="h-10 px-4 flex items-center gap-2 hover:bg-secondary/50"
                        >
                            <Filter className="h-3.5 w-3.5" />
                            All Severity
                        </Button>
                        {alertStats.map((stat) => (
                            <Button
                                key={stat.label}
                                variant={filter === stat.value ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setFilter(stat.value as any)}
                                className={`h-10 px-4 flex items-center gap-2 hover:bg-secondary/50 ${filter === stat.value ? "bg-secondary/40 border border-primary/20" : ""}`}
                            >
                                <div className={`h-2.5 w-2.5 rounded-full ${stat.color} shadow-sm`} />
                                <span className={filter === stat.value ? "text-foreground font-medium" : "text-muted-foreground"}>
                                    {stat.label}
                                </span>
                                <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-mono">{stat.count}</span>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Alert summary bar */}
            <div className="glass-card p-6 mb-8 animate-fade-in group hover:border-primary/20 transition-all border-dashed border-2">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="font-semibold text-foreground">Risk Exposure Bar</h2>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">Severity Distribution Graph</p>
                    </div>
                    <span className="text-xl font-bold text-foreground font-mono">{totalAlertsCount} <span className="text-xs font-normal text-muted-foreground uppercase">Alerts Total</span></span>
                </div>
                <div className="flex gap-1.5 h-4 rounded-full overflow-hidden bg-secondary items-center p-1">
                    {alertStats.map((stat) => (
                        <div
                            key={stat.label}
                            className={`${stat.color} h-2 rounded-full transition-all duration-700 ease-elastic`}
                            style={{ 
                                width: totalAlertsCount > 0 ? `${(stat.count / totalAlertsCount) * 100}%` : "0%",
                                opacity: stat.count > 0 ? 1 : 0
                            }}
                        />
                    ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {alertStats.map(stat => (
                        <div key={stat.label} className="p-3 rounded-xl bg-secondary/40 border border-border/50 hover:bg-secondary/60 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <div className={`h-2 w-2 rounded-full ${stat.color}`} />
                                <span className="text-xs text-muted-foreground font-medium">{stat.label} Priority</span>
                            </div>
                            <p className="text-xl font-bold font-mono text-foreground leading-none">{stat.count}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{(totalAlertsCount > 0 ? (stat.count / totalAlertsCount) * 100 : 0).toFixed(1)}% of total risk</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Alert types */}
                {loadingStates.fetchingAlerts ? (
                    <>
                        {[0, 1, 2].map(i => (
                            <div key={i} className="glass-card p-6 animate-fade-in">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-9 w-9 rounded-lg" />
                                        <Skeleton className="h-4 w-28" />
                                    </div>
                                </div>
                                <Skeleton className="h-9 w-16 mb-2" />
                                <Skeleton className="h-2 w-full rounded-full" />
                            </div>
                        ))}
                    </>
                ) : alertTypes.map((type, index) => (
                    <div
                        key={type.label}
                        className="glass-card p-6 animate-fade-in"
                        style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <type.icon className="h-5 w-5 text-primary" />
                                </div>
                                <span className="font-medium text-foreground">{type.label}</span>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-foreground">{type.active}</span>
                            <span className="text-sm text-muted-foreground">/ {type.count} total</span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: type.count > 0 ? `${(type.active / type.count) * 100}%` : "0%" }} // Fixed /0 check
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Critical alerts */}
            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <h2 className="font-semibold text-foreground">
                            {filter === "all" ? "All Alerts" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Priority Alerts`}
                        </h2>
                        <span className={filter === "critical" ? "badge-critical" : "badge-outline"}>
                            {filteredAlerts.length} items
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredAlerts.length === 0 ? (
                        <div className="text-center py-16 bg-secondary/10 rounded-2xl border border-dashed border-border/50">
                            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                            <p className="text-muted-foreground font-medium">No alerts found matching your criteria.</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your filters or search query</p>
                            <Button variant="link" size="sm" onClick={() => {setFilter("all"); setSearchQuery("");}} className="mt-4">
                                Reset filters
                            </Button>
                        </div>
                    ) : (
                        filteredAlerts.map((alert, idx) => (
                            <div
                                key={alert.id}
                                className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 hover:border-primary/30 transition-all group animate-fade-in"
                                style={{ animationDelay: `${idx * 0.05}s` }}
                            >
                                <div className="flex items-start gap-5">
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-inner ${
                                        alert.severity === 'critical' ? 'bg-destructive/10 border border-destructive/20' : 
                                        alert.severity === 'high' ? 'bg-warning/10 border border-warning/20' : 'bg-primary/10 border border-primary/20'
                                    }`}>
                                        {alert.type === "Secret" && <Key className={`h-6 w-6 ${alert.severity === 'critical' ? 'text-destructive' : 'text-warning'}`} />}
                                        {alert.type === "Dependency" && <Package className="h-6 w-6 text-warning" />}
                                        {alert.type === "Code" && <Bug className="h-6 w-6 text-primary" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background/50 border border-border text-[11px] font-bold text-foreground/80 hover:text-primary transition-colors cursor-pointer" onClick={() => router.push(`/repos/${alert.repo}`)}>
                                                <ExternalLink className="h-3 w-3" />
                                                {alert.repo}
                                            </div>
                                            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border ${
                                                alert.severity === "critical" ? "border-destructive/30 text-destructive bg-destructive/5" :
                                                alert.severity === "high" ? "border-warning/30 text-warning bg-warning/5" :
                                                "border-primary/30 text-primary bg-primary/5"
                                            }`}>
                                                {alert.severity} Priority
                                            </div>
                                            <span className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-tighter">{alert.type} scanning</span>
                                        </div>
                                        <h3 className="text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{alert.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px] md:max-w-md bg-secondary/40 px-2 py-0.5 rounded border border-border/50">
                                                {alert.path || "Global scope"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-border/50">
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            Detected {alert.detected}
                                        </div>
                                        {alert.fixed && <span className="text-[10px] text-success font-bold uppercase">Fixed recently</span>}
                                    </div>
                                    {alert.url && (
                                        <Button
                                            size="sm"
                                            variant="glow"
                                            className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all gap-2 border border-primary/20"
                                            onClick={() => window.open(alert.url, '_blank')}
                                        >
                                            Remediate
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
