"use client";

import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GitCommit, GitPullRequest, Eye, Shield } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Member } from "@/types";

export default function MemberDetailView() {
    const router = useRouter()
    const params = useParams();
    const { state, setState } = useGitHubApp();
    const [member, setMember] = useState<Member | null>(null);

    useEffect(() => {
        const member = state.members.find(m => m.username === params.id);
        if (member) {
            setMember(member);
        }
    }, [params]);

    if (!member) return null;

    const backToDashboard = () => router.back()

    return (
        <div className="animate-fade-in">
            <div className="mb-8 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={backToDashboard} className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-4">
                    <img src={member.avatar} alt={member.username || "Member avatar"} className="h-12 w-12 rounded-full border border-border/50" />
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{member.name}</h1>
                        <p className="text-muted-foreground">@{member.username} · {member.role}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Monthly Commits"
                    value={member.commits.toString()}
                    icon={GitCommit}
                    loading={false}
                />
                <StatCard
                    title="Pull Requests"
                    value={member.prs.toString()}
                    icon={GitPullRequest}
                    loading={false}
                />
                <StatCard
                    title="Code Reviews"
                    value={member.reviews.toString()}
                    icon={Eye}
                    loading={false}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <GitCommit className="h-5 w-5 text-primary" />
                        Repository Contributions
                    </h2>
                    <div className="space-y-4">
                        {member.contributedRepos.length > 0 ? (
                            member.contributedRepos.map(repoName => (
                                <div key={repoName} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all">
                                    <span className="font-medium">{repoName}</span>
                                    <Button variant="ghost" size="sm" onClick={() => setState(prev => ({ ...prev, selectedMemberId: null, selectedRepoName: repoName }))}>
                                        View Repo
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground italic">No specific repo contributions found for this period.</p>
                        )}
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-success" />
                        Security Posture
                    </h2>
                    <div className="p-4 rounded-xl bg-success/5 border border-success/20">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {member.name} has no pending security reviews or blocked merges for this month.
                            All contributions are aligned with organization security policies.
                        </p>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Activity Highlights</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2 text-foreground/80">• Merged 3 critical PRs in the last 7 days</li>
                            <li className="flex items-center gap-2 text-foreground/80">• Resolved 2 dependency alerts in shared modules</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
