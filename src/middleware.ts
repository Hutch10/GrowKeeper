import { updateSession } from '@/lib/supabase-middleware';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 1. Alpha Lockdown Logic
  const isAlphaLockdown = process.env.NEXT_PUBLIC_ALPHA_LOCKDOWN === 'true';
  const { pathname } = request.nextUrl;

  if (isAlphaLockdown) {
    // Core Allowed Routes
    const isAllowed = 
      pathname === '/' ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/plants') ||
      pathname.startsWith('/tasks') ||
      pathname.startsWith('/reminders') ||
      pathname.startsWith('/settings');

    // System/Asset bypasses (API, static assets, etc.)
    const isSystem = 
      pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/manifest.json');

    if (!isAllowed && !isSystem) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.searchParams.set('notice', 'alpha_locked');
      return NextResponse.redirect(url);
    }
  }

  // 2. Standard Supabase Session Update
  const response = await updateSession(request);

  // Security Headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  // ALLOW CAMERA for AR HUD
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(self), hid=(self)');

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com", // 'unsafe-eval' required for some TFJS builds, 'unsafe-inline' for dev-mode
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    "connect-src 'self' blob: data: https://*.supabase.co https://api.open-meteo.com https://api.openai.com wss://y-webrtc-signaling-eu.herokuapp.com wss://y-webrtc-signaling-us.herokuapp.com wss://y-webrtc-signaling.p-p.dev",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "upgrade-insecure-requests",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
