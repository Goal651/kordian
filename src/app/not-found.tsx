"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function NotFound() {
    const pathname = usePathname();

    useEffect(() => {
        console.error("404 Error: User attempted to access non-existent route:", pathname);
    }, [pathname]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="text-center glass-card p-12">
                <h1 className="mb-4 text-6xl font-bold gradient-text">404</h1>
                <p className="mb-8 text-xl text-muted-foreground">Oops! Page not found</p>
                <Link href="/" className="nav-link inline-flex items-center justify-center border border-primary/20 bg-primary/10 px-6 py-3 rounded-lg hover:bg-primary/20 transition-all">
                    Return to Home
                </Link>
            </div>
        </div>
    );
}
