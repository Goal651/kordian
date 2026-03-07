import { useCallback } from "react";
import { AppInstallationState, RankingWeights, DateRange } from "@/types";
import { STORAGE_KEYS } from "./constants";

export function useGitHubSettings(
  state: AppInstallationState,
  setState: React.Dispatch<React.SetStateAction<AppInstallationState>>,
  fetchOrgData: (force?: boolean) => Promise<void>,
  fetchMembers: (force?: boolean) => Promise<void>,
  fetchSecurityAlerts: (force?: boolean) => Promise<void>
) {
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

    localStorage.removeItem(STORAGE_KEYS.CACHE);

    fetchOrgData(true);
    fetchMembers(true);
    fetchSecurityAlerts(true);
  }, [state.rankingWeights, setState, fetchOrgData, fetchMembers, fetchSecurityAlerts]);

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
    setState(prev => ({ ...prev, dateRange: range }));
  }, [setState]);

  return {
    selectOrg,
    updateRankingWeights,
    updateDateRange
  };
}
