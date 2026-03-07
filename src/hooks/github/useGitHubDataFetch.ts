import { useCallback, useRef, useEffect } from "react";
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
  // Use refs to stabilize callbacks
  const stateRef = useRef(state);
  const loadingStatesRef = useRef(loadingStates);

  // CRITICAL: Update refs in the render body so they are fresh for effects in child components
  stateRef.current = state;
  loadingStatesRef.current = loadingStates;

  const saveToCache = useCallback((data: Partial<AppInstallationState>) => {
    const currentState = stateRef.current;
    const existing = localStorage.getItem(STORAGE_KEYS.CACHE);
    let cacheObj = existing ? JSON.parse(existing) : { timestamp: Date.now(), org: currentState.selectedOrg };

    // Reset timestamp on new data or if org changed
    if (cacheObj.org !== currentState.selectedOrg) {
      cacheObj = { timestamp: Date.now(), org: currentState.selectedOrg };
    }

    const newCache = {
      ...cacheObj,
      ...data,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.CACHE, JSON.stringify(newCache));
  }, []);

  const fetchOrgData = useCallback(async (force = false) => {
    const currentState = stateRef.current;
    if (!currentState.selectedOrg || !currentState.installationId || loadingStatesRef.current.fetchingRepos) return;

    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { repos, timestamp, org } = JSON.parse(cached);
        if (org === currentState.selectedOrg && repos && repos.length > 0 && Date.now() - timestamp < CACHE_DURATION) {
          // If we have cached repos but the current state is empty, fill it
          if (currentState.repos.length === 0) {
            setState(prev => ({ ...prev, repos: repos }));
          }
          return;
        }
      }
    }

    setLoadingStates(prev => ({ ...prev, fetchingRepos: true }));

    try {
      const tokenRes = await fetch("/api/github/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ installationId: currentState.installationId }),
      });
      const { token, org, accountType: responseAccountType } = await tokenRes.json();

      if (org && org !== currentState.selectedOrg) {
        setState(prev => ({ ...prev, selectedOrg: org, accountType: responseAccountType || prev.accountType }));
      }

      const currentOrg = org || currentState.selectedOrg;
      const finalAccountType = responseAccountType || currentState.accountType;
      
      console.log(`[DEBUG] fetchOrgData starting for ${currentOrg} (${finalAccountType})`);

      const query = `
        query($owner: String!) {
          repositoryOwner(login: $owner) {
            ... on Organization { createdAt }
            ... on User { createdAt }
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
      console.log(`[DEBUG] fetchOrgData response for ${currentOrg}:`, { 
        hasData: !!json.data, 
        hasOwner: !!json.data?.repositoryOwner,
        repoCount: json.data?.repositoryOwner?.repositories?.nodes?.length || 0,
        errors: json.errors 
      });
      
      if (json.errors) {
        console.error("GraphQL errors fetching repos:", json.errors.map((e: any) => e.message).join(", "));
      }

      const nodes = (json.data?.repositoryOwner?.repositories?.nodes || []).filter((node: any) => node !== null);

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
          status: "healthy" as const,
          alerts: 0,
          contributors: contributors,
          url: r.url
        };
      });

      setState(prev => {
        // Merge with existing alerts if we already have them
        const mergedRepos = repos.map(repo => {
          const repoAlerts = prev.alerts.filter(a => a.repo === repo.name);
          if (repoAlerts.length > 0) {
            const hasCritical = repoAlerts.some(a => a.severity === "critical");
            const hasHigh = repoAlerts.some(a => a.severity === "high");
            return {
              ...repo,
              alerts: repoAlerts.length,
              status: (hasCritical || hasHigh) ? "critical" : "warning" as any
            };
          }
          return repo;
        });

        return {
          ...prev,
          repos: mergedRepos,
          selectedOrg: currentOrg,
          orgCreatedAt: json.data?.repositoryOwner?.createdAt || prev.orgCreatedAt
        };
      });

      saveToCache({
        repos, // We save base repos to cache, alerts will be updated by alerts fetcher
        orgCreatedAt: json.data?.repositoryOwner?.createdAt
      });
    } catch (err: any) {
      console.error("Failed to fetch repos:", err.message);
    } finally {
      setLoadingStates(prev => ({ ...prev, fetchingRepos: false }));
    }
  }, [setState, setLoadingStates, saveToCache]);

  const fetchMembers = useCallback(async (force = false) => {
    const currentState = stateRef.current;
    if (!currentState.selectedOrg || !currentState.installationId || loadingStatesRef.current.fetchingMembers) return;

    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { members, timestamp, org } = JSON.parse(cached);
        if (org === currentState.selectedOrg && members && members.length > 0 && Date.now() - timestamp < CACHE_DURATION) {
          // If we have cached members but the current state is empty, fill it
          if (currentState.members.length === 0) {
            setState(prev => ({ ...prev, members: members }));
          }
          return;
        }
      }
    }

    setLoadingStates(prev => ({ ...prev, fetchingMembers: true }));

    try {
      const tokenRes = await fetch("/api/github/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ installationId: currentState.installationId }),
      });
      const { token } = await tokenRes.json();

      const fromDate = currentState.dateRange?.from || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const toDate = currentState.dateRange?.to || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

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
                    commitContributionsByRepository(maxRepositories: 50) {
                      repository {
                        name
                        owner { login }
                      }
                      contributions {
                        totalCount
                      }
                    }
                    pullRequestContributionsByRepository(maxRepositories: 50) {
                      repository {
                        name
                        owner { login }
                      }
                      contributions {
                        totalCount
                      }
                    }
                    pullRequestReviewContributionsByRepository(maxRepositories: 50) {
                      repository {
                        name
                        owner { login }
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
                commitContributionsByRepository(maxRepositories: 50) {
                  repository {
                    name
                    owner { login }
                  }
                  contributions {
                    totalCount
                  }
                }
                pullRequestContributionsByRepository(maxRepositories: 50) {
                  repository {
                    name
                    owner { login }
                  }
                  contributions {
                    totalCount
                  }
                }
                pullRequestReviewContributionsByRepository(maxRepositories: 50) {
                  repository {
                    name
                    owner { login }
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
            owner: currentState.selectedOrg,
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
        
        // Helper to filter and sum contributions for the selected org/user
        const filterAndSum = (repos: any[]) => {
          return repos
            ?.filter((r: any) => r.repository.owner.login.toLowerCase() === currentState.selectedOrg?.toLowerCase())
            .reduce((sum: number, r: any) => sum + r.contributions.totalCount, 0) || 0;
        };

        const commits = filterAndSum(stats.commitContributionsByRepository);
        const prs = filterAndSum(stats.pullRequestContributionsByRepository);
        const reviews = filterAndSum(stats.pullRequestReviewContributionsByRepository);
        
        const contributedRepos = stats.commitContributionsByRepository
          ?.filter((r: any) => r.repository.owner.login.toLowerCase() === currentState.selectedOrg?.toLowerCase())
          .map((repoContr: any) => repoContr.repository.name) || [];

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
          score: (prs * currentState.rankingWeights.prs) + (reviews * currentState.rankingWeights.reviews) + (commits * currentState.rankingWeights.commits)
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
  }, [setState, setLoadingStates, saveToCache]);

  const fetchSecurityAlerts = useCallback(async (force = false) => {
    const currentState = stateRef.current;
    if (!currentState.selectedOrg || !currentState.installationId || loadingStatesRef.current.fetchingAlerts) return;

    if (!force) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { alerts, timestamp, org } = JSON.parse(cached);
        if (org === currentState.selectedOrg && alerts && alerts.length > 0 && Date.now() - timestamp < CACHE_DURATION) {
          // If we have cached alerts but the current state is empty, fill it
          if (currentState.alerts.length === 0) {
            setState(prev => ({ ...prev, alerts: alerts }));
          }
          return;
        }
      }
    }

    setLoadingStates(prev => ({ ...prev, fetchingAlerts: true }));

    try {
      const isOrg = currentState.accountType === 'Organization';
      const baseApiUrl = isOrg ? `/orgs/${currentState.selectedOrg}` : `/user`;

      // Helper to fetch via proxy
      const fetchViaProxy = async (endpoint: string) => {
        const res = await fetch("/api/github/alerts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            installationId: currentState.installationId,
            endpoint
          }),
        });
        if (!res.ok) return [];
        return await res.json();
      };

      // 1. Fetch Dependabot alerts
      const depData = await fetchViaProxy(`${baseApiUrl}/dependabot/alerts?state=open`);

      // 2. Fetch Secret Scanning alerts
      const secretData = await fetchViaProxy(`${baseApiUrl}/secret-scanning/alerts?state=open`);

      // 3. Fetch Code Scanning alerts
      const codeData = await fetchViaProxy(`${baseApiUrl}/code-scanning/alerts?state=open`);

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
        if (prev.repos.length === 0) {
          saveToCache({ alerts });
          return { ...prev, alerts };
        }

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
  }, [setState, setLoadingStates, saveToCache]);

  return {
    fetchOrgData,
    fetchMembers,
    fetchSecurityAlerts,
    saveToCache
  };
}
