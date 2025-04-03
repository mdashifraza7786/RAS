import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
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
    
    // If there's no token, redirect to login
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
    
    // Check role permission
    const userRole = token.role as string;
    
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