import { useCallback } from "react";
import { AppInstallationState, SecurityAlert } from "@/types";
import { STORAGE_KEYS, CACHE_KEY, CACHE_DURATION } from "./constants";

export function useGitHubDataFetch(
  state: AppInstallationState,
  setState: React.Dispatch<React.SetStateAction<AppInstallationState>>,
  setLoadingStates: React.Dispatch<React.SetStateAction<{
    fetchingOrgData: boolean;
    fetchingMembers: boolean;
    fetchingAlerts: boolean;
    fetchingRepos: boolean;
    fetchingPRs: boolean;
  }>>
) {
  const saveToCache = useCallback((data: Partial<AppInstallationState>) => {
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
  }, [state.selectedOrg]);

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
                vulnerabilityAlerts(first: 100, states: OPEN) {
                  totalCount
                  nodes {
                    securityAdvisory {
                      severity
                    }
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
        const alertCount = r.vulnerabilityAlerts?.totalCount || 0;
        const alertNodes = r.vulnerabilityAlerts?.nodes || [];
        const hasCritical = alertNodes.some((a: any) => a.securityAdvisory?.severity === "CRITICAL");
        const hasHigh = alertNodes.some((a: any) => a.securityAdvisory?.severity === "HIGH");
        const lastPushDate = new Date(r.pushedAt);
        const daysSinceLastPush = Math.floor((Date.now() - lastPushDate.getTime()) / (1000 * 60 * 60 * 24));
        
        let status: "healthy" | "warning" | "critical" = "healthy";
        if (alertCount > 0) {
          status = (hasCritical || hasHigh) ? "critical" : "warning";
        } else {
          if (daysSinceLastPush > 180) status = "critical";
          else if (daysSinceLastPush > 90) status = "warning";
        }

        return {
          name: r.name,
          description: r.description || "",
          language: languageNode?.name || "Unknown",
          languageColor: languageNode?.color || "#999",
          visibility: r.isPrivate ? "private" : "public",
          stars: r.stargazerCount,
          forks: r.forkCount,
          lastCommit: new Date(r.pushedAt).toLocaleString(),
          alerts: alertCount,
          status,
          contributors
        };
      });

      setState(prev => ({ ...prev, repos }));
      saveToCache({ repos });
    } catch (err: any) {
      console.error("Failed to fetch repos:", err.message);
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchingOrgData: false }));
    }
  }, [state.selectedOrg, state.installationId, setState, setLoadingStates, saveToCache]);

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

    setLoadingStates(prev => ({ ...prev, fetchingMembers: true }));

    try {
      const tokenRes = await fetch("/api/github/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ installationId: state.installationId }),
      });
      const { token } = await tokenRes.json();

      const fromDate = state.dateRange?.from || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const toDate = state.dateRange?.to || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

      const query = `
        query($org: String!, $from: DateTime!, $to: DateTime!) {
          organization(login: $org) {
            membersWithRole(first: 50) {
              nodes {
                login
                name
                avatarUrl
                contributionsCollection(from: $from, to: $to) {
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
            from: fromDate.toISOString(),
            to: toDate.toISOString(),
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
      setLoadingStates(prev => ({ ...prev, fetchingMembers: false }));
    }
  }, [state.selectedOrg, state.installationId, state.rankingWeights, state.dateRange, setState, setLoadingStates, saveToCache]);

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

      // 2. Fetch Secret Scanning alerts
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

      setState(prev => {
        const updatedRepos = prev.repos.map(repo => {
          const repoAlerts = alerts.filter(a => a.repo === repo.name);
          const alertCount = repoAlerts.length;
          let status: "healthy" | "warning" | "critical" = "healthy";
          if (alertCount > 0) {
            const hasCritical = repoAlerts.some(a => a.severity === "critical");
            const hasHigh = repoAlerts.some(a => a.severity === "high");
            status = (hasCritical || hasHigh) ? "critical" : "warning";
          }
          return { ...repo, alerts: alertCount, status };
        });
        saveToCache({ alerts, repos: updatedRepos });
        return { ...prev, alerts, repos: updatedRepos };
      });
    } catch (err) {
      console.error("Failed to fetch security alerts", err);
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchingAlerts: false }));
    }
  }, [state.selectedOrg, state.installationId, setState, setLoadingStates, saveToCache]);

  return {
    fetchOrgData,
    fetchMembers,
    fetchSecurityAlerts,
    saveToCache
  };
}
