"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Bell, Layers3, ShieldCheck, Users } from "lucide-react";
import { useEffect } from "react";

import type { Role } from "@/lib/mock-lms";
import { seatUtilizationPercent } from "@/lib/mock-lms";
import { dashboardPathForRole, useMockLms } from "@/providers/mock-lms-provider";

import {
  AdminAiToolsPanel,
  AdminAssessmentsPanel,
  AuditPanel,
  BillingStudio,
  BrandingPanel,
  CertificatesPanel,
  CompliancePanel,
  EnrollmentManagementPanel,
  InstituteSettingsPanel,
  LiveClassMonitorPanel,
  NotificationsPanel,
  PaymentsPanel,
  PlanManagementPanel,
  UserDirectoryPanel,
  SeatUtilizationPanel
} from "@/components/admin/admin-panels";
import { pageFrame, Badge, MetricGrid, Section, WorkspaceHero } from "@/components/shared/lms-core";
import {
  StudentAssessmentPanel,
  StudentCertificatesPanel,
  StudentCoursesPanel,
  StudentDashboardPanel,
  StudentLiveClassesPanel,
  StudentSettingsPanel
} from "@/components/student/student-panels";
import {
  AssessmentLab,
  ContentUploadsPanel,
  EssayEvaluationPanel,
  CourseWorkbench,
  LiveClassesPanel,
  TeacherAnnouncementsPanel,
  TeacherDashboardPanel,
  TeacherAssessmentsPanel,
  TeacherMessagesPanel,
  TeacherSettingsPanel,
  TeacherStudentPerformancePanel,
  TeacherSubmissionsPanel
} from "@/components/teacher/teacher-panels";

function GenericRoster({
  title,
  users
}: {
  title: string;
  users: Array<{ name: string; role: string; email: string; department?: string }>;
}) {
  return (
    <Section title={title} subtitle="Role-based access and directory visibility are part of the SRS and surfaced here in the frontend.">
      <div className="grid gap-3">
        {users.map((user) => (
          <div key={user.email} className="rounded-[1.4rem] border border-foreground/10 bg-white p-4 dark:border-white/8 dark:bg-[#13212a]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <Badge>{user.role}</Badge>
                {user.department ? <Badge>{user.department}</Badge> : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function roleHero(role: Role, joined: string) {
  if (role === "admin") {
    return {
      eyebrow: "Admin workspace",
      title:
        joined === "branding"
          ? "Control tenant identity and white-label setup."
          : joined === "billing"
            ? "Manage subscription economics and seat usage."
            : joined === "reports/compliance"
              ? "Export audit-ready compliance views."
              : "Run the LMS like a multi-tenant SaaS product.",
      description: "These admin pages now implement the operational flows in your SRS rather than just describing them."
    };
  }

  if (role === "teacher") {
    return {
      eyebrow: "Teacher workspace",
      title: joined.includes("assessment")
        ? "Generate, review, and publish AI-assisted assessments."
        : joined.includes("course")
          ? "Create structured learning experiences with modules and lessons."
          : "Operate the teaching workflow from one connected workspace.",
      description: "Course authoring, assessment review, submission oversight, and live teaching are all interactable here."
    };
  }

  return {
    eyebrow: "Student workspace",
    title: joined.includes("assessment")
      ? "Submit work, receive scoring, and track feedback."
      : joined.includes("certificate")
        ? "Access earned certificates and progress records."
        : "Learn through structured courses with clear next steps.",
    description: "The learner side now includes working progress, submissions, live-class visibility, and certificate actions."
  };
}

export function WorkspaceExperience({
  role,
  segments
}: {
  role: Role;
  segments: string[];
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { state, currentUser, authReady, isAuthenticated } = useMockLms();
  const joined = segments.join("/");
  const hero = roleHero(role, joined);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (currentUser && currentUser.role !== role) {
      router.replace(dashboardPathForRole(currentUser.role));
    }
  }, [authReady, currentUser, isAuthenticated, pathname, role, router]);

  if (!authReady || !isAuthenticated || currentUser?.role !== role) {
    return (
      <div className={`${pageFrame} pb-24 pt-14`}>
        <Section title="Securing workspace access" subtitle="Your session is being checked so each user only sees their own dashboard and allowed workspace.">
          <p className="text-sm text-muted-foreground">Redirecting to the correct sign-in or dashboard view...</p>
        </Section>
      </div>
    );
  }

  let content: ReactNode;

  if (role === "admin") {
    if (joined === "branding") {
      content = <BrandingPanel />;
    } else if (joined === "tenants" || joined === "institute-settings" || joined === "settings") {
      content = <InstituteSettingsPanel />;
    } else if (joined === "courses") {
      content = <CourseWorkbench />;
    } else if (joined === "enrollments") {
      content = <EnrollmentManagementPanel />;
    } else if (joined === "assessments") {
      content = <AdminAssessmentsPanel />;
    } else if (joined === "ai-tools") {
      content = <AdminAiToolsPanel />;
    } else if (joined === "live-classes") {
      content = <LiveClassMonitorPanel />;
    } else if (joined === "reports/compliance") {
      content = <CompliancePanel />;
    } else if (joined === "certificates") {
      content = <CertificatesPanel />;
    } else if (joined === "billing") {
      content = <BillingStudio />;
    } else if (joined === "payments") {
      content = <PaymentsPanel />;
    } else if (joined === "notifications") {
      content = <NotificationsPanel />;
    } else if (joined === "audit-logs") {
      content = <AuditPanel />;
    } else if (joined === "users") {
      content = <UserDirectoryPanel />;
    } else if (joined === "teachers") {
      content = <UserDirectoryPanel roleFilter="teacher" />;
    } else if (joined === "students") {
      content = <UserDirectoryPanel roleFilter="student" />;
    } else if (joined === "reports" || joined === "dashboard" || joined === "") {
      content = (
        <div className="grid gap-6">
          <MetricGrid
            items={[
              { label: "Active tenants", value: "312", icon: <Layers3 className="h-5 w-5" /> },
              { label: "Seat utilization", value: `${seatUtilizationPercent(state.billing)}%`, icon: <Users className="h-5 w-5" /> },
              { label: "Compliance certificates", value: String(state.certificates.length), icon: <ShieldCheck className="h-5 w-5" /> },
              { label: "Open notifications", value: String(state.notifications.length), icon: <Bell className="h-5 w-5" /> }
            ]}
          />
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-6">
              <InstituteSettingsPanel />
              <BrandingPanel />
              <EnrollmentManagementPanel />
              <SeatUtilizationPanel />
            </div>
            <div className="grid gap-6">
              <PlanManagementPanel />
              <AdminAiToolsPanel />
            </div>
          </div>
        </div>
      );
    } else {
      content = <GenericRoster title="Admin directory" users={state.users} />;
    }
  } else if (role === "teacher") {
    if (joined === "courses" || joined === "courses/new" || joined.endsWith("/edit") || joined.startsWith("courses/")) {
      const specificCourseId = segments[1];
      content = <CourseWorkbench defaultCourseId={specificCourseId} />;
    } else if (joined === "modules-lessons" || joined === "content-uploads") {
      content = <ContentUploadsPanel />;
    } else if (joined === "assessments" || joined === "assessments/ai-generate" || joined === "assessments/review") {
      content = <AssessmentLab reviewMode={joined === "assessments/review"} />;
    } else if (joined === "assignments") {
      content = <TeacherAssessmentsPanel />;
    } else if (joined === "submissions") {
      content = <TeacherSubmissionsPanel />;
    } else if (joined === "essay-evaluation") {
      content = <EssayEvaluationPanel />;
    } else if (joined === "live-classes" || joined === "live-classes/new" || joined.startsWith("live-classes/")) {
      content = <LiveClassesPanel />;
    } else if (joined === "students") {
      content = <TeacherStudentPerformancePanel />;
    } else if (joined === "announcements") {
      content = <TeacherAnnouncementsPanel />;
    } else if (joined === "messages") {
      content = <TeacherMessagesPanel />;
    } else if (joined === "settings") {
      content = <TeacherSettingsPanel />;
    } else {
      content = <TeacherDashboardPanel />;
    }
  } else {
    if (joined === "courses" || joined.startsWith("courses/") || joined.startsWith("learn/")) {
      const courseId = joined.startsWith("courses/") ? segments[1] : joined.startsWith("learn/") ? segments[1] : undefined;
      content = <StudentCoursesPanel selectedCourseId={courseId} />;
    } else if (joined === "assessments" || joined === "assignments") {
      content = <StudentAssessmentPanel />;
    } else if (joined === "live-classes") {
      content = <StudentLiveClassesPanel />;
    } else if (joined === "certificates") {
      content = <StudentCertificatesPanel />;
    } else if (joined === "profile" || joined === "settings") {
      content = <StudentSettingsPanel />;
    } else {
      content = <StudentDashboardPanel />;
    }
  }

  return (
    <>
      <WorkspaceHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        actions={
          <>
            <Link href="/" className="rounded-full border border-foreground/15 px-5 py-3 text-sm font-semibold">
              Home
            </Link>
            <Link href="/pricing" className="rounded-full border border-foreground/15 px-5 py-3 text-sm font-semibold">
              Pricing
            </Link>
          </>
        }
      />
      <div className={`${pageFrame} grid gap-6 pb-24 xl:pb-20`}>{content}</div>
    </>
  );
}
