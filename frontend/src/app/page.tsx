import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Video,
  BrainCircuit,
  Search,
  GraduationCap,
  Building2,
  ChevronRight,
  BarChart3,
  BadgeCheck,
  Users,
  Bot,
  LockKeyhole,
  Award,
  FileText,
} from "lucide-react";
import type { ReactNode } from "react";

export default function HomePage() {
  const bestCourses = [
    { title: "AI-Powered Teaching Toolkit", org: "Daffodil Smart Academy", level: "Professional", href: "/catalog/ai-instructor-studio" },
    { title: "BRAC Data Science Foundation", org: "BRAC Learning Center", level: "Standard", href: "/catalog/data-analytics-with-excel" },
    { title: "Cybersecurity for University Labs", org: "Tepantor Institute", level: "Professional", href: "/catalog/compliance-excellence-bootcamp" },
    { title: "MERN Bootcamp for Job Readiness", org: "Dhaka Skill Hub", level: "Basic+", href: "/catalog/full-stack-web-development" },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_12%_18%,rgba(14,165,233,0.2),transparent_32%),radial-gradient(circle_at_86%_12%,rgba(245,158,11,0.22),transparent_30%),linear-gradient(135deg,#f8fafc_0%,#eef2ff_46%,#ecfeff_100%)] dark:bg-[radial-gradient(circle_at_12%_18%,rgba(59,130,246,0.22),transparent_34%),radial-gradient(circle_at_86%_12%,rgba(245,158,11,0.15),transparent_32%),linear-gradient(135deg,#0b1220_0%,#111b34_46%,#121a2d_100%)]">
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl dark:bg-cyan-500/20" />
      <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-amber-300/30 blur-3xl dark:bg-amber-400/20" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-16 sm:px-10">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              Smart LMS Platform
            </p>
            <h1 className="mt-6 font-serif text-5xl leading-[0.95] text-slate-900 dark:text-slate-100 sm:text-6xl">
              Learn faster.
              <br />
              Teach smarter.
              <br />
              Scale beautifully.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              A complete multi-tenant LMS with modern course delivery, AI-assisted assessments, live classes, and compliance-ready reporting.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <DynamicButton href="/login" variant="primary" label="Launch Dashboard" icon={<ArrowRight className="h-4 w-4" />} />
              <DynamicButton href="/catalog" variant="secondary" label="Explore Courses" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-6 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.45)] backdrop-blur dark:border-slate-700 dark:bg-slate-900/70">
            <div className="grid gap-4 sm:grid-cols-2">
              <FeatureCard href="/teacher/assessments" icon={<BrainCircuit className="h-5 w-5 text-indigo-600" />} title="AI Assessments" body="Generate quizzes, review drafts, and evaluate essays faster." />
              <FeatureCard href="/teacher/live-classes" icon={<Video className="h-5 w-5 text-cyan-600" />} title="Live Classes" body="Run interactive virtual sessions with attendance tracking." />
              <FeatureCard href="/admin/dashboard" icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />} title="Tenant Security" body="Isolated role-based workspaces for admin, teacher, and student." />
              <FeatureCard href="/pricing" icon={<Sparkles className="h-5 w-5 text-amber-600" />} title="Premium UX" body="Clean, responsive, and polished workflow experience." />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-10 sm:px-10">
        <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Search Programs</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100 sm:text-3xl">Search 10,000+ learning programs</h2>
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition duration-300 hover:border-indigo-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-400 dark:hover:bg-slate-800">
            <Search className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Try: Data Science, IELTS, HSC ICT, Software Engineering..."
              className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none dark:text-slate-200 dark:placeholder:text-slate-400"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-10 sm:px-10">
        <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 dark:border-slate-700 dark:bg-slate-900/70 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Popular Categories</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {["Web Development", "AI & ML", "Data Science", "Business", "Design", "Cybersecurity"].map((item) => (
              <Link
                key={item}
                href="/catalog"
                className="rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:bg-slate-700 dark:hover:text-indigo-200"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-10 sm:px-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Best Courses</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100 sm:text-3xl">Top picks for Bangladesh institutes</h2>
          </div>
          <Link href="/catalog" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            View Full Catalog
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {bestCourses.map((course) => (
            <Link
              key={course.title}
              href={course.href}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-400"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{course.org}</p>
              <h3 className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">{course.title}</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Plan fit: {course.level}</p>
              <p className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
                Open course
                <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-10 sm:px-10">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/70 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Student Success</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100 sm:text-3xl">Learners and teachers are getting real results</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { name: "Nusrat Jahan", role: "CSE Student, Daffodil", quote: "AI quiz practice helped me improve midterm score by 18%." },
              { name: "Tanvir Ahmed", role: "Teacher, BRAC Coaching", quote: "Live class attendance is now fully tracked and organized." },
              { name: "Fariha Rahman", role: "BBA Student, Dhaka", quote: "Dashboard progress reports keep me on schedule every week." },
              { name: "Sabbir Hasan", role: "Admin, Tepantor Institute", quote: "Multi-tenant control and role isolation made operations secure." },
            ].map((item) => (
              <article key={item.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">&ldquo;{item.quote}&rdquo;</p>
                <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.role}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-10 sm:px-10">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Pricing Plans</p>
        <h2 className="mt-2 text-center text-2xl font-semibold text-slate-900 dark:text-slate-100 sm:text-3xl">Simple BDT pricing for coaching and university programs</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { name: "Basic", price: "BDT 2,500", note: "Starter for small batches", points: ["Limited AI access", "Live class up to 60", "Core reports"] },
            { name: "Standard", price: "BDT 6,900", note: "Best for growing institutes", points: ["Moderate AI usage", "Live class up to 200", "Advanced analytics"] },
            { name: "Professional", price: "BDT 14,900", note: "Full control for scale", points: ["Full AI suite", "Live class up to 500+", "API access + premium support"] },
          ].map((plan) => (
            <article key={plan.name} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-400">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{plan.name}</h3>
              <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-300">{plan.price}<span className="ml-1 text-sm font-medium text-slate-500 dark:text-slate-400">/month</span></p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{plan.note}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {plan.points.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-600" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <DynamicButton href="/pricing" variant="secondary" label="Choose Plan" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-10 sm:px-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/70 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Platform Benefits</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FeatureCard href="/teacher/assessments" icon={<Bot className="h-5 w-5 text-indigo-600" />} title="AI Assessments" body="AI quiz and assessment workflows for faster teaching." />
            <FeatureCard href="/teacher/live-classes" icon={<Video className="h-5 w-5 text-cyan-600" />} title="Live Classes" body="Interactive classes with attendance and participation tracking." />
            <FeatureCard href="/admin/dashboard" icon={<LockKeyhole className="h-5 w-5 text-emerald-600" />} title="Tenant Security" body="Secure tenant isolation for every institute and workspace." />
            <FeatureCard href="/pricing" icon={<Award className="h-5 w-5 text-amber-600" />} title="Premium UX" body="Polished, responsive UI tailored for modern LMS operations." />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-10 sm:px-10">
        <div className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900/70 md:grid-cols-2 sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Why Choose Smart LMS</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100 sm:text-3xl">Built for Bangladesh coaching and university workflows</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {["Multi-tenant SaaS", "AI-powered learning", "Secure system", "Role-based dashboard"].map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
              Strong points: Multi-tenant LMS, AI quiz and assessment, live class system, role-based dashboards, secure tenant isolation,
              payment with certificate automation, and report-based progress tracking for admin teams.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-12 sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Role-based Features</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100 sm:text-3xl">Every role gets a focused workspace</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <RoleCard href="/admin/dashboard" icon={<Building2 className="h-5 w-5 text-indigo-600" />} title="Admin" points={["Manage users, courses, billing", "Control tenant settings", "Reports and compliance export"]} />
          <RoleCard href="/teacher/dashboard" icon={<GraduationCap className="h-5 w-5 text-cyan-600" />} title="Teacher" points={["Create courses and assignments", "Run live classes", "Track learner progress"]} />
          <RoleCard href="/student/dashboard" icon={<Users className="h-5 w-5 text-emerald-600" />} title="Student" points={["Join classes and submit tasks", "View reports and certificates", "Track personal learning path"]} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-20 sm:px-10">
        <div className="rounded-3xl border border-indigo-200 bg-[linear-gradient(135deg,#1e1b4b,#4338ca,#2563eb)] px-6 py-8 text-white shadow-[0_25px_60px_-30px_rgba(30,27,75,0.8)] sm:px-10 sm:py-10">
          <h2 className="text-2xl font-semibold sm:text-3xl">Start learning smarter today</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-indigo-100">
            Bring your institute, coaching center, or university team into one secure LMS with AI, live classes, payments, certificates, and progress reporting.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <DynamicButton href="/login" variant="ctaSolid" label="Go to Dashboard" />
            <DynamicButton href="/catalog" variant="ctaGhost" label="Explore Courses" />
          </div>
        </div>
      </section>
    </main>
  );
}

function DynamicButton({
  href,
  label,
  variant,
  icon,
}: {
  href: string;
  label: string;
  variant: "primary" | "secondary" | "ctaSolid" | "ctaGhost";
  icon?: ReactNode;
}) {
  const variantClass =
    variant === "primary"
      ? "bg-[linear-gradient(135deg,#4f46e5,#2563eb,#0ea5e9)] text-white shadow-[0_18px_42px_-22px_rgba(37,99,235,0.65)] hover:shadow-[0_22px_52px_-24px_rgba(37,99,235,0.7)]"
      : variant === "secondary"
        ? "border border-slate-300 bg-white/90 text-slate-800 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-500"
        : variant === "ctaSolid"
          ? "bg-white text-indigo-700 hover:bg-indigo-50"
          : "border border-white/40 text-white hover:bg-white/10";

  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition duration-300 hover:-translate-y-0.5 active:translate-y-0 ${variantClass}`}
    >
      {label}
      {icon}
    </Link>
  );
}

function FeatureCard({ href, icon, title, body }: { href: string; icon: ReactNode; title: string; body: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-slate-200 bg-white p-4 transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-400">
      <div className="mb-3 inline-flex rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800">{icon}</div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p>
    </Link>
  );
}

function RoleCard({ href, icon, title, points }: { href: string; icon: ReactNode; title: string; points: string[] }) {
  return (
    <Link href={href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-400">
      <div className="mb-3 inline-flex rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800">{icon}</div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2">
            <BarChart3 className="mt-0.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
            {point}
          </li>
        ))}
      </ul>
    </Link>
  );
}
