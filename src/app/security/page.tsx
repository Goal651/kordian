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
    Filter,
    CheckCircle,
    ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { cn } from "@/lib/utils";
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
            <div className="mb-6 p-4 md:p-8 bg-gradient-to-br from-primary/10 via-background to-background rounded-2xl border border-primary/20 shadow-xl shadow-primary/5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                            </div>
                            <h1 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight">Security Overview</h1>
                        </div>
                        <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
                            Real-time security vulnerability tracking and automated remediation across your entire organization's codebase.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <Button
                            variant="outline"
                            size="lg"
                            className="flex-1 sm:flex-none h-12 md:h-14 px-8 gap-3 bg-secondary/10 border-border/40 hover:bg-secondary/20 transition-all rounded-2xl group text-muted-foreground hover:text-primary"
                            onClick={() => {
                                console.log("Generating security report...");
                                toast.info("Compiling security findings...");
                            }}
                        >
                            <ShieldCheck className="h-5 w-5 transition-transform group-hover:scale-110" />
                            <span className="uppercase font-black text-[10px] tracking-widest">Security Report</span>
                        </Button>
                        <Button
                            variant="glow"
                            size="lg"
                            className="flex-1 sm:flex-none bg-primary text-primary-foreground font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all h-12 md:h-14 px-8 text-base rounded-2xl"
                            onClick={async () => {
                                setIsRemediating(true);
                                await new Promise(r => setTimeout(r, 1500));
                                setIsRemediating(false);
                                toast.success("Security remediation workflow initiated!");
                            }}
                            disabled={isRemediating}
                        >
                            {isRemediating ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : null}
                            {isRemediating ? "Initializing Engine..." : "Remediate Vulnerabilities"}
                        </Button>
                    </div>
                </div>

                {/* Filter and Search */}
                <div className="flex flex-col xl:flex-row gap-4 pt-6 border-t border-border/40">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                        <Input
                            placeholder="Search by vulnerability, CVE, or repository..."
                            className="pl-11 h-11 md:h-12 bg-secondary/20 border-border/50 focus:border-primary/40 focus:bg-secondary/40 transition-all rounded-xl placeholder:text-muted-foreground/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant={filter === "all" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setFilter("all")}
                            className={`h-11 px-4 flex items-center gap-2 rounded-xl transition-all ${filter === "all" ? "bg-secondary shadow-sm" : "hover:bg-secondary/40"}`}
                        >
                            <Filter className="h-3.5 w-3.5" />
                            <span className="font-medium">All Alerts</span>
                        </Button>
                        <div className="h-6 w-px bg-border/40 hidden sm:block mx-1" />
                        {alertStats.map((stat) => (
                            <Button
                                key={stat.label}
                                variant={filter === stat.value ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setFilter(stat.value as any)}
                                className={`h-11 px-4 flex items-center gap-2 rounded-xl transition-all ${filter === stat.value ? "bg-secondary border border-primary/20 shadow-sm" : "hover:bg-secondary/40"}`}
                            >
                                <div className={`h-2.5 w-2.5 rounded-full ${stat.color} shadow-sm ring-2 ring-background`} />
                                <span className={`text-sm ${filter === stat.value ? "text-foreground font-semibold" : "text-muted-foreground font-medium"}`}>
                                    {stat.label}
                                </span>
                                <span className="bg-background/80 px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono border border-border/50 text-muted-foreground">
                                    {stat.count}
                                </span>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Alert summary bar */}
            <div className="glass-card-medium p-4 md:p-6 mb-8 animate-fade-in group hover:border-primary/20 transition-all border-dashed border-2 bg-secondary/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                    <div className="flex flex-col gap-1">
                        <h2 className="font-bold text-lg text-foreground">Risk Exposure Profile</h2>
                        <p className="text-[10px] text-muted-foreground uppercase  font-black opacity-70">Severity Distribution Analysis</p>
                    </div>
                    <div className="flex items-baseline gap-2 bg-background/50 px-3 py-1 rounded-lg border border-border/50 self-start sm:self-auto">
                        <span className="text-2xl font-black text-foreground font-mono">{totalAlertsCount}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Total Alerts</span>
                    </div>
                </div>
                <div className="flex gap-1.5 h-3 md:h-4 rounded-full overflow-hidden bg-secondary/50 items-center p-0.5 md:p-1 mb-8 shadow-inner">
                    {alertStats.map((stat) => (
                        <div
                            key={stat.label}
                            className={`${stat.color} h-full rounded-full transition-all duration-1000 ease-out shadow-sm`}
                            style={{
                                width: totalAlertsCount > 0 ? `${(stat.count / totalAlertsCount) * 100}%` : "0%",
                                opacity: stat.count > 0 ? 1 : 0
                            }}
                        />
                    ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {alertStats.map(stat => (
                        <div key={stat.label} className="p-4 rounded-2xl bg-secondary/20 border border-border/40 hover:bg-secondary/40 transition-all hover:scale-[1.02] group/stat">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={cn(
                                    "h-2.5 w-2.5 rounded-full shadow-sm",
                                    stat.color,
                                    stat.value === 'critical' ? 'shadow-destructive/40' :
                                        stat.value === 'high' ? 'shadow-warning/40' :
                                            stat.value === 'medium' ? 'shadow-primary/40' : 'shadow-muted-foreground/40'
                                )} />
                                <span className="text-xs text-muted-foreground font-bold uppercase ">{stat.label}</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-black font-mono text-foreground leading-none">{stat.count}</p>
                                <p className="text-[10px] text-muted-foreground/60 font-bold">{(totalAlertsCount > 0 ? (stat.count / totalAlertsCount) * 100 : 0).toFixed(0)}%</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
                {/* Alert types */}
                {loadingStates.fetchingAlerts ? (
                    <>
                        {[0, 1, 2].map(i => (
                            <div key={i} className="glass-card p-6 animate-fade-in">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-10 w-10 rounded-xl" />
                                        <Skeleton className="h-5 w-28" />
                                    </div>
                                </div>
                                <Skeleton className="h-10 w-20 mb-3" />
                                <Skeleton className="h-2 w-full rounded-full" />
                            </div>
                        ))}
                    </>
                ) : alertTypes.map((type, index) => (
                    <div
                        key={type.label}
                        className="glass-card p-6 animate-fade-in hover:border-primary/20 transition-all group"
                        style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-primary/5 p-2.5 group-hover:bg-primary/10 transition-colors">
                                    <type.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                                </div>
                                <span className="font-bold text-foreground text-sm md:text-base">{type.label}</span>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground/40 cursor-pointer hover:text-primary transition-all hover:scale-110" />
                        </div>
                        <div className="flex items-baseline gap-2 mb-4">
                            <span className="text-3xl md:text-4xl font-black text-foreground font-mono">{type.active}</span>
                            <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-tighter">Active Issues</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase  text-muted-foreground/50">
                                <span>Coverage</span>
                                <span>{type.count} Total</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: type.count > 0 ? `${(type.active / type.count) * 100}%` : "0%" }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Alert List */}
            <div className="glass-card p-4 md:p-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-destructive/10 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <h2 className="font-bold text-xl text-foreground tracking-tight">
                            {filter === "all" ? "Security Vulnerabilities" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Priority Detected`}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className={`text-[10px] font-black uppercase  px-3 py-1.5 rounded-full border ${filter === "critical" ? "bg-destructive/10 border-destructive/20 text-destructive" :
                            "bg-secondary/50 border-border/50 text-muted-foreground"
                            }`}>
                            {filteredAlerts.length} Critical Findings
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredAlerts.length === 0 ? (
                        <div className="text-center py-20 bg-secondary/5 rounded-3xl border border-dashed border-border/40 flex flex-col items-center">
                            <div className="h-20 w-20 bg-secondary/20 rounded-full flex items-center justify-center mb-6">
                                <Shield className="h-10 w-10 text-muted-foreground/30" />
                            </div>
                            <p className="text-lg font-bold text-foreground">Perfect Clean Slate</p>
                            <p className="text-sm text-muted-foreground/60 mt-1 max-w-xs mx-auto">No security alerts matching your current filters have been detected in the system.</p>
                            <Button variant="outline" size="sm" onClick={() => { setFilter("all"); setSearchQuery(""); }} className="mt-8 rounded-xl px-6 h-10 font-bold border-primary/20 hover:bg-primary/5 text-primary">
                                Reset Scan Filters
                            </Button>
                        </div>
                    ) : (
                        filteredAlerts.map((alert, idx) => (
                            <div
                                key={idx}
                                className="group/alert relative flex flex-col p-5 md:p-6 rounded-3xl bg-secondary/10 border border-border/40 hover:bg-secondary/20 hover:border-primary/20 transition-all animate-fade-in"
                                style={{ animationDelay: `${idx * 0.05}s` }}
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="flex items-start gap-4 md:gap-6">
                                        <div className={`h-12 w-12 md:h-14 md:w-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl transition-transform group-hover/alert:scale-110 ${alert.severity === 'critical' ? 'bg-destructive/10 border border-destructive/20 shadow-destructive/5' :
                                            alert.severity === 'high' ? 'bg-warning/10 border border-warning/20 shadow-warning/5' : 'bg-primary/10 border border-primary/20 shadow-primary/5'
                                            }`}>
                                            {alert.type === "Secret" && <Key className={`h-6 w-6 md:h-7 md:w-7 ${alert.severity === 'critical' ? 'text-destructive' : 'text-warning'}`} />}
                                            {alert.type === "Dependency" && <Package className="h-6 w-6 md:h-7 md:w-7 text-warning" />}
                                            {alert.type === "Code" && <Bug className="h-6 w-6 md:h-7 md:w-7 text-primary" />}
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <button onClick={() => router.push(`/repos/${alert.repo}`)} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/80 border border-border/50 text-[10px] font-black uppercase  text-muted-foreground hover:text-primary hover:border-primary/30 transition-all backdrop-blur-sm">
                                                    <ExternalLink className="h-3 w-3" />
                                                    {alert.repo}
                                                </button>
                                                <div className={`text-[9px] font-black px-3 py-1 rounded-full uppercase  border shadow-sm ${alert.severity === "critical" ? "border-destructive/30 text-destructive bg-destructive/10" :
                                                    alert.severity === "high" ? "border-warning/30 text-warning bg-warning/10" :
                                                        "border-primary/30 text-primary bg-primary/10"
                                                    }`}>
                                                    {alert.severity} Risk
                                                </div>
                                            </div>
                                            <h3 className="text-lg md:text-xl font-black text-foreground leading-tight group-hover/alert:text-primary transition-colors">{alert.title}</h3>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground/70 bg-secondary/30 px-3 py-1 rounded-lg border border-border/30">
                                                    <span className="opacity-40 select-none">PATH:</span>
                                                    <span className="truncate max-w-[150px] sm:max-w-md">{alert.path || "Repository Global Scope"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 md:gap-3 pt-4 md:pt-0 border-t md:border-0 border-border/30">
                                        <div className="flex flex-col items-start md:items-end">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">
                                                <Clock className="h-3 w-3" />
                                                Detected {alert.detected}
                                            </div>
                                            {alert.fixed && <div className="flex items-center gap-1 font-black text-[9px] text-success uppercase mt-1 "><CheckCircle className="h-2.5 w-2.5" />Auto-Patch Ready</div>}
                                        </div>
                                        {alert.url && (
                                            <Button
                                                size="sm"
                                                variant="glow"
                                                className="h-10 px-5 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground font-bold transition-all border border-primary/20 shadow-lg shadow-primary/5 active:scale-95 group/btn"
                                                onClick={() => window.open(alert.url, '_blank')}
                                            >
                                                <span className="mr-2">Remediate</span>
                                                <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
