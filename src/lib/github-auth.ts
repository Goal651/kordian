import { AppInstallationState } from "@/types";

// GitHub App Configuration (Public values only)
const GITHUB_APP_NAME = 'aperio';
const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'Iv23liKXLDw16D4n0bmQ';

const INSTALLATION_STORAGE_KEY = 'github_app_installation';

// Get GitHub App installation URL
export function getGitHubAppInstallUrl(): string {
  return `https://github.com/apps/${GITHUB_APP_NAME}/installations/new`;
}

// Save installation state (optional UX only)
export function saveInstallationState(
  state: Partial<AppInstallationState>
): void {
  const existing = getInstallationState();
  sessionStorage.setItem(
    INSTALLATION_STORAGE_KEY,
    JSON.stringify({ ...existing, ...state })
  );
}

// Get installation state from sessionStorage
export function getInstallationState(): AppInstallationState {
  const stored = sessionStorage.getItem(INSTALLATION_STORAGE_KEY);
  if (!stored) {
    return {
      installed: false,
      installationId: null,
      selectedOrg: null,
      repos: [],
      members: [],
      alerts: [],
      rankingWeights: { prs: 20, reviews: 15, commits: 2 },
      installations: [],
      currentUserToken: null,
      installationStatus: 'checking',
      dateRange: null,
      orgCreatedAt: null,
      selectedMemberId: null,
      selectedRepoName: null,
      theme: 'dark',
      accountType: null,
      totalRepos: 0,
      totalMembers: 0,
    };
  }

  try {
    return JSON.parse(stored);
  } catch {
    return {
      installed: false,
      installationId: null,
      selectedOrg: null,
      repos: [],
      members: [],
      alerts: [],
      rankingWeights: { prs: 20, reviews: 15, commits: 2 },
      installations: [],
      currentUserToken: null,
      installationStatus: 'checking',
      dateRange: null,
      orgCreatedAt: null,
      selectedMemberId: null,
      selectedRepoName: null,
      theme: 'dark',
      accountType: null,
      totalRepos: 0,
      totalMembers: 0,
    };
  }
}

// Clear installation state
export function clearInstallationState(): void {
  sessionStorage.removeItem(INSTALLATION_STORAGE_KEY);
}

// Check if GitHub App client ID is configured
export function isGitHubConfigured(): boolean {
  return Boolean(GITHUB_CLIENT_ID);
}

/**
 * Optional: helper to fetch repositories via GitHub App
 * You should call this from your provider after the user selects an org.
 */
export async function fetchOrgRepos(
  org: string,
  token: string
): Promise<any[]> {
  const res = await fetch(`https://api.github.com/orgs/${org}/repos`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!res.ok) throw new Error('Failed to fetch repositories');

  return res.json();
}
