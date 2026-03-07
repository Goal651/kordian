import { useCallback, useRef, useEffect } from "react";
import { AppInstallationState, RankingWeights, DateRange } from "@/types";
import { STORAGE_KEYS } from "./constants";

export function useGitHubSettings(
  state: AppInstallationState,
  setState: React.Dispatch<React.SetStateAction<AppInstallationState>>,
  fetchOrgData: (force?: boolean) => Promise<void>,
  fetchMembers: (force?: boolean) => Promise<void>,
  fetchSecurityAlerts: (force?: boolean) => Promise<void>
) {
  // Use a ref for ranking weights to stabilize selectOrg
  const weightsRef = useRef(state.rankingWeights);
  useEffect(() => {
    weightsRef.current = state.rankingWeights;
  }, [state.rankingWeights]);

  const selectOrg = useCallback((org: string, installationId: number, accountType?: 'User' | 'Organization') => {
    const finalAccountType = accountType || 'Organization';
    
    setState(prev => ({
      ...prev,
      installed: true,
      selectedOrg: org,
      installationId,
      installationStatus: 'installed',
      accountType: finalAccountType,
      // Clear data to trigger fresh fetch via useEffect in GitHubContext
      repos: [],
      members: [],
      alerts: []
    }));

    localStorage.setItem(
      STORAGE_KEYS.INSTALLATION,
      JSON.stringify({
        installed: true,
        selectedOrg: org,
        installationId,
        rankingWeights: weightsRef.current,
        accountType: finalAccountType
      })
    );

    localStorage.removeItem(STORAGE_KEYS.CACHE);
  }, [setState]);

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
  }, [setState]);

  const updateDateRange = useCallback((range: DateRange) => {
    console.log(`[Nexus] Changing date range to: ${range.label}`, {
      from: range.from.toISOString(),
      to: range.to.toISOString()
    });
    setState(prev => ({ ...prev, dateRange: range }));
  }, [setState]);

  return {
    selectOrg,
    updateRankingWeights,
    updateDateRange
  };
}
