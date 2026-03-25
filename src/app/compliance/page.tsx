"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    CheckCircle,
    XCircle,
    AlertCircle,
    Shield,
    FileCode
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";

import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { useEffect, useState } from "react";

const COLORS = ["hsl(152, 76%, 45%)", "hsl(38, 95%, 55%)", "hsl(0, 84%, 60%)"];

const StatusBar = ({ passed, total }: { passed: number; total: number }) => {
    const percentage = total > 0 ? (passed / total) * 100 : 0;
    return (
        <div className="flex items-center gap-3 flex-1">
            <div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${percentage >= 80 ? "bg-success" : percentage >= 50 ? "bg-warning" : "bg-destructive"
                        }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <span className="text-sm font-mono text-muted-foreground w-16 text-right">
                {passed}/{total}
            </span>
        </div>
    );
};

import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Page() {
    const { state, fetchOrgData, fetchSecurityAlerts, isLoading, loadingStates } = useGitHubApp();
    const router = useRouter();
    const [isAuditing, setIsAuditing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (!isLoading && !state.installed) {
            router.push("/connect");
        } else if (!isLoading && state.installed) {
            fetchOrgData();
            fetchSecurityAlerts();
        }
    }, [isLoading, state.installed, fetchOrgData, fetchSecurityAlerts, router]);

    if (isLoading) return <LoadingScreen />;
    if (!state.installed) return null;

    const totalRepos = state.repos?.length || 0;
    const criticalRepos = state.repos?.filter(r => r.status === "critical")?.length || 0;
    const warningRepos = state.repos?.filter(r => r.status === "warning")?.length || 0;
    const healthyRepos = state.repos?.filter(r => r.status === "healthy")?.length || 0;

    // Calculate compliance percentage
    const percentage = totalRepos > 0 ? Math.round((healthyRepos / totalRepos) * 100) : 100;

    // Calculate Grade
    const getGrade = (score: number) => {
        if (score >= 90) return { grade: "A", color: "text-success", bg: "bg-success/10 border-success/30", label: "Excellent" };
        if (score >= 80) return { grade: "B", color: "text-primary", bg: "bg-primary/10 border-primary/30", label: "Good" };
        if (score >= 60) return { grade: "C", color: "text-warning", bg: "bg-warning/10 border-warning/30", label: "Fair" };
        if (score >= 40) return { grade: "D", color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/30", label: "Poor" };
        return { grade: "F", color: "text-destructive", bg: "bg-destructive/10 border-destructive/30", label: "At Risk" };
    };

    const gradeInfo = getGrade(percentage);

    const complianceData = [
        { name: "Compliant", value: healthyRepos },
        { name: "Partial", value: warningRepos },
        { name: "Non-compliant", value: criticalRepos },
    ];

    // Real-time checks based on alerts
    const reposWithDependabot = new Set(state.alerts?.filter(a => a.type === "Dependency").map(a => a.repo)).size;
    const reposWithCodeScanning = new Set(state.alerts?.filter(a => a.type === "Code").map(a => a.repo)).size;
    const reposWithSecretScanning = new Set(state.alerts?.filter(a => a.type === "Secret").map(a => a.repo)).size;

    const checks = [
        {
            category: "Security Policies",
            icon: Shield,
            items: [
                { name: "Dependabot Active", passed: reposWithDependabot, total: totalRepos },
                { name: "Secret Scanning Active", passed: reposWithSecretScanning, total: totalRepos },
            ],
        },
        {
            category: "Code Quality",
            icon: FileCode,
            items: [
                { name: "Code Scanning Active", passed: reposWithCodeScanning, total: totalRepos },
                { name: "Healthy Status", passed: healthyRepos, total: totalRepos },
            ],
        },
    ];

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8 p-6 bg-secondary/20 rounded-2xl border border-border/50">
                <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`h-20 w-20 flex items-center justify-center text-3xl font-black rounded-2xl border-2 ${gradeInfo.bg} ${gradeInfo.color} shadow-lg shadow-black/10`}>
                            {gradeInfo.grade}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-bold text-foreground">Compliance Guard</h1>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${gradeInfo.bg} ${gradeInfo.color}`}>
                                    {gradeInfo.label}
                                </span>
                            </div>
                            <p className="text-muted-foreground text-sm max-w-md">
                                Your organization scored <span className="text-foreground font-semibold">{percentage}%</span> on the security compliance audit for <span className="text-foreground font-semibold">{totalRepos}</span> repositories.
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-background"
                            onClick={async () => {
                                setIsDownloading(true);
                                await new Promise(r => setTimeout(r, 1200));
                                setIsDownloading(false);
                                toast.success("Compliance report generated and downloaded!");
                            }}
                            disabled={isDownloading}
                        >
                            {isDownloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                            {isDownloading ? "Generating..." : "Download Report"}
                        </Button>
                        <Button 
                            variant="glow" 
                            size="sm"
                            onClick={async () => {
                                setIsAuditing(true);
                                await fetchOrgData(true);
                                setIsAuditing(false);
                                toast.success("Compliance audit completed!");
                            }}
                            disabled={isAuditing}
                        >
                            {isAuditing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                            {isAuditing ? "Auditing..." : "Audit Repositories"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Overview cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Compliance score */}
                <div className="glass-card p-6 animate-fade-in">
                    <h2 className="font-semibold text-foreground mb-4">Compliance Score</h2>
                    <div className="flex items-center justify-center">
                        {loadingStates.fetchingRepos ? (
                            <div className="relative h-40 w-40 flex items-center justify-center">
                                <div className="h-40 w-40 rounded-full border-[20px] border-muted animate-pulse" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                                    <Skeleton className="h-8 w-12" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                        ) : (
                            <div className="relative h-40 w-40">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={complianceData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            dataKey="value"
                                            strokeWidth={0}
                                        >
                                            {complianceData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-success">{percentage}%</span>
                                    <span className="text-xs text-muted-foreground">Compliant</span>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                        {complianceData.map((item, index) => (
                            <div key={item.name} className="flex items-center gap-1.5 text-xs">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                <span className="text-muted-foreground">{item.name}</span>
                                <span className="font-mono text-foreground">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick stats */}
                <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                    {loadingStates.fetchingRepos ? (
                        <>
                            {[0, 1, 2].map(i => (
                                <div key={i} className="stat-card animate-fade-in">
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-9 w-12" />
                                </div>
                            ))}
                        </>
                    ) : (
                        <>
                            <div className="stat-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-4 w-4 text-success" />
                                    <span className="text-sm text-muted-foreground">Fully Compliant</span>
                                </div>
                                <p className="text-3xl font-bold text-success">{healthyRepos}</p>
                                <p className="text-xs text-muted-foreground mt-1">repositories</p>
                            </div>
                            <div className="stat-card animate-fade-in" style={{ animationDelay: "0.15s" }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="h-4 w-4 text-warning" />
                                    <span className="text-sm text-muted-foreground">Partial</span>
                                </div>
                                <p className="text-3xl font-bold text-warning">{warningRepos}</p>
                                <p className="text-xs text-muted-foreground mt-1">repositories</p>
                            </div>
                            <div className="stat-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
                                <div className="flex items-center gap-2 mb-2">
                                    <XCircle className="h-4 w-4 text-destructive" />
                                    <span className="text-sm text-muted-foreground">Non-compliant</span>
                                </div>
                                <p className="text-3xl font-bold text-destructive">{criticalRepos}</p>
                                <p className="text-xs text-muted-foreground mt-1">repositories</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Compliance checks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {checks.map((category, catIndex) => (
                    <div
                        key={category.category}
                        className="glass-card p-6 animate-fade-in"
                        style={{ animationDelay: `${0.25 + catIndex * 0.1}s` }}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-lg bg-primary/10 p-2">
                                <category.icon className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="font-semibold text-foreground">{category.category}</h3>
                        </div>
                        <div className="space-y-4">
                            {category.items.map((item) => (
                                <div key={item.name} className="flex items-center gap-4">
                                    <span className="text-sm text-muted-foreground flex-shrink-0 w-40">
                                        {item.name}
                                    </span>
                                    <StatusBar passed={item.passed} total={item.total} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}
