import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface AppInstallationState {
  installed: boolean;
  installationId: number | null;
  selectedOrg: string | null;
}

const AppContext = createContext<{
  state: AppInstallationState;
  selectOrg: (org: string, installationId: number) => void;
  installApp: () => void;
}>({
  state: { installed: false, installationId: null, selectedOrg: null },
  selectOrg: () => {},
  installApp: () => {},
});

export function GitHubAppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppInstallationState>({
    installed: false,
    installationId: null,
    selectedOrg: null,
  });

  const selectOrg = useCallback((org: string, installationId: number) => {
    setState({ installed: true, installationId, selectedOrg: org });
    sessionStorage.setItem(
      'github_app_installation',
      JSON.stringify({ installed: true, installationId, selectedOrg: org })
    );
  }, []);

  const installApp = useCallback(() => {
    // Redirect to GitHub App installation
    window.location.href = 'https://github.com/apps/github-compass/installations/new';
  }, []);

  return (
    <AppContext.Provider value={{ state, selectOrg, installApp }}>
      {children}
    </AppContext.Provider>
  );
}

export function useGitHubApp() {
  return useContext(AppContext);
}
