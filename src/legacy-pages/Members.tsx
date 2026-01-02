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

const members = [
  {
    name: "Sarah Chen",
    username: "schen",
    avatar: "SC",
    role: "Admin",
    commits: 156,
    prs: 24,
    reviews: 45,
    issues: 12,
    status: "active",
  },
  {
    name: "Alex Rivera",
    username: "arivera",
    avatar: "AR",
    role: "Member",
    commits: 134,
    prs: 18,
    reviews: 32,
    issues: 8,
    status: "active",
  },
  {
    name: "Jordan Kim",
    username: "jkim",
    avatar: "JK",
    role: "Member",
    commits: 98,
    prs: 15,
    reviews: 28,
    issues: 15,
    status: "active",
  },
  {
    name: "Morgan Liu",
    username: "mliu",
    avatar: "ML",
    role: "Member",
    commits: 87,
    prs: 12,
    reviews: 19,
    issues: 6,
    status: "active",
  },
  {
    name: "Casey Park",
    username: "cpark",
    avatar: "CP",
    role: "Member",
    commits: 72,
    prs: 9,
    reviews: 15,
    issues: 4,
    status: "inactive",
  },
  {
    name: "Taylor Swift",
    username: "tswift",
    avatar: "TS",
    role: "Member",
    commits: 45,
    prs: 6,
    reviews: 8,
    issues: 2,
    status: "active",
  },
];

const chartData = members.slice(0, 5).map((m) => ({
  name: m.username,
  commits: m.commits,
  prs: m.prs,
  reviews: m.reviews,
}));

export default function Members() {
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
          <p className="text-2xl font-bold text-foreground">24</p>
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <p className="text-sm text-muted-foreground mb-1">Active (30d)</p>
          <p className="text-2xl font-bold text-success">21</p>
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <p className="text-sm text-muted-foreground mb-1">Inactive</p>
          <p className="text-2xl font-bold text-warning">3</p>
        </div>
        <div className="stat-card animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <p className="text-sm text-muted-foreground mb-1">Pending Invites</p>
          <p className="text-2xl font-bold text-muted-foreground">2</p>
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
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 47%, 8%)",
                  border: "1px solid hsl(222, 30%, 16%)",
                  borderRadius: "8px",
                  color: "hsl(210, 40%, 96%)",
                }}
              />
              <Bar dataKey="commits" fill="hsl(190, 95%, 50%)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="prs" fill="hsl(152, 76%, 45%)" radius={[0, 4, 4, 0]} />
              <Bar dataKey="reviews" fill="hsl(38, 95%, 55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-primary" />
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
            <Input placeholder="Search members..." className="pl-10" />
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
              {members.map((member) => (
                <tr key={member.username} className="hover:bg-secondary/30 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                        {member.avatar}
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
