"use client";

import { useState } from "react";
import { Award, Download, XCircle, Search } from "lucide-react";
import {
  DashboardLayout, PageHeader, StatusBadge, SearchBar, EmptyState, StatsCard
} from "@/components/dashboard/DashboardLayout";
import { useMockLms } from "@/providers/mock-lms-provider";
import { buildCertificateHtml, downloadHtmlFile } from "@/lib/utils/lms-helpers";

export default function AdminCertificatesPage() {
  const { state, issueCertificate, revokeCertificate } = useMockLms();
  const [search, setSearch] = useState("");
  const [showIssue, setShowIssue] = useState(false);
  const [issueStudentName, setIssueStudentName] = useState("");
  const [issueCourseId, setIssueCourseId] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const students = state.users.filter((u) => u.role === "student");
  const publishedCourses = state.courses.filter((c) => c.status === "published");

  const filtered = state.certificates.filter((c) =>
    c.studentName.toLowerCase().includes(search.toLowerCase()) ||
    c.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
    c.verificationCode.toLowerCase().includes(search.toLowerCase())
  );

  const active = state.certificates.filter((c) => !c.revoked).length;
  const revoked = state.certificates.filter((c) => c.revoked).length;

  async function handleIssue(e: React.FormEvent) {
    e.preventDefault();
    if (!issueStudentName || !issueCourseId) return;
    setIssuing(true);
    try {
      await issueCertificate(issueStudentName, issueCourseId);
      setAlert({ type: "success", msg: `Certificate issued to ${issueStudentName}.` });
      setShowIssue(false);
      setIssueStudentName("");
      setIssueCourseId("");
    } catch (err) {
      setAlert({ type: "error", msg: err instanceof Error ? err.message : "Failed to issue certificate." });
    } finally {
      setIssuing(false);
    }
  }

  async function handleRevoke(id: string, name: string) {
    if (!confirm(`Revoke certificate for ${name}? This cannot be undone.`)) return;
    try {
      await revokeCertificate(id);
      setAlert({ type: "success", msg: `Certificate revoked.` });
    } catch (err) {
      setAlert({ type: "error", msg: err instanceof Error ? err.message : "Failed to revoke." });
    }
  }

  function handleDownload(cert: typeof state.certificates[number]) {
    const html = buildCertificateHtml({ certificate: cert, branding: state.branding });
    downloadHtmlFile(`certificate-${cert.verificationCode}.html`, html);
  }

  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="Certificates"
        subtitle="Issue, verify, and manage learner certificates."
        actions={
          <button type="button" onClick={() => setShowIssue(true)} className="btn-accent">
            <Award className="w-4 h-4" /> Issue Certificate
          </button>
        }
      />

      <div className="stats-grid mb-8">
        <StatsCard label="Total Issued" value={state.certificates.length} icon={<Award className="w-5 h-5" />} iconBg="bg-yellow-500/10" iconColor="text-yellow-500" />
        <StatsCard label="Active" value={active} icon={<Award className="w-5 h-5" />} iconBg="bg-success/10" iconColor="text-success" />
        <StatsCard label="Revoked" value={revoked} icon={<XCircle className="w-5 h-5" />} iconBg="bg-destructive/10" iconColor="text-destructive" />
      </div>

      {alert && (
        <div className={`mb-6 rounded-xl p-4 text-sm flex items-center justify-between ${alert.type === "success" ? "alert-success" : "alert-error"}`}>
          <span>{alert.msg}</span>
          <button type="button" onClick={() => setAlert(null)} className="ml-4 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by student, course, or code…" />
      </div>

      <div className="card overflow-hidden p-0">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Award className="w-8 h-8" />}
            title="No certificates yet"
            description="Issue a certificate to a student who completed a course."
            action={<button type="button" onClick={() => setShowIssue(true)} className="btn-accent">Issue Certificate</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Certificate Code</th>
                  <th>Issued Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cert) => (
                  <tr key={cert.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="avatar w-8 h-8 text-xs shrink-0">
                          {cert.studentName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                        </div>
                        <span className="font-medium text-sm text-foreground">{cert.studentName}</span>
                      </div>
                    </td>
                    <td className="text-sm text-muted-foreground max-w-[160px] truncate">{cert.courseTitle}</td>
                    <td>
                      <span className="font-mono text-xs text-primary">{cert.verificationCode}</span>
                    </td>
                    <td className="text-sm text-muted-foreground">
                      {new Date(cert.issuedAt).toLocaleDateString("en-BD", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td><StatusBadge status={cert.revoked ? "revoked" : "active"} /></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDownload(cert)}
                          title="Download"
                          className="btn-ghost py-1.5 px-2"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {!cert.revoked && (
                          <button
                            type="button"
                            onClick={() => handleRevoke(cert.id, cert.studentName)}
                            title="Revoke"
                            className="btn-danger py-1.5 px-2 text-xs"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Issue Modal */}
      {showIssue && (
        <div className="modal-backdrop" onClick={() => setShowIssue(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-2xl text-foreground mb-1">Issue Certificate</h2>
            <p className="text-sm text-muted-foreground mb-5">Select a student and course to issue a certificate.</p>
            <form onSubmit={handleIssue} className="grid gap-4">
              <div>
                <label className="form-label">Student *</label>
                <select className="form-input" value={issueStudentName} onChange={(e) => setIssueStudentName(e.target.value)} required>
                  <option value="">Select a student</option>
                  {students.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Course *</label>
                <select className="form-input" value={issueCourseId} onChange={(e) => setIssueCourseId(e.target.value)} required>
                  <option value="">Select a course</option>
                  {publishedCourses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={issuing} className="btn-accent flex-1">
                  {issuing ? "Issuing…" : "Issue Certificate"}
                </button>
                <button type="button" onClick={() => setShowIssue(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
