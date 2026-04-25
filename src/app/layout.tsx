import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";
import { SiteShell } from "@/components/layout/site-shell";
import { MockLmsProvider } from "@/providers/mock/mock-lms-provider";
import { ThemeProvider } from "@/providers/theme-provider";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces"
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

export const metadata: Metadata = {
  title: "Betopia LMS",
  description: "Premium multi-tenant LMS frontend built with Next.js."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="font-sans">
        <ThemeProvider>
          <MockLmsProvider>
            <SiteShell>{children}</SiteShell>
          </MockLmsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
