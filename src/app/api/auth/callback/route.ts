import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/connect?error=${error}`);
    }
    
    if (!code) {
      console.error('No code received from OAuth');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/connect?error=no_code`);
    }
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    
    if (!tokenData.access_token) {
      console.error('Failed to get access token:', tokenData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/connect?error=token_failed`);
    }
    
    // Get user info and installations
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    
    const userData = await userResponse.json();
    
    // Get user installations
    const installationsResponse = await fetch('https://api.github.com/user/installations', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    const installationsData = await installationsResponse.json();
    
    // Redirect to the callback page with the data as query params
    // The page will handle the data via the context
    const callbackUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/callback`);
    callbackUrl.searchParams.set('token', tokenData.access_token);
    callbackUrl.searchParams.set('user', JSON.stringify(userData));
    callbackUrl.searchParams.set('installations', JSON.stringify(installationsData.installations || []));
    
    return NextResponse.redirect(callbackUrl.toString());
    
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/connect?error=server_error`);
  }
}
