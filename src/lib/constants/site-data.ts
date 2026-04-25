export type HeroStat = {
  label: string;
  value: string;
};

export type Panel = {
  title: string;
  body: string;
  tone?: "default" | "accent" | "warm";
};

export type PageDefinition = {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  stats: HeroStat[];
  panels: Panel[];
};

export const homeStats: HeroStat[] = [
  { label: "Active learners", value: "48.2k" },
  { label: "Tenant academies", value: "312" },
  { label: "Completion uplift", value: "+37%" },
  { label: "Live sessions this week", value: "1,284" }
];

export const homeHighlights = [
  {
    title: "Multi-tenant control",
    body: "Give every campus its own identity, permissions, and revenue view without fragmenting operations."
  },
  {
    title: "Teacher momentum",
    body: "Launch live classes, publish lessons, and review assessments from one workspace built for faster delivery."
  },
  {
    title: "Student clarity",
    body: "Learners move through courses, certificates, and deadlines with a calmer, more guided experience."
  }
];

export const marketingPages: Record<string, PageDefinition> = {
  features: {
    eyebrow: "Feature architecture",
    title: "A single LMS surface for content, live learning, compliance, and billing.",
    description:
      "This frontend ties together the admin, teacher, and student journeys so each audience gets the right tools without the product feeling fragmented.",
    ctaLabel: "Explore admin dashboard",
    ctaHref: "/admin/dashboard",
    secondaryLabel: "See pricing",
    secondaryHref: "/pricing",
    stats: [
      { label: "Feature modules", value: "18" },
      { label: "Role workspaces", value: "3" },
      { label: "Automation points", value: "26" }
    ],
    panels: [
      {
        title: "Operational spine",
        body: "Tenant controls, audit logs, certificates, billing, reports, and notifications sit in one admin command layer.",
        tone: "accent"
      },
      {
        title: "Teaching tools",
        body: "Course authoring, lesson views, assessment review, and live-class workflows keep instructors moving without context switching."
      },
      {
        title: "Learner journey",
        body: "Students can track course progress, assessments, certificates, and live sessions from a cleaner hub."
      }
    ]
  },
  solutions: {
    eyebrow: "Solution fit",
    title: "Built for academies, training brands, and enterprise education teams.",
    description:
      "The layout patterns in this frontend are designed to support branded tenants, internal teams, and public-facing enrollment experiences at the same time.",
    ctaLabel: "Request a demo",
    ctaHref: "/demo",
    secondaryLabel: "View catalog",
    secondaryHref: "/catalog",
    stats: [
      { label: "Tenant themes", value: "Unlimited" },
      { label: "Role-specific paths", value: "40+" },
      { label: "Reusable UI blocks", value: "Dozens" }
    ],
    panels: [
      {
        title: "For SaaS operators",
        body: "Launch branded instances faster while keeping centralized governance, finance, and user management."
      },
      {
        title: "For teaching teams",
        body: "Simplify scheduling, course publishing, and review workflows so instructors spend more time teaching.",
        tone: "warm"
      },
      {
        title: "For learners",
        body: "Reduce confusion with better structure around progress, events, deadlines, and earned credentials."
      }
    ]
  },
  pricing: {
    eyebrow: "Pricing logic",
    title: "Simple plan framing for a premium LMS SaaS sale.",
    description:
      "The pricing surface below is ready for product storytelling and can later be connected to billing plans, coupons, and usage tiers.",
    ctaLabel: "Talk to sales",
    ctaHref: "/contact",
    secondaryLabel: "Open billing center",
    secondaryHref: "/admin/billing",
    stats: [
      { label: "Starter", value: "$79" },
      { label: "Growth", value: "$249" },
      { label: "Enterprise", value: "Custom" }
    ],
    panels: [
      {
        title: "Starter",
        body: "Core LMS flows, branded learner portal, and a compact admin layer for smaller academies.",
        tone: "accent"
      },
      {
        title: "Growth",
        body: "Adds analytics, advanced teacher workflows, automation, and deeper tenant operations."
      },
      {
        title: "Enterprise",
        body: "Custom onboarding, compliance reporting, dedicated support, and multi-brand governance.",
        tone: "warm"
      }
    ]
  },
  catalog: {
    eyebrow: "Course discovery",
    title: "A course catalog designed to convert curiosity into enrollment.",
    description:
      "Use the catalog index for public browsing, recommendations, and filtered discovery before learners commit to a program.",
    ctaLabel: "Open sample course",
    ctaHref: "/catalog/future-of-product-teams",
    secondaryLabel: "Visit student courses",
    secondaryHref: "/student/courses",
    stats: [
      { label: "Programs live", value: "124" },
      { label: "Completion rate", value: "89%" },
      { label: "Average rating", value: "4.8/5" }
    ],
    panels: [
      {
        title: "Merchandised discovery",
        body: "Featured cards, category cues, and outcome-first messaging help the strongest courses rise quickly."
      },
      {
        title: "Course confidence",
        body: "Pair catalogs with instructor detail, syllabus previews, and proof signals to reduce enrollment hesitation.",
        tone: "accent"
      },
      {
        title: "Operator ready",
        body: "Later this can plug into a real catalog API without changing the route structure."
      }
    ]
  },
  about: {
    eyebrow: "Product story",
    title: "This LMS frontend is framed like a serious SaaS product, not a generic dashboard starter.",
    description:
      "The visual language leans editorial and operational at the same time, which helps the product feel premium without losing clarity.",
    ctaLabel: "Visit the homepage",
    ctaHref: "/",
    secondaryLabel: "View feature set",
    secondaryHref: "/features",
    stats: [
      { label: "Visual themes", value: "Editorial + operational" },
      { label: "Core personas", value: "Admins, teachers, students" },
      { label: "Deployment model", value: "Multi-tenant" }
    ],
    panels: [
      {
        title: "Designed for trust",
        body: "Warm surfaces, strong typography, and crisp information grouping make the product feel dependable from the first screen."
      },
      {
        title: "Ready to extend",
        body: "The routes are organized so a real backend or design system can be layered in cleanly later.",
        tone: "warm"
      }
    ]
  },
  contact: {
    eyebrow: "Contact sales",
    title: "Open a conversation about rollout, branding, or enterprise requirements.",
    description:
      "This contact surface is positioned for demos, pricing questions, onboarding requests, and custom compliance needs.",
    ctaLabel: "Book demo",
    ctaHref: "/demo",
    secondaryLabel: "Pricing details",
    secondaryHref: "/pricing",
    stats: [
      { label: "Response window", value: "< 24h" },
      { label: "Onboarding support", value: "Included" },
      { label: "Regional rollout", value: "Global" }
    ],
    panels: [
      {
        title: "Sales questions",
        body: "Plan fit, tenant counts, integrations, and growth options."
      },
      {
        title: "Implementation needs",
        body: "Theme rollout, migration planning, and team enablement.",
        tone: "accent"
      },
      {
        title: "Enterprise asks",
        body: "Security review, compliance reporting, and custom commercial terms."
      }
    ]
  },
  demo: {
    eyebrow: "Demo funnel",
    title: "Guide prospects into the right product story before the call starts.",
    description:
      "A good demo page sets context for admins, instructors, and learners so the conversation lands faster and closer to the buyer’s real needs.",
    ctaLabel: "Open admin preview",
    ctaHref: "/admin/dashboard",
    secondaryLabel: "Open teacher preview",
    secondaryHref: "/teacher/dashboard",
    stats: [
      { label: "Live walkthrough", value: "45 min" },
      { label: "Role-specific demos", value: "3" },
      { label: "Implementation plan", value: "Tailored" }
    ],
    panels: [
      {
        title: "Executive overview",
        body: "Position the platform around tenant growth, visibility, and operational control."
      },
      {
        title: "Teaching workflow",
        body: "Show how courses, live classes, and assessments move from draft to delivery.",
        tone: "warm"
      },
      {
        title: "Student outcomes",
        body: "Highlight the calmer learner experience around progress, completion, and certificates."
      }
    ]
  },
  faq: {
    eyebrow: "Questions answered",
    title: "Common questions about tenants, roles, rollout, and product scope.",
    description:
      "This route is useful for self-serve validation before a sales call, especially when buyers are comparing LMS platforms quickly.",
    ctaLabel: "Contact the team",
    ctaHref: "/contact",
    secondaryLabel: "See solutions",
    secondaryHref: "/solutions",
    stats: [
      { label: "Multi-tenant", value: "Yes" },
      { label: "Role-specific UX", value: "Yes" },
      { label: "Laravel-ready API layer", value: "Planned" }
    ],
    panels: [
      {
        title: "Can each tenant be branded?",
        body: "Yes. The app structure is already oriented around tenant-aware theming and operations.",
        tone: "accent"
      },
      {
        title: "Does it support live teaching?",
        body: "Yes. The route model includes instructor and student live-class flows."
      },
      {
        title: "Can billing and compliance be managed centrally?",
        body: "Yes. The admin information architecture includes both billing and compliance reporting."
      }
    ]
  }
};

export const authPages: Record<string, PageDefinition> = {
  login: {
    eyebrow: "Welcome back",
    title: "Sign in to resume operations, teaching, or learning.",
    description:
      "Use this route as the main account entry for role-aware authentication and branded tenant sign-ins.",
    ctaLabel: "Go to student dashboard",
    ctaHref: "/student/dashboard",
    secondaryLabel: "Create account",
    secondaryHref: "/signup",
    stats: [
      { label: "Roles", value: "Admin / Teacher / Student" },
      { label: "Tenant branding", value: "Enabled" },
      { label: "Session flow", value: "Ready" }
    ],
    panels: [
      {
        title: "Role routing",
        body: "Successful sign-in can direct each user to the right workspace."
      },
      {
        title: "Tenant identity",
        body: "Brand accents, welcome copy, and support details can shift by academy.",
        tone: "accent"
      }
    ]
  },
  signup: {
    eyebrow: "Create account",
    title: "A warmer enrollment flow for new learners and invited team members.",
    description:
      "This signup screen is positioned for future validation, invite flows, and tenant-specific onboarding copy.",
    ctaLabel: "Start learning",
    ctaHref: "/student/dashboard",
    secondaryLabel: "Already have an account?",
    secondaryHref: "/login",
    stats: [
      { label: "Self-serve onboarding", value: "Available" },
      { label: "Invite support", value: "Available" },
      { label: "Brandable copy", value: "Available" }
    ],
    panels: [
      {
        title: "Conversion-friendly",
        body: "The layout prioritizes trust signals and a lighter cognitive load."
      },
      {
        title: "Ready for validation",
        body: "The structure is already suitable for form libraries and schema validation.",
        tone: "warm"
      }
    ]
  },
  "forgot-password": {
    eyebrow: "Reset access",
    title: "Let users recover access without creating support friction.",
    description:
      "A dedicated recovery route reduces drop-off and gives tenant teams a more polished support experience.",
    ctaLabel: "Back to sign in",
    ctaHref: "/login",
    secondaryLabel: "Create account",
    secondaryHref: "/signup",
    stats: [
      { label: "Recovery emails", value: "Ready" },
      { label: "Tenant messaging", value: "Customizable" },
      { label: "Support fallback", value: "Included" }
    ],
    panels: [
      {
        title: "Reduce support load",
        body: "Password recovery should feel fast, safe, and predictable."
      },
      {
        title: "Preserve trust",
        body: "Use clear guidance and concise status messaging throughout the flow.",
        tone: "accent"
      }
    ]
  },
  "reset-password": {
    eyebrow: "Complete reset",
    title: "A clean handoff from email recovery back into the platform.",
    description:
      "This route closes the loop after verification and can later enforce password rules or security policies.",
    ctaLabel: "Return to login",
    ctaHref: "/login",
    secondaryLabel: "Need help?",
    secondaryHref: "/contact",
    stats: [
      { label: "Token flow", value: "Placeholder ready" },
      { label: "Policy checks", value: "Easy to add" },
      { label: "User feedback", value: "Inline" }
    ],
    panels: [
      {
        title: "Security touchpoint",
        body: "This page is structured for future password policy messaging and successful reset confirmation.",
        tone: "warm"
      }
    ]
  }
};

export const sampleCatalogCourses = [
  {
    slug: "future-of-product-teams",
    title: "Future of Product Teams",
    category: "Leadership",
    duration: "8 weeks",
    summary: "A strategic cohort for modern product operations, communication, and delivery systems."
  },
  {
    slug: "ai-instructor-studio",
    title: "AI Instructor Studio",
    category: "Teaching",
    duration: "6 weeks",
    summary: "Hands-on patterns for creating lessons, assessments, and feedback loops with AI assistance."
  },
  {
    slug: "compliance-bootcamp",
    title: "Compliance Bootcamp",
    category: "Operations",
    duration: "4 weeks",
    summary: "A practical program focused on reporting, certificate logic, and operational readiness."
  }
];

type PlatformPage = {
  eyebrow: string;
  title: string;
  description: string;
  stats: HeroStat[];
  panels: Panel[];
};

function dashboardPage(role: "admin" | "teacher" | "student"): PlatformPage {
  if (role === "admin") {
    return {
      eyebrow: "Admin workspace",
      title: "See tenant health, revenue signals, and operational activity at a glance.",
      description:
        "The admin dashboard acts like mission control for the LMS SaaS: it centralizes growth, compliance, and platform oversight.",
      stats: [
        { label: "Monthly recurring revenue", value: "$184k" },
        { label: "Active tenants", value: "312" },
        { label: "At-risk accounts", value: "9" }
      ],
      panels: [
        {
          title: "Revenue pulse",
          body: "Track subscription movement, overdue invoices, and expansion opportunities in one view.",
          tone: "accent"
        },
        {
          title: "Tenant attention",
          body: "Spot branding gaps, inactive teams, and support-heavy organizations early."
        },
        {
          title: "Compliance watch",
          body: "Audit readiness, certificate activity, and policy drift can all surface here."
        }
      ]
    };
  }

  if (role === "teacher") {
    return {
      eyebrow: "Teacher workspace",
      title: "Manage course delivery, learner momentum, and live teaching from a single dashboard.",
      description:
        "This view is oriented around weekly teaching rhythm: what is publishing, who needs review, and where live sessions are headed next.",
      stats: [
        { label: "Courses in progress", value: "12" },
        { label: "Pending reviews", value: "48" },
        { label: "Next live class", value: "2:00 PM" }
      ],
      panels: [
        {
          title: "Teaching cadence",
          body: "Use the dashboard to move from lesson prep to assessment review with less administrative drag.",
          tone: "warm"
        },
        {
          title: "Student signals",
          body: "Identify learners falling behind, top participation, and submission bottlenecks quickly."
        }
      ]
    };
  }

  return {
    eyebrow: "Student workspace",
    title: "A learner dashboard that keeps progress, deadlines, and live sessions easy to follow.",
    description:
      "Students should not have to hunt for the next step. This dashboard focuses on clarity and confidence.",
    stats: [
      { label: "Courses active", value: "5" },
      { label: "Progress this month", value: "78%" },
      { label: "Certificates earned", value: "9" }
    ],
    panels: [
      {
        title: "Progress guidance",
        body: "Surface the next lesson, important deadlines, and recent wins in one calm view.",
        tone: "accent"
      },
      {
        title: "Live learning",
        body: "Keep upcoming class times and recording links clearly visible."
      }
    ]
  };
}

export function resolvePlatformPage(
  role: "admin" | "teacher" | "student",
  segments: string[]
): PlatformPage | null {
  const joined = segments.join("/");

  if (joined === "dashboard") {
    return dashboardPage(role);
  }

  if (role === "admin") {
    const adminPages: Record<string, PlatformPage> = {
      tenants: {
        eyebrow: "Tenant operations",
        title: "Manage branded organizations, plan health, and activation across every tenant.",
        description:
          "Tenant management is where account health, branding status, and renewal conversations become visible.",
        stats: [
          { label: "Healthy tenants", value: "281" },
          { label: "Needs attention", value: "31" },
          { label: "Theme variants", value: "74" }
        ],
        panels: [
          { title: "Activation state", body: "See which organizations are fully launched and which still need setup." },
          { title: "Commercial risk", body: "Spot low-engagement or overdue tenants before renewal season.", tone: "warm" }
        ]
      },
      branding: {
        eyebrow: "Brand controls",
        title: "Shape tenant-facing experiences without splintering the product.",
        description:
          "Branding controls can adjust color, messaging, and identity while preserving a shared application structure.",
        stats: [
          { label: "Live themes", value: "74" },
          { label: "Brand refreshes", value: "12" },
          { label: "Components themed", value: "120+" }
        ],
        panels: [
          { title: "Theme governance", body: "Keep tenant brands consistent without rebuilding views from scratch.", tone: "accent" }
        ]
      },
      users: {
        eyebrow: "User directory",
        title: "Search, audit, and segment accounts across the platform.",
        description:
          "Centralized user management helps support, operations, and compliance teams move faster.",
        stats: [
          { label: "Users total", value: "48.2k" },
          { label: "New this week", value: "1,108" },
          { label: "Suspended", value: "23" }
        ],
        panels: [
          { title: "Search and action", body: "Quick actions for role changes, account flags, and tenant reassignment." }
        ]
      },
      teachers: {
        eyebrow: "Instruction teams",
        title: "Track the teaching workforce behind each academy.",
        description:
          "Monitor instructor coverage, performance, and course load from a single view.",
        stats: [
          { label: "Active teachers", value: "864" },
          { label: "Open invites", value: "27" },
          { label: "Average rating", value: "4.9" }
        ],
        panels: [
          { title: "Capacity", body: "Balance course ownership, live sessions, and review workloads." }
        ]
      },
      students: {
        eyebrow: "Student operations",
        title: "Track student scale, engagement, and support patterns across tenants.",
        description:
          "Use this area for cohort insights, at-risk identification, and administrative support workflows.",
        stats: [
          { label: "Learners", value: "48.2k" },
          { label: "At risk", value: "614" },
          { label: "Support tickets", value: "92" }
        ],
        panels: [
          { title: "Cohort health", body: "Watch completion, attendance, and inactivity patterns by tenant.", tone: "accent" }
        ]
      },
      courses: {
        eyebrow: "Course portfolio",
        title: "See what is published, under review, or due for refresh across the platform.",
        description:
          "A portfolio view makes curriculum oversight and catalog merchandising easier to manage centrally.",
        stats: [
          { label: "Courses live", value: "124" },
          { label: "Drafts", value: "19" },
          { label: "Needs update", value: "14" }
        ],
        panels: [
          { title: "Catalog health", body: "Monitor publication freshness, enrollment pull, and update cadence." }
        ]
      },
      "live-classes": {
        eyebrow: "Live learning ops",
        title: "Coordinate the schedule, hosts, and attendance across live teaching programs.",
        description:
          "A shared live-class view helps resolve conflicts and keep operations moving smoothly.",
        stats: [
          { label: "Upcoming sessions", value: "86" },
          { label: "Attendance rate", value: "93%" },
          { label: "Conflicts flagged", value: "4" }
        ],
        panels: [
          { title: "Schedule visibility", body: "See overlaps, host assignments, and room readiness in one place." }
        ]
      },
      reports: {
        eyebrow: "Reporting hub",
        title: "Operational analytics for tenant growth, teaching quality, and learner progress.",
        description:
          "Reports connect strategic oversight to the raw activity happening across the product every day.",
        stats: [
          { label: "Reports shared", value: "32" },
          { label: "Scheduled exports", value: "11" },
          { label: "Decision latency", value: "-42%" }
        ],
        panels: [
          { title: "Executive visibility", body: "Use trends and snapshots to guide renewals, staffing, and growth bets.", tone: "accent" }
        ]
      },
      "reports/compliance": {
        eyebrow: "Compliance reporting",
        title: "Collect the evidence needed for audits, certifications, and policy reviews.",
        description:
          "This route is positioned for training records, certificate evidence, and readiness tracking.",
        stats: [
          { label: "Audit-ready tenants", value: "287" },
          { label: "Policy alerts", value: "7" },
          { label: "Certificate records", value: "12.4k" }
        ],
        panels: [
          { title: "Evidence trail", body: "Centralize completion records, policy acknowledgements, and issuance history.", tone: "warm" }
        ]
      },
      certificates: {
        eyebrow: "Certificate controls",
        title: "Manage issuance logic, template quality, and earned credential history.",
        description:
          "Certificates are both a learner outcome and a compliance asset, so this route bridges both needs.",
        stats: [
          { label: "Issued this month", value: "1,946" },
          { label: "Templates", value: "18" },
          { label: "Verification rate", value: "99.3%" }
        ],
        panels: [
          { title: "Credential trust", body: "Make earned outcomes feel legitimate and easy to verify.", tone: "accent" }
        ]
      },
      billing: {
        eyebrow: "Billing center",
        title: "Monitor subscription movement, invoice status, and upgrade momentum.",
        description:
          "Billing becomes much easier to reason about when commercial and operational signals live together.",
        stats: [
          { label: "MRR", value: "$184k" },
          { label: "Overdue invoices", value: "11" },
          { label: "Expansion this quarter", value: "$29k" }
        ],
        panels: [
          { title: "Revenue detail", body: "View usage patterns, plan changes, and collections pressure from one surface." }
        ]
      },
      settings: {
        eyebrow: "Platform settings",
        title: "Control defaults, permissions, and rollout preferences.",
        description:
          "Settings are where central governance lives, from tenant defaults to staff permissions and system behavior.",
        stats: [
          { label: "Feature toggles", value: "19" },
          { label: "Permission groups", value: "12" },
          { label: "Updated today", value: "4" }
        ],
        panels: [
          { title: "Governance layer", body: "Keep the platform flexible without losing consistency.", tone: "warm" }
        ]
      },
      notifications: {
        eyebrow: "Notification center",
        title: "Coordinate the messages that reach learners, teachers, and admins.",
        description:
          "This route can evolve into campaign management, event reminders, and transactional messaging control.",
        stats: [
          { label: "Notifications sent", value: "22.8k" },
          { label: "Open rate", value: "61%" },
          { label: "Templates", value: "43" }
        ],
        panels: [
          { title: "Message discipline", body: "Protect learners from noisy communication while keeping essential updates visible." }
        ]
      },
      "audit-logs": {
        eyebrow: "Audit trail",
        title: "Trace who changed what, when, and where across the platform.",
        description:
          "Audit logs matter for trust, support, and compliance. This route gives that visibility a dedicated home.",
        stats: [
          { label: "Tracked events", value: "1.8M" },
          { label: "High-risk actions", value: "13" },
          { label: "Retention", value: "365 days" }
        ],
        panels: [
          { title: "Operational trust", body: "Investigate sensitive changes quickly and with context.", tone: "accent" }
        ]
      }
    };

    return adminPages[joined] ?? null;
  }

  if (role === "teacher") {
    if (joined === "courses") {
      return {
        eyebrow: "Teacher courses",
        title: "See every course you own, update, or review from one courseboard.",
        description: "This route supports publishing cadence, learner progress, and content refinement.",
        stats: [
          { label: "Courses active", value: "12" },
          { label: "Publishing soon", value: "3" },
          { label: "Needs edits", value: "5" }
        ],
        panels: [{ title: "Curriculum rhythm", body: "Move between authoring, review, and launch states smoothly." }]
      };
    }

    if (joined === "courses/new") {
      return {
        eyebrow: "Create course",
        title: "Start a new course with a structure that already expects lessons, assessments, and live moments.",
        description: "Use this route as the authoring entry point for new programs or one-off learning tracks.",
        stats: [
          { label: "Templates", value: "6" },
          { label: "Suggested outcomes", value: "Auto" },
          { label: "Ready to publish", value: "Guided" }
        ],
        panels: [{ title: "Authoring kickoff", body: "Outline a course fast, then refine with better content over time.", tone: "warm" }]
      };
    }

    if (segments[0] === "courses" && segments.length === 2) {
      return {
        eyebrow: "Course detail",
        title: `Course ${segments[1]} overview`,
        description: "Review syllabus flow, learner progress, and content quality signals for this course.",
        stats: [
          { label: "Learners enrolled", value: "248" },
          { label: "Completion", value: "82%" },
          { label: "Lesson count", value: "14" }
        ],
        panels: [{ title: "Delivery quality", body: "Track where learners are thriving and where the content may need refinement.", tone: "accent" }]
      };
    }

    if (segments[0] === "courses" && segments[2] === "edit") {
      return {
        eyebrow: "Course editor",
        title: `Editing course ${segments[1]}`,
        description: "Update copy, modules, schedules, and assessments without losing context.",
        stats: [
          { label: "Draft changes", value: "7" },
          { label: "Unsynced assets", value: "2" },
          { label: "Review checklist", value: "91%" }
        ],
        panels: [{ title: "Safe editing", body: "Make structural changes while keeping publication quality high.", tone: "warm" }]
      };
    }

    if (segments[0] === "lessons" && segments.length === 2) {
      return {
        eyebrow: "Lesson view",
        title: `Lesson ${segments[1]} detail`,
        description: "Lesson pages are where content quality, clarity, and student momentum become visible.",
        stats: [
          { label: "Watch rate", value: "88%" },
          { label: "Notes added", value: "146" },
          { label: "Completion delta", value: "+6%" }
        ],
        panels: [{ title: "Lesson performance", body: "Use this view to improve pacing, copy, and supporting materials." }]
      };
    }

    const teacherStaticPages: Record<string, PlatformPage> = {
      assessments: {
        eyebrow: "Assessments",
        title: "Create, schedule, and track assessments without losing teaching flow.",
        description: "Keep grading, authoring, and assessment quality in a focused workspace.",
        stats: [
          { label: "Assessments live", value: "18" },
          { label: "Awaiting review", value: "48" },
          { label: "Average score", value: "84%" }
        ],
        panels: [{ title: "Assessment pipeline", body: "From creation to grading, everything stays visible.", tone: "accent" }]
      },
      "assessments/ai-generate": {
        eyebrow: "AI assist",
        title: "Generate quiz and rubric drafts faster, then keep the teacher in control.",
        description: "This route is designed as an assistive workspace, not an autopilot.",
        stats: [
          { label: "Question variants", value: "24" },
          { label: "Rubric suggestions", value: "8" },
          { label: "Teacher approval", value: "Required" }
        ],
        panels: [{ title: "Teacher first", body: "AI speeds up drafting, but quality stays under instructor review.", tone: "warm" }]
      },
      "assessments/review": {
        eyebrow: "Submission review",
        title: "Review learner work with clearer queues and less friction.",
        description: "The review workspace should shorten grading time while preserving thoughtful feedback.",
        stats: [
          { label: "Pending submissions", value: "48" },
          { label: "Reviewed today", value: "17" },
          { label: "Average turnaround", value: "19h" }
        ],
        panels: [{ title: "Feedback quality", body: "Keep comments actionable, timely, and consistent." }]
      },
      submissions: {
        eyebrow: "Submission queue",
        title: "A unified view of incoming learner work across your active courses.",
        description: "Use this route to prioritize grading and identify bottlenecks.",
        stats: [
          { label: "Submitted today", value: "62" },
          { label: "Late items", value: "11" },
          { label: "Needs attention", value: "9" }
        ],
        panels: [{ title: "Queue health", body: "Surface urgency without making the workflow feel chaotic." }]
      },
      "live-classes": {
        eyebrow: "Live classes",
        title: "Coordinate teaching sessions, readiness, and post-session follow-up.",
        description: "This route supports both schedule management and session quality.",
        stats: [
          { label: "Upcoming sessions", value: "9" },
          { label: "Attendance", value: "94%" },
          { label: "Recordings pending", value: "2" }
        ],
        panels: [{ title: "Session readiness", body: "Track rooms, materials, and follow-up in one place.", tone: "accent" }]
      },
      "live-classes/new": {
        eyebrow: "Schedule session",
        title: "Create a live class with the right timing, audience, and resources.",
        description: "The creation flow can later connect to calendar, meeting, and reminder services.",
        stats: [
          { label: "Default duration", value: "60 min" },
          { label: "Reminder windows", value: "3" },
          { label: "Recording option", value: "Enabled" }
        ],
        panels: [{ title: "Fast setup", body: "Go from idea to scheduled session in a few guided steps." }]
      },
      students: {
        eyebrow: "Student roster",
        title: "See learner participation, performance, and outreach opportunities across your classes.",
        description: "A good roster view balances progress, support, and recognition.",
        stats: [
          { label: "Students active", value: "248" },
          { label: "Needs outreach", value: "14" },
          { label: "Top performers", value: "36" }
        ],
        panels: [{ title: "Human signals", body: "Keep teaching personal even at scale.", tone: "warm" }]
      },
      settings: {
        eyebrow: "Teacher settings",
        title: "Tune teaching preferences, notifications, and workspace defaults.",
        description: "This page supports the instructor’s daily workflow rather than platform-wide governance.",
        stats: [
          { label: "Notification rules", value: "8" },
          { label: "Saved templates", value: "12" },
          { label: "Workspace presets", value: "4" }
        ],
        panels: [{ title: "Personal workflow", body: "Small settings here can remove a lot of repetitive effort." }]
      }
    };

    if (segments[0] === "live-classes" && segments.length === 2) {
      return {
        eyebrow: "Live class detail",
        title: `Live class ${segments[1]}`,
        description: "Review attendance, chat activity, and follow-up tasks for this session.",
        stats: [
          { label: "Attendance", value: "97%" },
          { label: "Questions asked", value: "34" },
          { label: "Follow-up tasks", value: "5" }
        ],
        panels: [{ title: "Session recap", body: "Capture what happened and what learners need next." }]
      };
    }

    return teacherStaticPages[joined] ?? null;
  }

  if (role === "student") {
    if (joined === "courses") {
      return {
        eyebrow: "My courses",
        title: "A cleaner home for active courses, saved learning paths, and recent wins.",
        description: "Students should immediately understand what is active and what deserves attention next.",
        stats: [
          { label: "Active courses", value: "5" },
          { label: "Saved for later", value: "3" },
          { label: "Completed", value: "9" }
        ],
        panels: [{ title: "Learning focus", body: "Reduce clutter so learners can keep momentum." }]
      };
    }

    if (segments[0] === "courses" && segments.length === 2) {
      return {
        eyebrow: "Course journey",
        title: `Course ${segments[1]} progress`,
        description: "See modules, assignments, live events, and next recommended actions for this course.",
        stats: [
          { label: "Progress", value: "72%" },
          { label: "Modules left", value: "4" },
          { label: "Upcoming due date", value: "Monday" }
        ],
        panels: [{ title: "Next best step", body: "Learners should always know what comes next.", tone: "accent" }]
      };
    }

    if (segments[0] === "learn" && segments.length === 3) {
      return {
        eyebrow: "Lesson player",
        title: `Learning session ${segments[1]} / ${segments[2]}`,
        description: "Lesson delivery pages should keep focus high and navigation friction low.",
        stats: [
          { label: "Lesson progress", value: "38%" },
          { label: "Notes captured", value: "12" },
          { label: "Resources", value: "6" }
        ],
        panels: [{ title: "Focused study", body: "Keep content, notes, and progress in one calm frame.", tone: "warm" }]
      };
    }

    const studentPages: Record<string, PlatformPage> = {
      assignments: {
        eyebrow: "Assignments",
        title: "See upcoming work, recent submissions, and what needs attention first.",
        description: "Assignments should feel manageable, not intimidating.",
        stats: [
          { label: "Due this week", value: "3" },
          { label: "Submitted", value: "18" },
          { label: "Awaiting grade", value: "4" }
        ],
        panels: [{ title: "Deadline clarity", body: "The best assignment views reduce uncertainty and procrastination." }]
      },
      assessments: {
        eyebrow: "Assessments",
        title: "Track quizzes, exams, and practice checks from one study-focused page.",
        description: "Students get one place to prepare, attempt, and review results.",
        stats: [
          { label: "Upcoming", value: "2" },
          { label: "Completed", value: "11" },
          { label: "Average score", value: "88%" }
        ],
        panels: [{ title: "Study rhythm", body: "Keep preparation, performance, and feedback close together.", tone: "accent" }]
      },
      "live-classes": {
        eyebrow: "Live schedule",
        title: "Join upcoming live classes without digging through the platform.",
        description: "This route foregrounds attendance, room access, and recordings.",
        stats: [
          { label: "Sessions this week", value: "4" },
          { label: "Attendance rate", value: "96%" },
          { label: "Recordings available", value: "8" }
        ],
        panels: [{ title: "Join with confidence", body: "Make class timing and access details impossible to miss." }]
      },
      certificates: {
        eyebrow: "Certificates",
        title: "Celebrate earned milestones and keep credentials easy to access.",
        description: "Certificates are proof of progress and should feel meaningful, not buried.",
        stats: [
          { label: "Earned", value: "9" },
          { label: "In progress", value: "3" },
          { label: "Share-ready", value: "100%" }
        ],
        panels: [{ title: "Outcome visibility", body: "Learners should see what they have earned and what comes next.", tone: "warm" }]
      },
      profile: {
        eyebrow: "Student profile",
        title: "Personal details, learning identity, and account information in one place.",
        description: "Profiles give learners ownership over how they show up in the platform.",
        stats: [
          { label: "Profile completion", value: "92%" },
          { label: "Skills tagged", value: "14" },
          { label: "Programs joined", value: "5" }
        ],
        panels: [{ title: "Learning identity", body: "Support a stronger sense of progress and belonging." }]
      },
      settings: {
        eyebrow: "Student settings",
        title: "Control notifications, preferences, and learning convenience features.",
        description: "These settings focus on clarity and comfort rather than heavy administration.",
        stats: [
          { label: "Notification rules", value: "6" },
          { label: "Accessibility toggles", value: "5" },
          { label: "Study reminders", value: "On" }
        ],
        panels: [{ title: "Reduce friction", body: "A few good preference controls make the whole experience feel more supportive.", tone: "accent" }]
      }
    };

    return studentPages[joined] ?? null;
  }

  return null;
}
