"use client";

import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from "react";

import type { Certificate, Course, TenantBranding } from "@/lib/mock-lms";

export const pageFrame = "mx-auto w-full max-w-[1840px] px-4 sm:px-6 lg:px-8";

export function downloadTextFile(filename: string, content: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function downloadHtmlFile(filename: string, content: string) {
  downloadTextFile(filename, content, "text/html;charset=utf-8");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildCertificateHtml({
  certificate,
  branding
}: {
  certificate: Certificate;
  branding: TenantBranding;
}) {
  const studentName = escapeHtml(certificate.studentName);
  const courseTitle = escapeHtml(certificate.courseTitle);
  const certificateNumber = escapeHtml(certificate.certificateNumber || `BETO-${certificate.courseId}`);
  const verificationCode = escapeHtml(certificate.verificationCode);
  const issuedAt = new Date(certificate.issuedAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
  const institutionName = escapeHtml(branding.tenantName || "Betopia LMS");
  const logoText = escapeHtml((branding.logoText || "BT").slice(0, 3).toUpperCase());
  const customDomain = escapeHtml(branding.customDomain || "betopiaacademy.com");
  const primary = branding.primaryColor || "#153b4b";
  const accent = branding.accentColor || "#d6ab47";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${studentName} Certificate</title>
  <style>
    :root {
      --primary: ${primary};
      --accent: ${accent};
      --ink: #2a2a2a;
      --gold: #d8b25a;
      --gold-soft: #f3e1aa;
      --paper: #fffef9;
      --cream: #f8f3e5;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background: linear-gradient(135deg, #f4efdf 0%, #faf8f0 50%, #f6f7f3 100%);
      display: grid;
      place-items: center;
      font-family: Georgia, "Times New Roman", serif;
      color: var(--ink);
      padding: 24px;
    }
    .sheet {
      position: relative;
      width: min(1120px, 100%);
      min-height: 760px;
      background:
        linear-gradient(145deg, rgba(248, 243, 229, 0.52), transparent 28%),
        linear-gradient(-145deg, rgba(248, 243, 229, 0.5), transparent 28%),
        linear-gradient(125deg, rgba(255,255,255,0.84), rgba(248,243,229,0.38)),
        var(--paper);
      border: 2px solid rgba(214, 178, 90, 0.7);
      box-shadow: 0 34px 90px rgba(21, 59, 75, 0.16);
      overflow: hidden;
    }
    .sheet::before {
      content: "";
      position: absolute;
      top: 76px;
      left: 80px;
      right: 80px;
      height: 2px;
      background: linear-gradient(90deg, rgba(214,178,90,0.2), rgba(214,178,90,0.9), rgba(214,178,90,0.2));
      pointer-events: none;
    }
    .sheet::after {
      content: "";
      position: absolute;
      inset: 34px;
      border: 1px solid rgba(214, 178, 90, 0.32);
      pointer-events: none;
    }
    .geo-left,
    .geo-right {
      position: absolute;
      top: 180px;
      width: 190px;
      height: 320px;
      opacity: 0.92;
    }
    .geo-left { left: -34px; }
    .geo-right { right: -34px; transform: scaleX(-1); }
    .geo-left::before,
    .geo-left::after,
    .geo-right::before,
    .geo-right::after {
      content: "";
      position: absolute;
      border: 12px solid rgba(214, 178, 90, 0.86);
      transform: rotate(45deg);
    }
    .geo-left::before,
    .geo-right::before {
      width: 132px;
      height: 132px;
      left: 0;
      top: 30px;
    }
    .geo-left::after,
    .geo-right::after {
      width: 86px;
      height: 86px;
      left: 72px;
      top: 136px;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 34px 84px 0;
      gap: 24px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-mark {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.45), transparent 34%), linear-gradient(145deg, var(--primary), #0f2f3e);
      color: white;
      border: 4px solid rgba(214, 178, 90, 0.42);
      font-size: 26px;
      font-weight: 700;
      font-family: "Segoe UI", Arial, sans-serif;
      box-shadow: 0 18px 40px rgba(21, 59, 75, 0.16);
    }
    .brand-copy h1 {
      margin: 0;
      font-size: 24px;
      letter-spacing: 0.04em;
    }
    .brand-copy p {
      margin: 4px 0 0;
      font-size: 11px;
      letter-spacing: 0.26em;
      text-transform: uppercase;
      color: rgba(42, 42, 42, 0.58);
      font-family: "Segoe UI", Arial, sans-serif;
    }
    .verify {
      position: absolute;
      top: 52px;
      right: 84px;
      text-align: right;
      font-family: "Segoe UI", Arial, sans-serif;
    }
    .verify-label {
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(42, 42, 42, 0.52);
    }
    .verify-code {
      margin-top: 8px;
      font-size: 16px;
      font-weight: 700;
      color: #7e6423;
    }
    .body {
      position: relative;
      padding: 84px 106px 0;
      text-align: center;
    }
    .title {
      margin: 18px 0 10px;
      font-size: 74px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 400;
    }
    .subtitle {
      margin: 0;
      font-size: 30px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(42, 42, 42, 0.9);
    }
    .presented {
      margin: 34px 0 0;
      font-size: 18px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: rgba(42, 42, 42, 0.78);
    }
    .name {
      margin: 26px 0 22px;
      font-size: 92px;
      line-height: 0.98;
      font-weight: 400;
      color: #2f3238;
      font-family: "Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive;
    }
    .body-copy {
      max-width: 720px;
      margin: 0 auto;
      font-size: 18px;
      line-height: 1.65;
      font-style: italic;
      color: rgba(42, 42, 42, 0.74);
    }
    .course-line {
      width: min(760px, 100%);
      margin: 30px auto 0;
      padding-top: 18px;
      border-top: 2px solid rgba(214, 178, 90, 0.72);
    }
    .course {
      font-size: 34px;
      font-weight: 400;
      color: var(--primary);
    }
    .details {
      margin-top: 22px;
      font-size: 18px;
      color: rgba(42, 42, 42, 0.82);
    }
    .laurels {
      position: absolute;
      top: 176px;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      padding: 0 180px;
      pointer-events: none;
    }
    .laurel {
      width: 118px;
      height: 210px;
      opacity: 0.92;
    }
    .laurel svg {
      width: 100%;
      height: 100%;
      fill: none;
      stroke: url(#goldGradient);
      stroke-width: 6;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .seal {
      width: 148px;
      height: 148px;
      margin: 34px auto 0;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background:
        radial-gradient(circle at 50% 50%, #fdf3c6 0 34%, #f2d887 35% 52%, transparent 53%),
        radial-gradient(circle at 50% 50%, #f6df9a 0 62%, #b97920 63% 67%, #9b1220 68% 100%);
      box-shadow: 0 20px 45px rgba(130, 95, 18, 0.2);
      position: relative;
      font-family: "Segoe UI", Arial, sans-serif;
      font-weight: 700;
      text-transform: uppercase;
      color: #7f5b17;
      text-align: center;
      font-size: 12px;
      line-height: 1.2;
    }
    .seal::before,
    .seal::after {
      content: "";
      position: absolute;
      bottom: -56px;
      width: 34px;
      height: 88px;
      background: linear-gradient(180deg, #b0141e, #7f0610);
      clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 76%, 0 100%);
    }
    .seal::before { left: 32px; transform: rotate(-7deg); }
    .seal::after { right: 32px; transform: rotate(7deg); }
    .footer {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: end;
      gap: 26px;
      padding: 80px 90px 74px;
      margin-top: 8px;
    }
    .sign {
      text-align: center;
      font-family: "Segoe UI", Arial, sans-serif;
    }
    .line {
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(214,178,90,0.95), transparent);
      margin-bottom: 16px;
    }
    .sign strong {
      display: block;
      font-size: 13px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(42, 42, 42, 0.7);
    }
    .sign span {
      display: block;
      margin-top: 7px;
      font-size: 18px;
      font-weight: 700;
      color: #2d2f34;
    }
    .meta {
      text-align: center;
      font-family: "Segoe UI", Arial, sans-serif;
      font-size: 12px;
      line-height: 1.9;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(42, 42, 42, 0.6);
    }
    @media print {
      body { background: white; padding: 0; }
      .sheet { box-shadow: none; width: 100%; min-height: 100vh; }
    }
  </style>
</head>
<body>
  <article class="sheet">
    <span class="geo-left"></span>
    <span class="geo-right"></span>

    <header class="header">
      <div class="brand">
        <div class="brand-mark">${logoText}</div>
        <div class="brand-copy">
          <h1>${institutionName}</h1>
          <p>Learning Platform</p>
        </div>
      </div>
      <div class="verify">
        <div class="verify-label">Verification Code</div>
        <div class="verify-code">${verificationCode}</div>
      </div>
    </header>

    <section class="body">
      <div class="laurels">
        <div class="laurel">
          <svg viewBox="0 0 120 220" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#eed88c" />
                <stop offset="100%" stop-color="#bb8b22" />
              </linearGradient>
            </defs>
            <path d="M92 182c-42-18-64-56-68-120" />
            <path d="M82 166c-28-6-45-26-52-58" />
            <path d="M74 148c-18-2-30-12-38-32" />
            <path d="M64 128c-14 0-23-6-31-18" />
            <path d="M57 106c-11 1-18-2-25-10" />
          </svg>
        </div>
        <div class="laurel">
          <svg viewBox="0 0 120 220" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="goldGradientRight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#eed88c" />
                <stop offset="100%" stop-color="#bb8b22" />
              </linearGradient>
            </defs>
            <path d="M28 182c42-18 64-56 68-120" stroke="url(#goldGradientRight)" />
            <path d="M38 166c28-6 45-26 52-58" stroke="url(#goldGradientRight)" />
            <path d="M46 148c18-2 30-12 38-32" stroke="url(#goldGradientRight)" />
            <path d="M56 128c14 0 23-6 31-18" stroke="url(#goldGradientRight)" />
            <path d="M63 106c11 1 18-2 25-10" stroke="url(#goldGradientRight)" />
          </svg>
        </div>
      </div>
      <h2 class="title">Certificate</h2>
      <p class="subtitle">Of Completion</p>
      <p class="presented">This is to certify that</p>
      <h3 class="name">${studentName}</h3>
      <p class="body-copy">
        has successfully completed the required learning activities, assessments, and course milestones on the
        ${institutionName} digital learning environment.
      </p>
      <div class="course-line">
        <div class="course">${courseTitle}</div>
      </div>
      <div class="details">${institutionName}  |  Issued on ${escapeHtml(issuedAt)}</div>
      <div class="seal">Verified<br />Seal</div>
    </section>

    <footer class="footer">
      <div class="sign">
        <div class="line"></div>
        <strong>Chief Executive Officer</strong>
        <span>${institutionName}</span>
      </div>
      <div class="meta">
        <div>Certificate no ${certificateNumber}</div>
        <div>${customDomain}</div>
        <div>${verificationCode}</div>
      </div>
      <div class="sign">
        <div class="line"></div>
        <strong>Chief Operating Officer</strong>
        <span>Betopia LMS</span>
      </div>
    </footer>
  </article>
</body>
</html>`;
}

export function emailForName(name: string) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "")}@betopiaacademy.com`;
}

export function openMailDraft({
  to = "",
  bcc = [],
  subject,
  body
}: {
  to?: string;
  bcc?: string[];
  subject: string;
  body: string;
}) {
  const params = new URLSearchParams();
  params.set("subject", subject);
  params.set("body", body);

  if (bcc.length) {
    params.set("bcc", bcc.join(","));
  }

  window.location.href = `mailto:${to}?${params.toString()}`;
}

export function readNoteFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (["txt", "md", "json", "csv"].includes(extension)) {
    return file.text();
  }

  return Promise.resolve(
    [
      `Uploaded file: ${file.name}`,
      `Detected type: ${file.type || extension || "unknown"}`,
      "Frontend preview mode is active.",
      "When backend is implemented, this file should be sent to the upload endpoint for OCR/document parsing before AI question generation."
    ].join(" ")
  );
}

export function percentageForStudent(course: Course, studentName: string) {
  const lessons = course.modules.flatMap((module) => module.lessons);
  if (!lessons.length) {
    return 0;
  }

  const completed = lessons.filter((lesson) => lesson.completedBy.includes(studentName)).length;
  return Math.round((completed / lessons.length) * 100);
}

export function courseLessonCount(course: Course) {
  return course.modules.reduce((total, module) => total + module.lessons.length, 0);
}

export function Section({
  title,
  subtitle,
  children,
  accent = false
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <section
      className={`rounded-[24px] border p-6 shadow-soft ${
        accent
          ? "border-cyan-900/15 bg-cyan-950 text-white shadow-glow dark:border-cyan-400/15 dark:bg-[#0c2430]"
          : "border-border/70 bg-card/80 backdrop-blur dark:border-white/8 dark:bg-white/5"
      }`}
    >
      <div className="flex flex-col gap-2">
        <h2 className="font-serif text-3xl">{title}</h2>
        {subtitle ? (
          <p className={`text-sm leading-6 ${accent ? "text-cyan-100/75" : "text-muted-foreground"}`}>{subtitle}</p>
        ) : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  note,
  icon,
  className = ""
}: {
  label: string;
  value: string;
  note?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`group min-h-[8.2rem] rounded-[24px] border border-border/70 bg-card/85 p-5 shadow-soft backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-glow dark:border-white/8 dark:bg-white/5 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
        {icon ? (
          <div className="rounded-[18px] bg-cyan-950/6 p-2.5 text-cyan-800 dark:bg-white/10 dark:text-cyan-200">
            {icon}
          </div>
        ) : null}
      </div>
      <p className="mt-3 font-serif text-4xl font-semibold md:text-[2.7rem]">{value}</p>
      {note ? <p className="mt-2 text-sm text-muted-foreground">{note}</p> : null}
    </div>
  );
}

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex rounded-full border border-border/80 bg-card/70 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground backdrop-blur dark:border-white/8 dark:bg-white/5 ${className}`}
    >
      {children}
    </span>
  );
}

export function MetricGrid({
  items
}: {
  items: Array<{ label: string; value: string; note?: string; icon?: ReactNode }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`min-h-[3.35rem] w-full rounded-[14px] border border-border/80 bg-card px-4 py-3 text-sm shadow-soft outline-none transition placeholder:text-muted-foreground/70 focus:border-cyan-700/30 focus:ring-2 focus:ring-cyan-800/10 dark:border-white/8 dark:bg-white/5 ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[160px] w-full rounded-[14px] border border-border/80 bg-card px-4 py-3 text-sm shadow-soft outline-none transition placeholder:text-muted-foreground/70 focus:border-cyan-700/30 focus:ring-2 focus:ring-cyan-800/10 dark:border-white/8 dark:bg-white/5 ${props.className ?? ""}`}
    />
  );
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`min-h-[3.35rem] w-full rounded-[14px] border border-border/80 bg-card px-4 py-3 text-sm shadow-soft outline-none transition focus:border-cyan-700/30 focus:ring-2 focus:ring-cyan-800/10 dark:border-white/8 dark:bg-white/5 ${props.className ?? ""}`}
    />
  );
}

export function PrimaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#0b3f51_0%,#146c82_52%,#ff7a00_100%)] px-5 py-3 text-sm font-semibold text-white shadow-glow ring-1 ring-white/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-20px_rgba(20,108,130,0.55)] disabled:cursor-not-allowed disabled:opacity-60 ${props.className ?? ""}`}
    />
  );
}

export function SecondaryButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-full border border-border/80 bg-card/85 px-5 py-3 text-sm font-semibold text-foreground shadow-soft transition duration-300 hover:-translate-y-0.5 hover:border-cyan-900/25 hover:bg-card dark:border-white/10 dark:bg-white/5 ${props.className ?? ""}`}
    />
  );
}

export function WorkspaceHero({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className={`${pageFrame} pb-7 pt-10 md:pb-8`}>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <p className="inline-flex rounded-full border border-foreground/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground shadow-soft dark:border-white/8 dark:bg-white/5">
            {eyebrow}
          </p>
          <h1 className="mt-6 max-w-4xl font-serif text-5xl leading-[0.96] text-balance md:text-6xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-[24px] border border-foreground/10 bg-white/56 p-4 shadow-soft lg:mt-8 lg:max-w-[25rem] lg:justify-self-end dark:border-white/8 dark:bg-white/5">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Working frontend flows</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>Multi-tenant branding</Badge>
            <Badge>AI assessments</Badge>
            <Badge>Live classes</Badge>
            <Badge>Compliance exports</Badge>
            <Badge>Certificates</Badge>
            <Badge>Billing logic</Badge>
          </div>
          {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}
