import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";

export interface Contributor {
  login: string;
  avatar: string;
}

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
  contributors: Contributor[];
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
  url?: string;
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
  disconnect: () => void;
  isLoading: boolean;
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
  isLoading: true,
  selectOrg: () => { },
  installApp: () => { },
  fetchOrgData: async () => { },
  fetchMembers: async () => { },
  fetchSecurityAlerts: async () => { },
  updateRankingWeights: () => { },
  disconnect: () => { },
});

const CACHE_KEY = "github_app_cache";
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export function GitHubAppProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
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
    const hydrate = async () => {
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

      setIsLoading(false);
    };

    hydrate();
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

  const disconnect = useCallback(() => {
    setState({
      installed: false,
      installationId: null,
      selectedOrg: null,
      repos: [],
      members: [],
      alerts: [],
      rankingWeights: { prs: 20, reviews: 15, commits: 2 }
    });
    localStorage.removeItem("github_app_installation");
    localStorage.removeItem(CACHE_KEY);
    sessionStorage.clear(); // Good practice to clear session too
    window.location.href = "/connect";
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

    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { repos, timestamp, org } = JSON.parse(cached);
        if (org === state.selectedOrg && repos && Date.now() - timestamp < CACHE_DURATION) {
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
      const { token, org } = await tokenRes.json();

      if (org && org !== state.selectedOrg) {
        setState(prev => ({ ...prev, selectedOrg: org }));
      }

      const currentOrg = org || state.selectedOrg;

      const query = `
        query($org: String!) {
          organization(login: $org) {
            repositories(first: 100, orderBy: {field: PUSHED_AT, direction: DESC}) {
              nodes {
                name
                description
                isPrivate
                stargazersCount
                forksCount
                pushedAt
                languages(first: 1, orderBy: {field: SIZE, direction: DESC}) {
                  nodes {
                    name
                    color
                  }
                }
                defaultBranchRef {
                  target {
                    ... on Commit {
                      history(first: 5) {
                        nodes {
                          author {
                            user {
                              login
                              avatarUrl
                            }
                          }
                        }
                      }
                    }
                  }
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
          variables: { org: currentOrg },
        }),
      });

      const json = await res.json();
      const nodes = json.data?.organization?.repositories?.nodes || [];

      const repos = nodes.map((r: any) => {
        // Extract contributors from commit history
        const commits = r.defaultBranchRef?.target?.history?.nodes || [];
        const contributorsMap = new Map();
        commits.forEach((c: any) => {
          if (c.author?.user) {
            contributorsMap.set(c.author.user.login, {
              login: c.author.user.login,
              avatar: c.author.user.avatarUrl
            });
          }
        });
        const contributors = Array.from(contributorsMap.values());

        const languageNode = r.languages?.nodes?.[0];

        return {
          name: r.name,
          description: r.description || "",
          language: languageNode?.name || "Unknown",
          languageColor: languageNode?.color || "#999",
          visibility: r.isPrivate ? "private" : "public",
          stars: r.stargazersCount,
          forks: r.forksCount,
          lastCommit: new Date(r.pushedAt).toLocaleString(),
          alerts: 0,
          status: "healthy",
          contributors
        };
      });

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
          status: (commits + prs + reviews > 0) ? "active" : "inactive",
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
          id: `${a.repository.name}-${a.number}`,
          repo: a.repository.name,
          type: "Dependency",
          title: a.security_advisory.summary,
          severity: a.security_advisory.severity,
          detected: new Date(a.created_at).toLocaleDateString(),
          path: "package.json",
          url: a.html_url
        }));
      }

      if (Array.isArray(secretData)) {
        secretData.forEach((a: any) => alerts.push({
          id: `${a.repository.name}-${a.number}`,
          repo: a.repository.name,
          type: "Secret",
          title: a.secret_type_display_name || "Secret exposed",
          severity: "critical",
          detected: new Date(a.created_at).toLocaleDateString(),
          path: a.locations_url ? "multiple locations" : "unknown",
          url: a.html_url
        }));
      }

      if (Array.isArray(codeData)) {
        codeData.forEach((a: any) => alerts.push({
          id: `${a.repository.name}-${a.number}`,
          repo: a.repository.name,
          type: "Code",
          title: a.rule.description || "Code vulnerability",
          severity: a.rule.severity === "error" ? "critical" : a.rule.severity === "warning" ? "high" : "medium",
          detected: new Date(a.created_at).toLocaleDateString(),
          path: a.most_recent_instance?.location?.path || "unknown",
          url: a.html_url
        }));
      }

      // Update repositories with alert data
      setState(prev => {
        const updatedRepos = prev.repos.map(repo => {
          const repoAlerts = alerts.filter(a => a.repo === repo.name);
          const alertCount = repoAlerts.length;

          let status: "healthy" | "warning" | "critical" = "healthy";
          if (alertCount > 0) {
            const hasCritical = repoAlerts.some(a => a.severity === "critical");
            const hasHigh = repoAlerts.some(a => a.severity === "high");
            if (hasCritical || hasHigh) {
              status = "critical";
            } else {
              status = "warning";
            }
          }

          return {
            ...repo,
            alerts: alertCount,
            status
          };
        });

        saveToCache({ alerts, repos: updatedRepos });
        return { ...prev, alerts, repos: updatedRepos };
      });
    } catch (err) {
      console.error("Failed to fetch security alerts", err);
    }
  }, [state.selectedOrg, state.installationId]);

  return (
    <AppContext.Provider value={{ state, selectOrg, installApp, fetchOrgData, fetchMembers, fetchSecurityAlerts, updateRankingWeights, disconnect, isLoading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useGitHubApp() {
  return useContext(AppContext);
}
