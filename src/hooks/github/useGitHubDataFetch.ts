import { useCallback } from "react";
import { AppInstallationState, SecurityAlert, Member } from "@/types";
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
  }>>,
  loadingStates: {
    fetchingOrgData: boolean;
    fetchingMembers: boolean;
    fetchingAlerts: boolean;
    fetchingRepos: boolean;
    fetchingPRs: boolean;
  }
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
    if (!state.selectedOrg || !state.installationId || loadingStates.fetchingRepos) return;

    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { repos, timestamp, org } = JSON.parse(cached);
        if (org === state.selectedOrg && repos && Date.now() - timestamp < CACHE_DURATION) {
          return;
        }
      }
    }

    setLoadingStates(prev => ({ ...prev, fetchingRepos: true }));

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
      const isOrg = (org && state.accountType === 'Organization') || (!org && state.accountType === 'Organization') || state.accountType === null;

      const query = `
        query($owner: String!) {
          repositoryOwner(login: $owner) {
            ... on Organization {
              createdAt
            }
            repositories(first: 100, orderBy: {field: PUSHED_AT, direction: DESC}) {
              nodes {
                name
                description
                isPrivate
                stargazerCount
                forkCount
                pushedAt
                url
                languages(first: 5, orderBy: {field: SIZE, direction: DESC}) {
                  nodes {
                    name
                    color
                  }
                }
                vulnerabilityAlerts(first: 10, states: OPEN) {
                  totalCount
                  nodes {
                    securityAdvisory {
                      severity
                      summary
                      description
                    }
                    htmlUrl
                  }
                }
                defaultBranchRef {
                  target {
                    ... on Commit {
                      history(first: 20) {
                        nodes {
                          author {
                            user {
                              login
                              name
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
          variables: { owner: currentOrg },
        }),
      });

      const json = await res.json();
      const nodes = json.data?.repositoryOwner?.repositories?.nodes || [];

      const repos = nodes.map((r: any) => {
        const commits = r.defaultBranchRef?.target?.history?.nodes || [];
        const contributorsMap = new Map();
        commits.forEach((c: any) => {
          if (c.author?.user) {
            contributorsMap.set(c.author.user.login, {
              login: c.author.user.login,
              name: c.author.user.name || c.author.user.login,
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

        return {
          name: r.name,
          description: r.description || "No description provided",
          language: languageNode?.name || "Other",
          languageColor: languageNode?.color || "#555",
          visibility: r.isPrivate ? "private" : "public",
          stars: r.stargazerCount,
          forks: r.forkCount,
          lastCommit: new Date(r.pushedAt).toLocaleDateString(),
          pushedAt: r.pushedAt,
          status: hasCritical || hasHigh ? "critical" : alertCount > 0 ? "warning" : "healthy",
          alerts: alertCount,
          contributors: contributors,
          url: r.url
        };
      });

      setState(prev => ({
        ...prev,
        repos,
        selectedOrg: currentOrg,
        orgCreatedAt: json.data?.repositoryOwner?.createdAt || prev.orgCreatedAt
      }));

      saveToCache({
        repos,
        orgCreatedAt: json.data?.repositoryOwner?.createdAt
      });
    } catch (err: any) {
      console.error("Failed to fetch repos:", err.message);
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchingRepos: false }));
    }
  }, [state.selectedOrg, state.installationId, setState, setLoadingStates, saveToCache, loadingStates.fetchingRepos]);

  const fetchMembers = useCallback(async (force = false) => {
    if (!state.selectedOrg || !state.installationId || loadingStates.fetchingMembers) return;

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
        query($owner: String!, $from: DateTime!, $to: DateTime!) {
          repositoryOwner(login: $owner) {
            ... on Organization {
              membersWithRole(first: 50) {
                nodes {
                  login
                  name
                  avatarUrl
                  contributionsCollection(from: $from, to: $to) {
                    totalCommitContributions
                    totalPullRequestContributions
                    totalPullRequestReviewContributions
                    commitContributionsByRepository(maxRepositories: 50) {
                      repository {
                        name
                      }
                      contributions {
                        totalCount
                      }
                    }
                  }
                }
              }
            }
            ... on User {
              login
              name
              avatarUrl
              contributionsCollection(from: $from, to: $to) {
                totalCommitContributions
                totalPullRequestContributions
                totalPullRequestReviewContributions
                commitContributionsByRepository(maxRepositories: 50) {
                  repository {
                    name
                  }
                  contributions {
                    totalCount
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
          variables: {
            owner: state.selectedOrg,
            from: fromDate.toISOString(),
            to: toDate.toISOString(),
          },
        }),
      });

      const json = await res.json();
      const owner = json.data?.repositoryOwner;
      let nodes: any[] = [];
      
      if (owner?.membersWithRole) {
        // It's an Organization
        nodes = owner.membersWithRole.nodes;
      } else if (owner) {
        // It's a User
        nodes = [owner];
      }

      const members = nodes.map((node: any) => {
        const stats = node.contributionsCollection;
        const commits = stats.totalCommitContributions;
        const prs = stats.totalPullRequestContributions;
        const reviews = stats.totalPullRequestReviewContributions;
        
        const contributedRepos = stats.commitContributionsByRepository?.map((repoContr: any) => repoContr.repository.name) || [];

        return {
          name: node.name || node.login,
          username: node.login,
          avatar: node.avatarUrl,
          role: "Member",
          status: ((commits + prs + reviews > 0) ? "active" : "inactive") as "active" | "inactive",
          commits,
          prs,
          reviews,
          contributedRepos,
          score: (prs * state.rankingWeights.prs) + (reviews * state.rankingWeights.reviews) + (commits * state.rankingWeights.commits)
        };
      }).sort((a: any, b: any) => b.score - a.score);
 
      const typedMembers: Member[] = members;
      setState(prev => ({ ...prev, members: typedMembers }));
      saveToCache({ members: typedMembers });
    } catch (err) {
      console.error("Failed to fetch members via GraphQL", err);
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchingMembers: false }));
    }
  }, [state.selectedOrg, state.installationId, state.rankingWeights, state.dateRange, setState, setLoadingStates, saveToCache, loadingStates.fetchingMembers]);

  const fetchSecurityAlerts = useCallback(async (force = false) => {
    if (!state.selectedOrg || !state.installationId || loadingStates.fetchingAlerts) return;

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

      const isOrg = state.accountType === 'Organization';
      const baseApiUrl = isOrg ? `https://api.github.com/orgs/${state.selectedOrg}` : `https://api.github.com/user`;

      // 1. Fetch Dependabot alerts
      const depRes = await fetch(`${baseApiUrl}/dependabot/alerts?state=open`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const depData = await depRes.json();

      // 2. Fetch Secret Scanning alerts
      const secretRes = await fetch(`${baseApiUrl}/secret-scanning/alerts?state=open`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const secretData = await secretRes.json();

      // 3. Fetch Code Scanning alerts
      const codeRes = await fetch(`${baseApiUrl}/code-scanning/alerts?state=open`, {
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
          url: a.html_url,
          description: a.security_advisory.description,
          remediation: a.security_advisory.remediation || `Update ${a.security_vulnerability.package.name} to a secure version.`
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
          url: a.html_url,
          description: `A secret of type ${a.secret_type} was detected.`,
          remediation: "Revoke the secret immediately and update your configuration."
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
          url: a.html_url,
          description: a.rule.full_description || a.rule.description,
          remediation: "Review the code scanning alert and apply the suggested fix."
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
  }, [state.selectedOrg, state.installationId, setState, setLoadingStates, saveToCache, loadingStates.fetchingAlerts]);

  return {
    fetchOrgData,
    fetchMembers,
    fetchSecurityAlerts,
    saveToCache
  };
}
