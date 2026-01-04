"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { CheckCircle, AlertCircle } from "lucide-react";

function AuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { selectOrg, handleInstallationCallback } = useGitHubApp();

    useEffect(() => {
        if (!searchParams) return;
        
        const code = searchParams.get("code");
        const installationId = searchParams.get("installation_id");
        const org = searchParams.get("org");
        const token = searchParams.get("token");
        const user = searchParams.get("user");
        const installations = searchParams.get("installations");
        const error = searchParams.get("error");

        if (error) {
            console.error("Auth error:", error);
            router.push("/connect");
            return;
        }

        if (token && user && installations) {
            // OAuth flow - data passed from API route
            try {
                const userData = JSON.parse(decodeURIComponent(user));
                const installationsData = JSON.parse(decodeURIComponent(installations));
                
                // Store token and installations
                localStorage.setItem("github_user_token", token);
                localStorage.setItem("github_app_installations", JSON.stringify(installationsData));
                
                // Auto-select first installation if available
                if (installationsData.length > 0) {
                    const firstInstallation = installationsData[0];
                    selectOrg(firstInstallation.account.login, firstInstallation.id);
                    router.push("/");
                } else {
                    router.push("/connect");
                }
            } catch (err) {
                console.error("Failed to parse OAuth data:", err);
                router.push("/connect");
            }
        } else if (code) {
            // Legacy OAuth flow - let the context handle it
            handleInstallationCallback(code).then(() => {
                router.push("/");
            }).catch((err) => {
                console.error("Failed to handle installation callback:", err);
                router.push("/connect");
            });
        } else if (installationId && org) {
            // Legacy installation flow
            selectOrg(org, Number(installationId));
            router.push("/");
        } else {
            router.push("/connect");
        }
    }, [searchParams, selectOrg, handleInstallationCallback, router]);

    if (!searchParams) return null;

    const code = searchParams.get("code");
    const installationId = searchParams.get("installation_id");
    const token = searchParams.get("token");

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="hero-glow fixed inset-0 pointer-events-none" />
            <div className="relative text-center glass-card p-8 max-w-md">
                {code || installationId || token ? (
                    <>
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-foreground mb-2">
                            GitHub App Connected
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Setting up your workspace...
                        </p>
                    </>
                ) : (
                    <>
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-foreground mb-2">
                            Connection Failed
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Redirecting to Connect page...
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
            <AuthCallbackContent />
        </Suspense>
    );
}