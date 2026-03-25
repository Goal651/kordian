import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from "recharts";
import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = [
  "hsl(190, 95%, 50%)", // cyan
  "hsl(152, 76%, 45%)", // green
  "hsl(38, 95%, 55%)", // orange
  "hsl(0, 84%, 60%)",  // red
  "hsl(262, 83%, 58%)", // purple
  "hsl(215, 20%, 65%)" // grey
];

// Custom tooltip with better styling
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-4 py-3 shadow-lg border border-border/50">
        <p className="font-medium text-foreground">{label}</p>
        <p className="font-mono text-sm text-foreground/80">
          {payload[0].value} {payload[0].value === 1 ? 'repository' : 'repositories'}
        </p>
      </div>
    );
  }
  return null;
};

export function ActivityChart({ loading = false }: { loading?: boolean }) {
  const { state } = useGitHubApp();

  const languageCounts: Record<string, number> = {};
  state.repos.forEach(repo => {
    const lang = repo.language || "Unknown";
    if (lang === "Unknown") return;
    languageCounts[lang] = (languageCounts[lang] || 0) + 1;
  });

  const totalRepos = state.repos.length;
  
  const data = Object.entries(languageCounts)
    .map(([name, count]) => ({ 
      name, 
      count,
      percentage: ((count / totalRepos) * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  // If loading, show skeleton loading state
  if (loading) {
    const skeletonWidths = ["w-[80%]", "w-[65%]", "w-[55%]", "w-[45%]", "w-[38%]", "w-[28%]", "w-[20%]"];
    return (
      <div className="glass-card p-6 animate-fade-in">
        <div className="mb-6">
          <h3 className="font-semibold text-foreground">Language Distribution</h3>
          <Skeleton className="h-4 w-48 mt-1" />
        </div>
        <div className="h-64 flex flex-col justify-center gap-4 px-4">
          {skeletonWidths.map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3 w-16 shrink-0" />
              <Skeleton className={`h-5 ${w} rounded-r-md`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If no data, show empty state
  if (data.length === 0) {
    return (
      <div className="glass-card p-6 animate-fade-in">
        <div className="mb-6">
          <h3 className="font-semibold text-foreground">Language Distribution</h3>
          <p className="text-sm text-muted-foreground">Primary languages across repositories</p>
        </div>
        <div className="h-64 flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <span className="text-4xl">📊</span>
          <p>No language data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card w-full  p-6 animate-fade-in hover:border-primary/30 transition-all duration-300">
      {/* Header with gradient text */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold gradient-text">Language Distribution</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Primary languages across {totalRepos} {totalRepos === 1 ? 'repository' : 'repositories'}
          </p>
        </div>
        {/* Legend badges */}
        <div className="flex gap-2">
          <span className="badge-info text-xs">
            Top {data.length} languages
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="vertical" 
            margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(0, 0%, 20%)" 
              horizontal={false}
              opacity={0.3}
            />
            
            <XAxis 
              type="number" 
              tick={{ fill: "hsl(0, 0%, 65%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(0, 0%, 25%)" }}
              tickLine={{ stroke: "hsl(0, 0%, 25%)" }}
              domain={[0, 'dataMax']}
            />
            
            <YAxis 
              type="category"
              dataKey="name"
              tick={{ 
                fill: "hsl(0, 0%, 85%)", 
                fontSize: 13,
                fontWeight: 500 
              }}
              width={100}
              axisLine={{ stroke: "hsl(0, 0%, 25%)" }}
              tickLine={false}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Bar 
              dataKey="count" 
              radius={[0, 6, 6, 0]}
              maxBarSize={40}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  className="transition-all duration-300 hover:opacity-95"
                />
              ))}
              <LabelList 
                dataKey="percentage" 
                position="right"
                content={({ x, y, width, value, index }) => (
                  <text
                    x={Number(x) + Number(width) + 8}
                    y={Number(y) + 14}
                    fill="hsl(0, 0%, 65%)"
                    fontSize={11}
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {value}%
                  </text>
                )}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer with stats */}
      <div className="mt-6 pt-4 border-t border-border/50 items-center w-full">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Most used</p>
            <p className="font-medium text-foreground mt-1">
              {data[0]?.name || '—'}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {data[0]?.percentage}%
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Languages</p>
            <p className="font-medium text-foreground mt-1">
              {Object.keys(languageCounts).length}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              unique
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Top 7 share</p>
            <p className="font-medium text-foreground mt-1">
              {data.reduce((acc, curr) => acc + curr.count, 0)}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              repositories
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}