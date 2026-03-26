"use client";

import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { SecurityAlertsCard } from "@/components/dashboard/SecurityAlertsCard";
import { RiskScoreCard } from "@/components/dashboard/RiskScoreCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { TopContributors } from "@/components/dashboard/TopContributors";
import { RepoHealthCard } from "@/components/dashboard/RepoHealthCard";
import { DateRangeSelector } from "@/components/DateRangeSelector";
import {
    GitBranch,
    Users,
    GitCommit,
    AlertTriangle,
    RefreshCw,
    Calendar,
    LayoutDashboard,
    Zap,
    TrendingUp,
    ShieldCheck,
    FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function Page() {
    const { state, fetchOrgData, fetchMembers, fetchSecurityAlerts, updateDateRange, isLoading, loadingStates } = useGitHubApp();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !state.installed) {
            router.push("/connect");
        }
    }, [isLoading, state.installed, router]);

    if (isLoading) return <LoadingScreen />;
    if (!state.installed) return null;

    const totalPrs = state.members.reduce((acc, m) => acc + (m.prs || 0), 0);
    const totalCommits = state.members.reduce((acc, m) => acc + (m.commits || 0), 0);

    const isRefreshing = loadingStates.fetchingRepos ||
        loadingStates.fetchingMembers ||
        loadingStates.fetchingAlerts ||
        loadingStates.fetchingPRs ||
        loadingStates.fetchingOrgData;

    return (
        <DashboardLayout>
            {/* Page Header */}
            <div className="mb-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 shadow-sm transition-transform hover:scale-110 duration-500">
                            <LayoutDashboard className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Organization Insights</h1>
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 px-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                    <span className="font-black font-mono text-xs text-primary uppercase ">@{state.selectedOrg || "Loading..."}</span>
                                </div>
                                <span className="hidden sm:inline text-muted-foreground/40 font-bold">•</span>
                                <p className="text-xs text-muted-foreground font-medium">Real-time infrastructure intelligence active</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="flex-1 sm:flex-none h-12">
                        <DateRangeSelector onDateRangeChange={updateDateRange} orgCreatedAt={state.orgCreatedAt} />
                    </div>
                    <Button
                        variant="ghost"
                        size="lg"
                        className="h-12 px-6 gap-3 bg-secondary/10 border-border/40 hover:bg-secondary/20 hover:border-primary/30 transition-all rounded-2xl group text-muted-foreground hover:text-primary shrink-0"
                        onClick={() => {
                            // Professional report generation logic placeholder
                            console.log("Generating infrastructure report...");
                        }}>
                        <FileText className="h-4 w-4 transition-transform group-hover:scale-110" />
                        <span className="uppercase font-black text-[10px] tracking-widest">Generate Report</span>
                    </Button>
                    <Button
                        variant="glow"
                        size="lg"
                        className="h-12 px-8 gap-3 bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all rounded-2xl group shrink-0"
                        onClick={() => {
                            fetchOrgData(true);
                            fetchMembers(true);
                            fetchSecurityAlerts(true);
                        }}>
                        <RefreshCw className={`h-4 w-4 transition-transform group-hover:rotate-180 duration-500 ${isRefreshing && "animate-spin"}`} />
                        <span className="uppercase  text-[10px]">Initialize Scan</span>
                    </Button>
                </div>
            </div>

            {/* Top Row: Core Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10 w-full animate-fade-in no-scrollbar overflow-x-auto pb-4">
                <StatCard
                    title="Infrastructure Base"
                    value={state.totalRepos > 0 ? state.totalRepos.toString() : state.repos?.length?.toString() || "0"}
                    change={state.repos?.length ? "Provisioned Assets" : "-"}
                    changeType="positive"
                    icon={GitBranch}
                    iconColor="primary"
                    href="/repos"
                    loading={loadingStates.fetchingRepos}
                />
                <StatCard
                    title="Engineering Force"
                    value={state.totalMembers > 0 ? state.totalMembers.toString() : state.members?.length?.toString() || "0"}
                    change={state.members?.length ? "Active Contributors" : "-"}
                    changeType="neutral"
                    icon={Users}
                    iconColor="success"
                    href="/members"
                    loading={loadingStates.fetchingMembers}
                />
                <StatCard
                    title="Velocity Threshold"
                    value={totalPrs.toString()}
                    change={`${totalCommits} aggregate events`}
                    changeType="positive"
                    icon={GitCommit}
                    iconColor="primary"
                    loading={loadingStates.fetchingMembers}
                />
                <StatCard
                    title="Risk Exposure"
                    value={state.alerts?.length?.toString() || "0"}
                    change={state.alerts?.length ? `${state.alerts.filter(a => a.severity === "critical").length} CRITICAL DETECTED` : "0 Vulnerabilities"}
                    changeType="negative"
                    icon={AlertTriangle}
                    iconColor="destructive"
                    href="/security"
                    loading={loadingStates.fetchingAlerts}
                />
            </div>

            {/* Central Analysis Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 w-full animate-fade-in" style={{ animationDelay: "0.1s" }}>
                <div className="lg:col-span-8 w-full group">
                    <ActivityChart loading={loadingStates.fetchingRepos} />
                </div>
                <div className="lg:col-span-4 group">
                    <RiskScoreCard loading={loadingStates.fetchingRepos} />
                </div>
            </div>

            {/* Secondary Intelligence Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="group">
                    <SecurityAlertsCard loading={loadingStates.fetchingAlerts} />
                </div>
                <div className="group">
                    <TopContributors loading={loadingStates.fetchingMembers} />
                </div>
            </div>

            {/* Deep Health Audit Row */}
            <div className="animate-fade-in group" style={{ animationDelay: "0.3s" }}>
                <RepoHealthCard loading={loadingStates.fetchingRepos} />
            </div>

            {/* Footer Polish */}
            <div className="mt-20 pt-10 border-t border-border/20 text-center pb-12">
                <div className="flex justify-center gap-8 mb-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                    <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /><span className="text-[10px] font-black uppercase ">Git Guard Protocol</span></div>
                    <div className="flex items-center gap-2"><Zap className="h-4 w-4" /><span className="text-[10px] font-black uppercase ">Enterprise Ready</span></div>
                    <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /><span className="text-[10px] font-black uppercase ">High Velocity</span></div>
                </div>
                <p className="text-[10px] text-muted-foreground font-black uppercase  opacity-40">
                    Git Guard Engine v4.2.1-stable • Provisioned for {state.selectedOrg}
                </p>
            </div>
        </DashboardLayout>
    );
}
