import { NextResponse } from 'next/server';

export function middleware(request) {
  // Check if accessing admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to login and setup pages
    if (request.nextUrl.pathname === '/admin/login' || 
        request.nextUrl.pathname === '/admin/setup') {
      return NextResponse.next();
    }

    // Check for admin token
    const token = request.cookies.get('admin-token');
    
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*'
};