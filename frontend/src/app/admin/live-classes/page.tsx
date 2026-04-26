"use client";

import { useState } from "react";
import { Video, Plus, Play, StopCircle, Archive } from "lucide-react";
import {
  DashboardLayout, PageHeader, StatusBadge, EmptyState, StatsCard
} from "@/components/dashboard/DashboardLayout";
import { useMockLms } from "@/providers/mock-lms-provider";

export default function AdminLiveClassesPage() {
  const { state, scheduleLiveClass, setLiveClassStatus } = useMockLms();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [form, setForm] = useState({ title: "", courseId: "", startAt: "", durationMinutes: "60" });

  const publishedCourses = state.courses.filter((c) => c.status === "published");
  const scheduled = state.liveClasses.filter((lc) => lc.status === "scheduled").length;
  const live = state.liveClasses.filter((lc) => lc.status === "live").length;
  const recorded = state.liveClasses.filter((lc) => lc.status === "recorded").length;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await scheduleLiveClass({ title: form.title, courseId: form.courseId, startAt: form.startAt, durationMinutes: Number(form.durationMinutes), meetingType: "jitsi" });
      setAlert({ type: "success", msg: `"${form.title}" scheduled.` });
      setShowCreate(false);
      setForm({ title: "", courseId: "", startAt: "", durationMinutes: "60" });
    } catch (err) {
      setAlert({ type: "error", msg: err instanceof Error ? err.message : "Failed to schedule." });
    } finally {
      setCreating(false);
    }
  }

  async function handleStatus(id: string, status: "scheduled" | "live" | "recorded") {
    try {
      await setLiveClassStatus(id, status);
      setAlert({ type: "success", msg: `Status updated to ${status}.` });

      if (status === "live") {
        const liveClass = state.liveClasses.find((item) => item.id === id);

        if (liveClass?.meetingUrl) {
          window.open(liveClass.meetingUrl, "_blank", "noopener,noreferrer");
        }
      }
    } catch (err) {
      setAlert({ type: "error", msg: err instanceof Error ? err.message : "Failed to update status." });
    }
  }

  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="Live Classes"
        subtitle="Schedule and manage all live learning sessions."
        actions={
          <button type="button" onClick={() => setShowCreate(true)} className="btn-accent">
            <Plus className="w-4 h-4" /> Schedule Class
          </button>
        }
      />

      <div className="stats-grid mb-8">
        <StatsCard label="Scheduled" value={scheduled} icon={<Video className="w-5 h-5" />} iconBg="bg-blue-500/10" iconColor="text-blue-500" />
        <StatsCard label="Live Now" value={live} icon={<Play className="w-5 h-5" />} iconBg="bg-red-500/10" iconColor="text-red-500" />
        <StatsCard label="Recorded" value={recorded} icon={<Archive className="w-5 h-5" />} iconBg="bg-muted" iconColor="text-muted-foreground" />
      </div>

      {alert && (
        <div className={`mb-6 rounded-xl p-4 text-sm flex items-center justify-between ${alert.type === "success" ? "alert-success" : "alert-error"}`}>
          <span>{alert.msg}</span>
          <button type="button" onClick={() => setAlert(null)} className="ml-4 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      <div className="card overflow-hidden p-0">
        {state.liveClasses.length === 0 ? (
          <EmptyState
            icon={<Video className="w-8 h-8" />}
            title="No live classes yet"
            description="Schedule your first live class to connect with students."
            action={<button type="button" onClick={() => setShowCreate(true)} className="btn-accent">Schedule Class</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Course</th>
                  <th>Start Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.liveClasses.map((lc) => {
                  const course = state.courses.find((c) => c.id === lc.courseId);
                  return (
                    <tr key={lc.id}>
                      <td className="font-semibold text-sm text-foreground max-w-[180px] truncate">{lc.title}</td>
                      <td className="text-sm text-muted-foreground">{course?.title ?? "—"}</td>
                      <td className="text-sm text-muted-foreground">
                        {new Date(lc.startAt).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}
                      </td>
                      <td className="text-sm text-muted-foreground">{lc.durationMinutes} min</td>
                      <td><StatusBadge status={lc.status} /></td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          {lc.status === "scheduled" && (
                            <button type="button" onClick={() => handleStatus(lc.id, "live")} className="btn-secondary py-1 px-2.5 text-xs text-success border-success/30">
                              <Play className="w-3.5 h-3.5" /> Go Live
                            </button>
                          )}
                          {lc.status === "live" && (
                            <button type="button" onClick={() => handleStatus(lc.id, "recorded")} className="btn-danger py-1 px-2.5 text-xs">
                              <StopCircle className="w-3.5 h-3.5" /> End
                            </button>
                          )}
                          {lc.meetingUrl && (
                            <a href={lc.meetingUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost py-1 px-2.5 text-xs">
                              {lc.meetingType === "external" ? "Open Link" : "Join Jitsi"}
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif text-2xl mb-1">Schedule Live Class</h2>
            <p className="text-sm text-muted-foreground mb-5">Fill in the details to schedule a new live session.</p>
            <form onSubmit={handleCreate} className="grid gap-4">
              <div>
                <label className="form-label">Class Title *</label>
                <input type="text" className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Weekly Q&A Session" required />
              </div>
              <div>
                <label className="form-label">Course *</label>
                <select className="form-input" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required>
                  <option value="">Select a course</option>
                  {publishedCourses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Start Date & Time *</label>
                <input type="datetime-local" className="form-input" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} required />
              </div>
              <div>
                <label className="form-label">Duration (minutes)</label>
                <input type="number" className="form-input" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} min={15} max={300} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={creating} className="btn-accent flex-1">{creating ? "Scheduling…" : "Schedule"}</button>
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
