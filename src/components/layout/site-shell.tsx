import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { FancyRouteTabs, NavigationChrome } from "@/components/layout/navigation-chrome";
import type { HeroStat, Panel } from "@/lib/constants/site-data";

const shellFrame = "mx-auto w-full max-w-[1840px] px-4 sm:px-6 lg:px-8";

type ShellProps = {
  children: ReactNode;
};

type HeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  stats: HeroStat[];
  ctaLabel?: string;
  ctaHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function SiteShell({ children }: ShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-[size:90px_90px] opacity-25" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,rgba(117,190,184,0.2),transparent_52%),radial-gradient(circle_at_18%_18%,rgba(255,246,233,0.82),transparent_32%)]" />
      <div className="relative z-10">
        <NavigationChrome />
        {children}
        <SiteFooter />
      </div>
    </div>
  );
}

export function HeroSection({
  eyebrow,
  title,
  description,
  stats,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref
}: HeroProps) {
  return (
    <section className={`${shellFrame} pb-12 pt-12 md:pb-20 md:pt-16`}>
      <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div className="space-y-6">
          <p className="inline-flex rounded-full border border-foreground/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground shadow-soft">
            {eyebrow}
          </p>
          <h1 className="max-w-4xl font-serif text-5xl leading-[0.95] text-balance md:text-7xl">
            {title}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
            {description}
          </p>

          {(ctaLabel || secondaryLabel) && (
            <div className="flex flex-wrap gap-3 pt-2">
              {ctaLabel && ctaHref ? (
                <Link href={ctaHref} className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-soft transition hover:translate-y-[-1px]">
                  {ctaLabel}
                </Link>
              ) : null}
              {secondaryLabel && secondaryHref ? (
                <Link href={secondaryHref} className="rounded-full border border-foreground/15 px-5 py-3 text-sm font-semibold transition hover:border-foreground/35">
                  {secondaryLabel}
                </Link>
              ) : null}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] border border-white/65 bg-white/80 p-5 shadow-glow backdrop-blur">
          <div className="grid gap-4 sm:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[1.5rem] border border-black/5 bg-background/90 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{stat.label}</p>
                <p className="mt-3 font-serif text-4xl">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function PanelGrid({ panels }: { panels: Panel[] }) {
  return (
    <section className={`${shellFrame} pb-16`}>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {panels.map((panel) => (
          <article
            key={panel.title}
            className={`rounded-[2rem] border p-6 shadow-soft ${
              panel.tone === "accent"
                ? "border-cyan-950/10 bg-cyan-950 text-white"
                : panel.tone === "warm"
                  ? "border-orange-300/35 bg-orange-50"
                  : "border-foreground/10 bg-white/80"
            }`}
          >
            <h2 className="font-serif text-3xl">{panel.title}</h2>
            <p
              className={`mt-4 text-base leading-7 ${
                panel.tone === "accent" ? "text-white/82" : "text-muted-foreground"
              }`}
            >
              {panel.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function DashboardShowcase() {
  return (
    <section className={`${shellFrame} pb-20`}>
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-foreground/10 bg-white/80 p-6 shadow-glow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Live workspace preview</p>
              <h2 className="mt-3 font-serif text-4xl">One product, three role-aware rhythms.</h2>
            </div>
            <div className="rounded-full border border-foreground/10 px-4 py-2 text-sm text-muted-foreground">
              Updated 2 min ago
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.6rem] bg-cyan-950 p-5 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm uppercase tracking-[0.22em] text-white/70">Admin pulse</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs">Healthy</span>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  ["MRR", "$184k"],
                  ["Tenants", "312"],
                  ["Tickets", "92"]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[1.25rem] bg-white/8 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/60">{label}</p>
                    <p className="mt-2 text-2xl font-semibold">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 h-32 rounded-[1.5rem] bg-[linear-gradient(120deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-4">
                <div className="flex h-full items-end gap-3">
                  {[48, 64, 58, 76, 82, 68, 91].map((height, index) => (
                    <div key={index} className="flex-1 rounded-t-full bg-gradient-to-t from-cyan-300 to-white/90" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                ["Teacher queue", "48 submissions need review", "bg-orange-50 border-orange-200/70"],
                ["Student motion", "72% average progress this cohort", "bg-white border-foreground/10"],
                ["Certificates", "1,946 issued this month", "bg-emerald-50 border-emerald-200/70"]
              ].map(([title, body, tone]) => (
                <div key={title} className={`rounded-[1.5rem] border p-5 shadow-soft ${tone}`}>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-stone-950 p-6 text-white shadow-glow">
            <div className="absolute -right-8 top-6 h-36 w-36 rounded-full bg-orange-400/35 blur-3xl" />
            <p className="text-xs uppercase tracking-[0.25em] text-white/60">Brandable product surface</p>
            <h3 className="mt-3 max-w-md font-serif text-4xl">A public-facing experience that still feels premium and operational.</h3>
            <p className="mt-4 max-w-lg text-white/72">
              The homepage, catalog, auth flows, and dashboards now share one design language instead of breaking into unrelated screens.
            </p>
            <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-white/10">
              <Image
                src="/hero-learning-meeting.jpg"
                alt="Students collaborating in a modern learning environment"
                width={1400}
                height={900}
                className="h-72 w-full object-cover"
                priority
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              ["Catalog", "/catalog", "Public discovery"],
              ["Teacher", "/teacher/dashboard", "Delivery workspace"],
              ["Student", "/student/dashboard", "Learner hub"]
            ].map(([label, href, text]) => (
              <Link key={href} href={href} className="rounded-[1.6rem] border border-foreground/10 bg-white/80 p-5 shadow-soft transition hover:-translate-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{text}</p>
                <p className="mt-3 font-serif text-3xl">{label}</p>
                <p className="mt-3 text-sm text-muted-foreground">Open this workspace</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HighlightStrip({
  items
}: {
  items: Array<{ title: string; body: string }>;
}) {
  return (
    <section className={`${shellFrame} pb-16`}>
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((item, index) => (
          <article
            key={item.title}
            className="rounded-[1.8rem] border border-foreground/10 bg-white/75 p-6 shadow-soft backdrop-blur"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">0{index + 1}</p>
            <h2 className="mt-4 font-serif text-3xl">{item.title}</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function RouteLinks({
  title,
  links
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return <FancyRouteTabs title={title} links={links} />;
}

export function SiteFooter() {
  return (
    <footer className="border-t border-foreground/10 bg-cyan-950 text-white">
      <div className="mx-auto grid w-full max-w-[1840px] gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="font-serif text-[2.35rem] leading-none sm:text-[2.75rem]">Betopia LMS</p>
          <p className="mt-5 max-w-lg text-[14px] leading-8 text-cyan-100/84 sm:text-[15px]">
            Multi-tenant SaaS LMS frontend aligned to the SRS: course delivery, AI assessment, live classes,
            compliance reporting, certificates, and subscription billing.
          </p>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <p className="text-[14px] font-semibold uppercase tracking-[0.2em] text-cyan-100/78">Platform</p>
            <div className="mt-5 grid gap-3 text-[14px] leading-7 text-cyan-100/84">
              <Link href="/admin/dashboard" className="transition hover:text-white">Admin Dashboard</Link>
              <Link href="/admin/branding" className="transition hover:text-white">White-label Branding</Link>
              <Link href="/admin/billing" className="transition hover:text-white">Billing</Link>
              <Link href="/admin/audit-logs" className="transition hover:text-white">Audit Logs</Link>
            </div>
          </div>

          <div>
            <p className="text-[14px] font-semibold uppercase tracking-[0.2em] text-cyan-100/78">Learning</p>
            <div className="mt-5 grid gap-3 text-[14px] leading-7 text-cyan-100/84">
              <Link href="/teacher/courses" className="transition hover:text-white">Course Builder</Link>
              <Link href="/teacher/live-classes" className="transition hover:text-white">Live Classroom</Link>
              <Link href="/student/courses" className="transition hover:text-white">Student Courses</Link>
              <Link href="/student/live-classes" className="transition hover:text-white">Student Live Classes</Link>
            </div>
          </div>

          <div>
            <p className="text-[14px] font-semibold uppercase tracking-[0.2em] text-cyan-100/78">AI & Compliance</p>
            <div className="mt-5 grid gap-3 text-[14px] leading-7 text-cyan-100/84">
              <Link href="/teacher/assessments/ai-generate" className="transition hover:text-white">AI Studio</Link>
              <Link href="/teacher/assessments/review" className="transition hover:text-white">Review Queue</Link>
              <Link href="/admin/reports/compliance" className="transition hover:text-white">Compliance Reports</Link>
              <Link href="/admin/certificates" className="transition hover:text-white">Certificates</Link>
            </div>
          </div>

          <div>
            <p className="text-[14px] font-semibold uppercase tracking-[0.2em] text-cyan-100/78">Access</p>
            <div className="mt-5 grid gap-3 text-[14px] leading-7 text-cyan-100/84">
              <Link href="/pricing" className="transition hover:text-white">Pricing</Link>
              <Link href="/catalog" className="transition hover:text-white">Catalog</Link>
              <Link href="/login" className="transition hover:text-white">Login</Link>
              <Link href="/signup" className="transition hover:text-white">Signup</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
