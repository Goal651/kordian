import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from "react";
import { AppInstallationState, InstallationInfo, RankingWeights, DateRange } from "@/types";
import { STORAGE_KEYS, CACHE_DURATION, CACHE_KEY } from "@/hooks/github/constants";
import { useGitHubDataFetch } from "@/hooks/github/useGitHubDataFetch";
import { useGitHubAuthFlow } from "@/hooks/github/useGitHubAuthFlow";
import { useGitHubSettings } from "@/hooks/github/useGitHubSettings";

interface GitHubContextType {
  state: AppInstallationState;
  selectOrg: (org: string, installationId: number, accountType?: 'User' | 'Organization') => void;
  installApp: () => void;
  fetchOrgData: (force?: boolean) => Promise<void>;
  fetchMembers: (force?: boolean) => Promise<void>;
  fetchSecurityAlerts: (force?: boolean) => Promise<void>;
  updateRankingWeights: (weights: RankingWeights) => void;
  updateDateRange: (range: DateRange) => void;
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
  setState: React.Dispatch<React.SetStateAction<AppInstallationState>>;
}

const GitHubContext = createContext<GitHubContextType | undefined>(undefined);

export function GitHubAppProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<AppInstallationState>({
    installed: false,
    installationId: null,
    selectedOrg: null,
    currentUserToken: null,
    installations: [],
    installationStatus: 'not_installed',
    rankingWeights: { prs: 1, reviews: 1, commits: 1 },
    repos: [],
    members: [],
    alerts: [],
    dateRange: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date(),
      label: "This month"
    },
    orgCreatedAt: null,
    selectedMemberId: null,
    selectedRepoName: null,
    theme: 'dark',
    accountType: null,
    totalRepos: 0,
    totalMembers: 0
  });

  const [loadingStates, setLoadingStates] = useState({
    fetchingOrgData: false,
    fetchingMembers: false,
    fetchingAlerts: false,
    fetchingRepos: false,
    fetchingPRs: false,
  });

  const { fetchOrgData, fetchMembers, fetchSecurityAlerts } = useGitHubDataFetch(state, setState, setLoadingStates, loadingStates);
  
  const { selectOrg, updateRankingWeights, updateDateRange } = useGitHubSettings(
    state, setState, fetchOrgData, fetchMembers, fetchSecurityAlerts
  );

  const authFlow = useGitHubAuthFlow(state, setState, setIsLoading, selectOrg);
  const initialized = useRef(false);

  const hydrateFromStorage = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem(STORAGE_KEYS.USER_TOKEN);
      if (storedToken) {
        setState(prev => ({ ...prev, currentUserToken: storedToken }));
      } else {
        setState(prev => ({ ...prev, installationStatus: 'not_installed' }));
      }

      const storedInstallations = localStorage.getItem(STORAGE_KEYS.INSTALLATIONS);
      if (storedInstallations) {
        setState(prev => ({ ...prev, installations: JSON.parse(storedInstallations) }));
      }

      const storedInstallation = localStorage.getItem(STORAGE_KEYS.INSTALLATION);
      if (storedInstallation) {
        const { installed, selectedOrg, installationId, rankingWeights, accountType } = JSON.parse(storedInstallation);
        if (installed && installationId) {
          setState(prev => ({
            ...prev,
            installed: true,
            selectedOrg,
            installationId,
            rankingWeights: rankingWeights || prev.rankingWeights,
            installationStatus: 'installed',
            accountType: accountType || null
          }));
        }
      }

      const storedDateRange = localStorage.getItem('nexus_date_range');
      if (storedDateRange) {
        const parsed = JSON.parse(storedDateRange);
        setState(prev => ({ 
          ...prev, 
          dateRange: { 
            from: new Date(parsed.from), 
            to: new Date(parsed.to), 
            label: parsed.label 
          } 
        }));
      }

      const cached = localStorage.getItem(STORAGE_KEYS.CACHE);
      if (cached) {
        const { repos, members, alerts, timestamp, org } = JSON.parse(cached);
        const storedOrg = storedInstallation ? JSON.parse(storedInstallation).selectedOrg : null;

        if (org === storedOrg && Date.now() - timestamp < CACHE_DURATION) {
          setState(prev => ({ ...prev, repos: repos || [], members: members || [], alerts: alerts || [] }));
        }
      }
    } catch (error) {
      console.error("Failed to hydrate from storage:", error);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      if (initialized.current) return;
      initialized.current = true;
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        await authFlow.handleInstallationCallback(code);
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }

      await hydrateFromStorage();
      setIsLoading(false);
    };

    if (typeof window !== 'undefined') {
      initializeAuth();
    }
  }, [authFlow.handleInstallationCallback, hydrateFromStorage]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('nexus_theme') as 'light' | 'dark';
    if (savedTheme) {
      setState(prev => ({ ...prev, theme: savedTheme }));
      if (savedTheme === 'dark') {
          window.document.documentElement.classList.add('dark');
      } else {
          window.document.documentElement.classList.remove('dark');
      }
    } else {
        // Default to dark if no preference
        window.document.documentElement.classList.add('dark');
    }
    
    if (state.currentUserToken && state.installationStatus === 'not_installed') {
      authFlow.checkExistingInstallations();
    }
  }, [state.currentUserToken, state.installationStatus]);

  // Centralized data fetching trigger
  useEffect(() => {
    if (state.installed && state.selectedOrg && state.installationId && !isLoading) {
      console.log(`[DEBUG] Centralized fetch triggered for ${state.selectedOrg} (${state.dateRange?.label})`, {
        from: state.dateRange?.from.toISOString(),
        to: state.dateRange?.to.toISOString()
      });
      // Always fetch or check cache when org shifts or dateRange changes
      fetchOrgData();
      fetchMembers();
      fetchSecurityAlerts();
    }
  }, [
    state.installed, 
    state.selectedOrg, 
    state.installationId, 
    state.dateRange, 
    isLoading,
    fetchOrgData, 
    fetchMembers, 
    fetchSecurityAlerts
  ]);

  const value = {
    state,
    isLoading,
    loadingStates,
    selectOrg,
    ...authFlow,
    fetchOrgData,
    fetchMembers,
    fetchSecurityAlerts,
    updateRankingWeights,
    updateDateRange,
    setState,
  };

  return (
    <GitHubContext.Provider value={value}>
      {children}
    </GitHubContext.Provider>
  );
}

export function useGitHubApp() {
  const context = useContext(GitHubContext);
  if (context === undefined) {
    throw new Error("useGitHubApp must be used within a GitHubAppProvider");
  }
  return context;
}
