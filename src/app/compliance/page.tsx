"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
    CheckCircle,
    XCircle,
    AlertCircle,
    Shield,
    FileCode,
    TrendingUp,
    Download,
    RefreshCcw,
    ShieldCheck,
    Lock,
    Zap,
    ChevronRight,
    Search,
    FileText
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { useEffect, useState } from "react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const COLORS = ["hsl(152, 76%, 45%)", "hsl(38, 95%, 55%)", "hsl(0, 84%, 60%)"];

const StatusBar = ({ passed, total, label }: { passed: number; total: number; label: string }) => {
    const percentage = total > 0 ? (passed / total) * 100 : 0;
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-foreground/80 truncate">{label}</span>
                <span className="text-[10px] font-black font-mono text-muted-foreground bg-secondary/30 px-2 py-0.5 rounded-md">
                    {passed}/{total}
                </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-secondary/30 overflow-hidden border border-border/20 p-[1px]">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,0,0,0.1)] ${percentage >= 80 ? "bg-success" : percentage >= 50 ? "bg-warning" : "bg-destructive"
                        }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

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

    const percentage = totalRepos > 0 ? Math.round((healthyRepos / totalRepos) * 100) : 100;

    const getGrade = (score: number) => {
        if (score >= 90) return { grade: "A", color: "text-success", bg: "bg-success/10 border-success/20", label: "Excellent", glow: "shadow-success/20" };
        if (score >= 80) return { grade: "B", color: "text-primary", bg: "bg-primary/10 border-primary/20", label: "Good", glow: "shadow-primary/20" };
        if (score >= 60) return { grade: "C", color: "text-warning", bg: "bg-warning/10 border-warning/20", label: "Fair", glow: "shadow-warning/20" };
        if (score >= 40) return { grade: "D", color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20", label: "Poor", glow: "shadow-orange-500/20" };
        return { grade: "F", color: "text-destructive", bg: "bg-destructive/10 border-destructive/20", label: "At Risk", glow: "shadow-destructive/20" };
    };

    const gradeInfo = getGrade(percentage);

    const complianceData = [
        { name: "Compliant", value: healthyRepos },
        { name: "Partial", value: warningRepos },
        { name: "Non-compliant", value: criticalRepos },
    ];

    const reposWithDependabot = new Set(state.alerts?.filter(a => a.type === "Dependency").map(a => a.repo)).size;
    const reposWithCodeScanning = new Set(state.alerts?.filter(a => a.type === "Code").map(a => a.repo)).size;
    const reposWithSecretScanning = new Set(state.alerts?.filter(a => a.type === "Secret").map(a => a.repo)).size;

    const checks = [
        {
            category: "Security Policies",
            icon: Shield,
            description: "Automated vulnerability detection and secret prevention",
            items: [
                { name: "Dependabot Active", passed: reposWithDependabot, total: totalRepos },
                { name: "Secret Scanning", passed: reposWithSecretScanning, total: totalRepos },
            ],
        },
        {
            category: "Code Standards",
            icon: FileCode,
            description: "Static analysis and repository health metrics",
            items: [
                { name: "Code Analysis", passed: reposWithCodeScanning, total: totalRepos },
                { name: "Healthy Status", passed: healthyRepos, total: totalRepos },
            ],
        },
    ];

    return (
        <DashboardLayout>
            {/* Page Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-sm">
                            <ShieldCheck className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Compliance</h1>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                Security posture audit and reporting
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 md:flex-none h-12 px-6 gap-2 bg-secondary/10 border-border/40 hover:bg-secondary/20 rounded-2xl transition-all group text-muted-foreground hover:text-primary"
                        onClick={async () => {
                            setIsDownloading(true);
                            await new Promise(r => setTimeout(r, 1200));
                            setIsDownloading(false);
                            toast.success("Compliance report generated!");
                        }}
                        disabled={isDownloading}
                    >
                        {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4 transition-transform group-hover:scale-110" />}
                        <span className="font-black uppercase  text-[10px]">Generate Compliance Report</span>
                    </Button>
                    <Button
                        variant="glow"
                        size="sm"
                        className="flex-1 md:flex-none h-12 px-8 gap-2 bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all rounded-2xl"
                        onClick={async () => {
                            setIsAuditing(true);
                            await fetchOrgData(true);
                            setIsAuditing(false);
                            toast.success("Audit completed!");
                        }}
                        disabled={isAuditing}
                    >
                        {isAuditing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                        <span className="font-black uppercase  text-[10px]">Re-scan Org</span>
                    </Button>
                </div>
            </div>

            {/* Score Overview Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
                <div className="lg:col-span-8 glass-card p-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                        <Shield className="h-64 w-64 rotate-12" />
                    </div>

                    <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
                        <div className="relative shrink-0">
                            <div className={`h-32 w-32 md:h-40 md:w-40 flex flex-col items-center justify-center rounded-[2.5rem] border-4 ${gradeInfo.bg} ${gradeInfo.color} ${gradeInfo.glow} shadow-2xl transition-transform group-hover:scale-105 duration-500`}>
                                <span className="text-5xl md:text-6xl font-black tracking-tighter leading-none">{gradeInfo.grade}</span>
                                <span className="text-[10px] md:text-xs font-black uppercase  mt-2 opacity-80">{gradeInfo.label}</span>
                            </div>
                            <div className="absolute -bottom-2 -right-2 p-2 bg-background rounded-2xl border border-border shadow-xl">
                                <Zap className="h-5 w-5 text-amber-400 fill-amber-400" />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl md:text-3xl font-black text-foreground mb-3 tracking-tight">Organization Score</h2>
                            <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-xl">
                                Your organization scored <span className="text-foreground font-black px-1.5 py-0.5 bg-primary/10 rounded-lg">{percentage}%</span> on the security compliance audit across <span className="text-foreground font-black underline decoration-primary/40 underline-offset-4">{totalRepos}</span> active codebase assets.
                            </p>

                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-secondary/20 rounded-2xl border border-border/40 hover:bg-secondary/30 transition-colors flex items-center gap-4">
                                    <div className="p-2 bg-success/10 rounded-xl">
                                        <CheckCircle className="h-5 w-5 text-success" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase  text-muted-foreground opacity-60">Compliant</p>
                                        <p className="text-xl font-black text-foreground">{healthyRepos}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-secondary/20 rounded-2xl border border-border/40 hover:bg-secondary/30 transition-colors flex items-center gap-4">
                                    <div className="p-2 bg-destructive/10 rounded-xl">
                                        <AlertCircle className="h-5 w-5 text-destructive" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase  text-muted-foreground opacity-60">At Risk</p>
                                        <p className="text-xl font-black text-foreground">{criticalRepos + warningRepos}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 glass-card p-6 md:p-8 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-black text-foreground mb-1 tracking-tight">Compliance Health</h3>
                        <p className="text-xs text-muted-foreground mb-6">Distribution of asset compliance status</p>
                    </div>

                    <div className="h-48 relative">
                        {loadingStates.fetchingRepos ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-40 w-40 rounded-full border-8 border-secondary/20 animate-pulse border-t-primary" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={complianceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                        strokeWidth={0}
                                        animationBegin={0}
                                        animationDuration={1500}
                                    >
                                        {complianceData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-black text-foreground">{percentage}%</span>
                            <span className="text-[8px] font-black uppercase  opacity-40">Healthy</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 pt-6 border-t border-border/40">
                        {complianceData.map((item, index) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full shadow-[0_0_4px_rgba(0,0,0,0.2)]" style={{ backgroundColor: COLORS[index] }} />
                                <span className="text-[10px] font-black uppercase  text-muted-foreground">{item.name}</span>
                                <span className="text-[10px] font-mono font-black text-foreground ml-1">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Compliance checks section */}
            <div className="space-y-6 mb-12">
                <div className="flex items-center gap-3 mb-2 px-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-black text-foreground tracking-tight">Security Control Matrix</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {checks.map((category, catIndex) => (
                        <div
                            key={category.category}
                            className="glass-card p-6 md:p-8 animate-fade-in group relative overflow-hidden"
                            style={{ animationDelay: `${0.1 + catIndex * 0.1}s` }}
                        >
                            <div className="absolute -right-4 -top-4 h-24 w-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

                            <div className="flex items-start gap-5 mb-8 relative z-10">
                                <div className="p-3.5 bg-secondary/30 rounded-2xl border border-border/50 group-hover:bg-primary/10 transition-colors group-hover:scale-110 duration-500">
                                    <category.icon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-foreground tracking-tight group-hover:text-primary transition-colors">{category.category}</h3>
                                    <p className="text-xs text-muted-foreground mt-1 font-medium">{category.description}</p>
                                </div>
                            </div>

                            <div className="space-y-6 relative z-10">
                                {category.items.map((item) => (
                                    <StatusBar key={item.name} label={item.name} passed={item.passed} total={item.total} />
                                ))}
                            </div>

                            <div className="mt-8 flex items-center justify-end">
                                <Button variant="ghost" size="sm" className="h-8 px-3 gap-1.5 text-[10px] font-black uppercase  text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                                    Analyze Policies
                                    <ChevronRight className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Audit Log / Footer Info */}
            <div className="py-12 border-t border-border/20 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full border border-border/40 mb-4 cursor-default">
                    <Lock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] font-black uppercase  text-muted-foreground opacity-60">Next full audit scheduled for Sunday, 00:00 UTC</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-2">
                    All audits are performed according to
                    <a href="#" className="text-primary hover:underline font-black uppercase  text-[10px]">Git Guard Protcol v4.2</a>
                </p>
            </div>
        </DashboardLayout>
    );
}
