"use client";

import Setup from "@/legacy-pages/Setup";

import { Suspense } from "react";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Setup />
        </Suspense>
    );
}
