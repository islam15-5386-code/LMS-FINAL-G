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
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Great+Vibes&family=Montserrat:wght@400;600;700&display=swap');
    
    body {
      margin: 0;
      background: #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: 'Montserrat', sans-serif;
    }
    .cert-wrapper {
      width: 1056px;
      height: 816px;
      background: #ffffff;
      position: relative;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      overflow: hidden;
      border: 8px solid #222;
    }
    
    .bg-pattern {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background-image: radial-gradient(circle at 10% 80%, rgba(135, 206, 250, 0.15) 0%, transparent 40%),
                        radial-gradient(circle at 60% 30%, rgba(135, 206, 250, 0.1) 0%, transparent 50%);
      z-index: 1;
    }
    
    .shape-container {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      z-index: 2;
      pointer-events: none;
    }
    
    .cert-content {
      position: relative;
      z-index: 10;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      padding: 60px;
    }
    
    .header-text {
      position: absolute;
      top: 60px;
      right: 60px;
      text-align: right;
      color: #fff;
    }
    .header-text h1 {
      font-family: 'Cinzel', serif;
      font-size: 50px;
      margin: 0;
      letter-spacing: 2px;
      font-weight: 600;
    }
    .header-text h2 {
      font-family: 'Cinzel', serif;
      font-size: 22px;
      margin: 5px 0 0 0;
      letter-spacing: 4px;
      font-weight: 400;
    }
    
    .main-content {
      margin-top: 240px;
      width: 680px;
    }
    
    .org-title {
      font-family: 'Cinzel', serif;
      font-size: 26px;
      font-weight: 700;
      color: #222;
      margin: 0 0 4px 0;
      text-transform: uppercase;
    }
    .org-address {
      font-size: 11px;
      color: #555;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 40px;
    }
    
    .presented-to {
      font-family: 'Cinzel', serif;
      font-size: 22px;
      font-weight: 700;
      color: #111;
      margin-bottom: 10px;
    }
    
    .student-name {
      font-family: 'Great Vibes', cursive;
      font-size: 80px;
      color: #021144;
      margin: 10px 0 20px 0;
      line-height: 1;
      border-bottom: 2px solid #021144;
      display: inline-block;
      padding: 0 60px 10px 0;
      min-width: 500px;
    }
    
    .description {
      font-size: 14px;
      line-height: 1.6;
      color: #444;
      margin-bottom: 50px;
      text-align: justify;
      max-width: 600px;
    }
    
    .footer-area {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      max-width: 600px;
    }
    
    .signature-block {
      text-align: center;
      width: 200px;
    }
    .signature-line {
      border-top: 2px solid #021144;
      margin-bottom: 8px;
    }
    .signature-text {
      font-family: 'Cinzel', serif;
      font-size: 16px;
      font-weight: 600;
      color: #021144;
      letter-spacing: 1px;
    }
    
    .logos {
      display: flex;
      gap: 20px;
      align-items: center;
    }
    .logo-placeholder {
      font-family: 'Cinzel', serif;
      font-size: 20px;
      font-weight: 700;
      color: #021144;
    }
    
    .badge-container {
      position: absolute;
      right: 106px;
      top: 420px;
      z-index: 20;
    }
    .badge {
      width: 180px;
      height: 250px;
    }
  </style>
</head>
<body>
  <div class="cert-wrapper">
    <div class="bg-pattern"></div>
    <div class="shape-container">
      <svg width="100%" height="100%" viewBox="0 0 1056 816" preserveAspectRatio="none">
        <!-- Right Stripe -->
        <rect x="820" y="0" width="80" height="816" fill="#021144" />
        <!-- Gray shadow layer -->
        <path d="M 0 0 L 1056 0 L 1056 330 C 650 430 300 130 0 240 Z" fill="#d0d0d0" />
        <!-- Dark Blue layer -->
        <path d="M 0 0 L 1056 0 L 1056 290 C 650 390 300 90 0 200 Z" fill="#021144" />
      </svg>
    </div>
    
    <div class="cert-content">
      <div class="header-text">
        <h1>CERTIFICATE</h1>
        <h2>OF COMPLETION</h2>
      </div>
      
      <div class="main-content">
        <h3 class="org-title">${branding.tenantName}</h3>
        <p class="org-address">${branding.city || "Online Academy"} | ${branding.supportEmail}</p>
        
        <div class="presented-to">THIS CERTIFICATE PRESENTED TO</div>
        
        <div class="student-name">${certificate.studentName}</div>
        
        <div class="description">
          This is to certify that <strong>${certificate.studentName}</strong> has successfully completed the 
          <strong>${certificate.courseTitle}</strong> course on ${issuedDate}. This achievement reflects their dedication and commitment to learning.
          <br><br>
          Verification Code: <strong>${certificate.verificationCode}</strong>
        </div>
        
        <div class="footer-area">
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-text">SIGNATURE</div>
          </div>
          <div class="logos">
            <div class="logo-placeholder">${branding.logoText || "SL"}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="badge-container">
      <!-- SVG Gold Ribbon/Badge -->
      <svg class="badge" viewBox="0 0 200 250">
        <g transform="translate(100, 100)">
          <polygon points="-40,0 -50,130 -15,110 10,140 0,0" fill="#b8860b" />
          <polygon points="40,0 50,130 15,110 -10,140 0,0" fill="#daa520" />
          <polygon points="-20,0 -30,140 0,120 30,140 20,0" fill="#ffd700" />
        </g>
        
        <circle cx="100" cy="100" r="85" fill="#d4af37" />
        
        <g stroke="#b8860b" stroke-width="4">
          <line x1="15" y1="100" x2="185" y2="100" />
          <line x1="100" y1="15" x2="100" y2="185" />
          <line x1="40" y1="40" x2="160" y2="160" />
          <line x1="40" y1="160" x2="160" y2="40" />
          <line x1="25" y1="65" x2="175" y2="135" />
          <line x1="25" y1="135" x2="175" y2="65" />
          <line x1="65" y1="25" x2="135" y2="175" />
          <line x1="65" y1="175" x2="135" y2="25" />
        </g>
        
        <circle cx="100" cy="100" r="75" fill="#ffd700" />
        <circle cx="100" cy="100" r="65" fill="#fff8dc" stroke="#d4af37" stroke-width="2" />
        <circle cx="100" cy="100" r="55" fill="#ffd700" stroke="#b8860b" stroke-width="3" stroke-dasharray="4,4" />
        
        <text x="100" y="125" font-family="'Cinzel', serif" font-size="60" font-weight="bold" fill="#b8860b" text-anchor="middle">1</text>
      </svg>
    </div>
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
