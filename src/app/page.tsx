"use client";

import { useEffect } from "react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { SecurityAlertsCard } from "@/components/dashboard/SecurityAlertsCard";
import { RiskScoreCard } from "@/components/dashboard/RiskScoreCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { TopContributors } from "@/components/dashboard/TopContributors";
import { RepoHealthCard } from "@/components/dashboard/RepoHealthCard";
import {
    GitBranch,
    Users,
    GitCommit,
    AlertTriangle,
    RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useGitHubApp } from "@/hooks/useGitHubAuth";

import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function Page() {
    const { state, fetchOrgData, fetchMembers, fetchSecurityAlerts, isLoading, loadingStates } = useGitHubApp();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !state.installed) {
            router.push("/connect");
        } else if (!isLoading && state.installed) {
            fetchOrgData();
            fetchMembers();
            fetchSecurityAlerts();
        }
    }, [isLoading, state.installed, fetchOrgData, fetchMembers, fetchSecurityAlerts, router]);

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
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Organization Overview
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        <span className="font-mono text-primary">{state.selectedOrg || "Loading..."}</span> · Last scanned just now
                    </p>
                </div>
                <Button variant="glow" className="gap-2" onClick={() => {
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Total Repositories"
                    value={state.repos?.length?.toString() || "0"}
                    change={state.repos?.length ? "Live data" : "-"}
                    changeType="positive"
                    icon={GitBranch}
                    iconColor="primary"
                    href="/repos"
                    loading={isRefreshing}
                />
                <StatCard
                    title="Team Members"
                    value={state.members?.length?.toString() || "0"}
                    change={state.members?.length ? "Live data" : "-"}
                    changeType="neutral"
                    icon={Users}
                    iconColor="success"
                    href="/members"
                    loading={isRefreshing}
                />
                <StatCard
                    title="Activity (PRs)"
                    value={totalPrs.toString()}
                    change={`${totalCommits} aggregate commits`}
                    changeType="positive"
                    icon={GitCommit}
                    iconColor="primary"
                    loading={isRefreshing}
                />
                <StatCard
                    title="Open Alerts"
                    value={state.alerts?.length?.toString() || "0"}
                    change={state.alerts?.length ? `${state.alerts.filter(a => a.severity === "critical").length} critical` : "0 critical"}
                    changeType="negative"
                    icon={AlertTriangle}
                    iconColor="destructive"
                    href="/security"
                    loading={isRefreshing}
                />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                    <ActivityChart />
                </div>
                <RiskScoreCard />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <SecurityAlertsCard loading={isRefreshing} />
                <TopContributors loading={isRefreshing} />
            </div>

            <RepoHealthCard />
        </DashboardLayout>
    );
}
