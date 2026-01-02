import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

const repos = [
  {
    name: "frontend-app",
    status: "healthy",
    ci: true,
    branchProtection: true,
    codeowners: true,
    securityMd: true,
  },
  {
    name: "api-gateway",
    status: "warning",
    ci: true,
    branchProtection: true,
    codeowners: false,
    securityMd: true,
  },
  {
    name: "data-pipeline",
    status: "critical",
    ci: false,
    branchProtection: false,
    codeowners: false,
    securityMd: false,
  },
  {
    name: "mobile-sdk",
    status: "healthy",
    ci: true,
    branchProtection: true,
    codeowners: true,
    securityMd: true,
  },
];

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "healthy")
    return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (status === "warning")
    return <AlertCircle className="h-4 w-4 text-warning" />;
  return <XCircle className="h-4 w-4 text-destructive" />;
};

const Check = ({ value }: { value: boolean }) => (
  <span className={value ? "text-success" : "text-destructive"}>
    {value ? "✓" : "✗"}
  </span>
);

export function RepoHealthCard() {
  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
      <div className="mb-6">
        <h3 className="font-semibold text-foreground">Repository Health</h3>
        <p className="text-sm text-muted-foreground">Compliance status</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-3 font-medium text-muted-foreground">Repository</th>
              <th className="pb-3 font-medium text-muted-foreground text-center">CI</th>
              <th className="pb-3 font-medium text-muted-foreground text-center">Branch</th>
              <th className="pb-3 font-medium text-muted-foreground text-center">Owners</th>
              <th className="pb-3 font-medium text-muted-foreground text-center">Security</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {repos.map((repo) => (
              <tr key={repo.name} className="hover:bg-secondary/30 transition-colors">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={repo.status} />
                    <span className="font-mono text-foreground">{repo.name}</span>
                  </div>
                </td>
                <td className="py-3 text-center font-mono">
                  <Check value={repo.ci} />
                </td>
                <td className="py-3 text-center font-mono">
                  <Check value={repo.branchProtection} />
                </td>
                <td className="py-3 text-center font-mono">
                  <Check value={repo.codeowners} />
                </td>
                <td className="py-3 text-center font-mono">
                  <Check value={repo.securityMd} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
