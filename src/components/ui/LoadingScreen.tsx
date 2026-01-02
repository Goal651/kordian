import { Component, Loader2 } from "lucide-react";

export function LoadingScreen() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background animate-in fade-in duration-500">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-2xl relative z-10">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                </div>
                <div className="text-center space-y-1 mt-4">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">
                        GitGuard
                    </h2>
                    <p className="text-sm text-muted-foreground animate-pulse">
                        Verifying installation...
                    </p>
                </div>
            </div>
        </div>
    );
}
