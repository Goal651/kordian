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
import { useGitHubApp } from "@/hooks/useGitHubAuth";

export default function Page() {
    const { state, fetchOrgData, fetchMembers, fetchSecurityAlerts } = useGitHubApp();

    useEffect(() => {
        if (state.installed) {
            fetchOrgData();
            fetchMembers();
            fetchSecurityAlerts();
        }
    }, [state.installed, fetchOrgData, fetchMembers, fetchSecurityAlerts]);

    const totalPrs = state.members.reduce((acc, m) => acc + (m.prs || 0), 0);
    const totalCommits = state.members.reduce((acc, m) => acc + (m.commits || 0), 0);

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">
                        Organization Overview
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        <span className="font-mono text-primary">{state.selectedOrg || "acme-corp"}</span> · Last scanned just now
                    </p>
                </div>
                <Button variant="glow" className="gap-2" onClick={() => {
                    fetchOrgData(true);
                    fetchMembers(true);
                    fetchSecurityAlerts(true);
                }}>
                    <RefreshCw className="h-4 w-4" />
                    Run Scan
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Total Repositories"
                    value={state.repos?.length?.toString() || "47"}
                    change={state.repos?.length ? "Live data" : "+3 this month"}
                    changeType="positive"
                    icon={GitBranch}
                    iconColor="primary"
                />
                <StatCard
                    title="Team Members"
                    value={state.members?.length?.toString() || "24"}
                    change={state.members?.length ? "Live data" : "2 pending invites"}
                    changeType="neutral"
                    icon={Users}
                    iconColor="success"
                />
                <StatCard
                    title="Activity (PRs)"
                    value={totalPrs.toString()}
                    change={`${totalCommits} aggregate commits`}
                    changeType="positive"
                    icon={GitCommit}
                    iconColor="primary"
                />
                <StatCard
                    title="Open Alerts"
                    value={state.alerts?.length?.toString() || "38"}
                    change={state.alerts?.length ? `${state.alerts.filter(a => a.severity === "critical").length} critical` : "6 critical"}
                    changeType="negative"
                    icon={AlertTriangle}
                    iconColor="destructive"
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
                <SecurityAlertsCard />
                <TopContributors />
            </div>

            <RepoHealthCard />
        </DashboardLayout>
    );
}
