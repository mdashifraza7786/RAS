import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Explicitly allow /api/auth/session to pass through without any checks
  if (pathname === '/api/auth/session') {
    return NextResponse.next();
  }
  
  // Public routes that don't require authentication
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/guest' ||
    pathname.startsWith('/guest/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.includes('_next') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next();
  }
  
  // Get the role from the path
  let requiredRole: string | null = null;
  
  if (pathname.startsWith('/manager') || pathname.startsWith('/api/manager')) {
    requiredRole = 'manager';
  } else if (pathname.startsWith('/waiter') || pathname.startsWith('/api/waiter')) {
    requiredRole = 'waiter';
  } else if (pathname.startsWith('/chef') || pathname.startsWith('/api/chef')) {
    requiredRole = 'chef';
  }
  
  // If the path requires a role
  if (requiredRole) {
    // Get the user's session token
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    // For API routes, handle differently (return 401 instead of redirecting)
    if (pathname.startsWith('/api/')) {
      if (!token || token.role !== requiredRole) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.next();
    }
    
    // If there's no token, redirect to login
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
    
    // Check role permission
    const userRole = token.role as string;
    
    // Skip role redirects for subpaths within the same role section
    // Example: If a manager tries to access /manager/tables, don't redirect
    // This prevents the issue where refreshing a subpage redirects to the main page
    if (pathname.startsWith(`/${userRole}/`) || pathname === `/${userRole}`) {
      return NextResponse.next();
    }
    
    // User is trying to access a section they don't have permission for
    if (userRole !== requiredRole) {
      // User doesn't have permission for this route, redirect to their home page
      let redirectPath = '/login';
      
      switch (userRole) {
        case 'manager':
          redirectPath = '/manager';
          break;
        case 'waiter':
          redirectPath = '/waiter';
          break;
        case 'chef':
          redirectPath = '/chef';
          break;
      }
      
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files, api auth routes, and public images
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
}; 