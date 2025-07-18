import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "next-themes";
import { Geist } from "next/font/google";
import Link from "next/link";
import BetWinNotification from "./dashboard/bet-win-notification";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Parlay on Friends",
  description: "Bet on your friends' League of Legends games!",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <Analytics />
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 w-full flex flex-col gap-5 items-center">
              <nav className="w-full flex justify-center border-b border-b-foreground/10 h-20 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
                <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                  <div className="flex gap-5 items-center">
                    <div className="text-2xl tracking-tighter font-bold hover:text-green-500 transition-colors duration-700 ease-in-out">
                      <Link href={"/"}>Parlay on Friends</Link>
                    </div>
                  </div>
                  {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                </div>
              </nav>
              <div className="flex flex-col gap-20 max-w-5xl p-5">
                {children}
              </div>
              <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
                <p>Parlays on Friends © 2025. All Rights Reserved</p>
                <ThemeSwitcher />
              </footer>
            </div>
            <BetWinNotification />
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
