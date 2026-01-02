import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { Building2, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SelectOrgApp() {
  const navigate = useNavigate();
  const { state, selectOrg, installApp } = useGitHubApp();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const installationId = searchParams.get("installation_id");
    const org = searchParams.get("org");

    if (installationId && org) {
      selectOrg(org, Number(installationId));
      navigate("/"); // redirect to dashboard
    }
  }, [searchParams, selectOrg, navigate]);

  const handleInstall = () => {
    installApp(); // redirect to GitHub App installation
  };

  if (state.selectedOrg) {
    navigate("/"); // already selected
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="hero-glow fixed inset-0 pointer-events-none" />

      <div className="relative w-full max-w-lg glass-card p-8">
        <div className="text-center mb-6">
          <Building2 className="h-12 w-12 mx-auto text-primary mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Connect Your Organization
          </h1>
          <p className="text-sm text-muted-foreground">
            Install the GitHub App to allow GitGuard to scan your organization's repos.
          </p>
        </div>

        <Button className="w-full" onClick={handleInstall}>
          <LogOut className="h-4 w-4 mr-2" />
          Install GitHub App
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
