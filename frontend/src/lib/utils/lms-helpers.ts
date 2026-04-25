import type { Certificate, Course, TenantBranding } from "@/lib/mock-lms";

/** Calculate lesson completion % for a specific student */
export function percentageForStudent(course: Course, studentName: string): number {
  const allLessons = course.modules.flatMap((m) => m.lessons);
  if (allLessons.length === 0) return 0;
  const completed = allLessons.filter((l) => l.completedBy.includes(studentName)).length;
  return Math.round((completed / allLessons.length) * 100);
}

/** Download a text file from the browser */
export function downloadTextFile(filename: string, content: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Download an HTML file from the browser */
export function downloadHtmlFile(filename: string, content: string) {
  downloadTextFile(filename, content, "text/html;charset=utf-8");
}

/** Build a printable certificate HTML page */
export function buildCertificateHtml({
  certificate,
  branding,
}: {
  certificate: Certificate;
  branding: TenantBranding;
}): string {
  const issuedDate = new Date(certificate.issuedAt).toLocaleDateString("en-BD", { dateStyle: "long" });
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Certificate — ${certificate.courseTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=Manrope:wght@400;600&display=swap');
    body { margin:0; background:#f8f5ee; font-family:'Manrope',sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; }
    .cert { width:860px; background:#fff; border:2px solid #e8c97a; border-radius:24px; padding:64px; text-align:center; box-shadow:0 24px 80px rgba(0,0,0,0.12); }
    .cert-logo { font-family:'Fraunces',serif; font-size:24px; color:#1A1A2E; letter-spacing:0.04em; margin-bottom:8px; }
    .cert-org { font-size:12px; text-transform:uppercase; letter-spacing:0.2em; color:#888; }
    .divider { width:80px; height:2px; background:linear-gradient(90deg,#1A1A2E,#E8A020); margin:24px auto; }
    h1 { font-family:'Fraunces',serif; font-size:14px; text-transform:uppercase; letter-spacing:0.22em; color:#888; margin:0 0 16px; }
    .student-name { font-family:'Fraunces',serif; font-size:48px; color:#1A1A2E; margin:0 0 8px; line-height:1.1; }
    .course-title { font-size:18px; color:#444; margin:16px 0; }
    .date { font-size:14px; color:#888; margin-top:8px; }
    .verification { display:inline-block; margin-top:24px; background:#f3f4f6; border-radius:8px; padding:8px 16px; font-family:monospace; font-size:13px; color:#1A1A2E; letter-spacing:0.1em; }
    .footer { margin-top:40px; font-size:11px; color:#bbb; }
  </style>
</head>
<body>
  <div class="cert">
    <div class="cert-logo">${branding.logoText || "SL"}</div>
    <div class="cert-org">${branding.tenantName}</div>
    <div class="divider"></div>
    <h1>Certificate of Completion</h1>
    <div class="student-name">${certificate.studentName}</div>
    <p class="course-title">has successfully completed<br><strong>${certificate.courseTitle}</strong></p>
    <p class="date">Issued on ${issuedDate}</p>
    <div class="verification">Verification Code: ${certificate.verificationCode}</div>
    <div class="footer">This certificate was issued by ${branding.tenantName} via Smart LMS · Verify at ${branding.customDomain}</div>
  </div>
</body>
</html>`;
}

/** Read text from an uploaded file (txt, md, csv) */
export async function readNoteFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) ?? "");
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsText(file);
  });
}

/** Build CSV from generic rows */
export function buildCsv(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
}
