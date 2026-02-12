import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { cn } from "@/lib/utils";

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
                <div
                    className="fixed inset-0 z-0"
                    style={{
                        backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.6) 1px, transparent 2px)`,
                        backgroundSize: '40px 40px',
                        opacity: 0.1,
                    }}
                />
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
