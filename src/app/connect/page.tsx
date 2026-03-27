"use client";

import {
    Github,
    Shield,
    Lock,
    Zap,
    ArrowRight,
    Loader2,
    XCircle,
    Building2,
    Globe,
    BarChart3,
    Cpu,
    ShieldCheck,
    Container,
    LayoutDashboard,
    ArrowDown,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { OrganizationSelector } from "@/components/OrganizationSelector";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const stats = [
    { value: "100+", label: "Repos monitored" },
    { value: "50+", label: "Members tracked" },
    { value: "3", label: "Alert types unified" },
    { value: "0", label: "Data stored" },
];

const enterpriseFeatures = [
    {
        icon: ShieldCheck,
        title: "One tab. All your security.",
        description: "GitHub spreads Dependabot alerts, secret scanning and code scanning across 3 different tabs. Kordian aggregates all 3 alert types across every repo in your org — one view, zero tab switching.",
        badge: "vs GitHub native",
        metrics: ["Dependabot Alerts", "Secret Scanning", "Code Scanning"],
        color: "text-cyan-400",
        borderColor: "border-cyan-500/20",
        bgColor: "bg-cyan-500/5",
    },
    {
        icon: BarChart3,
        title: "Who's actually contributing?",
        description: "Track commits, pull requests and code reviews across all 50+ members of your organization. Ranked by real impact — not raw commit count. Know who's driving velocity and who's blocked.",
        badge: "50+ members",
        metrics: ["PR Contributions", "Code Reviews", "Commit Velocity"],
        color: "text-blue-400",
        borderColor: "border-blue-500/20",
        bgColor: "bg-blue-500/5",
    },
    {
        icon: Lock,
        title: "Your data never leaves.",
        description: "No backend. No database. No token storage. Kordian runs entirely in your browser session — everything is ephemeral. When you close the tab, nothing persists. GDPR compliant by architecture.",
        badge: "Zero retention",
        metrics: ["No Database", "No Token Storage", "Browser Only"],
        color: "text-purple-400",
        borderColor: "border-purple-500/20",
        bgColor: "bg-purple-500/5",
    },
    {
        icon: LayoutDashboard,
        title: "Built for leaders, not devs.",
        description: "CTOs, CISOs and Engineering Directors need org-wide visibility — not per-repo details. Kordian gives you the executive view across 100+ repositories with health scores, risk ratings and team rankings.",
        badge: "Executive view",
        metrics: ["Health Scores", "Risk Ratings", "Team Rankings"],
        color: "text-indigo-400",
        borderColor: "border-indigo-500/20",
        bgColor: "bg-indigo-500/5",
    },
];

const getErrorDescription = (error: string) => {
    const errorMessages: Record<string, string> = {
        'missing_credentials': 'GitHub environment variables not provisioned.',
        'token_exchange_failed': 'Secure handshake with GitHub Enterprise failed.',
        'no_access_token': 'Identity provider rejected request. Check permissions.',
        'user_info_failed': 'Failed to resolve organization metadata.',
        'installations_failed': 'Could not discover existing installations.',
        'orgs_failed': 'Organization index inaccessible. Verify token scopes.',
        'invalid_token': 'Authentication session expired. Re-handshake required.',
        'server_error': 'Internal protocol error. Engineering has been alerted.',
        'no_code': 'Missing authorization code from GitHub callback.',
        'access_denied': 'Access denied. Required: read:org, read:repo.',
        'default': 'System connection error. Please initialize again.'
    };
    return errorMessages[error] || errorMessages.default;
};

export default function Page() {
    const router = useRouter();
    const { state, selectOrg, fetchOrgData, installApp, installToOrganization, isLoading, getUserInstallations, loadingStates } = useGitHubApp();
    const [manualId, setManualId] = useState("");
    const [showManualInput, setShowManualInput] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        if (error) {
            setAuthError(error);
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    useEffect(() => {
        if (state.installed && state.selectedOrg && !isConnecting && !isRedirecting) {
            setIsRedirecting(true);
            router.push("/");
        }
    }, [state.installed, state.selectedOrg, router, isConnecting, isRedirecting]);

    const handleConnect = async () => {
        setIsConnecting(true);
        await installApp();
    };

    const handleManualConnect = () => {
        if (!manualId) return;
        selectOrg("Loading...", parseInt(manualId));
        setTimeout(() => {
            fetchOrgData(true);
            router.push("/");
        }, 100);
    };

    if (isLoading || loadingStates.fetchingOrgData) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(6,182,212,0.08),transparent)]" />
                <div className="relative text-center glass-card p-12 max-w-md border-cyan-500/20 shadow-2xl shadow-cyan-500/5">
                    <div className="relative mb-8 flex justify-center">
                        <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full" />
                        <Loader2 className="h-12 w-12 animate-spin text-cyan-400 relative z-10" />
                    </div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight mb-3">
                        {isConnecting ? 'Initializing Handshake' :
                            loadingStates.fetchingOrgData ? 'Synchronizing Data' :
                                'Verifying Identity'}
                    </h2>
                    <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                        {isConnecting
                            ? 'Establishing secure connection with your GitHub infrastructure.'
                            : loadingStates.fetchingOrgData
                                ? 'Parsing repository metadata and security audit logs.'
                                : 'Mapping existing GitHub App installations.'
                        }
                    </p>
                </div>
            </div>
        );
    }

    if (state.installationStatus === 'installed' && state.installations.length > 0 && !state.selectedOrg) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden no-scrollbar overflow-y-auto">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,rgba(6,182,212,0.08),transparent)]" />
                <div className="relative w-full py-12">
                    <OrganizationSelector />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col relative overflow-x-hidden no-scrollbar">

            {/* ── Background atmosphere ── */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(6,182,212,0.1),transparent)]" />
                <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-cyan-500/3 rounded-full blur-[140px]" />
                <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-blue-500/3 rounded-full blur-[120px]" />
                {/* Subtle grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px]" />
            </div>

            {/* ── TOP NAV BAR ── */}
            <nav className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                        <img src="/icon.png" alt="logo" className="h-8 w-8" />
                    </div>
                    <span className="font-black text-white text-lg tracking-tight">kordian</span>
                </div>
                <div className="hidden md:flex items-center gap-6 text-[11px] font-black uppercase tracking-widest text-muted-foreground/50">
                    <span className="flex items-center gap-1.5"><Shield className="h-3 w-3" /> SOC2</span>
                    <span className="flex items-center gap-1.5"><Globe className="h-3 w-3" /> GDPR</span>
                    <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> Zero Retention</span>
                </div>
                {/* CTA in nav — always visible */}
                <Button
                    onClick={handleConnect}
                    disabled={isConnecting || isLoading}
                    className="h-9 px-5 text-xs font-black uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl transition-all hover:scale-105 active:scale-95 gap-2 shadow-lg shadow-cyan-500/20"
                >
                    {isConnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Github className="h-3.5 w-3.5" />}
                    Connect
                </Button>
            </nav>

            {/* ── HERO ── */}
            <div className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-16 md:pt-28 md:pb-20">

                {/* Eyebrow label */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-8">
                    <Sparkles className="h-3 w-3" />
                    Free · Open Source · Stateless
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.88] text-balance max-w-4xl mb-6">
                    Stop switching tabs.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 italic">
                        See everything.
                    </span>
                </h1>

                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed mb-10">
                    GitHub spreads your org's security alerts, contributor data and repo health across dozens of tabs. Kordian brings it all into one stateless dashboard — built for CTOs, CISOs and Engineering Directors.
                </p>

                {/* Stats bar */}
                <div className="flex flex-wrap items-center justify-center gap-8 mb-10 py-6 px-8 rounded-2xl border border-white/5 bg-white/[0.02]">
                    {stats.map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-2xl font-black text-cyan-400 leading-none">{stat.value}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* PRIMARY CTA — big, central, impossible to miss */}
                <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                    <Button
                        onClick={handleConnect}
                        disabled={isConnecting || isLoading || loadingStates.fetchingOrgData}
                        className="w-full h-16 text-base font-black uppercase tracking-wider rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black transition-all hover:scale-[1.02] active:scale-95 gap-3 shadow-2xl shadow-cyan-500/25 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/10 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        {isConnecting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Connecting...
                            </>
                        ) : (
                            <>
                                <Github className="h-5 w-5" />
                                Connect with GitHub
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </>
                        )}
                    </Button>
                    <p className="text-[10px] text-muted-foreground/50 font-black uppercase tracking-widest">
                        Read-only access · No code stored · Free forever
                    </p>
                </div>

                {/* Scroll hint */}
                <div className="mt-16 flex flex-col items-center gap-2 text-muted-foreground/30 animate-bounce">
                    <span className="text-[9px] font-black uppercase tracking-widest">See what's included</span>
                    <ArrowDown className="h-4 w-4" />
                </div>
            </div>

            {/* ── ERROR BANNER ── */}
            {authError && (
                <div className="relative z-10 px-6 md:px-12 mb-8 max-w-3xl mx-auto w-full">
                    <Alert className="border-destructive/30 bg-destructive/5 backdrop-blur-xl rounded-2xl p-5">
                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-between w-full">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-destructive/10 rounded-lg shrink-0">
                                    <XCircle className="h-5 w-5 text-destructive" />
                                </div>
                                <div>
                                    <h4 className="font-black text-foreground text-sm tracking-tight">Connection Failed</h4>
                                    <p className="text-muted-foreground text-xs font-medium">{getErrorDescription(authError)}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <Button variant="outline" size="sm" onClick={handleConnect} className="h-9 px-4 rounded-xl border-destructive/20 text-destructive hover:bg-destructive text-xs">
                                    Retry
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setAuthError(null)} className="h-9 px-3 text-muted-foreground text-xs">
                                    Dismiss
                                </Button>
                            </div>
                        </div>
                    </Alert>
                </div>
            )}

            {/* ── FEATURES GRID ── */}
            <div className="relative z-10 px-6 md:px-12 pb-16 max-w-6xl mx-auto w-full">

                {/* Section label */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">What you get</span>
                    <div className="h-px flex-1 bg-white/5" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {enterpriseFeatures.map((feature, index) => (
                        <div
                            key={index}
                            className={`group relative rounded-2xl border ${feature.borderColor} ${feature.bgColor} p-7 overflow-hidden transition-all duration-300 hover:border-opacity-40 hover:scale-[1.01] animate-fade-in`}
                            style={{ animationDelay: `${0.1 * index}s` }}
                        >
                            {/* Decorative bg icon */}
                            <div className="absolute -right-6 -bottom-6 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                                <feature.icon className="h-32 w-32" />
                            </div>

                            <div className="flex items-start justify-between mb-5 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-xl border ${feature.borderColor} bg-black/30 ${feature.color} group-hover:scale-110 transition-transform`}>
                                        <feature.icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-base font-black text-white tracking-tight">{feature.title}</h3>
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${feature.borderColor} ${feature.color} bg-black/20`}>
                                    {feature.badge}
                                </span>
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed mb-5 relative z-10">
                                {feature.description}
                            </p>

                            <div className="flex flex-wrap gap-2 relative z-10">
                                {feature.metrics.map((metric, i) => (
                                    <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/5 text-white/40 border border-white/5 flex items-center gap-1.5">
                                        <Zap className={`h-2.5 w-2.5 ${feature.color}`} />
                                        {metric}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── BOTTOM CTA SECTION — can't miss it ── */}
            <div className="relative z-10 px-6 md:px-12 pb-24 max-w-2xl mx-auto w-full text-center">
                <div className="rounded-3xl border border-cyan-500/15 bg-cyan-500/5 p-10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08),transparent_70%)]" />
                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">
                            Your org deserves better visibility.
                        </h2>
                        <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
                            Connect in 30 seconds. Monitor 100+ repos, track 50+ members, unify 3 alert types — without storing a single byte of your data.
                        </p>
                        <Button
                            onClick={handleConnect}
                            disabled={isConnecting || isLoading || loadingStates.fetchingOrgData}
                            className="h-14 px-10 text-sm font-black uppercase tracking-wider rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black transition-all hover:scale-105 active:scale-95 gap-3 shadow-xl shadow-cyan-500/20 group"
                        >
                            {isConnecting ? (
                                <><Loader2 className="h-4 w-4 animate-spin" /> Connecting...</>
                            ) : (
                                <><Github className="h-4 w-4" /> Connect GitHub Organization <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                            )}
                        </Button>

                        {/* Manual install link */}
                        <div className="mt-6">
                            <button
                                onClick={() => setShowManualInput(!showManualInput)}
                                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-cyan-400 transition-colors underline underline-offset-4"
                            >
                                Developer Manual Installation
                            </button>
                            {showManualInput && (
                                <div className="mt-4 flex gap-2 max-w-sm mx-auto">
                                    <Input
                                        type="text"
                                        placeholder="GH_INSTALLATION_ID"
                                        value={manualId}
                                        onChange={(e) => setManualId(e.target.value)}
                                        className="h-11 bg-white/5 border-white/10 focus:border-cyan-500/50 rounded-xl font-mono text-sm text-white"
                                    />
                                    <Button
                                        onClick={handleManualConnect}
                                        className="h-11 w-11 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black p-0 shrink-0"
                                    >
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer trust signals */}
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-10 text-[9px] font-black uppercase tracking-widest text-muted-foreground/25">
                    <span className="flex items-center gap-2"><Cpu className="h-3 w-3" /> Edge Validated</span>
                    <span className="flex items-center gap-2"><Container className="h-3 w-3" /> Isolated Runtime</span>
                    <span className="flex items-center gap-2"><ShieldCheck className="h-3 w-3" /> Tier 1 Encryption</span>
                </div>
            </div>
        </div>
    );
}