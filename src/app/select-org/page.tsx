"use client";

import SelectOrg from "@/legacy-pages/SelectOrg";

import { Suspense } from "react";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SelectOrg />
        </Suspense>
    );
}
