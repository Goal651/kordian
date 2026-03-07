"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Settings,
    Shield,
    Users,
    Bell,
    Moon,
    Info,
    RefreshCw,
    LogOut
} from "lucide-react";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Page() {
    const { state, updateRankingWeights, fetchMembers, disconnect, isLoading } = useGitHubApp();
    const [weights, setWeights] = useState(state.rankingWeights || { prs: 20, reviews: 15, commits: 2 });
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !state.installed) {
            router.push("/connect");
        }
    }, [isLoading, state.installed, router]);

    if (isLoading) return <LoadingScreen />;
    if (!state.installed) return null;

    const handleSaveWeights = () => {
        updateRankingWeights(weights);
        fetchMembers(); 
        toast.success("Ranking algorithm updated successfully!");
    };

    return (
        <DashboardLayout>
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Settings className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                </div>
                <p className="text-muted-foreground">
                    Configure your Nexus environment and ranking algorithms
                </p>
            </div>

            <Tabs defaultValue="ranking" className="space-y-6">
                <TabsList className="bg-secondary/50 p-1">
                    <TabsTrigger value="ranking" className="gap-2">
                        <Users className="h-4 w-4" /> Ranking System
                    </TabsTrigger>
                    <TabsTrigger value="organization" className="gap-2">
                        <Shield className="h-4 w-4" /> Organization
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="gap-2">
                        <Moon className="h-4 w-4" /> Appearance
                    </TabsTrigger>
                </TabsList>

                {/* Ranking System */}
                <TabsContent value="ranking" className="space-y-6">
                    <Card className="glass-card border-none">
                        <CardHeader>
                            <CardTitle>Fair Ranking Algorithm</CardTitle>
                            <CardDescription>
                                Adjust the weight of each contribution type to define your organization's "Fair Ranking".
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Pull Requests Weight</Label>
                                    <span className="text-sm font-mono text-primary">{weights.prs}x</span>
                                </div>
                                <Slider
                                
                                    value={[weights.prs]}
                                    max={50}
                                    step={1}
                                    onValueChange={([v]) => setWeights(prev => ({ ...prev, prs: v }))}
                                />
                                <p className="text-xs text-muted-foreground">Higher weight rewards collaborative work and significant code changes.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Reviews Weight</Label>
                                    <span className="text-sm font-mono text-success">{weights.reviews}x</span>
                                </div>
                                <Slider
                                    value={[weights.reviews]}
                                    max={50}
                                    step={1}
                                    onValueChange={([v]) => setWeights(prev => ({ ...prev, reviews: v }))}
                                />
                                <p className="text-xs text-muted-foreground">Rewards mentoring and code quality maintenance through thorough reviews.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">Commits Weight</Label>
                                    <span className="text-sm font-mono text-warning">{weights.commits}x</span>
                                </div>
                                <Slider
                                    value={[weights.commits]}
                                    max={10}
                                    step={1}
                                    onValueChange={([v]) => setWeights(prev => ({ ...prev, commits: v }))}
                                />
                                <p className="text-xs text-muted-foreground">Standard weight for raw development activity.</p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button onClick={handleSaveWeights} className="gap-2 bg-background text-foreground hover:bg-background/80">
                                    Apply Weights
                                </Button>
                                <Button variant="secondary" className="gap-2 bg-background text-foreground hover:bg-background/80" onClick={() => setWeights({ prs: 20, reviews: 15, commits: 2 })}>
                                    Reset to Defaults
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Organization Details */}
                <TabsContent value="organization">
                    <Card className="glass-card border-none">
                        <CardHeader>
                            <CardTitle>Connection Status</CardTitle>
                            <CardDescription>
                                Details about your GitHub App installation and connected organization.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-secondary/30">
                                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Target Organization</p>
                                    <p className="font-mono text-lg text-primary">{state.selectedOrg || "None"}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-secondary/30">
                                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Installation ID</p>
                                    <p className="font-mono text-lg text-foreground">{state.installationId || "N/A"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                <Info className="h-4 w-4" />
                                <p className="text-xs">Your organization data is temporarily cached in standard secure session storage.</p>
                            </div>

                            <div className="pt-4 border-t border-border flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-foreground">App Connection</p>
                                    <p className="text-xs text-muted-foreground">The GitHub App has access to 50+ members and security endpoints.</p>
                                </div>
                                <Button variant="destructive" className="gap-2" onClick={() => disconnect()}>
                                    <LogOut className="h-4 w-4" /> Disconnect App
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Appearance */}
                <TabsContent value="appearance">
                    <Card className="glass-card border-none">
                        <CardHeader>
                            <CardTitle>Interface Preferences</CardTitle>
                            <CardDescription>
                                Customize how Nexus looks on your screen.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Dark Mode</Label>
                                    <p className="text-sm text-muted-foreground">Enable dark mode for a more comfortable experience.</p>
                                </div>
                                <Switch checked={true} />
                            </div>
                           
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    );
}
