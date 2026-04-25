"use client";

import { Bell, CreditCard, Mail, ReceiptText, SendHorizontal, Users } from "lucide-react";
import { useState } from "react";

import {
  backendReadyEndpoints,
  generateCsv,
  overageAmount,
  planMatrix,
  seatUtilizationPercent
} from "@/lib/mock-lms";
import { downloadAuthenticatedFile } from "@/lib/api/lms-backend";
import { useMockLms } from "@/providers/mock-lms-provider";

import {
  Badge,
  MetricGrid,
  PrimaryButton,
  SecondaryButton,
  Section,
  SelectInput,
  TextInput,
  downloadTextFile,
  emailForName,
  openMailDraft
} from "@/components/shared/lms-core";

export function BrandingPanel() {
  const { state, updateBranding } = useMockLms();
  const [form, setForm] = useState(state.branding);

  return (
    <Section title="White-label branding" subtitle="Update the tenant identity, domain, and color system exactly like the SRS provisioning flow expects.">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput value={form.tenantName} onChange={(event) => setForm({ ...form, tenantName: event.target.value })} placeholder="Tenant name" />
          <TextInput value={form.logoText} onChange={(event) => setForm({ ...form, logoText: event.target.value.slice(0, 3) })} placeholder="Logo initials" />
          <TextInput value={form.subdomain} onChange={(event) => setForm({ ...form, subdomain: event.target.value })} placeholder="Subdomain" />
          <TextInput value={form.customDomain} onChange={(event) => setForm({ ...form, customDomain: event.target.value })} placeholder="Custom domain" />
          <TextInput value={form.supportEmail} onChange={(event) => setForm({ ...form, supportEmail: event.target.value })} placeholder="Support email" />
          <div className="grid grid-cols-2 gap-3">
            <TextInput type="color" value={form.primaryColor} onChange={(event) => setForm({ ...form, primaryColor: event.target.value })} />
            <TextInput type="color" value={form.accentColor} onChange={(event) => setForm({ ...form, accentColor: event.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <PrimaryButton onClick={() => updateBranding(form)}>Save branding profile</PrimaryButton>
          </div>
        </div>

        <div
          className="rounded-[1.8rem] p-6 text-white shadow-glow"
          style={{
            background: `linear-gradient(135deg, ${form.primaryColor}, ${form.accentColor})`
          }}
        >
          <p className="text-xs uppercase tracking-[0.24em] text-white/70">Live preview</p>
          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.3rem] bg-white/12 text-xl font-semibold">
              {form.logoText || "BA"}
            </div>
            <div>
              <p className="font-serif text-3xl">{form.tenantName}</p>
              <p className="text-sm text-white/75">{form.customDomain}</p>
            </div>
          </div>
          <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/8 p-4">
            <p className="text-sm text-white/85">White-labeled login page, institute colors, and branded support touchpoints are now configurable in the demo state.</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function CompliancePanel() {
  const { state, currentUser, sendComplianceReminders } = useMockLms();
  const incompleteLearners = state.complianceRecords.filter((record) => !record.certified || record.completionPercent < 100);
  const [selectedRecipientId, setSelectedRecipientId] = useState(incompleteLearners[0]?.id ?? state.complianceRecords[0]?.id ?? "");
  const selectedRecipient =
    state.complianceRecords.find((record) => record.id === selectedRecipientId) ??
    incompleteLearners[0] ??
    state.complianceRecords[0];
  const recipientEmail = selectedRecipient ? emailForName(selectedRecipient.employeeName) : "";
  const subject = selectedRecipient ? `Compliance reminder for ${selectedRecipient.courseTitle}` : "Compliance reminder";
  const body = selectedRecipient
    ? [
        `Hello ${selectedRecipient.employeeName},`,
        "",
        `This is a reminder to complete ${selectedRecipient.courseTitle}.`,
        `Current completion: ${selectedRecipient.completionPercent}%.`,
        "",
        "Please log in to Betopia LMS and finish the remaining steps.",
        "",
        "Regards,",
        "Betopia Academy Compliance Team"
      ].join("\n")
    : "Please complete your pending compliance course.";

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Section title="Compliance reporting" subtitle="Track completion by employee, department, and role, then export the audit-ready view as CSV exactly as described in the SRS.">
        <div className="overflow-auto rounded-[1.4rem] border border-foreground/10 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-foreground/10 bg-background/70 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Employee</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Completion</th>
                <th className="px-4 py-3 font-medium">Certified</th>
              </tr>
            </thead>
            <tbody>
              {state.complianceRecords.map((record) => (
                <tr key={record.id} className="border-b border-foreground/8">
                  <td className="px-4 py-3">{record.employeeName}</td>
                  <td className="px-4 py-3">{record.department}</td>
                  <td className="px-4 py-3">{record.courseTitle}</td>
                  <td className="px-4 py-3">{record.completionPercent}%</td>
                  <td className="px-4 py-3">{record.certified ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Report actions" subtitle="Export data, trigger reminders, and support HR or regulatory workflows from the frontend.">
        <div className="grid gap-3">
          <PrimaryButton
            onClick={() =>
              currentUser
                ? downloadAuthenticatedFile("/api/v1/reports/compliance/export/csv", "compliance-report.csv")
                : downloadTextFile("compliance-report.csv", generateCsv(state.complianceRecords), "text/csv;charset=utf-8")
            }
          >
            Export CSV report
          </PrimaryButton>
          <SecondaryButton
            onClick={() =>
              currentUser
                ? downloadAuthenticatedFile("/api/v1/reports/compliance/export/pdf", "compliance-report.pdf")
                : downloadTextFile("compliance-report.txt", "PDF export placeholder generated by the frontend demo.")
            }
          >
            Export PDF report
          </SecondaryButton>
          <SecondaryButton
            onClick={() => {
              sendComplianceReminders(state.complianceRecords[0]?.courseId ?? "");
              openMailDraft({
                bcc: incompleteLearners.map((record) => emailForName(record.employeeName)),
                subject: "Compliance reminder batch",
                body: "This draft opens in the default mail app so reminders can be sent now without a backend."
              });
            }}
          >
            Send reminder emails
          </SecondaryButton>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-border/70 bg-background/75 p-4 shadow-soft dark:border-white/8 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-cyan-800 dark:text-cyan-200" />
            <p className="text-sm font-semibold">Email sending function</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Works now by opening the default mail app from the browser, so reminders can be sent immediately without waiting for backend SMTP integration.
          </p>
          <div className="mt-4 grid gap-3">
            <SelectInput value={selectedRecipientId} onChange={(event) => setSelectedRecipientId(event.target.value)}>
              {state.complianceRecords.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.employeeName} - {record.courseTitle}
                </option>
              ))}
            </SelectInput>
            <div className="rounded-2xl border border-border/70 bg-card/85 px-4 py-3 text-sm shadow-soft dark:border-white/8 dark:bg-white/5">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Recipient email</p>
              <p className="mt-1 font-medium">{recipientEmail}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <PrimaryButton
                onClick={() => {
                  if (!selectedRecipient) return;
                  sendComplianceReminders(selectedRecipient.courseId);
                  openMailDraft({
                    to: recipientEmail,
                    subject,
                    body
                  });
                }}
              >
                <SendHorizontal className="mr-2 h-4 w-4" />
                Open mail app
              </PrimaryButton>
              <SecondaryButton
                onClick={() =>
                  downloadTextFile(
                    `${selectedRecipient?.employeeName.replace(/\s+/g, "-").toLowerCase() ?? "compliance"}-mail-draft.txt`,
                    `To: ${recipientEmail}\nSubject: ${subject}\n\n${body}`
                  )
                }
              >
                Download mail draft
              </SecondaryButton>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

export function CertificatesPanel() {
  const { state, issueCertificate, revokeCertificate } = useMockLms();
  const [studentName, setStudentName] = useState("Rafi Khan");
  const [courseId, setCourseId] = useState(state.courses[0]?.id ?? "");

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <Section title="Issue certificate" subtitle="Generate branded certificates after passing criteria and allow later revocation or secure sharing.">
        <div className="grid gap-3">
          <TextInput value={studentName} onChange={(event) => setStudentName(event.target.value)} />
          <SelectInput value={courseId} onChange={(event) => setCourseId(event.target.value)}>
            {state.courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </SelectInput>
          <PrimaryButton onClick={() => issueCertificate(studentName, courseId)}>Generate certificate</PrimaryButton>
        </div>
      </Section>

      <Section title="Certificate register" subtitle="Download, verify, or revoke generated certificates from a central register.">
        <div className="grid gap-4">
          {state.certificates.map((certificate) => (
            <div key={certificate.id} className="rounded-[1.5rem] border border-foreground/10 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-serif text-2xl">{certificate.courseTitle}</p>
                  <p className="text-sm text-muted-foreground">{certificate.studentName} · {certificate.verificationCode}</p>
                </div>
                <Badge>{certificate.revoked ? "revoked" : "active"}</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <SecondaryButton
                  onClick={() =>
                    downloadTextFile(
                      `${certificate.studentName.replace(/\s+/g, "-").toLowerCase()}-certificate.txt`,
                      `Certificate for ${certificate.studentName}\nCourse: ${certificate.courseTitle}\nVerification: ${certificate.verificationCode}`
                    )
                  }
                >
                  Download
                </SecondaryButton>
                {!certificate.revoked ? <SecondaryButton onClick={() => revokeCertificate(certificate.id)}>Revoke</SecondaryButton> : null}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

export function BillingPanel() {
  const { state, updatePlan, updateActiveStudents } = useMockLms();
  const utilization = seatUtilizationPercent(state.billing);
  const overage = overageAmount(state.billing);

  return (
    <div className="grid gap-6">
      <MetricGrid
        items={[
          { label: "Current plan", value: state.billing.plan, icon: <CreditCard className="h-5 w-5" /> },
          { label: "Monthly fee", value: `$${state.billing.monthlyPrice}`, icon: <ReceiptText className="h-5 w-5" /> },
          { label: "Seat usage", value: `${state.billing.activeStudents}/${state.billing.seatLimit}`, icon: <Users className="h-5 w-5" /> },
          { label: "Overage", value: `$${overage}`, icon: <Bell className="h-5 w-5" /> }
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Section title="Plan management" subtitle="Switch between Starter, Growth, and Professional and see seat economics update immediately.">
          <div className="grid gap-4 md:grid-cols-3">
            {(Object.keys(planMatrix) as Array<keyof typeof planMatrix>).map((plan) => (
              <div key={plan} className={`overflow-hidden rounded-[1.85rem] border p-5 shadow-soft transition ${state.billing.plan === plan ? "border-cyan-900/15 bg-[linear-gradient(160deg,#0b3240,#145a71_58%,#ff8a1a)] text-white shadow-glow dark:border-cyan-400/20" : "border-border/70 bg-card/85 dark:border-white/8 dark:bg-white/5"}`}>
                <p className="text-pretty-wrap font-serif text-[clamp(2rem,2vw,2.45rem)] leading-none">{plan}</p>
                <p className={`text-pretty-wrap mt-3 text-sm leading-6 ${state.billing.plan === plan ? "text-cyan-100/80" : "text-muted-foreground"}`}>
                  ${planMatrix[plan].price}/mo · {planMatrix[plan].seatLimit} seats · ${planMatrix[plan].overagePerSeat}/seat overage
                </p>
                <PrimaryButton className="mt-4 w-full text-center" onClick={() => updatePlan(plan)}>
                  {state.billing.plan === plan ? "Current plan" : "Switch plan"}
                </PrimaryButton>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Seat utilization" subtitle="Seat alerts and overage behavior are part of the frontend demo too.">
          <div className="rounded-[1.4rem] border border-foreground/10 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Active students</p>
              <p className="text-sm text-muted-foreground">{utilization}% utilized</p>
            </div>
            <input
              className="mt-5 w-full accent-cyan-800"
              type="range"
              min={10}
              max={2200}
              value={state.billing.activeStudents}
              onChange={(event) => updateActiveStudents(Number(event.target.value))}
            />
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-900 via-cyan-600 to-orange-500" style={{ width: `${Math.min(100, utilization)}%` }} />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Current overage charge: <span className="font-semibold text-foreground">${overage}</span>
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}

export function BillingStudio() {
  const { state } = useMockLms();
  const overage = overageAmount(state.billing);

  return (
    <div className="grid gap-6">
      <MetricGrid
        items={[
          { label: "Current plan", value: state.billing.plan, icon: <CreditCard className="h-5 w-5" /> },
          { label: "Monthly fee", value: `$${state.billing.monthlyPrice}`, icon: <ReceiptText className="h-5 w-5" /> },
          { label: "Seat usage", value: `${state.billing.activeStudents}/${state.billing.seatLimit}`, icon: <Users className="h-5 w-5" /> },
          { label: "Overage", value: `$${overage}`, icon: <Bell className="h-5 w-5" /> }
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[0.64fr_1.36fr]">
        <SeatUtilizationPanel />
        <PlanManagementPanel />
      </div>
    </div>
  );
}

export function SeatUtilizationPanel() {
  const { state, updateActiveStudents } = useMockLms();
  const utilization = seatUtilizationPercent(state.billing);
  const overage = overageAmount(state.billing);

  return (
    <Section title="Seat utilization" subtitle="Track usage live and see how much seat headroom is left before overage kicks in.">
      <div className="rounded-[1.7rem] border border-border/70 bg-card/85 p-5 shadow-soft dark:border-white/8 dark:bg-white/5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Active students</p>
            <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">Live seat monitor</p>
          </div>
          <div className="rounded-full bg-background/90 px-3 py-1 text-sm text-muted-foreground dark:bg-white/5">
            {utilization}% utilized
          </div>
        </div>

        <input
          className="mt-6 w-full accent-cyan-800"
          type="range"
          min={10}
          max={2200}
          value={state.billing.activeStudents}
          onChange={(event) => updateActiveStudents(Number(event.target.value))}
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.3rem] bg-background/80 p-4 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Current usage</p>
            <p className="mt-2 font-serif text-4xl">
              {state.billing.activeStudents}
              <span className="ml-1 text-lg text-muted-foreground">learners</span>
            </p>
          </div>
          <div className="rounded-[1.3rem] bg-background/80 p-4 dark:bg-white/5">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Seat buffer</p>
            <p className="mt-2 font-serif text-4xl">
              {Math.max(0, state.billing.seatLimit - state.billing.activeStudents)}
              <span className="ml-1 text-lg text-muted-foreground">left</span>
            </p>
          </div>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted/80 dark:bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-900 via-cyan-600 to-orange-500" style={{ width: `${Math.min(100, utilization)}%` }} />
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Current overage charge: <span className="font-semibold text-foreground">${overage}</span>
        </p>
      </div>
    </Section>
  );
}

export function PlanManagementPanel() {
  const { state, updatePlan } = useMockLms();

  return (
    <Section title="Plan management" subtitle="Switch plans instantly and review seat economics from a cleaner control surface.">
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {(Object.keys(planMatrix) as Array<keyof typeof planMatrix>).map((plan) => {
          const active = state.billing.plan === plan;
          const planTitleClass =
            plan === "Professional"
              ? "text-[clamp(1.55rem,1.35vw,2.15rem)]"
              : "text-[clamp(1.8rem,1.55vw,2.5rem)]";

          return (
            <div
              key={plan}
              className={`relative overflow-hidden rounded-[1.9rem] border p-4 sm:p-5 ${
                active
                  ? "border-cyan-900/15 bg-[linear-gradient(160deg,#0b3240,#145a71_58%,#ff8a1a)] text-white shadow-glow dark:border-cyan-400/20"
                  : "border-border/70 bg-card/85 shadow-soft dark:border-white/8 dark:bg-white/5"
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.24),transparent_55%)]" />
              <div className="relative">
                <div className="flex items-start justify-end gap-3">
                  <div className={`shrink-0 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.24em] ${active ? "bg-white/12 text-white" : "bg-cyan-950/6 text-cyan-900 dark:bg-white/10 dark:text-cyan-100"}`}>
                    {planMatrix[plan].seatLimit} seats
                  </div>
                </div>

                <div className="mt-4 min-w-0">
                  <p className={`font-serif ${planTitleClass} leading-[0.92] tracking-[-0.05em]`}>{plan}</p>
                  <p className={`mt-2 text-xs font-medium uppercase tracking-[0.24em] ${active ? "text-cyan-100/78" : "text-muted-foreground"}`}>
                    {active ? "Active tier" : "Available tier"}
                  </p>
                </div>

                <p className={`text-pretty-wrap mt-4 text-sm leading-7 ${active ? "text-cyan-100/82" : "text-muted-foreground"}`}>
                  ${planMatrix[plan].price} / month
                  <br />
                  ${planMatrix[plan].overagePerSeat} per extra seat
                </p>

                <div className="mt-5 grid gap-2 text-sm">
                  <div className={`text-pretty-wrap rounded-2xl px-3 py-2 ${active ? "bg-white/10 text-white" : "bg-background/85 text-muted-foreground dark:bg-white/5"}`}>
                    Live class capacity: {planMatrix[plan].liveLimit || "Not included"}
                  </div>
                  <div className={`text-pretty-wrap rounded-2xl px-3 py-2 ${active ? "bg-white/10 text-white" : "bg-background/85 text-muted-foreground dark:bg-white/5"}`}>
                    White-label branding: {planMatrix[plan].whiteLabel ? "Included" : "Upgrade required"}
                  </div>
                </div>

                <PrimaryButton
                  className={`mt-5 w-full text-center ${active ? "bg-white text-cyan-950 ring-0 hover:shadow-soft" : ""}`}
                  onClick={() => updatePlan(plan)}
                  disabled={active}
                >
                  {active ? "Current plan" : "Switch plan"}
                </PrimaryButton>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

export function NotificationsPanel() {
  const { state } = useMockLms();

  return (
    <Section title="Notification center" subtitle="Transactional, compliance, billing, and live-class notices are all visible in one stream.">
      <div className="grid gap-3">
        {state.notifications.map((notification) => (
          <div key={notification.id} className="rounded-[1.4rem] border border-foreground/10 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge>{notification.type}</Badge>
                <Badge>{notification.audience}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</p>
            </div>
            <p className="mt-3 text-sm leading-6">{notification.message}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function AuditPanel() {
  const { state } = useMockLms();

  return (
    <Section title="Audit trail" subtitle="Administrative actions, target objects, timestamp, and IP metadata remain visible for operational trust.">
      <div className="overflow-auto rounded-[1.4rem] border border-foreground/10 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-foreground/10 bg-background/70 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Actor</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="px-4 py-3 font-medium">IP</th>
              <th className="px-4 py-3 font-medium">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {state.auditEvents.map((event) => (
              <tr key={event.id} className="border-b border-foreground/8">
                <td className="px-4 py-3">{event.actor}</td>
                <td className="px-4 py-3">{event.action}</td>
                <td className="px-4 py-3">{event.target}</td>
                <td className="px-4 py-3">{event.ipAddress}</td>
                <td className="px-4 py-3">{new Date(event.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
