"use client";

import { Award, Download, ExternalLink } from "lucide-react";
import { DashboardLayout, PageHeader, EmptyState } from "@/components/dashboard/DashboardLayout";
import { useMockLms } from "@/providers/mock-lms-provider";
import { buildCertificateHtml, downloadHtmlFile } from "@/lib/utils/lms-helpers";
import Link from "next/link";

export default function StudentCertificatesPage() {
  const { state, currentUser } = useMockLms();

  const studentName = currentUser?.name ?? state.users.find((u) => u.role === "student")?.name ?? "Student";
  const myCerts = state.certificates.filter((c) => c.studentName === studentName && !c.revoked);

  function handleDownload(cert: typeof state.certificates[number]) {
    const html = buildCertificateHtml({ certificate: cert, branding: state.branding });
    downloadHtmlFile(`certificate-${cert.verificationCode}.html`, html);
  }

  return (
    <DashboardLayout role="student">
      <PageHeader
        title="My Certificates"
        subtitle="Download and share your achievements."
      />

      {myCerts.length === 0 ? (
        <EmptyState
          icon={<Award className="w-8 h-8" />}
          title="No certificates yet"
          description="Complete a course to earn your first certificate."
          action={<Link href="/student/courses" className="btn-accent">Go to Courses</Link>}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {myCerts.map((cert) => (
            <div key={cert.id} className="course-card overflow-hidden">
              {/* Card header */}
              <div className="h-24 flex items-center justify-center relative" style={{ background: "linear-gradient(135deg, #1A1A2E, #2d2d50)" }}>
                <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-[#E8A020]/20 blur-2xl" />
                <Award className="w-10 h-10 text-[#E8A020] relative z-10" />
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-serif text-lg text-foreground leading-snug">{cert.courseTitle}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Issued on {new Date(cert.issuedAt).toLocaleDateString("en-BD", { dateStyle: "long" })}
                </p>
                <p className="text-xs font-mono text-primary mt-2">{cert.verificationCode}</p>

                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => handleDownload(cert)}
                    className="btn-primary flex-1 py-2 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button
                    type="button"
                    title="Verification Code"
                    className="btn-secondary py-2 px-3 text-xs"
                    onClick={() => navigator.clipboard.writeText(cert.verificationCode)}
                  >
                    Copy Code
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
