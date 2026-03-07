"use client";

import { Moon, Sun } from "lucide-react";
import { useGitHubApp } from "@/hooks/useGitHubAuth";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function ThemeToggle() {
    const { state, setState } = useGitHubApp();
    const isDark = state.theme === 'dark';

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDark]);

    const toggleTheme = () => {
        const newTheme = isDark ? 'light' : 'dark';
        setState(prev => ({ ...prev, theme: newTheme }));
        localStorage.setItem('nexus_theme', newTheme);
    };

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="glass-card-medium border-border/50 hover:border-primary/30 w-10 h-10 rounded-full transition-all duration-300"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            {isDark ? (
                <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
            ) : (
                <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
