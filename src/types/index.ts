export interface Contributor {
  login: string;
  avatar: string;
}

export interface Repository {
  name: string;
  description: string;
  language: string;
  languageColor: string;
  visibility: "private" | "public";
  stars: number;
  forks: number;
  lastCommit: string;
  status: "healthy" | "warning" | "critical";
  alerts: number;
  contributors: Contributor[];
}

export interface Member {
  name: string;
  username: string;
  avatar: string;
  role: string;
  status: "active" | "inactive";
  commits: number;
  prs: number;
  reviews: number;
}

export interface SecurityAlert {
  id: string;
  repo: string;
  type: "Secret" | "Dependency" | "Code";
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  detected: string;
  path: string;
  url?: string;
}

export interface RankingWeights {
  prs: number;
  reviews: number;
  commits: number;
}

export interface InstallationInfo {
  installationId: number;
  organizationId: number;
  organizationLogin: string;
  permissions: Record<string, string>;
  installedAt: string;
  installedBy: string;
}

export interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

export interface AppInstallationState {
  installed: boolean;
  installationId: number | null;
  selectedOrg: string | null;
  repos: Repository[];
  members: Member[];
  alerts: SecurityAlert[];
  rankingWeights: RankingWeights;
  installations: InstallationInfo[];
  currentUserToken: string | null;
  installationStatus: 'checking' | 'installed' | 'not_installed' | 'error';
  dateRange: DateRange | null;
}
