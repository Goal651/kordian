import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Shield,
  GitBranch,
  FileCode,
  Lock,
  Workflow
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const complianceData = [
  { name: "Compliant", value: 32 },
  { name: "Partial", value: 10 },
  { name: "Non-compliant", value: 5 },
];

const COLORS = ["hsl(152, 76%, 45%)", "hsl(38, 95%, 55%)", "hsl(0, 84%, 60%)"];

const checks = [
  {
    category: "CI/CD",
    icon: Workflow,
    items: [
      { name: "CI workflows configured", passed: 42, failed: 5, total: 47 },
      { name: "CI passing", passed: 38, failed: 4, total: 42 },
      { name: "Automated tests", passed: 35, failed: 7, total: 42 },
    ],
  },
  {
    category: "Branch Protection",
    icon: GitBranch,
    items: [
      { name: "Protected main branch", passed: 40, failed: 7, total: 47 },
      { name: "Require PR reviews", passed: 36, failed: 11, total: 47 },
      { name: "Require status checks", passed: 32, failed: 15, total: 47 },
    ],
  },
  {
    category: "Security Policies",
    icon: Shield,
    items: [
      { name: "SECURITY.md present", passed: 28, failed: 19, total: 47 },
      { name: "CODEOWNERS configured", passed: 22, failed: 25, total: 47 },
      { name: "Dependabot enabled", passed: 45, failed: 2, total: 47 },
    ],
  },
  {
    category: "Code Quality",
    icon: FileCode,
    items: [
      { name: "Linting configured", passed: 40, failed: 7, total: 47 },
      { name: "Code scanning enabled", passed: 30, failed: 17, total: 47 },
      { name: "License file present", passed: 44, failed: 3, total: 47 },
    ],
  },
];

const StatusBar = ({ passed, total }: { passed: number; total: number }) => {
  const percentage = (passed / total) * 100;
  return (
    <div className="flex items-center gap-3 flex-1">
      <div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percentage >= 80 ? "bg-success" : percentage >= 50 ? "bg-warning" : "bg-destructive"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-mono text-muted-foreground w-16 text-right">
        {passed}/{total}
      </span>
    </div>
  );
};

export default function Compliance() {
  const totalRepos = 47;
  const compliantRepos = 32;
  const percentage = Math.round((compliantRepos / totalRepos) * 100);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Compliance Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Best practices and policy compliance across your organization
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Compliance score */}
        <div className="glass-card p-6 animate-fade-in">
          <h2 className="font-semibold text-foreground mb-4">Compliance Score</h2>
          <div className="flex items-center justify-center">
            <div className="relative h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={complianceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {complianceData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-success">{percentage}%</span>
                <span className="text-xs text-muted-foreground">Compliant</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {complianceData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-mono text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="lg:col-span-2 grid grid-cols-3 gap-4">
          <div className="stat-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm text-muted-foreground">Fully Compliant</span>
            </div>
            <p className="text-3xl font-bold text-success">32</p>
            <p className="text-xs text-muted-foreground mt-1">repositories</p>
          </div>
          <div className="stat-card animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-warning" />
              <span className="text-sm text-muted-foreground">Partial</span>
            </div>
            <p className="text-3xl font-bold text-warning">10</p>
            <p className="text-xs text-muted-foreground mt-1">repositories</p>
          </div>
          <div className="stat-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Non-compliant</span>
            </div>
            <p className="text-3xl font-bold text-destructive">5</p>
            <p className="text-xs text-muted-foreground mt-1">repositories</p>
          </div>
        </div>
      </div>

      {/* Compliance checks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {checks.map((category, catIndex) => (
          <div
            key={category.category}
            className="glass-card p-6 animate-fade-in"
            style={{ animationDelay: `${0.25 + catIndex * 0.1}s` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <category.icon className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{category.category}</h3>
            </div>
            <div className="space-y-4">
              {category.items.map((item) => (
                <div key={item.name} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground flex-shrink-0 w-40">
                    {item.name}
                  </span>
                  <StatusBar passed={item.passed} total={item.total} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
