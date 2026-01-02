import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    try {
        const { installationId } = await req.json();

        if (!installationId) {
            return NextResponse.json(
                { error: "installationId is required" },
                { status: 400 }
            );
        }

        const appId = process.env.GITHUB_APP_ID;
        const privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, "\n");

        if (!appId || !privateKey) {
            console.error("Missing GitHub App configuration (GITHUB_APP_ID or GITHUB_PRIVATE_KEY)");
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        // 1. Generate JWT for the GitHub App
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            iat: now - 60, // Issued 60 seconds ago to account for clock drift
            exp: now + (10 * 60), // Expires in 10 minutes
            iss: appId,
        };

        const gitHubJwt = jwt.sign(payload, privateKey, { algorithm: "RS256" });

        // 2. Exchange JWT for an Installation Access Token
        const res = await fetch(
            `https://api.github.com/app/installations/${installationId}/access_tokens`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${gitHubJwt}`,
                    Accept: "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28",
                },
            }
        );

        if (!res.ok) {
            const errorData = await res.json();
            console.error("GitHub API error:", errorData);
            return NextResponse.json(
                { error: "Failed to exchange token", details: errorData },
                { status: res.status }
            );
        }

        const data = await res.json();

        // 3. Fetch installation details to get the organization name (account name)
        const installationRes = await fetch(
            `https://api.github.com/app/installations/${installationId}`,
            {
                headers: {
                    Authorization: `Bearer ${gitHubJwt}`,
                    Accept: "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28",
                },
            }
        );

        let orgName = null;
        if (installationRes.ok) {
            const installData = await installationRes.json();
            orgName = installData.account?.login;
        }

        return NextResponse.json({
            token: data.token,
            org: orgName
        });
    } catch (error: any) {
        console.error("API Route Error:", error);
        return NextResponse.json(
            { error: "Internal server error", message: error.message },
            { status: 500 }
        );
    }
}
