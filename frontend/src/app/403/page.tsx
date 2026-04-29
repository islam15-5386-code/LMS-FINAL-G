"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { dashboardPathForRole, useMockLms } from "@/providers/mock-lms-provider";

export default function ForbiddenPage() {
  const [from, setFrom] = useState<string | null>(null);
  const { currentUser } = useMockLms();
  const dashboardHref = dashboardPathForRole(currentUser?.role);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    setFrom(params.get("from"));
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(232,160,32,0.14),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(26,26,46,0.12),transparent_40%)] px-6 py-16">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-border/70 bg-card/95 p-10 shadow-soft">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">403 Forbidden</p>
        <h1 className="mt-2 font-serif text-4xl text-foreground">Access denied</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          You do not have permission to open this dashboard or page with your current role.
        </p>
        {from ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Attempted path: <span className="font-mono">{from}</span>
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={dashboardHref}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#1A1A2E] to-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white shadow-soft"
          >
            Go to my dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center rounded-full border border-border/70 px-5 py-2.5 text-sm font-semibold text-foreground"
          >
            Switch account
          </Link>
        </div>
      </div>
    </main>
  );
}
