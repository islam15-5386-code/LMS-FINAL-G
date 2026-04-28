"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  BookOpenText,
  ChartNoAxesCombined,
  Compass,
  CreditCard,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogIn,
  MessageSquareQuote,
  MoonStar,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Users
} from "lucide-react";

import { useThemeMode } from "@/providers/theme-provider";
import { dashboardPathForRole, useMockLms } from "@/providers/mock-lms-provider";

type NavLink = {
  href: string;
  label: string;
  note?: string;
  icon?: ReactNode;
};

type RouteTabsProps = {
  title: string;
  links: Array<{ href: string; label: string }>;
};

const marketingLinks: NavLink[] = [
  { href: "/", label: "Home", note: "Overview", icon: <Home className="h-4 w-4" /> },
  { href: "/features", label: "Features", note: "Product", icon: <Sparkles className="h-4 w-4" /> },
  { href: "/pricing", label: "Pricing", note: "Plans", icon: <CreditCard className="h-4 w-4" /> },
  { href: "/catalog", label: "Catalog", note: "Explore", icon: <Compass className="h-4 w-4" /> }
];

const marketingMobileLinks: NavLink[] = [
  { href: "/", label: "Home", icon: <Home className="h-4 w-4" /> },
  { href: "/catalog", label: "Catalog", icon: <Compass className="h-4 w-4" /> },
  { href: "/pricing", label: "Pricing", icon: <CreditCard className="h-4 w-4" /> }
];

const contextualGroups: Array<{
  match: (pathname: string) => boolean;
  label: string;
  links: NavLink[];
}> = [
  {
    match: (pathname) => pathname.startsWith("/admin"),
    label: "Admin lanes",
    links: [
      { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
      { href: "/admin/institute-settings", label: "Institute", icon: <Users className="h-4 w-4" /> },
      { href: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
      { href: "/admin/courses", label: "Courses", icon: <BookOpenText className="h-4 w-4" /> },
      { href: "/admin/enrollments", label: "Enrollments", icon: <GraduationCap className="h-4 w-4" /> },
      { href: "/admin/assessments", label: "Assessments", icon: <Sparkles className="h-4 w-4" /> },
      { href: "/admin/ai-tools", label: "AI Tools", icon: <Sparkles className="h-4 w-4" /> },
      { href: "/admin/live-classes", label: "Live", icon: <PlayCircle className="h-4 w-4" /> },
      { href: "/admin/certificates", label: "Certificates", icon: <ShieldCheck className="h-4 w-4" /> },
  { href: "/admin/reports/compliance", label: "Reports", icon: <ChartNoAxesCombined className="h-4 w-4" /> },
  { href: "/admin/reports/revenue", label: "Revenue", icon: <ChartNoAxesCombined className="h-4 w-4" /> },
      { href: "/admin/payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
      { href: "/admin/billing", label: "Billing", icon: <CreditCard className="h-4 w-4" /> },
      { href: "/admin/audit-logs", label: "Audit", icon: <ShieldCheck className="h-4 w-4" /> }
    ]
  },
  {
    match: (pathname) => pathname.startsWith("/teacher"),
    label: "Teacher lanes",
    links: [
      { href: "/teacher/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
      { href: "/teacher/courses", label: "Courses", icon: <BookOpenText className="h-4 w-4" /> },
      { href: "/teacher/content-uploads", label: "Uploads", icon: <Compass className="h-4 w-4" /> },
      { href: "/teacher/assessments", label: "Assess", icon: <Sparkles className="h-4 w-4" /> },
      { href: "/teacher/assignments", label: "Assignments", icon: <BookOpenText className="h-4 w-4" /> },
      { href: "/teacher/submissions", label: "Submissions", icon: <MessageSquareQuote className="h-4 w-4" /> },
      { href: "/teacher/live-classes", label: "Live", icon: <PlayCircle className="h-4 w-4" /> },
      { href: "/teacher/students", label: "Students", icon: <Users className="h-4 w-4" /> },
      { href: "/teacher/announcements", label: "Announce", icon: <MessageSquareQuote className="h-4 w-4" /> }
    ]
  },
  {
    match: (pathname) => pathname.startsWith("/student"),
    label: "Student lanes",
    links: [
      { href: "/student/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
      { href: "/student/courses", label: "Courses", icon: <BookOpenText className="h-4 w-4" /> },
      { href: "/student/assignments", label: "Tasks", icon: <Sparkles className="h-4 w-4" /> },
      { href: "/student/live-classes", label: "Live", icon: <PlayCircle className="h-4 w-4" /> },
      { href: "/student/certificates", label: "Certificates", icon: <ShieldCheck className="h-4 w-4" /> }
    ]
  },
  {
    match: (pathname) => pathname.startsWith("/catalog"),
    label: "Catalog lanes",
    links: [
      { href: "/catalog/future-of-product-teams", label: "Product Teams", icon: <Sparkles className="h-4 w-4" /> },
      { href: "/catalog/ai-instructor-studio", label: "AI Studio", icon: <GraduationCap className="h-4 w-4" /> },
      { href: "/catalog/compliance-bootcamp", label: "Compliance", icon: <ShieldCheck className="h-4 w-4" /> }
    ]
  },
  {
    match: (pathname) =>
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/forgot-password" ||
      pathname === "/reset-password",
    label: "Auth lanes",
    links: [
      { href: "/login", label: "Login", icon: <LogIn className="h-4 w-4" /> },
      { href: "/signup", label: "Signup", icon: <Sparkles className="h-4 w-4" /> },
      { href: "/forgot-password", label: "Recover", icon: <ShieldCheck className="h-4 w-4" /> }
    ]
  }
];

const defaultContextLinks: NavLink[] = [
  { href: "/teacher/assessments/ai-generate", label: "AI Studio", icon: <Sparkles className="h-4 w-4" /> },
  { href: "/teacher/live-classes", label: "Live Classroom", icon: <PlayCircle className="h-4 w-4" /> },
  { href: "/admin/reports/compliance", label: "Compliance", icon: <ShieldCheck className="h-4 w-4" /> },
  { href: "/admin/certificates", label: "Certificates", icon: <MessageSquareQuote className="h-4 w-4" /> },
  { href: "/admin/billing", label: "Billing", icon: <CreditCard className="h-4 w-4" /> }
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function resolveContextLinks(pathname: string) {
  const match = contextualGroups.find((group) => group.match(pathname));
  if (match) {
    return match;
  }

  return {
    label: "Explore",
    links: defaultContextLinks
  };
}

function NavChip({ link, pathname }: { link: NavLink; pathname: string }) {
  const active = isActive(pathname, link.href);

  return (
    <Link
      href={link.href}
      className={`group relative flex min-h-[3.35rem] min-w-[6.9rem] items-center justify-center overflow-hidden rounded-full border px-3 py-2 text-center transition duration-300 ${
        active
          ? "border-[#E8A020]/30 bg-[#1A1A2E] text-white shadow-glow"
          : "border-white/60 bg-white/72 text-foreground/80 shadow-soft hover:-translate-y-0.5 hover:border-[#E8A020]/50 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
      }`}
    >
      <span
        className={`absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.4),transparent_45%)] transition-opacity ${
          active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />
      <span className="relative flex items-center justify-center gap-2">
        <span className={active ? "text-[#E8A020]" : "text-[#1A1A2E] dark:text-[#E8A020]"}>{link.icon}</span>
        <span className="flex flex-col items-center leading-none">
          <span className="text-sm font-semibold">{link.label}</span>
          {link.note ? (
            <span className={`mt-1 text-[10px] uppercase tracking-[0.22em] ${active ? "text-white/70" : "text-muted-foreground"}`}>
              {link.note}
            </span>
          ) : null}
        </span>
      </span>
    </Link>
  );
}

function DockChip({ link, pathname }: { link: NavLink; pathname: string }) {
  const active = isActive(pathname, link.href);

  return (
    <Link
      href={link.href}
      className={`flex min-w-[3.8rem] flex-col items-center gap-1 rounded-[1.4rem] px-3 py-2 text-[11px] font-medium transition ${
        active
          ? "bg-[#1A1A2E] text-white shadow-glow"
          : "text-foreground/70 hover:bg-white/80 hover:text-foreground dark:hover:bg-white/10"
      }`}
    >
      <span className={active ? "text-[#E8A020]" : "text-[#1A1A2E] dark:text-[#E8A020]"}>{link.icon}</span>
      <span>{link.label}</span>
    </Link>
  );
}

export function NavigationChrome() {
  const pathname = usePathname();
  const router = useRouter();
  const context = resolveContextLinks(pathname);
  const { mounted, theme, toggleTheme } = useThemeMode();
  const { currentUser, authReady, isAuthenticated, signOut } = useMockLms();
  const workspaceHref = isAuthenticated ? dashboardPathForRole(currentUser?.role) : "/login";
  const workspaceLabel =
    currentUser?.role === "teacher" ? "Teacher" : currentUser?.role === "student" ? "Student" : "Admin";
  const primaryLinks = isAuthenticated
    ? [
        ...marketingLinks,
        {
          href: workspaceHref,
          label: workspaceLabel,
          note: currentUser?.role === "teacher" ? "Deliver" : currentUser?.role === "student" ? "Learn" : "Ops",
          icon:
            currentUser?.role === "teacher"
              ? <GraduationCap className="h-4 w-4" />
              : currentUser?.role === "student"
                ? <BookOpenText className="h-4 w-4" />
                : <LayoutDashboard className="h-4 w-4" />
        }
      ]
    : marketingLinks;
  const mobileLinks = isAuthenticated
    ? [
        { href: "/", label: "Home", icon: <Home className="h-4 w-4" /> },
        { href: "/catalog", label: "Catalog", icon: <Compass className="h-4 w-4" /> },
        {
          href: workspaceHref,
          label: workspaceLabel,
          icon:
            currentUser?.role === "teacher"
              ? <GraduationCap className="h-4 w-4" />
              : currentUser?.role === "student"
                ? <BookOpenText className="h-4 w-4" />
                : <LayoutDashboard className="h-4 w-4" />
        }
      ]
    : marketingMobileLinks;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur-2xl dark:border-white/5">
        <div className="mx-auto w-full max-w-[1840px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[1.45rem] bg-[linear-gradient(135deg,#1A1A2E_55%,#E8A020)] text-white shadow-glow">
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.38),transparent_46%)]" />
                <span className="relative font-serif text-lg">SL</span>
              </div>
              <div>
                <p className="font-serif text-xl font-semibold leading-none">Smart LMS</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  <span>Learning platform</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E8A020] shadow-[0_0_16px_rgba(232,160,32,0.7)]" />
                </div>
              </div>
            </Link>

            <div className="hidden flex-1 justify-center xl:flex">
              <nav className="flex flex-wrap items-center gap-2 rounded-full border border-white/70 bg-white/55 p-2 shadow-glow backdrop-blur dark:border-white/10 dark:bg-white/5">
                {primaryLinks.map((link) => (
                  <NavChip key={link.href} link={link} pathname={pathname} />
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-foreground/15 bg-card/80 px-4 text-sm font-semibold text-foreground shadow-soft transition hover:-translate-y-0.5 hover:border-[#E8A020]/60 dark:border-white/10 dark:bg-white/5"
                aria-label={mounted ? `Switch to ${theme === "light" ? "dark" : "light"} mode` : "Toggle theme"}
              >
                {mounted && theme === "dark" ? <SunMedium className="h-4 w-4 text-[#E8A020]" /> : <MoonStar className="h-4 w-4 text-[#1A1A2E]" />}
                <span className="hidden sm:inline">{mounted && theme === "dark" ? "Day mode" : "Night mode"}</span>
              </button>
              {authReady && isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => void signOut().then(() => router.replace("/login"))}
                    className="hidden rounded-full border border-foreground/15 bg-card/80 px-4 py-2 text-sm transition hover:-translate-y-0.5 hover:border-[#E8A020]/60 md:inline-flex dark:border-white/10 dark:bg-white/5"
                  >
                    Sign out
                  </button>
                  <Link
                    href={workspaceHref}
                    className="hidden rounded-full border border-foreground/15 bg-card/80 px-4 py-2 text-sm transition hover:-translate-y-0.5 hover:border-[#E8A020]/60 md:inline-flex dark:border-white/10 dark:bg-white/5"
                  >
                    {currentUser?.name}
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  className="hidden rounded-full border border-foreground/15 bg-card/80 px-4 py-2 text-sm transition hover:-translate-y-0.5 hover:border-[#E8A020]/60 md:inline-flex dark:border-white/10 dark:bg-white/5"
                >
                  Sign in
                </Link>
              )}
              <Link
                href="/demo"
                className="rounded-full bg-[linear-gradient(135deg,#1A1A2E,#E8A020)] px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
              >
                Book demo
              </Link>
            </div>
          </div>

          <div className="mt-4 hidden xl:block">
            <div className="flex items-center gap-3 overflow-x-auto rounded-[1.75rem] border border-white/60 bg-white/60 p-3 shadow-soft backdrop-blur dark:border-white/10 dark:bg-white/5">
              <div className="shrink-0 rounded-full bg-[#1A1A2E] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-[#E8A020]">
                {context.label}
              </div>
              <div className="flex min-w-max items-center gap-2">
                {context.links.map((link) => (
                  <NavChip key={link.href} link={link} pathname={pathname} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="fixed inset-x-0 bottom-4 z-40 px-4 xl:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between rounded-[1.9rem] border border-white/70 bg-white/80 p-2 shadow-glow backdrop-blur-2xl dark:border-white/10 dark:bg-white/10">
          {mobileLinks.map((link) => (
            <DockChip key={link.href} link={link} pathname={pathname} />
          ))}
        </div>
      </div>
    </>
  );
}

export function FancyRouteTabs({ title, links }: RouteTabsProps) {
  const pathname = usePathname();

  return (
    <section className="mx-auto w-full max-w-[1840px] px-4 pb-24 sm:px-6 xl:pb-20 lg:px-8">
      <div className="relative overflow-hidden rounded-[2.2rem] border border-foreground/10 bg-white/78 p-6 shadow-glow backdrop-blur dark:border-white/8 dark:bg-[#13212a]/90">
        <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,rgba(23,126,137,0.18),transparent_48%),radial-gradient(circle_at_top_right,rgba(255,122,0,0.14),transparent_34%)]" />
        <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Dynamic route tabs</p>
            <h2 className="mt-3 font-serif text-4xl">{title}</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            These tabs now respond to the current route, keep the active destination visually pinned, and are much easier to scan on both desktop and mobile.
          </p>
        </div>

        <div className="mt-8 flex gap-3 overflow-x-auto pb-2">
          {links.map((link, index) => {
            const active = isActive(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative min-w-[15rem] flex-1 overflow-hidden rounded-[1.7rem] border px-5 py-5 transition duration-300 ${
                  active
                    ? "border-[#E8A020]/30 bg-[#1A1A2E] text-white shadow-glow"
                    : "border-foreground/10 bg-background/90 shadow-soft hover:-translate-y-1 hover:border-[#E8A020]/50 hover:bg-white dark:border-white/8 dark:bg-white/5 dark:hover:bg-white/10"
                }`}
              >
                <div
                  className={`absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.3),transparent_38%)] transition-opacity ${
                    active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-[10px] uppercase tracking-[0.24em] ${active ? "text-white/70" : "text-muted-foreground"}`}>
                      Tab {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-3 font-serif text-2xl leading-none">{link.label}</p>
                    <p className={`mt-4 text-sm ${active ? "text-white/80" : "text-muted-foreground"}`}>
                      {link.href}
                    </p>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em] ${
                      active ? "bg-white/12 text-white" : "bg-[#1A1A2E]/6 text-[#1A1A2E]"
                    }`}
                  >
                    {active ? "Active" : "Open"}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
