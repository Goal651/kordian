import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: "primary" | "success" | "warning" | "destructive";
  href?: string;
  loading: boolean;
}

const iconColorClasses = {
  primary: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
  destructive: "text-destructive bg-destructive/10",
};

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "primary",
  href,
  loading,
}: StatCardProps) {
  const content = (
    <div className={cn("stat-card cursor-pointer animate-fade-in transition-all", href && "hover:shadow-md hover:scale-[1.02] cursor-pointer")}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <>
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-3 w-32" />
            </>
          ) : (
            <>
              <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
              {change && (
                <p
                  className={cn(
                    "text-xs font-medium",
                    changeType === "positive" && "text-success",
                    changeType === "negative" && "text-destructive",
                    changeType === "neutral" && "text-muted-foreground"
                  )}
                >
                  {change}
                </p>
              )}
            </>
          )}
        </div>
        <div className={cn("rounded-lg p-3 shrink-0", iconColorClasses[iconColor])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
