import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";

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

export interface Member {
  name: string;
  username: string;
  avatar: string;
  role: string;
  status: "active" | "inactive";
  commits: number;
  prs: number;
  reviews: number;
}

export interface SecurityAlert {
  id: string;
  repo: string;
  type: "Secret" | "Dependency" | "Code";
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  detected: string;
  path: string;
}

export interface RankingWeights {
  prs: number;
  reviews: number;
  commits: number;
}

export interface AppInstallationState {
  installed: boolean;
  installationId: number | null;
  selectedOrg: string | null;
  repos: Repository[];
  members: Member[];
  alerts: SecurityAlert[];
  rankingWeights: RankingWeights;
}

const AppContext = createContext<{
  state: AppInstallationState;
  selectOrg: (org: string, installationId: number) => void;
  installApp: () => void;
  fetchOrgData: (force?: boolean) => Promise<void>;
  fetchMembers: (force?: boolean) => Promise<void>;
  fetchSecurityAlerts: (force?: boolean) => Promise<void>;
  updateRankingWeights: (weights: RankingWeights) => void;
}>({
  state: {
    installed: false,
    installationId: null,
    selectedOrg: null,
    repos: [],
    members: [],
    alerts: [],
    rankingWeights: { prs: 20, reviews: 15, commits: 2 }
  },
  selectOrg: () => { },
  installApp: () => { },
  fetchOrgData: async () => { },
  fetchMembers: async () => { },
  fetchSecurityAlerts: async () => { },
  updateRankingWeights: () => { },
});

const CACHE_KEY = "github_app_cache";
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export function GitHubAppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppInstallationState>({
    installed: false,
    installationId: null,
    selectedOrg: null,
    repos: [],
    members: [],
    alerts: [],
    rankingWeights: { prs: 20, reviews: 15, commits: 2 }
  });

  // Hydrate state from localStorage on mount
  useEffect(() => {
    // 1. Hydrate Installation Info
    const stored = localStorage.getItem("github_app_installation");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.installed) {
          setState(prev => ({
            ...prev,
            installed: true,
            selectedOrg: parsed.selectedOrg || null,
            installationId: parsed.installationId || null,
            rankingWeights: parsed.rankingWeights || prev.rankingWeights
          }));
        }
      } catch (e) {
        console.error("Failed to parse stored installation state", e);
      }
    }

    // 2. Hydrate Data Cache
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { repos, members, alerts, timestamp, org } = JSON.parse(cached);
        const storedOrg = stored ? JSON.parse(stored).selectedOrg : null;

        // Only use cache if it's for the same org and not expired
        if (org === storedOrg && Date.now() - timestamp < CACHE_DURATION) {
          setState(prev => ({
            ...prev,
            repos: repos || [],
            members: members || [],
            alerts: alerts || []
          }));
        }
      } catch (e) {
        console.error("Failed to parse cache", e);
      }
    }
  }, []);

  const saveToCache = (data: Partial<AppInstallationState>) => {
    const existing = localStorage.getItem(CACHE_KEY);
    let cacheObj = existing ? JSON.parse(existing) : { timestamp: Date.now(), org: state.selectedOrg };

    // Reset timestamp on new data or if org changed
    if (cacheObj.org !== state.selectedOrg) {
      cacheObj = { timestamp: Date.now(), org: state.selectedOrg };
    }

    const newCache = {
      ...cacheObj,
      ...data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
  };

  const selectOrg = useCallback((org: string, installationId: number) => {
    setState(prev => ({ ...prev, installed: true, selectedOrg: org, installationId }));
    localStorage.setItem(
      "github_app_installation",
      JSON.stringify({ installed: true, selectedOrg: org, installationId })
    );
    // Clear cache on org switch
    localStorage.removeItem(CACHE_KEY);
  }, []);

  const installApp = useCallback(() => {
    window.location.href = "https://github.com/apps/short-tagline/installations/new";
  }, []);

  const updateRankingWeights = useCallback((weights: RankingWeights) => {
    setState(prev => {
      const newState = { ...prev, rankingWeights: weights };
      localStorage.setItem(
        "github_app_installation",
        JSON.stringify({
          installed: newState.installed,
          selectedOrg: newState.selectedOrg,
          installationId: newState.installationId,
          rankingWeights: newState.rankingWeights
        })
      );
      return newState;
    });
  }, []);

  const fetchOrgData = useCallback(async (force = false) => {
    if (!state.selectedOrg || !state.installationId) return;

    // Check cache
    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { repos, timestamp, org } = JSON.parse(cached);
        if (org === state.selectedOrg && repos && Date.now() - timestamp < CACHE_DURATION) {
          return; // Use existing state
        }
      }
    }

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
        // Also update localStorage
        const stored = localStorage.getItem("github_app_installation");
        if (stored) {
          const parsed = JSON.parse(stored);
          localStorage.setItem("github_app_installation", JSON.stringify({ ...parsed, selectedOrg: org }));
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
      saveToCache({ repos });
    } catch (err: any) {
      console.error("Failed to fetch repos:", err.message);
    }
  }, [state.selectedOrg, state.installationId]);

  const fetchMembers = useCallback(async (force = false) => {
    if (!state.selectedOrg || !state.installationId) return;

    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { members, timestamp, org } = JSON.parse(cached);
        if (org === state.selectedOrg && members && Date.now() - timestamp < CACHE_DURATION) {
          return;
        }
      }
    }

    try {
      const tokenRes = await fetch("/api/github/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ installationId: state.installationId }),
      });
      const { token } = await tokenRes.json();

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const query = `
        query($org: String!, $from: DateTime!) {
          organization(login: $org) {
            membersWithRole(first: 50) {
              nodes {
                login
                name
                avatarUrl
                contributionsCollection(from: $from) {
                  totalCommitContributions
                  totalPullRequestContributions
                  totalPullRequestReviewContributions
                }
              }
            }
          }
        }
      `;

      const res = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          variables: {
            org: state.selectedOrg,
            from: thirtyDaysAgo.toISOString(),
          },
        }),
      });

      const json = await res.json();
      const nodes = json.data?.organization?.membersWithRole?.nodes || [];

      const members = nodes.map((node: any) => {
        const stats = node.contributionsCollection;
        const commits = stats.totalCommitContributions;
        const prs = stats.totalPullRequestContributions;
        const reviews = stats.totalPullRequestReviewContributions;

        return {
          name: node.name || node.login,
          username: node.login,
          avatar: node.avatarUrl,
          role: "Member",
          status: "active",
          commits,
          prs,
          reviews,
          score: (prs * state.rankingWeights.prs) + (reviews * state.rankingWeights.reviews) + (commits * state.rankingWeights.commits)
        };
      }).sort((a: any, b: any) => b.score - a.score);

      setState(prev => ({ ...prev, members }));
      saveToCache({ members });
    } catch (err) {
      console.error("Failed to fetch members via GraphQL", err);
    }
  }, [state.selectedOrg, state.installationId, state.rankingWeights]);

  const fetchSecurityAlerts = useCallback(async (force = false) => {
    if (!state.selectedOrg || !state.installationId) return;

    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { alerts, timestamp, org } = JSON.parse(cached);
        if (org === state.selectedOrg && alerts && Date.now() - timestamp < CACHE_DURATION) {
          return;
        }
      }
    }

    try {
      const tokenRes = await fetch("/api/github/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ installationId: state.installationId }),
      });
      const { token } = await tokenRes.json();

      // 1. Fetch Dependabot alerts
      const depRes = await fetch(`https://api.github.com/orgs/${state.selectedOrg}/dependabot/alerts?state=open`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const depData = await depRes.json();

      // 2. Fetch Secret Scanning alerts (requires advanced security)
      const secretRes = await fetch(`https://api.github.com/orgs/${state.selectedOrg}/secret-scanning/alerts?state=open`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const secretData = await secretRes.json();

      // 3. Fetch Code Scanning alerts
      const codeRes = await fetch(`https://api.github.com/orgs/${state.selectedOrg}/code-scanning/alerts?state=open`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const codeData = await codeRes.json();

      const alerts: SecurityAlert[] = [];

      if (Array.isArray(depData)) {
        depData.forEach((a: any) => alerts.push({
          id: a.number.toString(),
          repo: a.repository.name,
          type: "Dependency",
          title: a.security_advisory.summary,
          severity: a.security_advisory.severity,
          detected: new Date(a.created_at).toLocaleDateString(),
          path: "package.json"
        }));
      }

      if (Array.isArray(secretData)) {
        secretData.forEach((a: any) => alerts.push({
          id: a.number.toString(),
          repo: a.repository.name,
          type: "Secret",
          title: a.secret_type_display_name || "Secret exposed",
          severity: "critical",
          detected: new Date(a.created_at).toLocaleDateString(),
          path: a.locations_url ? "multiple locations" : "unknown"
        }));
      }

      if (Array.isArray(codeData)) {
        codeData.forEach((a: any) => alerts.push({
          id: a.number.toString(),
          repo: a.repository.name,
          type: "Code",
          title: a.rule.description || "Code vulnerability",
          severity: a.rule.severity === "error" ? "critical" : a.rule.severity === "warning" ? "high" : "medium",
          detected: new Date(a.created_at).toLocaleDateString(),
          path: a.most_recent_instance?.location?.path || "unknown"
        }));
      }

      setState(prev => ({ ...prev, alerts }));
      saveToCache({ alerts });
    } catch (err) {
      console.error("Failed to fetch security alerts", err);
    }
  }, [state.selectedOrg, state.installationId]);

  return (
    <AppContext.Provider value={{ state, selectOrg, installApp, fetchOrgData, fetchMembers, fetchSecurityAlerts, updateRankingWeights }}>
      {children}
    </AppContext.Provider>
  );
}

export function useGitHubApp() {
  return useContext(AppContext);
}
