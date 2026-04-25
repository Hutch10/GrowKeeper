import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { getAuthenticatedUser } from "@/lib/auth-server";


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
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3">
            <Link href="/" className="text-sm font-semibold text-slate-900">
              GrowKeeper
            </Link>
            {auth.success ? (
              <span className="text-sm text-slate-600">{auth.data.email}</span>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">Not signed in</span>
                <Link
                  href="/auth"
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
