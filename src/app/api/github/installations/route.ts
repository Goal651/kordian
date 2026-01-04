import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
  }
  
  try {
    const [type, token] = authHeader.split(' ');
    
    if (type !== 'Bearer' || !token) {
      return NextResponse.json({ error: 'Invalid authorization' }, { status: 401 });
    }
    
    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const userData = await userResponse.json();
    
    // Get installations
    const installationsResponse = await fetch('https://api.github.com/user/installations', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    const installationsData = await installationsResponse.json();
    
    return NextResponse.json({
      user: userData,
      installations: installationsData.installations || [],
    });
    
  } catch (error) {
    console.error('Installations error:', error);
    return NextResponse.json({ error: 'Failed to fetch installations' }, { status: 500 });
  }
}
