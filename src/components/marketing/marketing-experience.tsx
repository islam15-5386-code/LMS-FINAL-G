"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Award,
  BookOpen,
  Bot,
  CheckCircle2,
  CreditCard,
  FileText,
  LockKeyhole,
  Palette,
  PlayCircle,
  ShieldCheck,
  Store,
  Users,
  Video
} from "lucide-react";
import { useState } from "react";

import {
  backendReadyEndpoints,
  fallbackQuestionBank,
  planMatrix,
  seatUtilizationPercent,
  type Role
} from "@/lib/mock-lms";
import { dashboardPathForRole, useMockLms } from "@/providers/mock-lms-provider";

import {
  Badge,
  MetricGrid,
  PrimaryButton,
  SecondaryButton,
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

const facilityGroups = [
  {
    title: "Multi-tenant provisioning",
    icon: <Palette className="h-5 w-5" />,
    items: [
      "Tenant-scoped branding profile with logo, color palette, subdomain, and custom domain mapping",
      "Default Admin, Teacher, and Student roles",
      "White-labeled login surface for each institute",
      "Tenant isolation-ready operational structure"
    ]
  },
  {
    title: "Course and content management",
    icon: <BookOpen className="h-5 w-5" />,
    items: [
      "Course, module, and lesson structure",
      "PDF, MP4, DOCX, and image-oriented lesson workflow",
      "Draft and publish controls for admins and teachers",
      "Drip content scheduling model"
    ]
  },
  {
    title: "AI-powered assessment engine",
    icon: <Bot className="h-5 w-5" />,
    items: [
      "Upload notes or paste content to generate questions",
      "MCQ, True/False, Short Answer, and Essay generation flow",
      "Teacher review, edit, reject, and publish queue",
      "Fallback question bank for AI disruption",
      "Essay evaluation with score and written feedback"
    ]
  },
  {
    title: "Live classroom",
    icon: <Video className="h-5 w-5" />,
    items: [
      "Jitsi-ready live session scheduling and status tracking",
      "Host, record, and manage upcoming sessions",
      "24-hour and 1-hour reminder workflow",
      "Participant cap aligned to subscription tier"
    ]
  },
  {
    title: "Compliance and progress tracking",
    icon: <ShieldCheck className="h-5 w-5" />,
    items: [
      "Course completion and progress visibility",
      "Compliance matrix by employee, department, and role",
      "CSV and PDF export flow for reporting",
      "Certificate issuance, verification code, download, and revoke"
    ]
  },
  {
    title: "Subscription and billing",
    icon: <CreditCard className="h-5 w-5" />,
    items: [
      "Starter, Growth, and Professional plan model",
      "Seat limit tracking and overage calculation",
      "Utilization warnings for admins",
      "Monthly invoice-friendly pricing view"
    ]
  }
];

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
  const { signIn } = useMockLms();
  const [email, setEmail] = useState("abdur.ahsan1@dhaka-dsi.example.com");
  const [password, setPassword] = useState("password");
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
        subtitle="These authentication screens are wired as workable frontend flows so reviewers can move through the product quickly. Use the seeded demo password `password`."
      >
        <div className="grid gap-3">
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
              ? "Go to sign in"
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
            ["Admin login", "abdur.ahsan1@dhaka-dsi.example.com"],
            ["Teacher login", "afsana.ahsan3@dhaka-dsi.example.com"],
            ["Student login", "amena.ahsan7@dhaka-dsi.example.com"]
          ].map(([label, value]) => (
            value.startsWith("/") ? (
              <Link key={value} href={value} className="rounded-[1.4rem] border border-foreground/10 bg-white p-4 text-sm font-semibold shadow-soft transition hover:-translate-y-0.5">
                {label}
              </Link>
            ) : (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setEmail(value);
                  setPassword("password");
                }}
                className="rounded-[1.4rem] border border-foreground/10 bg-white p-4 text-left text-sm font-semibold shadow-soft transition hover:-translate-y-0.5"
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
            <div key={plan} className={`overflow-hidden rounded-[1.8rem] border p-6 ${state.billing.plan === plan ? "border-cyan-900/10 bg-cyan-950 text-white shadow-glow" : "border-foreground/10 bg-white shadow-soft dark:border-white/8 dark:bg-[#13212a]"}`}>
              <p className="text-pretty-wrap font-serif text-[clamp(2.2rem,2.2vw,3rem)] leading-none">{plan}</p>
              <p className={`text-pretty-wrap mt-3 text-sm leading-6 ${state.billing.plan === plan ? "text-cyan-100/80" : "text-muted-foreground"}`}>
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

  return (
    <>
      <section className={`${pageFrame} pb-12 pt-10`}>
        <div className="grid items-center gap-10 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="hero-fade-up space-y-6">
            <p className="inline-flex rounded-full border border-cyan-900/10 bg-card/80 px-4 py-2 text-sm uppercase tracking-[0.24em] text-cyan-900 shadow-soft dark:border-cyan-400/10 dark:bg-white/5 dark:text-cyan-200">
              Smart LMS Platform
            </p>
            <h1 className="max-w-4xl font-serif text-[clamp(3rem,5.5vw,6.1rem)] leading-[0.9] text-balance">
              Manage courses, learning, assessments, and live classes in one modern LMS.
            </h1>
            <p className="max-w-2xl text-lg leading-9 text-muted-foreground md:text-xl">
              A clean platform for course management, online learning, smart assessments, and live teaching workflows.
            </p>
            <p className="max-w-xl text-sm font-medium uppercase tracking-[0.22em] text-cyan-900/75 dark:text-cyan-200/80">
              Simple to manage. Easy to learn. Built for modern education.
            </p>
            <div className="hero-fade-up hero-delay-1 flex flex-wrap gap-3">
              <Link href="/admin/dashboard" className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#0b3f51_0%,#146c82_52%,#ff7a00_100%)] px-6 py-3 text-sm font-semibold text-white shadow-glow ring-1 ring-white/20 transition hover:-translate-y-0.5">
                Open admin dashboard
              </Link>
              <Link href="/teacher/assessments/ai-generate" className="inline-flex items-center justify-center rounded-full border border-border/80 bg-card/80 px-6 py-3 text-sm font-semibold shadow-soft transition hover:-translate-y-0.5 hover:border-cyan-900/20 dark:border-white/10 dark:bg-white/5">
                Open AI Studio
              </Link>
              <SecondaryButton onClick={resetDemo}>Reset demo data</SecondaryButton>
            </div>
          </div>

          <div className="hero-glow hero-delay-2 relative overflow-hidden rounded-[3rem] border border-white/65 bg-[linear-gradient(135deg,#fde9d1,#fffdf8_38%,#dff4f1)] p-6 shadow-glow dark:border-white/10 dark:bg-[linear-gradient(145deg,#0c202a,#102e3c_50%,#163845)]">
            <div className="absolute -right-12 bottom-0 h-64 w-64 rounded-full bg-orange-500/20 blur-2xl" />
            <div className="absolute left-8 top-8 h-28 w-28 rounded-full border-2 border-cyan-300/75" />
            <div className="hero-float absolute right-10 top-10 rounded-full border border-white/30 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.24em] text-cyan-900 shadow-soft dark:border-white/10 dark:bg-white/10 dark:text-cyan-100">
              Live product preview
            </div>
            <div className="relative grid gap-5">
              <div className="hero-float relative rounded-[2.2rem] bg-white/75 p-4 shadow-soft dark:bg-white/10">
                <div className="hero-fade-up hero-delay-3 absolute bottom-8 left-6 z-10 max-w-[20rem] rounded-[1.35rem] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(241,248,247,0.92))] px-4 py-3 text-slate-900 shadow-soft backdrop-blur dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(12,33,42,0.96),rgba(18,52,66,0.92))] dark:text-white">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-900/75 dark:text-cyan-100/75">AI Studio ready</p>
                  <p className="mt-1 text-sm font-semibold text-pretty-wrap">Notes, review queue, fallback bank</p>
                </div>
                <div className="absolute inset-x-10 bottom-4 h-24 rounded-full bg-gradient-to-r from-cyan-500/10 via-transparent to-orange-400/20 blur-2xl" />
                <Image src="/hero-learning-meeting.jpg" alt="Learning platform collaboration" width={1600} height={900} className="h-[28rem] w-full rounded-[1.8rem] object-cover" priority />
              </div>
              <div className="hero-fade-up hero-delay-3 grid gap-4 sm:grid-cols-4">
                <StatCard label="Active learners" value={String(activeLearners)} />
                <StatCard label="Published courses" value={String(publishedCourses)} />
                <StatCard label="Lessons" value={String(totalLessons)} />
                <StatCard label="Certificates" value={String(state.certificates.length)} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${pageFrame} pb-12`}>
        <MetricGrid
          items={[
            { label: "Published courses", value: String(publishedCourses), icon: <BookOpen className="h-5 w-5" /> },
            { label: "AI assessments", value: String(state.assessments.length), icon: <Bot className="h-5 w-5" /> },
            { label: "Live sessions", value: String(state.liveClasses.length), icon: <PlayCircle className="h-5 w-5" /> },
            { label: "Certificates", value: String(state.certificates.length), icon: <Award className="h-5 w-5" /> },
            { label: "Active learners", value: String(activeLearners), icon: <Users className="h-5 w-5" /> },
            { label: "Lesson assets", value: String(totalLessons), icon: <FileText className="h-5 w-5" /> },
            { label: "Seat utilization", value: `${seatUtilizationPercent(state.billing)}%`, icon: <Store className="h-5 w-5" /> },
            { label: "Fallback banks", value: String(fallbackQuestionBank.length), icon: <LockKeyhole className="h-5 w-5" /> }
          ]}
        />
      </section>

      <section className={`${pageFrame} pb-14`}>
        <Section title="SRS functionality overview" subtitle="Only the core functionality from your SRS is highlighted here, without duplicate or extra feature blocks.">
          <div className="grid gap-5 xl:grid-cols-2">
            {facilityGroups.map((group) => (
              <div key={group.title} className="rounded-[1.7rem] border border-foreground/10 bg-white p-6 shadow-soft dark:border-white/8 dark:bg-[#13212a]">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-cyan-950 p-3 text-white shadow-soft">{group.icon}</div>
                  <p className="font-serif text-3xl">{group.title}</p>
                </div>
                <div className="mt-5 grid gap-3">
                  {group.items.map((item) => (
                    <div key={item} className="flex items-start gap-3 rounded-[1.2rem] bg-background/80 px-4 py-3 dark:bg-white/5">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      <p className="text-sm leading-6 text-foreground/85">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </section>

      <section className={`${pageFrame} pb-14`}>
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2.6rem] bg-cyan-950 px-8 py-10 text-white shadow-glow">
            <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/70">AI Studio</p>
            <h2 className="mt-4 max-w-2xl font-serif text-5xl leading-[0.95]">
              Upload notes, generate assessments, review drafts, and keep a fallback bank ready.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-cyan-100/82">
              This AI Studio follows your SRS only: uploaded PDF or note driven question generation, teacher review and publish flow,
              essay evaluation, and fallback question bank support.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/teacher/assessments/ai-generate" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-cyan-950">
                Open AI Studio
              </Link>
              <Link href="/teacher/assessments/review" className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white">
                Review queue
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-white/10 p-4">
                <p className="text-sm font-semibold">Upload endpoint</p>
                <p className="mt-2 text-sm text-cyan-100/75">{backendReadyEndpoints.noteUpload}</p>
              </div>
              <div className="rounded-[1.5rem] bg-white/10 p-4">
                <p className="text-sm font-semibold">Fallback endpoint</p>
                <p className="mt-2 text-sm text-cyan-100/75">{backendReadyEndpoints.fallbackQuestionBank}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {aiStudioFeatures.map((feature) => (
              <Link key={feature.title} href={feature.href} className="rounded-[1.9rem] border border-foreground/10 bg-white p-6 shadow-soft transition hover:-translate-y-1 dark:border-white/8 dark:bg-[#13212a]">
                <p className="font-serif text-3xl">{feature.title}</p>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{feature.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`${pageFrame} pb-14`}>
        <div className="grid gap-4 xl:grid-cols-3">
          {roleCards.map((card) => (
            <Link key={card.title} href={card.href} className="rounded-[2rem] border border-foreground/10 bg-white p-6 shadow-soft transition hover:-translate-y-1 dark:border-white/8 dark:bg-[#13212a]">
              <p className="font-serif text-4xl">{card.title}</p>
              <p className="mt-4 text-base leading-7 text-muted-foreground">{card.body}</p>
            </Link>
          ))}
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
                <div key={feature.title} className="rounded-[1.5rem] border border-foreground/10 bg-white p-5">
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
              <div className="rounded-[1.5rem] border border-foreground/10 bg-white p-5">
                <p className="text-sm font-semibold text-cyan-900">Question generation</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Generate up to 50 MCQ, True/False, Short Answer, or Essay questions from uploaded notes or pasted content.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-foreground/10 bg-white p-5">
                <p className="text-sm font-semibold text-cyan-900">Teacher review</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Review, edit, reject, and publish generated questions before students can see them.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-foreground/10 bg-white p-5">
                <p className="text-sm font-semibold text-cyan-900">Fallback continuity</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Keep assessment creation running even during AI disruption by generating from the fallback question bank.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-foreground/10 bg-white p-5">
                <p className="text-sm font-semibold text-cyan-900">Essay evaluation</p>
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
            <div key={module.id} className="rounded-[1.5rem] border border-foreground/10 bg-white p-5">
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
