"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Users, GitCommit, GitPullRequest, MessageSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import { useGitHubApp} from "@/hooks/useGitHubAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Member } from "@/types";

// Custom tooltip with better styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-4 py-3 shadow-lg border border-border/50">
        <p className="font-medium text-foreground">{label}</p>
        <p className="flex flex-col font-mono text-sm text-foreground">
          {payload[0].value} {payload[0].value === 1 ? 'repository' : 'repositories'}
        </p>
        <p className="flex flex-col font-mono text-sm text-foreground/80">
          {payload[1].value} {payload[1].value === 1 ? 'pull request' : 'pull requests'}
        </p>
        <p className="flex flex-col font-mono text-sm text-foreground/80">
          {payload[2].value} {payload[2].value === 1 ? 'review' : 'reviews'}
        </p>
      </div>
    );
  }
  return null;
};

export default function Page() {
    const { state, fetchMembers, isLoading } = useGitHubApp();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (!isLoading && !state.installed) {
            router.push("/connect");
        } else if (!isLoading && state.installed) {
            fetchMembers();
        }
    }, [isLoading, state.installed, fetchMembers, router]);

    if (isLoading) return <LoadingScreen />;
    if (!state.installed) return null;

    const members = state.members || [];
    const filteredMembers = members.filter(m =>
        m.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const chartData = members.slice(0, 5).map((m: Member) => ({
        name: m.username,
        commits: m.commits || 0,
        prs: m.prs || 0,
        reviews: m.reviews || 0,
    }));

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Users className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold text-foreground">Team Members</h1>
                </div>
                <p className="text-muted-foreground">
                    Contribution analytics for your organization members
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="stat-card animate-fade-in">
                    <p className="text-sm text-muted-foreground mb-1">Total Members</p>
                    <p className="text-2xl font-bold text-foreground">{members.length}</p>
                </div>
                <div className="stat-card animate-fade-in" style={{ animationDelay: "0.05s" }}>
                    <p className="text-sm text-muted-foreground mb-1">Active (30d)</p>
                    <p className="text-2xl font-bold text-success">{members.filter(m => (m.prs || 0) > 0 || (m.commits || 0) > 0).length}</p>
                </div>
                <div className="stat-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
                    <p className="text-sm text-muted-foreground mb-1">Inactive</p>
                    <p className="text-2xl font-bold text-warning">{members.filter(m => (m.prs || 0) === 0 && (m.commits || 0) === 0).length}</p>
                </div>
                <div className="stat-card animate-fade-in" style={{ animationDelay: "0.15s" }}>
                    <p className="text-sm text-muted-foreground mb-1">Pending Invites</p>
                    <p className="text-2xl font-bold text-muted-foreground">0</p>
                </div>
            </div>

            {/* Chart */}
            <div className="glass-card p-6 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <h2 className="font-semibold text-foreground mb-4">Top Contributors</h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
                            <XAxis type="number" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
                                width={80}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                            />
                            <Bar dataKey="commits" fill="hsl(190, 95%, 50%)" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="prs" fill="hsl(152, 76%, 45%)" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="reviews" fill="hsl(38, 95%, 55%)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex gap-6 mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-sm bg-[hsl(190,95%,50%)]" />
                        <span className="text-sm text-muted-foreground">Commits</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-sm bg-success" />
                        <span className="text-sm text-muted-foreground">Pull Requests</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-sm bg-warning" />
                        <span className="text-sm text-muted-foreground">Reviews</span>
                    </div>
                </div>
            </div>

            {/* Members table */}
            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold text-foreground">All Members</h2>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search members..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="pb-3 font-medium text-muted-foreground">Member</th>
                                <th className="pb-3 font-medium text-muted-foreground text-center">
                                    <GitCommit className="h-4 w-4 inline" />
                                </th>
                                <th className="pb-3 font-medium text-muted-foreground text-center">
                                    <GitPullRequest className="h-4 w-4 inline" />
                                </th>
                                <th className="pb-3 font-medium text-muted-foreground text-center">
                                    <MessageSquare className="h-4 w-4 inline" />
                                </th>
                                <th className="pb-3 font-medium text-muted-foreground text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredMembers.map((member) => (
                                <tr key={member.username} className="hover:bg-secondary/30 transition-colors">
                                    <td className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 overflow-hidden text-xs font-semibold text-primary">
                                                {member.avatar?.startsWith("http") ? (
                                                    <img src={member.avatar} alt={member.username} className="h-full w-full object-cover" />
                                                ) : (
                                                    member.avatar
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{member.name}</p>
                                                <p className="text-xs text-muted-foreground font-mono">@{member.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-center font-mono text-foreground">{member.commits}</td>
                                    <td className="py-4 text-center font-mono text-foreground">{member.prs}</td>
                                    <td className="py-4 text-center font-mono text-foreground">{member.reviews}</td>
                                    <td className="py-4 text-center">
                                        <span className={member.status === "active" ? "badge-success" : "badge-warning"}>
                                            {member.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
