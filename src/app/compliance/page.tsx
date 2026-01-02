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

import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { useEffect } from "react";

const COLORS = ["hsl(152, 76%, 45%)", "hsl(38, 95%, 55%)", "hsl(0, 84%, 60%)"];

const StatusBar = ({ passed, total }: { passed: number; total: number }) => {
    const percentage = (passed / total) * 100;
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

export default function Page() {
    const { state, fetchOrgData, fetchSecurityAlerts, isLoading } = useGitHubApp();
    const router = useRouter();

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

    const complianceData = [
        { name: "Compliant", value: healthyRepos },
        { name: "Partial", value: warningRepos },
        { name: "Non-compliant", value: criticalRepos },
    ];

    // Real-time checks based on alerts
    const reposWithDependabot = new Set(state.alerts?.filter(a => a.type === "Dependency").map(a => a.repo)).size;
    const reposWithCodeScanning = new Set(state.alerts?.filter(a => a.type === "Code").map(a => a.repo)).size;
    const reposWithSecretScanning = new Set(state.alerts?.filter(a => a.type === "Secret").map(a => a.repo)).size;

    // Use totalRepos for total, as these features "should" be enabled on all
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
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold text-foreground">Compliance Dashboard</h1>
                </div>
                <p className="text-muted-foreground">
                    Best practices and policy compliance across your organization
                </p>
            </div>

            {/* Overview cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Compliance score */}
                <div className="glass-card p-6 animate-fade-in">
                    <h2 className="font-semibold text-foreground mb-4">Compliance Score</h2>
                    <div className="flex items-center justify-center">
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
                <div className="lg:col-span-2 grid grid-cols-3 gap-4">
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
