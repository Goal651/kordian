"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GitHubAppProvider } from "@/hooks/useGitHubAuth";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <GitHubAppProvider>
                    {children}
                    <Toaster />
                    <Sonner />
                </GitHubAppProvider>
            </TooltipProvider>
        </QueryClientProvider>
    );
}
