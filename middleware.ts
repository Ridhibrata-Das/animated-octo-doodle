import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard', '/games', '/practice', '/leaderboard', '/history', '/profile'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p));

  if (!isProtected) return NextResponse.next();

  // Check for Firebase auth session cookie (set by client on sign-in)
  const authCookie = request.cookies.get('eng-app-auth');
  if (!authCookie?.value) {
    const loginUrl = new URL('/', request.url);
    // You can optionally add a hash or search param to trigger a popup on the homepage
    // loginUrl.searchParams.set('login_intent', 'true');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icon|apple-icon).*)'],
};
