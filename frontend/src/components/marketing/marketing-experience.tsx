"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Award,
  BookOpen,
  Bot,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Video
} from "lucide-react";
import { useState } from "react";

import {
  planMatrix,
  seatUtilizationPercent,
  type Role
} from "@/lib/mock-lms";
import { dashboardPathForRole, useMockLms } from "@/providers/mock-lms-provider";

import {
  Badge,
  PrimaryButton,
  Section,
  StatCard,
  SelectInput,
  TextInput,
  pageFrame
} from "@/components/shared/lms-core";

const catalogSlugMap: Record<string, string> = {
  "future-of-product-teams": "course-product",
  "ai-instructor-studio": "course-ai",
  "compliance-bootcamp": "course-compliance"
};

const aiStudioFeatures = [
  {
    title: "Upload lecture note input",
    body: "Upload TXT, MD, CSV, PDF, DOC, or DOCX notes now in frontend preview mode, then connect the same flow later to the backend upload endpoint.",
    href: "/teacher/assessments/ai-generate"
  },
  {
    title: "AI question generation queue",
    body: "Generate up to 50 questions from uploaded notes, then move them into the teacher review queue before publishing.",
    href: "/teacher/assessments/review"
  },
  {
    title: "Essay evaluation",
    body: "Students can submit long answers and receive rubric-aligned score plus written feedback in the demo workflow.",
    href: "/student/assessments"
  },
  {
    title: "Fallback question bank",
    body: "If notes are missing or AI is unavailable, generate from the local fallback bank so teachers can continue assessment creation.",
    href: "/teacher/assessments/ai-generate"
  }
];

const roleCards = [
  {
    title: "Admin workspace",
    body: "Branding, billing, compliance, certificates, notifications, and audit logs.",
    href: "/admin/dashboard"
  },
  {
    title: "Teacher workspace",
    body: "Courses, note upload, AI quiz generation, review queue, submissions, and live classes.",
    href: "/teacher/dashboard"
  },
  {
    title: "Student workspace",
    body: "Courses, progress tracking, assessment submission, live classes, and certificates.",
    href: "/student/dashboard"
  }
];

function AuthExperience({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp } = useMockLms();
  const [name, setName] = useState("Test User");
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState<Role>("admin");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const nextPath = searchParams.get("next");

  return (
    <div className={`${pageFrame} grid gap-6 pb-20 pt-10 lg:grid-cols-[1.05fr_0.95fr]`}>
      <Section
        title={
          slug === "signup"
            ? "Create your workspace access"
            : slug === "forgot-password"
              ? "Recover account access"
              : slug === "reset-password"
                ? "Set a new password"
                : "Sign in to Smart LMS"
        }
        subtitle="These authentication screens are wired as workable frontend flows so reviewers can move through the product quickly. Use the seeded demo password `password123`."
      >
        <div className="grid gap-3">
          {slug === "signup" ? (
            <TextInput value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" />
          ) : null}
          <TextInput value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" />
          {slug !== "forgot-password" ? (
            <TextInput type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
          ) : null}
          <SelectInput value={role} onChange={(event) => setRole(event.target.value as Role)}>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </SelectInput>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <PrimaryButton
            onClick={async () => {
              if (slug === "signup") {
                try {
                  setBusy(true);
                  setError("");
                  const user = await signUp(name, email, password, role);
                  router.push(nextPath || dashboardPathForRole(user.role));
                } catch (authError) {
                  setError(authError instanceof Error ? authError.message : "Sign up failed.");
                } finally {
                  setBusy(false);
                }
                return;
              }

              if (slug !== "login") {
                router.push("/login");
                return;
              }

              try {
                setBusy(true);
                setError("");
                const user = await signIn(email, password);
                router.push(nextPath || dashboardPathForRole(user.role));
              } catch (authError) {
                setError(authError instanceof Error ? authError.message : "Sign in failed.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {slug === "signup"
              ? busy
                ? "Creating account..."
                : "Create account"
              : slug === "forgot-password"
                ? "Send recovery email"
                : slug === "reset-password"
                  ? "Save password"
                  : busy
                    ? "Signing in..."
                    : "Continue"}
          </PrimaryButton>
        </div>
      </Section>

      <Section title="Secure access lanes" subtitle="Each user now signs in separately, and dashboards are protected so one role cannot open another role's workspace.">
        <div className="grid gap-3">
          {[
            ["Admin login", "admin@example.com"],
            ["Teacher login", "teacher@example.com"],
            ["Student login", "student@example.com"]
          ].map(([label, value]) => (
            value.startsWith("/") ? (
              <Link key={value} href={value} className="rounded-[1.4rem] border border-foreground/10 bg-white p-4 text-sm font-semibold text-foreground shadow-soft transition hover:-translate-y-0.5 dark:border-white/8 dark:bg-[#13212a]">
                {label}
              </Link>
            ) : (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setEmail(value);
                  setPassword("password123");
                }}
                className="rounded-[1.4rem] border border-foreground/10 bg-white p-4 text-left text-sm font-semibold text-foreground shadow-soft transition hover:-translate-y-0.5 dark:border-white/8 dark:bg-[#13212a]"
              >
                <span className="block">{label}</span>
                <span className="mt-1 block text-xs font-medium text-muted-foreground">{value}</span>
              </button>
            )
          ))}
        </div>
      </Section>
    </div>
  );
}

function PricingExperience() {
  const { state, updatePlan } = useMockLms();

  return (
    <div className={`${pageFrame} pb-20 pt-10`}>
      <Section title="Pricing tier matrix" subtitle="The SRS pricing tiers are implemented directly in the frontend so plan messaging and seat economics can be reviewed in context.">
        <div className="grid gap-4 xl:grid-cols-3">
          {(Object.keys(planMatrix) as Array<keyof typeof planMatrix>).map((plan) => (
            <div key={plan} className={`overflow-hidden rounded-[1.8rem] border p-6 ${state.billing.plan === plan ? "border-[#E8A020]/25 bg-[#1A1A2E] text-white shadow-glow" : "border-foreground/10 bg-white shadow-soft dark:border-white/8 dark:bg-[#13212a]"}`}>
              <p className="text-pretty-wrap font-serif text-[clamp(2.2rem,2.2vw,3rem)] leading-none">{plan}</p>
              <p className={`text-pretty-wrap mt-3 text-sm leading-6 ${state.billing.plan === plan ? "text-white/80" : "text-muted-foreground"}`}>
                ${planMatrix[plan].price}/month · {planMatrix[plan].seatLimit} active students
              </p>
              <div className="mt-6 space-y-2 text-sm">
                <p>Overage fee: ${planMatrix[plan].overagePerSeat}/seat</p>
                <p>Live class capacity: {planMatrix[plan].liveLimit || "No live classrooms"}</p>
                <p>White-label branding: {planMatrix[plan].whiteLabel ? "Included" : "Not included"}</p>
              </div>
              <PrimaryButton className="mt-6 w-full text-center" onClick={() => updatePlan(plan)}>
                {state.billing.plan === plan ? "Current plan" : "Select plan"}
              </PrimaryButton>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function CatalogExperience() {
  const { state } = useMockLms();

  return (
    <div className={`${pageFrame} pb-20 pt-10`}>
      <Section title="Course catalog" subtitle="SRS-aligned public discovery for institutes, corporate training, and tutors.">
        <div className="grid gap-4 xl:grid-cols-3">
          {state.courses.map((course) => {
            const slug = Object.entries(catalogSlugMap).find(([, value]) => value === course.id)?.[0] ?? course.id;

            return (
              <Link key={course.id} href={`/catalog/${slug}`} className="rounded-[1.8rem] border border-foreground/10 bg-white p-6 shadow-soft transition hover:-translate-y-1 dark:border-white/8 dark:bg-[#13212a]">
                <div className="flex items-center justify-between gap-3">
                  <Badge>{course.category}</Badge>
                  <Badge>{course.status}</Badge>
                </div>
                <p className="mt-4 font-serif text-3xl">{course.title}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{course.description}</p>
                <p className="mt-5 text-sm font-semibold text-foreground">${course.price}</p>
              </Link>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

function GenericMarketing({ slug }: { slug: string }) {
  const content: Record<string, { title: string; body: string; cards: Array<{ title: string; body: string }> }> = {
    features: {
      title: "Feature architecture for the Smart LMS",
      body: "The product combines multi-tenant management, course delivery, AI assessments, live classrooms, compliance tracking, certificates, and subscription billing in one frontend.",
      cards: [
        { title: "Multi-tenant provisioning", body: "Branding, subdomain mapping, and role defaults." },
        { title: "AI assessment engine", body: "Generate question banks and evaluate essays with teacher review." },
        { title: "Compliance reporting", body: "Track completion, export evidence, and manage certificates." }
      ]
    },
    solutions: {
      title: "Purpose-built for institutes, corporates, and tutors",
      body: "The SRS clearly targets multiple segments, so the frontend is organized around flexible roles and branded tenant operations.",
      cards: [
        { title: "Educational institutes", body: "Course delivery and AI-assisted assessment at scale." },
        { title: "Corporate training", body: "Compliance reporting, certification, and auditable operations." },
        { title: "Independent tutors", body: "White-label launch, pricing, and learner onboarding." }
      ]
    },
    about: {
      title: "This frontend is now driven by the SRS",
      body: "Instead of placeholder pages, the product surface now reflects the real requirements from your document.",
      cards: [
        { title: "Route coverage", body: "Admin, teacher, student, auth, marketing, and catalog paths." },
        { title: "Interactive state", body: "Mock workflows let reviewers test product behavior immediately." },
        { title: "Backend-ready structure", body: "The UI can later connect to Laravel APIs with minimal route churn." }
      ]
    },
    demo: {
      title: "Interactive product demo",
      body: "Use the admin, teacher, and student routes to simulate the main SRS use cases directly in the browser.",
      cards: [
        { title: "Quiz generation", body: "Teacher uploads notes and generates questions." },
        { title: "Compliance reporting", body: "Admin exports audit-friendly reports." },
        { title: "Certificates", body: "Generate and revoke branded completion records." }
      ]
    },
    contact: {
      title: "Contact and rollout support",
      body: "This route frames implementation support, pricing questions, and enterprise deployment needs.",
      cards: [
        { title: "Implementation support", body: "Tenant setup, migration, and onboarding help." },
        { title: "Pricing advisory", body: "Plan fit and seat forecasting." },
        { title: "Enterprise asks", body: "Compliance, data residency, and white-label governance." }
      ]
    },
    faq: {
      title: "Frequently asked questions",
      body: "The main concerns in the SRS are answered through the working frontend: tenant isolation, AI fallback, live classes, compliance, and billing.",
      cards: [
        { title: "Does it support AI assessments?", body: "Yes. The frontend includes draft generation, review, and grading simulation." },
        { title: "Can admins export compliance data?", body: "Yes. CSV export is functional in the demo." },
        { title: "Can certificates be revoked?", body: "Yes. The certificate register supports revocation." }
      ]
    }
  };

  const page = content[slug];
  if (!page) {
    return <CatalogExperience />;
  }

  return (
    <div className={`${pageFrame} pb-20 pt-10`}>
      <Section title={page.title} subtitle={page.body}>
        <div className="grid gap-4 xl:grid-cols-3">
          {page.cards.map((card) => (
            <div key={card.title} className="rounded-[1.6rem] border border-foreground/10 bg-white p-5 shadow-soft dark:border-white/8 dark:bg-[#13212a]">
              <p className="font-serif text-3xl">{card.title}</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.body}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

export function HomeExperience() {
  const { state, resetDemo } = useMockLms();
  const activeLearners = state.billing.activeStudents;
  const publishedCourses = state.courses.filter((course) => course.status === "published").length;
  const totalLessons = state.courses.reduce((total, course) => total + course.modules.reduce((sum, module) => sum + module.lessons.length, 0), 0);
  const featuredCourses = state.courses.slice(0, 3);
  const featuredCourseImages = [
    "/online-class-desktop.jpg",
    "/online-class-laptop.jpg",
    "/hero-learning-meeting.jpg"
  ];

  return (
    <>
      <section className="relative -mt-px overflow-hidden bg-[#A6ABB5] text-[#111827]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(255,161,10,0.12),transparent_22%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.1),transparent_18%)]" />
        <div className={`${pageFrame} pointer-events-none absolute inset-x-0 top-0 z-20`}>
          <div className="flex justify-end pt-6">
            <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/20 p-1 shadow-soft backdrop-blur">
              <Link
                href="/signup"
                className="rounded-full px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-white/40"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-[#1A1A2E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#111827]"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
        <div className={`${pageFrame} relative grid min-h-[780px] items-center gap-10 pb-28 pt-20 lg:grid-cols-[0.86fr_1.14fr] lg:pb-32 lg:pt-28`}>
          <div className="hero-fade-up mx-auto max-w-2xl space-y-6 lg:mx-0 lg:pl-[9vw]">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/25 px-4 py-2 text-xs font-bold text-[#111827] shadow-soft backdrop-blur">
              <Sparkles className="h-4 w-4 text-[#ffa10a]" />
              Welcome to Smart LMS
            </p>
            <h1 className="max-w-3xl font-serif text-[clamp(3.4rem,6vw,6.5rem)] font-semibold leading-[0.9] text-balance">
              Smart Learning <span className="block text-[#ffa10a]">& Course Growth</span>
            </h1>
            <p className="max-w-xl text-base leading-8 text-[#1f2937] md:text-lg">
              Manage courses, AI assessments, live classes, certificates, and compliance reports from one polished LMS workspace.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                ["AI Assessments", <Bot key="ai" className="h-4 w-4" />],
                ["Live Classes", <Video key="live" className="h-4 w-4" />],
                ["Certificates", <Award key="cert" className="h-4 w-4" />]
              ].map(([label, icon]) => (
                <span key={String(label)} className="inline-flex items-center gap-2 rounded-full bg-white/30 px-4 py-2 text-xs font-semibold text-[#111827] backdrop-blur">
                  <span className="text-[#ffa10a]">{icon}</span>
                  {label}
                </span>
              ))}
            </div>
            <div className="hero-fade-up hero-delay-1 flex flex-wrap gap-3 pt-2">
              <Link href="/admin/dashboard" className="inline-flex items-center justify-center rounded-full bg-[#ffa10a] px-6 py-3 text-sm font-bold text-white shadow-glow transition hover:-translate-y-0.5">
                Dashboard Access
              </Link>
              <Link href="/teacher/assessments/ai-generate" className="inline-flex items-center justify-center rounded-full border border-white/45 bg-white/20 px-6 py-3 text-sm font-bold text-[#111827] transition hover:-translate-y-0.5 hover:bg-white/30">
                AI Studio
              </Link>
              <button type="button" onClick={resetDemo} className="inline-flex items-center justify-center rounded-full border border-white/45 bg-white/20 px-6 py-3 text-sm font-bold text-[#111827] transition hover:-translate-y-0.5 hover:bg-white/30">
                Reset demo
              </button>
            </div>
            <div className="grid max-w-xl grid-cols-3 gap-6 pt-8">
              {[
                ["Active learners", activeLearners],
                ["Published courses", publishedCourses],
                ["Lessons", totalLessons]
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <p className="font-serif text-3xl font-semibold text-[#ffa10a]">{value}+</p>
                  <p className="mt-1 text-xs leading-5 text-[#374151]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden min-h-[560px] lg:block">
            <div className="absolute right-[3%] top-8 grid w-[34rem] grid-cols-2 gap-5">
              <div className="hero-float h-48 overflow-hidden rounded-[24px] shadow-glow">
                <Image src="/online-class-desktop.jpg" alt="Student attending an online class on desktop" width={900} height={620} className="h-full w-full object-cover" priority />
              </div>
              <div className="hero-float hero-delay-2 h-48 overflow-hidden rounded-[24px] shadow-glow">
                <Image src="/online-class-laptop.jpg" alt="Student learning through a laptop video class" width={900} height={620} className="h-full w-full object-cover" />
              </div>
              <div className="hero-float hero-delay-3 col-span-2 h-48 overflow-hidden rounded-[24px] shadow-glow">
                <Image src="/hero-learning-meeting.jpg" alt="Learning platform collaboration" width={1200} height={620} className="h-full w-full object-cover" />
              </div>
            </div>
            <div className="absolute bottom-8 right-[15%] w-80 rounded-[24px] border border-white/35 bg-white/25 p-5 text-[#111827] shadow-glow backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffa10a]">Live platform pulse</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <StatCard label="Assessments" value={String(state.assessments.length)} className="min-h-[6.6rem] bg-white/90 text-[#111827]" />
                <StatCard label="Certificates" value={String(state.certificates.length)} className="min-h-[6.6rem] bg-white/90 text-[#111827]" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-[-1px] h-20 bg-background [clip-path:ellipse(68%_58%_at_50%_100%)]" />
      </section>

      <section className={`${pageFrame} -mt-12 pb-16`}>
        <div className="relative z-10 grid gap-5 md:grid-cols-3">
          {featuredCourses.map((course, index) => (
            <Link key={course.id} href={`/catalog/${Object.entries(catalogSlugMap).find(([, value]) => value === course.id)?.[0] ?? course.id}`} className={`group rounded-[8px] border bg-white p-3 shadow-soft transition hover:-translate-y-1 dark:bg-[#13212a] ${index === 1 ? "border-[#ffa10a]/55" : "border-[#A6ABB5]"}`}>
              <div className="h-40 overflow-hidden rounded-[6px]">
                <Image
                  src={featuredCourseImages[index] ?? "/hero-learning-meeting.jpg"}
                  alt={course.title}
                  width={760}
                  height={460}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="px-1 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ffa10a]">{course.category}</p>
                <h2 className="mt-2 font-serif text-2xl leading-none">{course.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{course.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white/70 py-20 dark:bg-white/[0.03]">
        <div className={`${pageFrame} grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center xl:gap-10`}>
          <div className="relative min-h-[360px] lg:max-w-[30rem]">
            <div className="absolute left-0 top-8 h-64 w-64 overflow-hidden rounded-[10px] shadow-glow sm:h-80 sm:w-80">
              <Image src="/hero-learning-meeting.jpg" alt="Smart LMS learning workspace" width={900} height={900} className="h-full w-full object-cover" />
            </div>
            <div className="absolute left-36 top-40 hidden h-28 w-52 overflow-hidden rounded-[8px] border-4 border-white shadow-soft sm:block">
              <Image src="/hero-learning-meeting.jpg" alt="Course tools" width={520} height={260} className="h-full w-full object-cover" />
            </div>
            <div className="absolute left-3 top-64 rounded-[8px] bg-[#ffa10a] px-5 py-4 text-white shadow-glow">
              <p className="font-serif text-3xl leading-none">{seatUtilizationPercent(state.billing)}%</p>
              <p className="text-xs font-bold">Seat utilization</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#E8A020]">Welcome to Smart LMS</p>
            <h2 className="mt-3 max-w-2xl font-serif text-5xl leading-[0.96] text-[#111827] dark:text-white">
              Better learning operations for institutes and teams.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
              The interface keeps admin, teacher, and student workflows connected while preserving the working mock and backend-ready flows in your project.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ["Admin Ready", "Branding, billing, reporting, and tenant controls."],
                ["Teacher Tools", "Course delivery, live class scheduling, and AI review queue."]
              ].map(([title, body]) => (
                <div key={title} className="rounded-[8px] border border-[#A6ABB5]/60 bg-white p-5 shadow-soft dark:bg-[#13212a]">
                  <p className="font-serif text-2xl">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalog" className="rounded-full bg-[#ffa10a] px-5 py-3 text-sm font-bold text-white shadow-soft">Explore courses</Link>
              <Link href="/login" className="rounded-full border border-[#A6ABB5] px-5 py-3 text-sm font-bold text-[#111827] dark:border-white/25 dark:text-white">Learner login</Link>
            </div>
          </div>
        </div>
      </section>

      <section className={`${pageFrame} py-20`}>
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#ffa10a]">What we offer</p>
          <h2 className="mt-3 font-serif text-5xl leading-none">Complete LMS Services</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            A focused set of working features from your SRS, styled like the provided reference.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["Course Builder", <BookOpen key="book" className="h-5 w-5" />, "/teacher/courses"],
            ["AI Assessments", <Bot key="bot" className="h-5 w-5" />, "/teacher/assessments/ai-generate"],
            ["Live Classroom", <Video key="video" className="h-5 w-5" />, "/teacher/live-classes"],
            ["Compliance", <ShieldCheck key="shield" className="h-5 w-5" />, "/admin/reports/compliance"],
            ["Billing", <CreditCard key="card" className="h-5 w-5" />, "/admin/billing"]
          ].map(([title, icon, href]) => (
            <Link key={String(title)} href={String(href)} className="group relative min-h-[190px] overflow-hidden rounded-[8px] bg-[#A6ABB5] p-5 text-[#111827] shadow-soft transition hover:-translate-y-1">
              <Image src="/hero-learning-meeting.jpg" alt={String(title)} width={520} height={360} className="absolute inset-0 h-full w-full object-cover opacity-30 transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#A6ABB5]/95 via-[#A6ABB5]/72 to-transparent" />
              <div className="relative flex h-full flex-col justify-between">
                <span className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-white/14 text-[#ffa10a]">{icon}</span>
                <div>
                  <h3 className="font-serif text-2xl">{title}</h3>
                  <span className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold text-[#111827]">Open now</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#A6ABB5] py-16 text-center text-[#111827]">
        <p className="font-serif text-4xl font-semibold">Providing High Quality Learning Tools</p>
        <Link href="/catalog" className="mt-5 inline-flex rounded-full bg-[#ffa10a] px-5 py-3 text-sm font-bold text-white shadow-soft">
          Discover more
        </Link>
      </section>

      <section className={`${pageFrame} py-20`}>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#ffa10a]">Workspace access</p>
            <h2 className="mt-3 font-serif text-5xl leading-none">Choose Your Dashboard</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {roleCards.map((card) => (
              <Link key={card.title} href={card.href} className="rounded-[8px] border border-[#A6ABB5]/60 bg-white p-6 shadow-soft transition hover:-translate-y-1 dark:bg-[#13212a]">
                <p className="font-serif text-3xl">{card.title}</p>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{card.body}</p>
                <span className="mt-6 inline-flex text-sm font-bold text-[#111827] dark:text-[#ffa10a]">Open workspace +</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export function MarketingPageExperience({ slug }: { slug: string }) {
  if (slug === "login" || slug === "signup" || slug === "forgot-password" || slug === "reset-password") {
    return <AuthExperience slug={slug} />;
  }

  if (slug === "pricing") {
    return <PricingExperience />;
  }

  if (slug === "catalog") {
    return <CatalogExperience />;
  }

  return <GenericMarketing slug={slug} />;
}

export function CatalogCourseExperience({ slug }: { slug: string }) {
  const { state } = useMockLms();
  const resolvedSlug = catalogSlugMap[slug] ?? slug;
  const course = state.courses.find((item) => item.id === resolvedSlug);

  if (!course) {
    return (
      <div className={`${pageFrame} pb-20 pt-10`}>
        <Section title="Catalog item not found" subtitle="The requested course slug is not present in the seeded demo catalog.">
          <Link href="/catalog" className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background">
            Back to catalog
          </Link>
        </Section>
      </div>
    );
  }

  if (course.id === "course-ai") {
    return (
      <div className={`${pageFrame} pb-20 pt-10`}>
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <Section title="AI Instructor Studio" subtitle="Focused on exactly the SRS AI workflow: note upload, automatic quiz generation, essay scoring, teacher review, and fallback question bank support.">
            <div className="grid gap-4">
              {aiStudioFeatures.map((feature) => (
                <div key={feature.title} className="rounded-[1.5rem] border border-foreground/10 bg-white p-5 dark:border-white/8 dark:bg-[#13212a]">
                  <p className="font-serif text-2xl">{feature.title}</p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/teacher/assessments/ai-generate" className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background">
                Launch AI Studio
              </Link>
              <Link href="/teacher/assessments/review" className="rounded-full border border-foreground/15 px-5 py-3 text-sm font-semibold">
                Open review queue
              </Link>
            </div>
          </Section>

          <Section title="AI Studio capabilities" subtitle="Only SRS-based features are highlighted here.">
            <div className="grid gap-4">
              <div className="rounded-[1.5rem] border border-foreground/10 bg-white p-5 dark:border-white/8 dark:bg-[#13212a]">
                <p className="text-sm font-semibold text-[#1A1A2E] dark:text-[#F5C766]">Question generation</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Generate up to 50 MCQ, True/False, Short Answer, or Essay questions from uploaded notes or pasted content.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-foreground/10 bg-white p-5 dark:border-white/8 dark:bg-[#13212a]">
                <p className="text-sm font-semibold text-[#1A1A2E] dark:text-[#F5C766]">Teacher review</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Review, edit, reject, and publish generated questions before students can see them.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-foreground/10 bg-white p-5 dark:border-white/8 dark:bg-[#13212a]">
                <p className="text-sm font-semibold text-[#1A1A2E] dark:text-[#F5C766]">Fallback continuity</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Keep assessment creation running even during AI disruption by generating from the fallback question bank.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-foreground/10 bg-white p-5 dark:border-white/8 dark:bg-[#13212a]">
                <p className="text-sm font-semibold text-[#1A1A2E] dark:text-[#F5C766]">Essay evaluation</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Evaluate long-form student answers against rubric keywords and return score plus feedback.
                </p>
              </div>
            </div>
          </Section>
        </div>
      </div>
    );
  }

  return (
    <div className={`${pageFrame} pb-20 pt-10`}>
      <Section title={course.title} subtitle={course.description}>
        <div className="grid gap-4 xl:grid-cols-3">
          <StatCard label="Category" value={course.category} />
          <StatCard label="Modules" value={String(course.modules.length)} />
          <StatCard label="Price" value={`$${course.price}`} />
        </div>
        <div className="mt-6 grid gap-4">
          {course.modules.map((module) => (
            <div key={module.id} className="rounded-[1.5rem] border border-foreground/10 bg-white p-5 dark:border-white/8 dark:bg-[#13212a]">
              <p className="font-serif text-2xl">{module.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">Drip release: +{module.dripDays} days</p>
              <div className="mt-4 grid gap-2">
                {module.lessons.map((lesson) => (
                  <div key={lesson.id} className="rounded-[1.2rem] border border-foreground/10 bg-background/70 p-3 text-sm">
                    {lesson.title} · {lesson.type} · {lesson.durationMinutes} min
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
