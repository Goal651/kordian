"use client";

import AuthCallback from "@/legacy-pages/AuthCallback";

import { Suspense } from "react";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthCallback />
        </Suspense>
    );
}
 