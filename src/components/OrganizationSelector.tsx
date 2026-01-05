"use client";

import { useState } from "react";
import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, CheckCircle, Plus, SwitchCamera } from "lucide-react";

export function OrganizationSelector() {
  const { 
    state, 
    checkExistingInstallations, 
    switchInstallation,
    installApp,
    installToOrganization,
    isLoading,
    loadingStates
  } = useGitHubApp();

  const [isSwitching, setIsSwitching] = useState<number | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleSwitchInstallation = async (installationId: number) => {
    setIsSwitching(installationId);
    try {
      await switchInstallation(installationId);
    } finally {
      setIsSwitching(null);
    }
  };

  const handleInstallApp = async () => {
    setIsInstalling(true);
    try {
      await installApp();
    } finally {
      setIsInstalling(false);
    }
  };

  if (isLoading || loadingStates.fetchingOrgData || loadingStates.fetchingMembers || loadingStates.fetchingAlerts) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading data...</span>
        </CardContent>
      </Card>
    );
  }

  if (state.installationStatus === 'checking') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Discovering installations...</span>
        </CardContent>
      </Card>
    );
  }

  if (state.installationStatus === 'error') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">Connection Error</CardTitle>
          <CardDescription>
            Failed to connect to GitHub. Please check your configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={checkExistingInstallations} variant="outline">
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (state.installationStatus === 'installed' && state.installations.length > 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Select Organization</CardTitle>
          <CardDescription>
            Choose which organization to manage with GitGuard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {state.installations.map(installation => (
              <div
                key={installation.installationId}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors cursor-pointer ${
                  state.installationId === installation.installationId
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => switchInstallation(installation.installationId)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={`https://github.com/${installation.organizationLogin}.png`} 
                      alt={installation.organizationLogin} 
                    />
                    <AvatarFallback>
                      {installation.organizationLogin.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{installation.organizationLogin}</div>
                    <div className="text-sm text-muted-foreground">
                      Installed {new Date(installation.installedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {state.installationId === installation.installationId && (
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSwitchInstallation(installation.installationId)}
                    disabled={isSwitching === installation.installationId || isLoading}
                  >
                    {isSwitching === installation.installationId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SwitchCamera className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t space-y-2">
            
            <Button onClick={installToOrganization} variant="secondary" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Install to New Organization
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>No Installations Found</CardTitle>
        <CardDescription>
          GitGuard is not installed to any of your organizations yet.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button onClick={installToOrganization} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Install to New Organization
        </Button>
      </CardContent>
    </Card>
  );
}
