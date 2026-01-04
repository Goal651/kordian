"use client";

import { Github, Shield, Lock, Zap, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { OrganizationSelector } from "@/components/OrganizationSelector";

const features = [
    {
        icon: Shield,
        title: "Security Scanning",
        description: "Detect vulnerabilities, secrets, and misconfigurations",
    },
    {
        icon: Lock,
        title: "Read-Only Access",
        description: "We never modify your code or settings",
    },
    {
        icon: Zap,
        title: "On-Demand Analysis",
        description: "No data storage—scan when you need it",
    },
];

export default function Page() {
    const router = useRouter();
    const { state, selectOrg, fetchOrgData, installApp, isLoading, checkExistingInstallations } = useGitHubApp();
    const [manualId, setManualId] = useState("");
    const [showManualInput, setShowManualInput] = useState(false);

    useEffect(() => {
        if (state.installed && state.selectedOrg) {
            router.push("/"); // dashboard page
        }
    }, [state.installed, state.selectedOrg, router]);

    const handleConnect = async () => {
        // Use the smart installation logic
        await installApp();
    };

    const handleManualConnect = () => {
        if (!manualId) return;
        // We set the org to "Loading..." initially, the real name will come from fetchOrgData
        selectOrg("Loading...", parseInt(manualId));
        setTimeout(() => {
            // Give state a moment to update then fetch
            fetchOrgData(true);
            router.push("/");
        }, 100);
    };

    // Show loading while checking installations
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="hero-glow fixed inset-0 pointer-events-none" />
                <div className="relative text-center glass-card p-8 max-w-md">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-foreground mb-2">
                        Checking installations...
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Please wait while we check your GitHub app installations.
                    </p>
                </div>
            </div>
        );
    }

    // If we have installations but none selected, show the organization selector
    if (state.installationStatus === 'installed' && state.installations.length > 0 && !state.selectedOrg) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="hero-glow fixed inset-0 pointer-events-none" />
                <OrganizationSelector />
            </div>
        );
    }

    // If no installations found, show the main connect page
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="hero-glow fixed inset-0 pointer-events-none" />

            <div className="relative w-full max-w-2xl">
                {/* Logo and heading */}
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 mb-6 animate-glow">
                        <Github className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
                        Stop managing your GitHub <br /> organization in the dark.
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                        A state-of-the-art, stateless dashboard for maintainers who care about <span className="text-primary font-medium">Security</span>, <span className="text-success font-medium">Readability</span>, and <span className="text-foreground font-medium">Fairness</span>.
                    </p>
                </div>

                {/* Main card */}
                <div className="glass-card p-8 animate-fade-in shadow-2xl border-primary/10" style={{ animationDelay: "0.1s" }}>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div className="p-4 rounded-lg bg-secondary/20 border border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-5 w-5 text-primary" />
                                <h3 className="font-semibold text-foreground">Real-time Security</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">Live scanning of Dependabot, Secrets, and Code Scanning alerts in one view.</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/20 border border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="h-5 w-5 text-success" />
                                <h3 className="font-semibold text-foreground">Fair Ranking</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">A custom algorithm that rewards Pull Requests and Reviews—not just raw commits.</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/20 border border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                                <Lock className="h-5 w-5 text-warning" />
                                <h3 className="font-semibold text-foreground">Privacy-First</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">Stateless. No database. No stored tokens. Your data never leaves your session.</p>
                        </div>
                        <div className="p-4 rounded-lg bg-secondary/20 border border-border/50">
                            <div className="flex items-center gap-2 mb-2">
                                <ArrowRight className="h-5 w-5 text-purple-400" />
                                <h3 className="font-semibold text-foreground">High-Altitude View</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">Get a clear, filtered overview of 50+ repositories in seconds.</p>
                        </div>
                    </div>

                    {/* Connect button */}
                    <div className="text-center">
                        <Button onClick={handleConnect} variant="glow" size="lg" className="w-full md:w-auto min-w-[300px] h-12 text-base group mb-6">
                            <Github className="h-5 w-5 mr-2" />
                            Scan My Organization
                            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or verify manually</span>
                        </div>
                    </div>

                    {!showManualInput ? (
                        <div className="text-center">
                            <Button 
                                variant="outline" 
                                onClick={() => setShowManualInput(true)}
                                className="w-full md:w-auto"
                            >
                                Enter Installation ID Manually
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-2 max-w-sm mx-auto">
                            <Input
                                placeholder="Installation ID"
                                value={manualId}
                                onChange={(e) => setManualId(e.target.value)}
                                className="bg-secondary/50"
                            />
                            <Button variant="secondary" onClick={handleManualConnect} disabled={!manualId}>
                                Go
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-xs text-muted-foreground text-center mt-6 animate-fade-in" style={{ animationDelay: "0.5s" }}>
                    Built for the Open Source Community
                </p>
            </div>
        </div>
    );
}
