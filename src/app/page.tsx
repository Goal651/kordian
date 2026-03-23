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
        loadingStates.fetchingOrgData


    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between w-full">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Organization Insights
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-muted-foreground">
                            <span className="font-mono text-primary">{state.selectedOrg || "Loading..."}</span> · Last scanned just now
                        </p>
                        {state.dateRange && (
                            <>
                                <span className="text-muted-foreground">·</span>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                        {state.dateRange.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {state.dateRange.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Date Range Selector */}
                    <DateRangeSelector onDateRangeChange={updateDateRange} orgCreatedAt={state.orgCreatedAt} />

                    <Button
                        variant="glow" className="gap-2 bg-black shadow text-white hover:bg-black/90" onClick={() => {
                            fetchOrgData(true);
                            fetchMembers(true);
                            fetchSecurityAlerts(true);
                        }}>
                        <RefreshCw className={`h-4 w-4
                         ${isRefreshing
                            && "animate-spin"}`}
                        />
                        Run Scan
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 w-full">
                <StatCard
                    title="Total Repositories"
                    value={state.totalRepos > 0 ? state.totalRepos.toString() : state.repos?.length?.toString() || "0"}
                    change={state.repos?.length ? "Organization total" : "-"}
                    changeType="positive"
                    icon={GitBranch}
                    iconColor="primary"
                    href="/repos"
                    loading={loadingStates.fetchingRepos}
                />
                <StatCard
                    title="Team Members"
                    value={state.totalMembers > 0 ? state.totalMembers.toString() : state.members?.length?.toString() || "0"}
                    change={state.members?.length ? "Organization total" : "-"}
                    changeType="neutral"
                    icon={Users}
                    iconColor="success"
                    href="/members"
                    loading={loadingStates.fetchingMembers}
                />
                <StatCard
                    title="Activity (PRs)"
                    value={totalPrs.toString()}
                    change={`${totalCommits} aggregate commits`}
                    changeType="positive"
                    icon={GitCommit}
                    iconColor="primary"
                    loading={loadingStates.fetchingMembers}
                />
                <StatCard
                    title="Open Alerts"
                    value={state.alerts?.length?.toString() || "0"}
                    change={state.alerts?.length ? `${state.alerts.filter(a => a.severity === "critical").length} critical` : "0 critical"}
                    changeType="negative"
                    icon={AlertTriangle}
                    iconColor="destructive"
                    href="/security"
                    loading={loadingStates.fetchingAlerts}
                />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 w-full">
                <div className="lg:col-span-2 w-full">
                    <ActivityChart loading={loadingStates.fetchingRepos} />
                </div>
                <RiskScoreCard loading={loadingStates.fetchingRepos} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <SecurityAlertsCard loading={loadingStates.fetchingAlerts} />
                <TopContributors loading={loadingStates.fetchingMembers} />
            </div>

            <RepoHealthCard loading={loadingStates.fetchingRepos} />
        </DashboardLayout>
    );
}
