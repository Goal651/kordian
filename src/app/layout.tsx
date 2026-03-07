import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Nexus - Security & Productivity Dashboard",
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
                <Providers>{children}</Providers>
                <Analytics />
            </body>
        </html>
    );
}
