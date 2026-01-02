import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { useGitHubApp } from "@/hooks/useGitHubAuth";

const COLORS = [
  "hsl(190, 95%, 50%)", // cyan
  "hsl(152, 76%, 45%)", // green
  "hsl(38, 95%, 55%)", // orange
  "hsl(0, 84%, 60%)",  // red
  "hsl(262, 83%, 58%)", // purple
  "hsl(215, 20%, 65%)" // grey
];

export function ActivityChart() {
  const { state } = useGitHubApp();

  const languageCounts: Record<string, number> = {};
  state.repos.forEach(repo => {
    const lang = repo.language || "Unknown";
    if (lang === "Unknown") return; // Skip unknown languages
    languageCounts[lang] = (languageCounts[lang] || 0) + 1;
  });

  const data = Object.entries(languageCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7); // Top 7

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
      <div className="mb-6">
        <h3 className="font-semibold text-foreground">Language Distribution</h3>
        <p className="text-sm text-muted-foreground">Primary languages across repositories</p>
      </div>

      <div className="h-64">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No repository data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 47%, 8%)",
                  border: "1px solid hsl(222, 30%, 16%)",
                  borderRadius: "8px",
                  color: "hsl(210, 40%, 96%)",
                }}
                formatter={(value: number) => [`${value} repos`, "Count"]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Total Repositories</span>
        <span className="font-mono font-semibold text-foreground">{state.repos.length}</span>
      </div>
    </div>
  );
}
