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

export interface InstallationInfo {
  installationId: number;
  organizationId: number;
  organizationLogin: string;
  permissions: Record<string, string>;
  installedAt: string;
  installedBy: string;
}

export interface AppInstallationState {
  installed: boolean;
  installationId: number | null;
  selectedOrg: string | null;
  repos: Repository[];
  members: Member[];
  alerts: SecurityAlert[];
  rankingWeights: RankingWeights;
  installations: InstallationInfo[];
  currentUserToken: string | null;
  installationStatus: 'checking' | 'installed' | 'not_installed' | 'error';
}


const STORAGE_KEYS = {
  INSTALLATION: "github_app_installation",
  INSTALLATIONS: "github_app_installations",
  USER_TOKEN: "github_user_token",
  CACHE: "github_app_cache"
};

const CACHE_DURATION = 15 * 60 * 1000;

const GITHUB_CONFIG = {
  APP_NAME: "git-guard-app",
  CLIENT_ID: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || "",
  REDIRECT_URI: typeof window !== 'undefined' 
    ? `${window.location.origin}/api/auth/callback` 
    : '',
  SCOPE: "read:org read:user read:project"
};

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
  loadingStates: {
    fetchingOrgData: boolean;
    fetchingMembers: boolean;
    fetchingAlerts: boolean;
    fetchingRepos: boolean;
    fetchingPRs: boolean;
  };
  checkExistingInstallations: () => Promise<void>;
  getUserInstallations: () => Promise<InstallationInfo[]>;
  handleInstallationCallback: (code: string) => Promise<void>;
  switchInstallation: (installationId: number) => void;
  removeInstallation: (installationId: number) => void;
  installToOrganization: () => void;
}>({
  state: {
    installed: false,
    installationId: null,
    selectedOrg: null,
    repos: [],
    members: [],
    alerts: [],
    rankingWeights: { prs: 20, reviews: 15, commits: 2 },
    installations: [],
    currentUserToken: null,
    installationStatus: 'checking'
  },
  isLoading: true,
  loadingStates: {
    fetchingOrgData: false,
    fetchingMembers: false,
    fetchingAlerts: false,
    fetchingRepos: false,
    fetchingPRs: false,
  },
  selectOrg: () => { },
  installApp: () => { },
  fetchOrgData: async () => { },
  fetchMembers: async () => { },
  fetchSecurityAlerts: async () => { },
  updateRankingWeights: () => { },
  disconnect: () => { },
  checkExistingInstallations: async () => { },
  getUserInstallations: async () => [],
  handleInstallationCallback: async () => { },
  switchInstallation: () => { },
  removeInstallation: () => { },
  installToOrganization: () => { }
});

const CACHE_KEY = "github_app_cache";

export function GitHubAppProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<AppInstallationState>({
    installed: false,
    installationId: null,
    selectedOrg: null,
    currentUserToken: null,
    installations: [],
    installationStatus: 'not_installed',
    rankingWeights: {
      prs: 1,
      reviews: 1,
      commits: 1
    },
    repos: [],
    members: [],
    alerts: [],
  });

  // Loading states for different operations
  const [loadingStates, setLoadingStates] = useState({
    fetchingOrgData: false,
    fetchingMembers: false,
    fetchingAlerts: false,
    fetchingRepos: false,
    fetchingPRs: false,
  });

  // Initialize authentication and check for OAuth callback
  useEffect(() => {
    const initializeAuth = async () => {
      // Check for OAuth callback
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code) {
        await handleInstallationCallback(code);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }

      // Hydrate from storage
      await hydrateFromStorage();
      
      setIsLoading(false);
    };

    if (typeof window !== 'undefined') {
      initializeAuth();
    }
  }, []);

  // Hydrate from localStorage
  const hydrateFromStorage = async () => {
    try {
      // 1. Hydrate user token
      const storedToken = localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      if (storedToken) {
        setState(prev => ({ ...prev, currentUserToken: storedToken }));
      } else {
        // No token found, set status to not_installed
        setState(prev => ({ ...prev, installationStatus: 'not_installed' }));
      }

      // 2. Hydrate installations
      const storedInstallations = localStorage.getItem(STORAGE_KEYS.INSTALLATIONS);
      if (storedInstallations) {
        const installations = JSON.parse(storedInstallations);
        setState(prev => ({ ...prev, installations }));
      }

      // 3. Hydrate current installation
      const storedInstallation = localStorage.getItem(STORAGE_KEYS.INSTALLATION);
      if (storedInstallation) {
        const { installed, selectedOrg, installationId, rankingWeights } = JSON.parse(storedInstallation);
        if (installed && installationId) {
          setState(prev => ({
            ...prev,
            installed: true,
            selectedOrg,
            installationId,
            rankingWeights: rankingWeights || prev.rankingWeights,
            installationStatus: 'installed'
          }));
        }
      }

      // 4. Hydrate cache
      const cached = localStorage.getItem(STORAGE_KEYS.CACHE);
      if (cached) {
        const { repos, members, alerts, timestamp, org } = JSON.parse(cached);
        const storedOrg = storedInstallation ? JSON.parse(storedInstallation).selectedOrg : null;

        if (org === storedOrg && Date.now() - timestamp < CACHE_DURATION) {
          setState(prev => ({
            ...prev,
            repos: repos || [],
            members: members || [],
            alerts: alerts || []
          }));
        }
      }
    } catch (error) {
      console.error("Failed to hydrate from storage:", error);
    }
  };

  const saveToCache = (data: Partial<AppInstallationState>) => {
    const existing = localStorage.getItem(STORAGE_KEYS.CACHE);
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
    localStorage.setItem(STORAGE_KEYS.CACHE, JSON.stringify(newCache));
  };

  // Check for existing installations
  const checkExistingInstallations = useCallback(async () => {
    if (!state.currentUserToken) {
      setState(prev => ({ ...prev, installationStatus: 'not_installed' }));
      return;
    }

    setState(prev => ({ ...prev, installationStatus: 'checking' }));

    try {
      const response = await fetch("/api/github/installations", {
        headers: {
          Authorization: `Bearer ${state.currentUserToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.installations && data.installations.length > 0) {
          // Store installations
          const installations = data.installations.map((inst: any) => ({
            installationId: inst.id,
            organizationId: inst.account.id,
            organizationLogin: inst.account.login,
            permissions: inst.permissions,
            installedAt: inst.created_at,
            installedBy: data.user?.login || "unknown"
          }));

          localStorage.setItem(STORAGE_KEYS.INSTALLATIONS, JSON.stringify(installations));
          
          setState(prev => ({
            ...prev,
            installations,
            installationStatus: 'installed'
          }));

          // Don't auto-select, let the user choose on the connect page
        } else {
          setState(prev => ({ ...prev, installationStatus: 'not_installed' }));
        }
      } else if (response.status === 401) {
        // Token is invalid, clear it and reset state
        console.error('Token is invalid or expired, clearing and redirecting to OAuth');
        localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.INSTALLATIONS);
        setState(prev => ({
          ...prev,
          currentUserToken: null,
          installations: [],
          installationStatus: 'not_installed'
        }));
        // Trigger OAuth flow
        installApp();
      } else {
        console.error('Failed to fetch installations:', response.status, response.statusText);
        setState(prev => ({ ...prev, installationStatus: 'error' }));
      }
    } catch (error) {
      console.error("Error checking installations:", error);
      setState(prev => ({ ...prev, installationStatus: 'error' }));
    }
  }, [state.currentUserToken, state.installationId]);

  // Check installations when we have a user token
  useEffect(() => {
    if (state.currentUserToken) {
      checkExistingInstallations();
    }
  }, [state.currentUserToken, checkExistingInstallations]);

  // Get user installations
  const getUserInstallations = useCallback(async (): Promise<InstallationInfo[]> => {
    if (!state.currentUserToken) return [];
    
    try {
      const response = await fetch("/api/github/installations", {
        headers: {
          Authorization: `Bearer ${state.currentUserToken}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.installations.map((inst: any) => ({
          installationId: inst.id,
          organizationId: inst.account.id,
          organizationLogin: inst.account.login,
          permissions: inst.permissions,
          installedAt: inst.created_at,
          installedBy: data.user?.login || "unknown"
        }));
      } else if (response.status === 401) {
        // Token is invalid, clear it and reset state
        console.error('Token is invalid or expired in getUserInstallations, clearing and redirecting to OAuth');
        localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.INSTALLATIONS);
        setState(prev => ({
          ...prev,
          currentUserToken: null,
          installations: [],
          installationStatus: 'not_installed'
        }));
        // Trigger OAuth flow
        installApp();
      } else {
        console.error('Failed to get user installations:', response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error getting user installations:", error);
    }
    
    return [];
  }, [state.currentUserToken]);

  // Handle installation callback
  const handleInstallationCallback = useCallback(async (code: string) => {
    try {
      // Exchange code for access token
      const response = await fetch("/api/github/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) throw new Error("Failed to authenticate");

      const { token, installations } = await response.json();
      
      // Store token
      localStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);
      
      // Process installations
      if (installations && installations.length > 0) {
        const installationList = installations.map((inst: any) => ({
          installationId: inst.id,
          organizationId: inst.account.id,
          organizationLogin: inst.account.login,
          permissions: inst.permissions,
          installedAt: inst.created_at,
          installedBy: inst.installedBy || "unknown"
        }));

        localStorage.setItem(STORAGE_KEYS.INSTALLATIONS, JSON.stringify(installationList));
        
        setState(prev => ({
          ...prev,
          currentUserToken: token,
          installations: installationList,
          installationStatus: 'installed'
        }));

        // Don't auto-select, let the user choose on the connect page
      } else {
        // No installations found - redirect to install
        setState(prev => ({
          ...prev,
          currentUserToken: token,
          installationStatus: 'not_installed'
        }));
        installApp();
      }
    } catch (error) {
      console.error("Installation callback error:", error);
      setState(prev => ({ ...prev, installationStatus: 'error' }));
    }
  }, []);

  // Switch between installations
  const switchInstallation = useCallback((installationId: number) => {
    const installation = state.installations.find(inst => inst.installationId === installationId);
    if (installation) {
      selectOrg(installation.organizationLogin, installation.installationId);
    }
  }, [state.installations]);

  // Remove installation from list
  const removeInstallation = useCallback((installationId: number) => {
    const updatedInstallations = state.installations.filter(
      inst => inst.installationId !== installationId
    );
    
    localStorage.setItem(STORAGE_KEYS.INSTALLATIONS, JSON.stringify(updatedInstallations));
    
    setState(prev => ({
      ...prev,
      installations: updatedInstallations
    }));

    // If we removed the current installation, clear it
    if (state.installationId === installationId) {
      disconnect();
    }
  }, [state.installations, state.installationId]);

  const selectOrg = useCallback((org: string, installationId: number) => {
    setState(prev => ({ 
      ...prev, 
      installed: true, 
      selectedOrg: org, 
      installationId,
      installationStatus: 'installed'
    }));
    
    localStorage.setItem(
      STORAGE_KEYS.INSTALLATION,
      JSON.stringify({ 
        installed: true, 
        selectedOrg: org, 
        installationId,
        rankingWeights: state.rankingWeights
      })
    );
    
    // Clear cache on org switch
    localStorage.removeItem(STORAGE_KEYS.CACHE);
    
    // Fetch data for new org
    fetchOrgData(true);
    fetchMembers(true);
    fetchSecurityAlerts(true);
  }, [state.rankingWeights]);

  const disconnect = useCallback(() => {
    setState({
      installed: false,
      installationId: null,
      selectedOrg: null,
      repos: [],
      members: [],
      alerts: [],
      rankingWeights: { prs: 20, reviews: 15, commits: 2 },
      installations: [],
      currentUserToken: null,
      installationStatus: 'not_installed'
    });
    
    localStorage.removeItem(STORAGE_KEYS.INSTALLATION);
    localStorage.removeItem(STORAGE_KEYS.CACHE);
    sessionStorage.clear();
    
    // Keep user token and installations for re-use
    // window.location.href = "/connect";
  }, []);

  const installToOrganization = useCallback(() => {
    // Direct redirect to GitHub installation page
    window.location.href = "https://github.com/apps/git-guard-app/installations/new";
  }, []);

  const installApp = useCallback(async () => {
    // First check if we have a user token and existing installations
    if (state.currentUserToken) {
      try {
        const installations = await getUserInstallations();
        if (installations.length > 0) {
          // We have existing installations, just select the first one or show selector
          const firstInstallation = installations[0];
          selectOrg(firstInstallation.organizationLogin, firstInstallation.installationId);
          return;
        }

        // We have a valid user token but no installations yet:
        // send the user to GitHub's installation page so they can choose an organization and click "Install".
        installToOrganization();
        return;
      } catch (error) {
        console.error("Failed to check existing installations:", error);
      }
    }

    // No existing installations or no token, start OAuth flow
    const authUrl = new URL("https://github.com/login/oauth/authorize");
    authUrl.searchParams.append("client_id", GITHUB_CONFIG.CLIENT_ID!);
    authUrl.searchParams.append("redirect_uri", GITHUB_CONFIG.REDIRECT_URI);
    authUrl.searchParams.append("scope", GITHUB_CONFIG.SCOPE);
    authUrl.searchParams.append("state", "install");

    window.location.href = authUrl.toString();
  }, [state.currentUserToken, getUserInstallations, selectOrg, installToOrganization]);

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

    // Set loading state
    setLoadingStates(prev => ({ ...prev, fetchingOrgData: true }));

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
                stargazerCount
                forkCount
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
          stars: r.stargazerCount,
          forks: r.forkCount,
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

    // Set loading state
    setLoadingStates(prev => ({ ...prev, fetchingMembers: true }));

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
    } finally {
      // Reset loading state
      setLoadingStates(prev => ({ ...prev, fetchingMembers: false }));
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

    // Set loading state
    setLoadingStates(prev => ({ ...prev, fetchingAlerts: true }));

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
    } finally {
      // Reset loading state
      setLoadingStates(prev => ({ ...prev, fetchingAlerts: false }));
    }
  }, [state.selectedOrg, state.installationId]);

  const updateRankingWeights = useCallback((weights: RankingWeights) => {
    setState(prev => {
      const newState = { ...prev, rankingWeights: weights };
      localStorage.setItem(
        STORAGE_KEYS.INSTALLATION,
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

  return (
    <AppContext.Provider value={{ 
      state, 
      selectOrg, 
      installApp, 
      fetchOrgData, 
      fetchMembers, 
      fetchSecurityAlerts, 
      updateRankingWeights, 
      disconnect,
      isLoading,
      loadingStates,
      // Installation management
      checkExistingInstallations,
      getUserInstallations,
      handleInstallationCallback,
      switchInstallation,
      removeInstallation,
      installToOrganization
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useGitHubApp() {
  return useContext(AppContext);
}
