import { useCallback } from "react";
import { AppInstallationState, InstallationInfo } from "@/types";
import { STORAGE_KEYS, GITHUB_CONFIG } from "./constants";

export function useGitHubAuthFlow(
  state: AppInstallationState,
  setState: React.Dispatch<React.SetStateAction<AppInstallationState>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  selectOrg: (org: string, installationId: number) => void
) {
  const installToOrganization = useCallback(() => {
    window.location.href = `https://github.com/apps/${GITHUB_CONFIG.APP_NAME}/installations/new`;
  }, []);

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
        localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.INSTALLATIONS);
        setState(prev => ({
          ...prev,
          currentUserToken: null,
          installations: [],
          installationStatus: 'not_installed'
        }));
        // Note: installApp should be called here, but we'll handle it via returning empty and caller logic
      }
    } catch (error) {
      console.error("Error getting user installations:", error);
    }

    return [];
  }, [state.currentUserToken, setState]);

  const installApp = useCallback(async () => {
    if (state.currentUserToken) {
      try {
        const installations = await getUserInstallations();
        if (installations.length > 0) {
          const firstInstallation = installations[0];
          selectOrg(firstInstallation.organizationLogin, firstInstallation.installationId);
          return;
        }
        installToOrganization();
        return;
      } catch (error) {
        console.error("Failed to check existing installations:", error);
      }
    }

    const authUrl = new URL("https://github.com/login/oauth/authorize");
    authUrl.searchParams.append("client_id", GITHUB_CONFIG.CLIENT_ID!);
    authUrl.searchParams.append("redirect_uri", GITHUB_CONFIG.REDIRECT_URI);
    authUrl.searchParams.append("scope", GITHUB_CONFIG.SCOPE);
    authUrl.searchParams.append("state", "install");

    window.location.href = authUrl.toString();
  }, [state.currentUserToken, getUserInstallations, selectOrg, installToOrganization]);

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
        } else {
          setState(prev => ({ ...prev, installationStatus: 'not_installed' }));
        }
      } else if (response.status === 401) {
        localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.INSTALLATIONS);
        setState(prev => ({
          ...prev,
          currentUserToken: null,
          installations: [],
          installationStatus: 'not_installed'
        }));
        installApp();
      } else {
        setState(prev => ({ ...prev, installationStatus: 'error' }));
      }
    } catch (error) {
      console.error("Error checking installations:", error);
      setState(prev => ({ ...prev, installationStatus: 'error' }));
    }
  }, [state.currentUserToken, setState, installApp]);

  const handleInstallationCallback = useCallback(async (code: string) => {
    try {
      const response = await fetch("/api/github/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) throw new Error("Failed to authenticate");

      const { token, installations } = await response.json();
      localStorage.setItem(STORAGE_KEYS.USER_TOKEN, token);

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
      } else {
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
  }, [setState, installApp]);

  const disconnect = useCallback(() => {
    const now = new Date();
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
      installationStatus: 'not_installed',
      dateRange: {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        label: "This month"
      }
    });

    localStorage.removeItem(STORAGE_KEYS.INSTALLATION);
    localStorage.removeItem(STORAGE_KEYS.CACHE);
    sessionStorage.clear();
  }, [setState]);

  const switchInstallation = useCallback((installationId: number) => {
    const installation = state.installations.find(inst => inst.installationId === installationId);
    if (installation) {
      selectOrg(installation.organizationLogin, installation.installationId);
    }
  }, [state.installations, selectOrg]);

  const removeInstallation = useCallback((installationId: number) => {
    const updatedInstallations = state.installations.filter(
      inst => inst.installationId !== installationId
    );

    localStorage.setItem(STORAGE_KEYS.INSTALLATIONS, JSON.stringify(updatedInstallations));

    setState(prev => ({
      ...prev,
      installations: updatedInstallations
    }));

    if (state.installationId === installationId) {
      disconnect();
    }
  }, [state.installations, state.installationId, setState, disconnect]);

  return {
    installApp,
    handleInstallationCallback,
    disconnect,
    checkExistingInstallations,
    getUserInstallations,
    switchInstallation,
    removeInstallation,
    installToOrganization,
  };
}
