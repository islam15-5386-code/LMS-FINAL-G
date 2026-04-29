"use client";

import { Activity, Bell, CheckCheck, CheckCircle2, ClipboardCheck, CreditCard, GraduationCap, Hourglass, Lock, Mail, ReceiptText, SendHorizontal, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";

import {
  backendReadyEndpoints,
  generateCsv,
  overageAmount,
  planMatrix,
  seatUtilizationPercent
} from "@/lib/mock-lms";
import { 
  downloadAuthenticatedFile,
  fetchAdminCoursesFromBackend,
  fetchAdminTeachersFromBackend,
  fetchCourseTeachersFromBackend,
  assignTeachersToCourseOnBackend,
  removeTeacherFromCourseOnBackend,
  fetchCourseStudentsFromBackend,
  removeStudentFromCourseOnBackend
} from "@/lib/api/lms-backend";
import { useMockLms } from "@/providers/mock-lms-provider";

import {
  Badge,
  MetricGrid,
  PrimaryButton,
  SecondaryButton,
  SeeMoreButton,
  Section,
  SelectInput,
  StatCard,
  TextInput,
  TextArea,
  downloadTextFile,
  emailForName,
  openMailDraft
} from "@/components/shared/lms-core";

const bangladeshiInstitutePresets = [
  {
    id: "diu",
    label: "Smart LMS Platform",
    previewCopy: "Smart LMS Platform branding, learner access, and support touchpoints are ready for tenant provisioning in the demo workspace.",
    branding: {
      tenantName: "Smart LMS Platform",
      vendorName: "Smart LMS Platform",
      city: "Dhaka",
      logoText: "SL",
      subdomain: "smart-lms-platform",
      vendorSubdomain: "smart-lms-platform",
      customDomain: "learn.smartlms.local",
      supportEmail: "support@smartlms.local",
      primaryColor: "#6d28d9",
      accentColor: "#16a34a"
    }
  },
  {
    id: "bracu",
    label: "BRAC University",
    previewCopy: "BRAC University white-label learner access and branded support settings stay aligned with Smart LMS tenant provisioning.",
    branding: {
      tenantName: "BRAC University",
      vendorName: "BRAC University",
      city: "Dhaka",
      logoText: "BRACU",
      subdomain: "bracu",
      vendorSubdomain: "bracu",
      customDomain: "learn.bracu.ac.bd",
      supportEmail: "support@bracu.ac.bd",
      primaryColor: "#1d4ed8",
      accentColor: "#dc2626"
    }
  },
  {
    id: "tti",
    label: "Tepantor Training Institute",
    previewCopy: "Tepantor Training Institute branding, domain mapping, and support identity are prefilled for clean tenant setup demos.",
    branding: {
      tenantName: "Tepantor Training Institute",
      vendorName: "Tepantor Training Institute",
      city: "Chattogram",
      logoText: "TTI",
      subdomain: "tepantor",
      vendorSubdomain: "tepantor",
      customDomain: "learn.tepantor.com.bd",
      supportEmail: "support@tepantor.com.bd",
      primaryColor: "#0f766e",
      accentColor: "#f97316"
    }
  }
] as const;

type BangladeshiInstitutePresetId = (typeof bangladeshiInstitutePresets)[number]["id"];

function resolveInstitutePresetId(subdomain: string) {
  return bangladeshiInstitutePresets.find((preset) => preset.branding.subdomain === subdomain)?.id ?? bangladeshiInstitutePresets[0].id;
}

export function BrandingPanel() {
  const { state, updateBranding } = useMockLms();
  const [form, setForm] = useState(state.branding);
  const [selectedInstitute, setSelectedInstitute] = useState(resolveInstitutePresetId(state.branding.subdomain));

  useEffect(() => {
    setForm(state.branding);
    setSelectedInstitute(resolveInstitutePresetId(state.branding.subdomain));
  }, [state.branding]);

  const activePreset = bangladeshiInstitutePresets.find((preset) => preset.id === selectedInstitute) ?? bangladeshiInstitutePresets[0];

  const applyInstitutePreset = async (presetId: BangladeshiInstitutePresetId) => {
    const preset = bangladeshiInstitutePresets.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }

    const nextBranding = {
      ...state.branding,
      ...preset.branding
    };

    setSelectedInstitute(presetId);
    setForm(nextBranding);
    await updateBranding(nextBranding);
  };

  return (
    <Section title="White-label branding" subtitle="Update the tenant identity, domain, and color system exactly like the SRS provisioning flow expects.">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <SelectInput value={selectedInstitute} onChange={(event) => void applyInstitutePreset(event.target.value as BangladeshiInstitutePresetId)}>
              {bangladeshiInstitutePresets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </SelectInput>
          </div>
          <TextInput value={form.tenantName} onChange={(event) => setForm({ ...form, tenantName: event.target.value, vendorName: event.target.value })} placeholder="Tenant name" />
          <TextInput value={form.logoText} onChange={(event) => setForm({ ...form, logoText: event.target.value.slice(0, 6) })} placeholder="Short name" />
          <TextInput value={form.subdomain} onChange={(event) => setForm({ ...form, subdomain: event.target.value, vendorSubdomain: event.target.value })} placeholder="Subdomain" />
          <TextInput value={form.customDomain} onChange={(event) => setForm({ ...form, customDomain: event.target.value })} placeholder="Custom domain" />
          <TextInput value={form.supportEmail} onChange={(event) => setForm({ ...form, supportEmail: event.target.value })} placeholder="Support email" />
          <div className="grid grid-cols-2 gap-3">
            <TextInput type="color" value={form.primaryColor} onChange={(event) => setForm({ ...form, primaryColor: event.target.value })} />
            <TextInput type="color" value={form.accentColor} onChange={(event) => setForm({ ...form, accentColor: event.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <PrimaryButton onClick={() => updateBranding({ ...form, vendorName: form.tenantName, vendorSubdomain: form.subdomain })}>Save branding profile</PrimaryButton>
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
            <p className="text-sm text-white/85">{activePreset.previewCopy}</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function CompliancePanel() {
  const { state, currentUser, sendComplianceReminders } = useMockLms();
  const incompleteLearners = state.complianceRecords.filter((record) => !record.certified || record.completionPercent < 100);
  const [showAllRecords, setShowAllRecords] = useState(false);
  const visibleComplianceRecords = showAllRecords ? state.complianceRecords : state.complianceRecords.slice(0, 5);

  const [emailInput, setEmailInput] = useState("tanvirulislam5386@gmail.com");

  const selectedUser = state.users.find((u) => u.email === emailInput);
  const selectedRecipient = selectedUser
    ? state.complianceRecords.find((r) => r.employeeName === selectedUser.name)
    : null;

  const defaultSubject = selectedRecipient ? `Compliance reminder for ${selectedRecipient.courseTitle}` : "System Notification";
  const defaultBody = selectedRecipient
    ? [
        `Hello ${selectedRecipient.employeeName},`,
        "",
        `This is a reminder to complete ${selectedRecipient.courseTitle}.`,
        `Current completion: ${selectedRecipient.completionPercent}%.`,
        "",
        "Please log in to Smart LMS and finish the remaining steps.",
        "",
        "Regards,",
        "Smart LMS Compliance Team"
      ].join("\n")
    : "Hello,\n\nPlease log in to check your latest updates.\n\nRegards,\nSmart LMS Team";

  const [customSubject, setCustomSubject] = useState(defaultSubject);
  const [customBody, setCustomBody] = useState(defaultBody);

  useEffect(() => {
    setCustomSubject(defaultSubject);
    setCustomBody(defaultBody);
  }, [emailInput, selectedUser, selectedRecipient]);

  const { sendCustomEmail } = useMockLms();

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[1.5rem] bg-[#f5f4ef] border-[6px] border-[#10b981] p-8 sm:p-10 text-slate-900 shadow-soft dark:bg-[#13212a] dark:text-white dark:border-[#10b981]/50">
        <h2 className="text-[clamp(2.5rem,4vw,3.5rem)] leading-[1.05] tracking-[-0.04em]">
          <span className="font-medium text-slate-800 dark:text-white/80">Purpose of a</span>
          <br />
          <span className="font-extrabold text-black dark:text-white">Compliance Report</span>
        </h2>
        
        <div className="mt-10 grid gap-8">
          <div className="flex gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#10b981] text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
            <p className="text-lg leading-7 text-slate-700 dark:text-white/80">
              <strong className="font-bold text-black dark:text-white">Unblocking deals</strong> that would have been held up by security concerns or tedious questionnaires.
            </p>
          </div>
          
          <div className="flex gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#10b981] text-white">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <p className="text-lg leading-7 text-slate-700 dark:text-white/80">
              <strong className="font-bold text-black dark:text-white">Providing proof of successful audits and assessments</strong> like SOC 2, ISO 27001, HIPAA, PCI DSS, FedRAMP, and CMMC as well as your current compliance status.
            </p>
          </div>

          <div className="flex gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#10b981] text-white">
              <Lock className="h-6 w-6" />
            </div>
            <p className="text-lg leading-7 text-slate-700 dark:text-white/80">
              <strong className="font-bold text-black dark:text-white">Demonstrating accountability and transparency</strong> to customers, partners, regulators, boards, and other stakeholders.
            </p>
          </div>

          <div className="flex gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#10b981] text-white">
              <CheckCheck className="h-6 w-6" />
            </div>
            <p className="text-lg leading-7 text-slate-700 dark:text-white/80">
              <strong className="font-bold text-black dark:text-white">Tracking and reporting on compliance activities</strong> to identify any gaps, plan and track remediation efforts, and ensure continuous improvement over time.
            </p>
          </div>

          <div className="flex gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#10b981] text-white">
              <Activity className="h-6 w-6" />
            </div>
            <p className="text-lg leading-7 text-slate-700 dark:text-white/80">
              <strong className="font-bold text-black dark:text-white">Reducing regulatory and reputational risk</strong> by showing you’ve taken proactive steps to comply with laws and frameworks that apply to your industry, location, or data.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Section title="Compliance reporting" subtitle="Track completion by employee, department, and role, then export the audit-ready view as CSV exactly as described in the SRS.">
        <div className="overflow-auto rounded-[1.4rem] border border-foreground/10 bg-white dark:border-white/8 dark:bg-[#13212a]">
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
              {visibleComplianceRecords.map((record) => (
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
        {state.complianceRecords.length > 5 ? (
          <SeeMoreButton expanded={showAllRecords} remaining={state.complianceRecords.length - 5} onClick={() => setShowAllRecords((current) => !current)} />
        ) : null}
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
            <Mail className="h-4 w-4 text-[#1f2c69] dark:text-indigo-200" />
            <p className="text-sm font-semibold">Send Email via SMTP</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Write and send an email directly to any user. It uses the SMTP configuration set in your backend <code className="text-xs bg-white/10 px-1 py-0.5 rounded">.env</code>.
          </p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-border/70 bg-card/85 px-4 py-4 text-sm shadow-soft dark:border-white/8 dark:bg-white/5 flex flex-col gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">Recipient email</p>
                <SelectInput 
                  value={emailInput} 
                  onChange={(event) => setEmailInput(event.target.value)}
                >
                  <option value="tanvirulislam5386@gmail.com">tanvirulislam5386@gmail.com (Default)</option>
                  {state.users
                    .filter((user) => user.role === "student")
                    .map((user) => (
                      <option key={user.id} value={user.email}>
                        {user.email} ({user.name})
                      </option>
                  ))}
                </SelectInput>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">Subject</p>
                <TextInput 
                  value={customSubject} 
                  onChange={(e) => setCustomSubject(e.target.value)} 
                  placeholder="Email subject" 
                />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground mb-2">Body</p>
                <TextArea 
                  value={customBody} 
                  onChange={(e) => setCustomBody(e.target.value)} 
                  rows={6}
                  placeholder="Email message..." 
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <PrimaryButton
                onClick={() => {
                  sendCustomEmail(emailInput, customSubject, customBody);
                }}
              >
                <SendHorizontal className="mr-2 h-4 w-4" />
                Send Email
              </PrimaryButton>
              <SecondaryButton
                onClick={() =>
                  downloadTextFile(
                    `${emailInput.split('@')[0] ?? "user"}-mail-draft.txt`,
                    `To: ${emailInput}\nSubject: ${customSubject}\n\n${customBody}`
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
    </div>
  );
}

export function CertificatesPanel() {
  const { state, issueCertificate, revokeCertificate } = useMockLms();
  const [studentName, setStudentName] = useState("Rafi Khan");
  const [courseId, setCourseId] = useState(state.courses[0]?.id ?? "");
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  const visibleCertificates = showAllCertificates ? state.certificates : state.certificates.slice(0, 5);

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
          {visibleCertificates.map((certificate) => (
            <div key={certificate.id} className="rounded-[1.5rem] border border-foreground/10 bg-white p-5 dark:border-white/8 dark:bg-[#13212a]">
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
        {state.certificates.length > 5 ? (
          <SeeMoreButton expanded={showAllCertificates} remaining={state.certificates.length - 5} onClick={() => setShowAllCertificates((current) => !current)} />
        ) : null}
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
              <div key={plan} className={`overflow-hidden rounded-[1.85rem] border p-5 shadow-soft transition ${state.billing.plan === plan ? "border-primary/25 bg-[linear-gradient(160deg,#1f2c69,#3346a8_58%,#7c5cff)] text-white shadow-glow dark:border-primary/25" : "border-border/70 bg-card/85 dark:border-white/8 dark:bg-white/5"}`}>
                <p className="text-pretty-wrap font-serif text-[clamp(2rem,2vw,2.45rem)] leading-none">{plan}</p>
                <p className={`text-pretty-wrap mt-3 text-sm leading-6 ${state.billing.plan === plan ? "text-white/80" : "text-muted-foreground"}`}>
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
          <div className="rounded-[1.4rem] border border-foreground/10 bg-white p-4 dark:border-white/8 dark:bg-[#13212a]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Active students</p>
              <p className="text-sm text-muted-foreground">{utilization}% utilized</p>
            </div>
            <input
              className="mt-5 w-full accent-[#6366f1]"
              type="range"
              min={10}
              max={2200}
              value={state.billing.activeStudents}
              onChange={(event) => updateActiveStudents(Number(event.target.value))}
            />
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-gradient-to-r from-[#1f2c69] via-[#3346a8] to-[#7c5cff]" style={{ width: `${Math.min(100, utilization)}%` }} />
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
          className="mt-6 w-full accent-[#6366f1]"
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
          <div className="h-full rounded-full bg-gradient-to-r from-[#1f2c69] via-[#3346a8] to-[#7c5cff]" style={{ width: `${Math.min(100, utilization)}%` }} />
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
                  ? "border-primary/25 bg-[linear-gradient(160deg,#1f2c69,#3346a8_58%,#7c5cff)] text-white shadow-glow dark:border-primary/25"
                  : "border-border/70 bg-card/85 shadow-soft dark:border-white/8 dark:bg-white/5"
              }`}
            >
              <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.24),transparent_55%)]" />
              <div className="relative">
                <div className="flex items-start justify-end gap-3">
                  <div className={`shrink-0 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.24em] ${active ? "bg-white/12 text-white" : "bg-[#1f2c69]/8 text-[#1f2c69] dark:bg-white/10 dark:text-indigo-200"}`}>
                    {planMatrix[plan].seatLimit} seats
                  </div>
                </div>

                <div className="mt-4 min-w-0">
                  <p className={`font-serif ${planTitleClass} leading-[0.92] tracking-[-0.05em]`}>{plan}</p>
                  <p className={`mt-2 text-xs font-medium uppercase tracking-[0.24em] ${active ? "text-white/78" : "text-muted-foreground"}`}>
                    {active ? "Active tier" : "Available tier"}
                  </p>
                </div>

                <p className={`text-pretty-wrap mt-4 text-sm leading-7 ${active ? "text-white/82" : "text-muted-foreground"}`}>
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
                  className={`mt-5 w-full text-center ${active ? "bg-white text-[#1f2c69] ring-0 hover:shadow-soft" : ""}`}
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
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const visibleNotifications = showAllNotifications ? state.notifications : state.notifications.slice(0, 5);

  return (
    <Section title="Notification center" subtitle="Transactional, compliance, billing, and live-class notices are all visible in one stream.">
      <div className="grid gap-3">
        {visibleNotifications.map((notification) => (
          <div key={notification.id} className="rounded-[1.4rem] border border-foreground/10 bg-white p-4 dark:border-white/8 dark:bg-[#13212a]">
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
      {state.notifications.length > 5 ? (
        <SeeMoreButton expanded={showAllNotifications} remaining={state.notifications.length - 5} onClick={() => setShowAllNotifications((current) => !current)} />
      ) : null}
    </Section>
  );
}

export function AuditPanel() {
  const { state } = useMockLms();
  const [showAllAuditEvents, setShowAllAuditEvents] = useState(false);
  const visibleAuditEvents = showAllAuditEvents ? state.auditEvents : state.auditEvents.slice(0, 5);

  return (
    <Section title="Audit trail" subtitle="Administrative actions, target objects, timestamp, and IP metadata remain visible for operational trust.">
      <div className="overflow-auto rounded-[1.4rem] border border-foreground/10 bg-white dark:border-white/8 dark:bg-[#13212a]">
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
            {visibleAuditEvents.map((event) => (
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
      {state.auditEvents.length > 5 ? (
        <SeeMoreButton expanded={showAllAuditEvents} remaining={state.auditEvents.length - 5} onClick={() => setShowAllAuditEvents((current) => !current)} />
      ) : null}
    </Section>
  );
}

export function InstituteSettingsPanel() {
  const { state } = useMockLms();
  const activePreset = bangladeshiInstitutePresets.find((preset) => preset.branding.subdomain === state.branding.subdomain);

  return (
    <Section title="Institute settings" subtitle="Institute profile, tenant identity, white-label values, and default operating context for the LMS.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.4rem] border border-foreground/10 bg-white p-5 dark:border-white/8 dark:bg-[#13212a]">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Institute</p>
          <p className="mt-3 font-serif text-2xl">{state.branding.tenantName}</p>
          <p className="mt-2 text-sm text-muted-foreground">{state.branding.city ?? "Dhaka"}</p>
        </div>
        <div className="rounded-[1.4rem] border border-foreground/10 bg-white p-5 dark:border-white/8 dark:bg-[#13212a]">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Subdomain</p>
          <p className="mt-3 font-serif text-2xl">{state.branding.subdomain}</p>
          <p className="mt-2 text-sm text-muted-foreground">White-label login is tied to tenant branding.</p>
        </div>
        <div className="rounded-[1.4rem] border border-foreground/10 bg-white p-5 dark:border-white/8 dark:bg-[#13212a]">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Custom domain</p>
          <p className="mt-3 font-serif text-2xl">{state.branding.customDomain || "Not set"}</p>
          <p className="mt-2 text-sm text-muted-foreground">{state.branding.supportEmail}</p>
        </div>
        <div className="rounded-[1.4rem] border border-foreground/10 bg-white p-5 dark:border-white/8 dark:bg-[#13212a]">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Default role mix</p>
          <p className="mt-3 font-serif text-2xl">
            {state.users.filter((user) => user.role === "admin").length} / {state.users.filter((user) => user.role === "teacher").length} / {state.users.filter((user) => user.role === "student").length}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Admins, teachers, students</p>
        </div>
      </div>
      <div className="mt-5 rounded-[1.5rem] border border-foreground/10 bg-background/75 p-4 text-sm text-muted-foreground dark:border-white/8 dark:bg-white/5">
        {activePreset?.previewCopy ?? "Institute profile, logo text, colors, support email, subdomain, and custom domain are editable from the branding workflow."}
      </div>
    </Section>
  );
}

export function UserDirectoryPanel({ roleFilter }: { roleFilter?: "teacher" | "student" | "admin" }) {
  const { state } = useMockLms();
  const users = roleFilter ? state.users.filter((user) => user.role === roleFilter) : state.users;
  const title = roleFilter ? `${roleFilter[0].toUpperCase()}${roleFilter.slice(1)} directory` : "User directory";
  const initialVisibleCount = roleFilter ? 5 : 3;
  const shouldCollapse = users.length > initialVisibleCount;
  const [showAll, setShowAll] = useState(false);
  const visibleUsers = shouldCollapse && !showAll ? users.slice(0, initialVisibleCount) : users;

  return (
    <Section title={title} subtitle="Admin can review users, role assignments, department alignment, and account coverage from one place.">
      <div className="grid gap-4">
        {visibleUsers.map((user) => (
          <div key={user.id} className="rounded-[1.4rem] border border-foreground/10 bg-white p-4 dark:border-white/8 dark:bg-[#13212a]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{user.role}</Badge>
                {user.department ? <Badge>{user.department}</Badge> : null}
                <Badge>active</Badge>
              </div>
            </div>
          </div>
        ))}
        {shouldCollapse ? <SeeMoreButton expanded={showAll} remaining={users.length - initialVisibleCount} onClick={() => setShowAll(!showAll)} /> : null}
      </div>
    </Section>
  );
}

export function AdminCoursePanel({ refreshKey = 0 }: { refreshKey?: number }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const result = await fetchAdminCoursesFromBackend();
      setCourses(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCourses();
  }, [refreshKey]);

  if (selectedCourse) {
    return (
      <AdminCourseDetails
        course={selectedCourse}
        onBack={async () => {
          setSelectedCourse(null);
          await loadCourses();
        }}
      />
    );
  }

  return (
    <Section title="Course management" subtitle="Assign teachers, manage student enrollments, and monitor course status across the tenant.">
      <div className="grid gap-4">
        {loading ? (
          <p>Loading courses...</p>
        ) : courses.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div key={course.id} className="rounded-[1.4rem] border border-foreground/10 bg-white p-4 shadow-soft dark:border-white/8 dark:bg-[#13212a]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{course.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{course.teacher_count || 0} teachers · {course.enrollment_count || 0} students</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>{course.status}</Badge>
                    <SecondaryButton onClick={() => setSelectedCourse(course)} className="px-3 py-1.5 text-xs">Manage</SecondaryButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No courses found.</p>
        )}
      </div>
    </Section>
  );
}

function AdminCourseDetails({ course, onBack }: { course: any; onBack: () => void }) {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [assignedTeachers, setAssignedTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  const loadDetails = async () => {
    setLoading(true);
    try {
      const [allTeachersRes, assignedRes, studentsRes] = await Promise.all([
        fetchAdminTeachersFromBackend(),
        fetchCourseTeachersFromBackend(course.id),
        fetchCourseStudentsFromBackend(course.id)
      ]);
      setTeachers(allTeachersRes.data);
      setAssignedTeachers(assignedRes.data);
      setStudents(studentsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDetails();
  }, [course.id]);

  const handleAssignTeacher = async () => {
    if (!selectedTeacherId) return;
    setIsAssigning(true);
    try {
      await assignTeachersToCourseOnBackend(course.id, [selectedTeacherId]);
      await loadDetails();
      setSelectedTeacherId("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveTeacher = async (teacherId: string) => {
    if (!confirm("Are you sure you want to remove this teacher from the course?")) return;
    try {
      await removeTeacherFromCourseOnBackend(course.id, teacherId);
      await loadDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to remove this student's enrollment? This will revoke their access to course materials.")) return;
    try {
      await removeStudentFromCourseOnBackend(course.id, studentId);
      await loadDetails();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <SecondaryButton onClick={onBack}>← Back</SecondaryButton>
           <h2 className="font-serif text-3xl">{course.title}</h2>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Teachers" subtitle="Manage assigned teachers.">
          <div className="grid gap-4">
             <div className="flex gap-2">
                <div className="flex-1">
                   <SelectInput value={selectedTeacherId} onChange={(e) => setSelectedTeacherId(e.target.value)}>
                      <option value="">Select teacher...</option>
                      {teachers.filter(t => !assignedTeachers.some(at => at.id === t.id)).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                   </SelectInput>
                </div>
                <PrimaryButton onClick={handleAssignTeacher} disabled={isAssigning || !selectedTeacherId}>
                  {isAssigning ? "..." : "Assign"}
                </PrimaryButton>
             </div>

             <div className="grid gap-3">
                {assignedTeachers.map(teacher => (
                  <div key={teacher.id} className="flex items-center justify-between p-3 rounded-xl border border-foreground/10 bg-white dark:bg-white/5">
                    <p className="text-sm font-medium">{teacher.name}</p>
                    <SecondaryButton onClick={() => handleRemoveTeacher(teacher.id)} className="px-3 py-1.5 text-xs text-rose-600">Remove</SecondaryButton>
                  </div>
                ))}
             </div>
          </div>
        </Section>

        <Section title="Students" subtitle="Manage enrollments.">
           <div className="grid gap-3">
              {students.map(enrollment => (
                <div key={enrollment.id} className="flex items-center justify-between p-3 rounded-xl border border-foreground/10 bg-white dark:bg-white/5">
                   <div>
                      <p className="text-sm font-medium">{enrollment.student_name}</p>
                      <p className="text-xs text-muted-foreground">{enrollment.status}</p>
                   </div>
                   {enrollment.status === 'active' && (
                     <SecondaryButton onClick={() => handleRemoveStudent(enrollment.student_id)} className="px-3 py-1.5 text-xs text-rose-600">Remove</SecondaryButton>
                   )}
                </div>
              ))}
           </div>
        </Section>
      </div>
    </div>
  );
}

export function EnrollmentManagementPanel() {
  const { state, getEnrollment, updateEnrollment, deleteEnrollment } = useMockLms();
  const [showAllEnrollments, setShowAllEnrollments] = useState(false);
  const visibleEnrollments = showAllEnrollments ? state.enrollments : state.enrollments.slice(0, 8);

  const totalEnrollments = state.enrollments.length;
  const activeEnrollments = state.enrollments.filter((e) => e.status === "active").length;
  const completedEnrollments = state.enrollments.filter((e) => e.status === "completed").length;
  const pendingEnrollments = state.enrollments.filter((e) => e.status === "pending").length;

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<{ status: string; progressPercentage: number }>({ status: "active", progressPercentage: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleView = async (enrollment: any) => {
    try {
      setIsLoading(true);
      await getEnrollment(enrollment.id);
      setSelectedEnrollment(enrollment);
      setAlert({ type: "success", msg: `Viewing ${enrollment.studentName}` });
    } catch (err) {
      setAlert({ type: "error", msg: "Failed to load enrollment" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (enrollment: any) => {
    setSelectedEnrollment(enrollment);
    setEditForm({ status: enrollment.status, progressPercentage: enrollment.progressPercentage ?? 0 });
    setShowEdit(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedEnrollment) return;
    try {
      setIsLoading(true);
      await updateEnrollment(selectedEnrollment.id, { status: editForm.status, progressPercentage: editForm.progressPercentage });
      setAlert({ type: "success", msg: `Enrollment for ${selectedEnrollment.studentName} updated` });
      setShowEdit(false);
      setSelectedEnrollment(null);
    } catch (err) {
      setAlert({ type: "error", msg: "Failed to update enrollment" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (enrollment: any) => {
    setSelectedEnrollment(enrollment);
    setShowDelete(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEnrollment) return;
    try {
      setIsLoading(true);
      await deleteEnrollment(selectedEnrollment.id);
      setAlert({ type: "success", msg: `Enrollment removed: ${selectedEnrollment.studentName}` });
      setShowDelete(false);
      setSelectedEnrollment(null);
    } catch (err) {
      setAlert({ type: "error", msg: "Failed to remove enrollment" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Enrollments", value: totalEnrollments, color: "from-blue-500 to-cyan-500", bg: "from-blue-500/10 to-cyan-500/10", icon: <Users className="h-6 w-6 text-blue-700 dark:text-blue-300" /> },
          { label: "Active", value: activeEnrollments, color: "from-green-500 to-emerald-500", bg: "from-green-500/10 to-emerald-500/10", icon: <CheckCircle2 className="h-6 w-6 text-green-700 dark:text-green-300" /> },
          { label: "Completed", value: completedEnrollments, color: "from-purple-500 to-pink-500", bg: "from-purple-500/10 to-pink-500/10", icon: <GraduationCap className="h-6 w-6 text-purple-700 dark:text-purple-300" /> },
          { label: "Pending", value: pendingEnrollments, color: "from-amber-500 to-orange-500", bg: "from-amber-500/10 to-orange-500/10", icon: <Hourglass className="h-6 w-6 text-amber-700 dark:text-amber-300" /> },
        ].map((stat, idx) => (
          <div key={idx} className={`rounded-xl p-4 bg-gradient-to-br ${stat.bg} border border-foreground/10`}>
            <div className="flex items-start justify-between mb-2">
              <span>{stat.icon}</span>
            </div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{stat.label}</p>
            <p className={`text-3xl font-bold mt-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Enrollments List */}
      <div className="card">
        <h3 className="font-serif text-xl text-foreground mb-4">Recent Enrollments</h3>
        <div className="grid gap-3">
          {visibleEnrollments.map((enrollment) => {
            const getStatusColor = (status: string) => {
              if (status === "active") return "from-green-500 to-emerald-500";
              if (status === "completed") return "from-purple-500 to-pink-500";
              return "from-amber-500 to-orange-500";
            };

            const getStatusBg = (status: string) => {
              if (status === "active") return "bg-green-100/50 text-green-700 dark:bg-green-900/30 dark:text-green-400";
              if (status === "completed") return "bg-purple-100/50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
              return "bg-amber-100/50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
            };

            return (
              <div key={enrollment.id} className="group rounded-xl border border-border hover:border-[#E8A020]/50 bg-gradient-to-br from-card to-card/80 p-4 transition-all hover:shadow-lg">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1A1A2E] to-[#E8A020] flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {enrollment.studentName?.split(" ").map((n) => n[0]).join("").toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-foreground truncate">{enrollment.studentName}</p>
                      <p className="text-xs text-muted-foreground truncate">{enrollment.courseTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${getStatusBg(enrollment.status)}`}>
                      {enrollment.status}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-semibold text-muted-foreground">Progress</p>
                    <p className="text-xs font-bold text-[#E8A020]">{enrollment.progressPercentage}%</p>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-muted/50 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#E8A020] to-orange-400 transition-all duration-500"
                      style={{ width: `${enrollment.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleView(enrollment)}
                    disabled={isLoading}
                    className="text-xs px-2 py-1 rounded-lg bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 transition font-semibold disabled:opacity-50"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEditClick(enrollment)}
                    disabled={isLoading}
                    className="text-xs px-2 py-1 rounded-lg bg-amber-500/20 text-amber-600 hover:bg-amber-500/30 transition font-semibold disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(enrollment)}
                    disabled={isLoading}
                    className="text-xs px-2 py-1 rounded-lg bg-red-500/20 text-red-600 hover:bg-red-500/30 transition font-semibold disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit Modal */}
        {showEdit && selectedEnrollment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card rounded-xl border border-border max-w-md w-full">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-serif text-lg">Edit Enrollment</h3>
                <button type="button" onClick={() => setShowEdit(false)} className="opacity-70 hover:opacity-100">✕</button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-sm font-semibold">Status</label>
                  <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full mt-2 rounded-lg border border-border px-3 py-2">
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold">Progress (%)</label>
                  <input type="number" min={0} max={100} value={editForm.progressPercentage} onChange={(e) => setEditForm({ ...editForm, progressPercentage: parseInt(e.target.value) || 0 })} className="w-full mt-2 rounded-lg border border-border px-3 py-2" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={handleEditSubmit} disabled={isLoading} className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white font-semibold">{isLoading ? 'Saving...' : 'Save'}</button>
                  <button onClick={() => setShowEdit(false)} className="flex-1 px-4 py-2 rounded-lg border border-border">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDelete && selectedEnrollment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card rounded-xl border border-border max-w-md w-full p-6">
              <h3 className="font-serif text-xl mb-2">Delete Enrollment</h3>
              <p className="text-sm text-muted-foreground mb-4">Are you sure you want to remove <strong>{selectedEnrollment.studentName}</strong> from <strong>{selectedEnrollment.courseTitle}</strong>?</p>
              <div className="flex gap-3">
                <button onClick={handleDeleteConfirm} disabled={isLoading} className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white">{isLoading ? 'Deleting...' : 'Delete'}</button>
                <button onClick={() => setShowDelete(false)} className="flex-1 px-4 py-2 rounded-lg border border-border">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {state.enrollments.length > 8 && (
          <button
            onClick={() => setShowAllEnrollments(!showAllEnrollments)}
            className="w-full mt-4 py-2 text-sm font-semibold text-[#E8A020] hover:bg-[#E8A020]/5 rounded-lg transition-colors"
          >
            {showAllEnrollments ? "Show Less" : `Show All (${state.enrollments.length})`}
          </button>
        )}
      </div>
    </div>
  );
}

export function AdminAssessmentsPanel() {
  const { state } = useMockLms();
  const [showAllAssessments, setShowAllAssessments] = useState(false);
  const visibleAssessments = showAllAssessments ? state.assessments : state.assessments.slice(0, 5);

  return (
    <Section title="Assessment control" subtitle="Admin can inspect assessment coverage, publishing state, and learner submission outcomes.">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Assessments" value={String(state.assessments.length)} className="min-h-[7rem] p-4" />
        <StatCard label="Published" value={String(state.assessments.filter((assessment) => assessment.status === "published").length)} className="min-h-[7rem] p-4" />
        <StatCard label="Submissions" value={String(state.submissions.length)} className="min-h-[7rem] p-4" />
      </div>
      <div className="mt-5 grid gap-4">
        {visibleAssessments.map((assessment) => (
          <div key={assessment.id} className="rounded-[1.4rem] border border-foreground/10 bg-white p-4 dark:border-white/8 dark:bg-[#13212a]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{assessment.title}</p>
                <p className="text-sm text-muted-foreground">{assessment.generatedFrom}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{assessment.type}</Badge>
                <Badge>{assessment.status}</Badge>
                <Badge>{assessment.questionCount} questions</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
      {state.assessments.length > 5 ? (
        <SeeMoreButton expanded={showAllAssessments} remaining={state.assessments.length - 5} onClick={() => setShowAllAssessments((current) => !current)} />
      ) : null}
    </Section>
  );
}

export function AdminAiToolsPanel() {
  const { state } = useMockLms();
  const aiGenerated = state.assessments.filter((assessment) => assessment.generatedFrom.toLowerCase().includes("ai") || assessment.generatedFrom.toLowerCase().includes("teacher note") || assessment.generatedFrom.toLowerCase().includes("fallback")).length;

  return (
    <Section title="AI tools monitor" subtitle="Admin can monitor AI quiz generation, essay evaluation coverage, fallback bank continuity, and plan-linked enablement.">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="AI-generated drafts" value={String(aiGenerated)} className="min-h-[7rem] p-4" />
        <StatCard label="Essay workflows" value={String(state.assessments.filter((assessment) => assessment.type === "Essay" || assessment.type === "Short Answer").length)} className="min-h-[7rem] p-4" />
        <StatCard label="Fallback banks" value={String(backendReadyEndpoints.fallbackQuestionBank ? 1 : 0)} className="min-h-[7rem] p-4" />
        <StatCard label="Plan access" value={state.billing.plan} note="Current subscription tier" className="min-h-[7rem] p-4" />
      </div>
      <div className="mt-5 rounded-[1.5rem] border border-foreground/10 bg-background/75 p-4 text-sm leading-6 text-muted-foreground dark:border-white/8 dark:bg-white/5">
        Admin can review question-generation activity, essay evaluation load, fallback continuity, and whether advanced AI tooling aligns with the current subscription tier.
      </div>
    </Section>
  );
}

export function LiveClassMonitorPanel() {
  const { state } = useMockLms();
  const [showAllLiveClasses, setShowAllLiveClasses] = useState(false);
  const visibleLiveClasses = showAllLiveClasses ? state.liveClasses : state.liveClasses.slice(0, 5);

  return (
    <Section title="Live class monitor" subtitle="Admin can review scheduled sessions, recording status, participant limits, and reminder coverage.">
      <div className="grid gap-4">
        {visibleLiveClasses.map((liveClass) => (
          <div key={liveClass.id} className="rounded-[1.5rem] border border-foreground/10 bg-white p-5 dark:border-white/8 dark:bg-[#13212a]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-serif text-2xl">{liveClass.title}</p>
                <p className="text-sm text-muted-foreground">{new Date(liveClass.startAt).toLocaleString()} · {liveClass.durationMinutes} min</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{liveClass.status}</Badge>
                <Badge>{liveClass.participantLimit} seats</Badge>
                <Badge>{liveClass.provider}</Badge>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-[1.2rem] border border-foreground/10 bg-background/70 p-3 dark:border-white/8 dark:bg-white/5">24h reminder: {liveClass.reminder24h ? "On" : "Off"}</div>
              <div className="rounded-[1.2rem] border border-foreground/10 bg-background/70 p-3 dark:border-white/8 dark:bg-white/5">1h reminder: {liveClass.reminder1h ? "On" : "Off"}</div>
              <div className="rounded-[1.2rem] border border-foreground/10 bg-background/70 p-3 dark:border-white/8 dark:bg-white/5">Recording: {liveClass.recordingUrl ? "Available" : "Pending"}</div>
            </div>
          </div>
        ))}
      </div>
      {state.liveClasses.length > 5 ? (
        <SeeMoreButton expanded={showAllLiveClasses} remaining={state.liveClasses.length - 5} onClick={() => setShowAllLiveClasses((current) => !current)} />
      ) : null}
    </Section>
  );
}

export function PaymentsPanel() {
  const { state } = useMockLms();
  const [filter, setFilter] = useState("all");
  const [showAllPayments, setShowAllPayments] = useState(false);

  const filteredPayments = state.payments.filter((payment) => {
    if (filter === "all") return true;
    return payment.status === filter;
  });

  const visiblePayments = showAllPayments ? filteredPayments : filteredPayments.slice(0, 10);

  const totalRevenue = state.payments
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <Section title="Payment & Revenue Tracking" subtitle="Monitor course sales, transaction IDs, and revenue distribution across your tenant.">
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard 
          label="Total Revenue" 
          value={`$${totalRevenue.toFixed(2)}`} 
          icon={<CreditCard className="h-5 w-5" />} 
          className="border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5"
        />
        <StatCard 
          label="Total Transactions" 
          value={String(state.payments.length)} 
          icon={<ReceiptText className="h-5 w-5" />} 
        />
        <div className="flex items-center justify-end gap-3 self-center">
          <SelectInput value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </SelectInput>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-white dark:border-white/8 dark:bg-[#13212a]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-foreground/10 bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-6 py-4 font-semibold text-foreground">Date</th>
              <th className="px-6 py-4 font-semibold text-foreground">Student</th>
              <th className="px-6 py-4 font-semibold text-foreground">Course</th>
              <th className="px-6 py-4 font-semibold text-foreground">Transaction ID</th>
              <th className="px-6 py-4 font-semibold text-foreground">Amount</th>
              <th className="px-6 py-4 font-semibold text-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foreground/5">
            {visiblePayments.length > 0 ? (
              visiblePayments.map((payment) => {
                const user = state.users.find(u => u.id === payment.userId);
                const course = state.courses.find(c => c.id === payment.courseId);
                return (
                  <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-foreground">{user?.name || "Unknown Student"}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {course?.title || "Unknown Course"}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs uppercase text-muted-foreground">
                      {payment.transactionId}
                    </td>
                    <td className="px-6 py-4 font-semibold text-foreground">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={
                        payment.status === "paid" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                        payment.status === "pending" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                        "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      }>
                        {payment.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">
                  No payment records found for the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredPayments.length > 10 && (
        <SeeMoreButton 
          expanded={showAllPayments} 
          remaining={filteredPayments.length - 10} 
          onClick={() => setShowAllPayments(!showAllPayments)} 
        />
      )}
    </Section>
  );
}
