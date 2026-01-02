import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Shield } from "lucide-react";

const data = [
  { name: "Score", value: 72 },
  { name: "Remaining", value: 28 },
];

const COLORS = ["hsl(152, 76%, 45%)", "hsl(222, 30%, 16%)"];

export function RiskScoreCard() {
  const score = 72;
  const getScoreColor = () => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Critical";
  };

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="rounded-lg bg-success/10 p-2">
          <Shield className="h-5 w-5 text-success" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Security Score</h3>
          <p className="text-sm text-muted-foreground">Overall health rating</p>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <div className="relative h-44 w-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${getScoreColor()}`}>{score}</span>
            <span className="text-xs text-muted-foreground">{getScoreLabel()}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Vulnerabilities Fixed</span>
          <span className="font-mono text-success">85%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Policies Enforced</span>
          <span className="font-mono text-foreground">12/15</span>
        </div>
      </div>
    </div>
  );
}
