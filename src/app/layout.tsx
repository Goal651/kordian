import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "GitGuard - Security & Productivity Dashboard",
    description: "Monitor your GitHub organization security and productivity",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={cn(inter.className, "overflow-hidden")}>
                {/* Main dot pattern */}
                <div
                    className="fixed inset-0 z-0 pointer-events-none"
                    style={{
                        backgroundImage: `
            radial-gradient(circle at 1px 1px, white 1px, transparent 0),
            radial-gradient(circle at 13px 13px, rgba(255,255,255,0.15) 1px, transparent 0)
        `,
                        backgroundSize: '28px 28px, 56px 56px',
                        opacity: 0.2,
                    }}
                />

                {/* Very subtle radial fade at edges */}
                <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-t from-background via-transparent to-background opacity-40" />
                <Providers>{children}</Providers>
                <Analytics />
            </body>
        </html>
    );
}
