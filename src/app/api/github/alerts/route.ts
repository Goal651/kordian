import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { installationId, endpoint } = await req.json();

        if (!installationId || !endpoint) {
            return NextResponse.json(
                { error: "installationId and endpoint are required" },
                { status: 400 }
            );
        }

        // 1. Get the installation token from our existing token helper or logic
        // For simplicity, we'll re-implement the token exchange here or call the internal token logic
        // But better is to have a shared utility. For now, let's look at how token route does it.
        
        // We actually need the token. Let's redirect to the token route's logic or implement a helper.
        // Actually, the client ALREADY has the token for the duration of the session.
        // But if we want to avoid CORS, we must call from the server.
        // So the server needs to get a token for this installation.
        
        const appId = process.env.GITHUB_APP_ID;
        const privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, "\n");

        if (!appId || !privateKey) {
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const jwt = require('jsonwebtoken');
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            iat: now - 60,
            exp: now + (10 * 60),
            iss: appId,
        };
        const gitHubJwt = jwt.sign(payload, privateKey, { algorithm: "RS256" });

        const tokenRes = await fetch(
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

        if (!tokenRes.ok) {
            return NextResponse.json({ error: "Failed to get installation token" }, { status: 500 });
        }

        const { token } = await tokenRes.json();

        // 2. Proxied call to GitHub
        const githubRes = await fetch(`https://api.github.com${endpoint}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
        });

        const data = await githubRes.json();
        return NextResponse.json(data, { status: githubRes.status });

    } catch (error: any) {
        console.error("Alerts Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal server error", message: error.message },
            { status: 500 }
        );
    }
}
