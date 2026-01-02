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
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function Page() {
    const { state, fetchSecurityAlerts, isLoading } = useGitHubApp();
    const router = useRouter();
    const [filter, setFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all");

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
    const filteredAlerts = filter === "all"
        ? allAlerts
        : allAlerts.filter(a => a.severity === filter);

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
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold text-foreground">Security Overview</h1>
                </div>
                <p className="text-muted-foreground">
                    Vulnerabilities and security alerts across your organization
                </p>
            </div>

            {/* Alert summary bar */}
            <div className="glass-card p-6 mb-8 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-foreground">Alert Summary</h2>
                    <span className="text-sm text-muted-foreground">{totalAlertsCount} total alerts</span>
                </div>
                <div className="flex gap-2 h-3 rounded-full overflow-hidden bg-secondary">
                    {alertStats.map((stat) => (
                        <div
                            key={stat.label}
                            className={`${stat.color} transition-all duration-500`}
                            style={{ width: totalAlertsCount > 0 ? `${(stat.count / totalAlertsCount) * 100}%` : "0%" }}
                        />
                    ))}
                </div>
                <div className="flex gap-6 mt-4">
                    <Button
                        variant={filter === "all" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setFilter("all")}
                        className="h-auto p-0 px-2 hover:bg-secondary/50"
                    >
                        <span className="text-sm text-muted-foreground">All: <span className="font-mono text-foreground">{totalAlertsCount}</span></span>
                    </Button>
                    {alertStats.map((stat) => (
                        <Button
                            key={stat.label}
                            variant="ghost"
                            size="sm"
                            onClick={() => setFilter(stat.value as any)}
                            className={`h-auto p-0 px-2 flex items-center gap-2 hover:bg-secondary/50 ${filter === stat.value ? "bg-secondary/50" : ""}`}
                        >
                            <div className={`h-2 w-2 rounded-full ${stat.color}`} />
                            <span className="text-sm text-muted-foreground">
                                {stat.label}: <span className="font-mono text-foreground">{stat.count}</span>
                            </span>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Alert types */}
                {alertTypes.map((type, index) => (
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

                <div className="space-y-3">
                    {filteredAlerts.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">No alerts found matching your criteria.</p>
                    ) : (
                        filteredAlerts.map((alert) => (
                            <div
                                key={alert.id}
                                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border hover:bg-secondary/50 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                                        {alert.type === "Secret" && <Key className="h-5 w-5 text-destructive" />}
                                        {alert.type === "Dependency" && <Package className="h-5 w-5 text-warning" />}
                                        {alert.type === "Code" && <Bug className="h-5 w-5 text-primary" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary border border-border text-xs font-medium">
                                                <ExternalLink className="h-3 w-3" />
                                                {alert.repo}
                                            </div>
                                            <span className="text-xs text-muted-foreground">·</span>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${alert.severity === "critical" ? "border-destructive/50 text-destructive bg-destructive/10" :
                                                alert.severity === "high" ? "border-warning/50 text-warning bg-warning/10" :
                                                    "border-primary/50 text-primary bg-primary/10"
                                                }`}>
                                                {alert.type}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-foreground">{alert.title}</p>
                                        <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate max-w-md">{alert.path}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {alert.detected}
                                    </div>
                                    {alert.url && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                                            onClick={() => window.open(alert.url, '_blank')}
                                        >
                                            View
                                            <ExternalLink className="h-3 w-3" />
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
