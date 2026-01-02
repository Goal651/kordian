import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function AppCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectOrg } = useGitHubApp();

  useEffect(() => {
    if (!searchParams) return;
    const installationId = searchParams.get("installation_id");
    const org = searchParams.get("org");

    if (installationId && org) {
      // Save installation/organization state for UX
      selectOrg(org, Number(installationId));
      router.push("/"); // redirect to dashboard
    } else {
      router.push("/connect"); // fallback
    }
  }, [searchParams, selectOrg, router]);

  if (!searchParams) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="hero-glow fixed inset-0 pointer-events-none" />
      <div className="relative text-center glass-card p-8 max-w-md">
        {searchParams.get("installation_id") ? (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              GitHub App Installed
            </h2>
            <p className="text-muted-foreground text-sm">
              Redirecting to your dashboard...
            </p>
          </>
        ) : (
          <>
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Installation Failed
            </h2>
            <p className="text-muted-foreground text-sm">
              Redirecting to Connect page...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
