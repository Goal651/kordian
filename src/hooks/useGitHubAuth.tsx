import { createContext, useContext, useState, ReactNode, useCallback } from "react";

export interface Repository {
  name: string;
  description: string;
  language: string;
  languageColor: string;
  visibility: "private" | "public";
  stars: number;
  forks: number;
  lastCommit: string;
  status: "healthy" | "warning" | "critical";
  alerts: number;
}

export interface AppInstallationState {
  installed: boolean;
  installationId: number | null;
  selectedOrg: string | null;
  repos: Repository[];
}

const AppContext = createContext<{
  state: AppInstallationState;
  selectOrg: (org: string, installationId: number) => void;
  installApp: () => void;
  fetchOrgData: () => Promise<void>;
}>({
  state: { installed: false, installationId: null, selectedOrg: null, repos: [] },
  selectOrg: () => { },
  installApp: () => { },
  fetchOrgData: async () => { },
});

export function GitHubAppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppInstallationState>({
    installed: false,
    installationId: null,
    selectedOrg: null,
    repos: [],
  });

  const selectOrg = useCallback((org: string, installationId: number) => {
    setState(prev => ({ ...prev, installed: true, selectedOrg: org, installationId }));
    sessionStorage.setItem(
      "github_app_installation",
      JSON.stringify({ installed: true, selectedOrg: org, installationId })
    );
  }, []);

  const installApp = useCallback(() => {
    window.location.href = "https://github.com/apps/short-tagline/installations/new";
  }, []);

  const fetchOrgData = useCallback(async () => {
    if (!state.selectedOrg || !state.installationId) return;

    try {
      // 1. Fetch Installation Access Token from backend
      const tokenRes = await fetch("/api/github/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ installationId: state.installationId }),
      });

      if (!tokenRes.ok) {
        throw new Error("Failed to get installation token from backend");
      }

      const { token, org } = await tokenRes.json();

      // If we got an org name from the backend and it doesn't match our current state, update it
      if (org && org !== state.selectedOrg) {
        setState(prev => ({ ...prev, selectedOrg: org }));
        // Also update sessionStorage
        const stored = sessionStorage.getItem("github_app_installation");
        if (stored) {
          const parsed = JSON.parse(stored);
          sessionStorage.setItem("github_app_installation", JSON.stringify({ ...parsed, selectedOrg: org }));
        }
      }

      const currentOrg = org || state.selectedOrg;

      // 2. Use the token to fetch repositories
      const res = await fetch(
        `https://api.github.com/orgs/${currentOrg}/repos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch repositories");
      }

      const reposData = await res.json();

      if (!Array.isArray(reposData)) {
        throw new Error("Invalid response from GitHub: expected an array of repositories");
      }

      // Map GitHub API data to your UI structure
      const repos = reposData.map((r: any) => ({
        name: r.name,
        description: r.description || "",
        language: r.language || "Unknown",
        languageColor: "#999",
        visibility: (r.private ? "private" : "public") as "private" | "public",
        stars: r.stargazers_count,
        forks: r.forks_count,
        lastCommit: new Date(r.pushed_at).toLocaleString(),
        alerts: 0,
        status: "healthy" as "healthy" | "warning" | "critical",
      }));

      setState(prev => ({ ...prev, repos }));
    } catch (err: any) {
      console.error("Failed to fetch repos:", err.message);
    }
  }, [state.selectedOrg, state.installationId]);

  return (
    <AppContext.Provider value={{ state, selectOrg, installApp, fetchOrgData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useGitHubApp() {
  return useContext(AppContext);
}
