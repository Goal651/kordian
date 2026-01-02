import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Mon", commits: 42, prs: 12 },
  { name: "Tue", commits: 38, prs: 8 },
  { name: "Wed", commits: 65, prs: 15 },
  { name: "Thu", commits: 51, prs: 11 },
  { name: "Fri", commits: 48, prs: 14 },
  { name: "Sat", commits: 22, prs: 4 },
  { name: "Sun", commits: 18, prs: 3 },
];

export function ActivityChart() {
  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
      <div className="mb-6">
        <h3 className="font-semibold text-foreground">Weekly Activity</h3>
        <p className="text-sm text-muted-foreground">Commits and pull requests</p>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(190, 95%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(190, 95%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPRs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(152, 76%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(152, 76%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
            <XAxis
              dataKey="name"
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(222, 30%, 16%)" }}
            />
            <YAxis
              tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(222, 30%, 16%)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 47%, 8%)",
                border: "1px solid hsl(222, 30%, 16%)",
                borderRadius: "8px",
                color: "hsl(210, 40%, 96%)",
              }}
            />
            <Area
              type="monotone"
              dataKey="commits"
              stroke="hsl(190, 95%, 50%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCommits)"
            />
            <Area
              type="monotone"
              dataKey="prs"
              stroke="hsl(152, 76%, 45%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPRs)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Commits</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-success" />
          <span className="text-sm text-muted-foreground">Pull Requests</span>
        </div>
      </div>
    </div>
  );
}
