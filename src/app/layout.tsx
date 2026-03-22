import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { UserMenu } from "@/components/auth/user-menu";
import { CommandPalette } from "@/components/layout/command-palette";
import { ThemeProvider } from "@/components/providers/theme-provider";

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
  const auth = await getAuthenticatedUser();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <CommandPalette />
          <header className="border-b border-brand-pink/30 bg-white">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
              <Link href="/" className="text-sm font-bold text-brand-dark">
                GrowKeeper
              </Link>
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
