// GitHub App Configuration
// Public values only
const GITHUB_APP_NAME = 'short-tagline'; // exact app slug
const GITHUB_CLIENT_ID =
  import.meta.env.VITE_GITHUB_CLIENT_ID || 'Iv23liKXLDw16D4n0bmQ';

export interface AppInstallationState {
  installed: boolean;
  installationId: number | null;
  selectedOrg: string | null;
}

const INSTALLATION_STORAGE_KEY = 'github_app_installation';

// Redirect user to GitHub App installation page
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

export function getInstallationState(): AppInstallationState {
  const stored = sessionStorage.getItem(INSTALLATION_STORAGE_KEY);
  if (!stored) {
    return {
      installed: false,
      installationId: null,
      selectedOrg: null,
    };
  }

  try {
    return JSON.parse(stored);
  } catch {
    return {
      installed: false,
      installationId: null,
      selectedOrg: null,
    };
  }
}

export function clearInstallationState(): void {
  sessionStorage.removeItem(INSTALLATION_STORAGE_KEY);
}

// Check if app client ID is configured
export function isGitHubConfigured(): boolean {
  return Boolean(GITHUB_CLIENT_ID);
}
