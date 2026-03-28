import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase-middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (auth callback route)
     * - api/auth/callback (api auth callback route)
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|api/auth/callback).*)",
  ],
};
