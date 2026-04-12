import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { UserMenu } from "@/components/auth/user-menu";
import { CommandPalette } from "@/components/layout/command-palette";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SyncStatusProvider } from "@/components/providers/sync-status-provider";
import { SyncStatusIndicator } from "@/components/layout/sync-status-indicator";
import { FeedbackButton } from "@/components/feedback/feedback-button";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.name,
  },
  formatDetection: {
    telephone: false,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isEnvReady = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!isEnvReady) {
    return (
      <html lang="en">
        <body className="flex h-screen w-screen items-center justify-center bg-white text-brand-dark p-6">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-2xl font-bold text-red-600">Configuration Error</h1>
            <p className="text-lg font-medium">Backend not connected</p>
            <p className="text-sm text-gray-500">
              Please ensure <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and 
              <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are set in your environment variables.
            </p>
          </div>
        </body>
      </html>
    );
  }

  const auth = await getAuthenticatedUser();

  const isLockdown = process.env.NEXT_PUBLIC_ALPHA_LOCKDOWN === 'true';

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${isLockdown ? 'lockdown overflow-hidden' : ''}`}
      >
        <ThemeProvider>
          <SyncStatusProvider>
            <CommandPalette />
            {/* ENTRANCE HARDENING: Generic header is suppressed in Registry Mode */}
            {!isLockdown && (
              <header className="border-b border-brand-pink/30 bg-white sticky top-0 z-40">
                <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-4">
                    <Link href="/" className="text-sm font-bold text-brand-dark hover:text-brand-pink transition-colors">
                      GrowKeeper
                    </Link>
                    <SyncStatusIndicator />
                  </div>
                  {auth.success ? (
                    <UserMenu email={auth.data.email} />
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-brand-dark/50 font-medium">Not signed in</span>
                      <Link
                        href="/auth"
                        className="rounded-md border border-brand-pink/30 px-3 py-1.5 text-sm font-semibold text-brand-dark/70 hover:bg-brand-pink-light/50 transition-colors"
                      >
                        Sign in
                      </Link>
                    </div>
                  )}
                </div>
              </header>
            )}
            <main className={isLockdown ? "h-screen" : "min-h-[calc(100vh-57px)]"}>
              {children}
            </main>
            {!isLockdown && <FeedbackButton />}
          </SyncStatusProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
