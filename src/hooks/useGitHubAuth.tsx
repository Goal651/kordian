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
  selectOrg: () => {},
  installApp: () => {},
  fetchOrgData: async () => {},
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
    console.log(state)
    if (!state.selectedOrg || !state.installationId) return;

    try {
      const token = "YOUR_GITHUB_APP_TOKEN"; // replace with your backend token flow
      const res = await fetch(
        `https://api.github.com/orgs/${state.selectedOrg}/repos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
          },
        }
      );

      const reposData = await res.json();

      // Map GitHub API data to your UI structure
      const repos = reposData.map((r: any) => ({
        name: r.name,
        description: r.description,
        language: r.language || "Unknown",
        languageColor: "#999", // Optional: map language to color
        visibility: r.private ? "private" : "public",
        stars: r.stargazers_count,
        forks: r.forks_count,
        lastCommit: new Date(r.pushed_at).toLocaleString(),
        alerts: 0, // Optional: fetch security alerts if needed
        status: "healthy", // Optional: compute based on alerts
      }));

      setState(prev => ({ ...prev, repos }));
    } catch (err) {
      console.error("Failed to fetch repos", err);
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
