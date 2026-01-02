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

export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Organization Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            <span className="font-mono text-primary">acme-corp</span> · Last scanned 5 minutes ago
          </p>
        </div>
        <Button variant="glow" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Run Scan
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Repositories"
          value="47"
          change="+3 this month"
          changeType="positive"
          icon={GitBranch}
          iconColor="primary"
        />
        <StatCard
          title="Team Members"
          value="24"
          change="2 pending invites"
          changeType="neutral"
          icon={Users}
          iconColor="success"
        />
        <StatCard
          title="Commits (30d)"
          value="1,284"
          change="+12% from last month"
          changeType="positive"
          icon={GitCommit}
          iconColor="primary"
        />
        <StatCard
          title="Open Alerts"
          value="38"
          change="6 critical"
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
