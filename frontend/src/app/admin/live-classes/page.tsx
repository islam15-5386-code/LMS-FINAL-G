"use client";

import { useState } from "react";
import { Video, Plus, Play, StopCircle, Archive, Clock, Users, Mic, MicOff, Send } from "lucide-react";
import {
  DashboardLayout, PageHeader, StatusBadge, EmptyState, SearchBar
} from "@/components/dashboard/DashboardLayout";
import { useMockLms } from "@/providers/mock-lms-provider";

export default function AdminLiveClassesPage() {
  const { state, scheduleLiveClass, setLiveClassStatus } = useMockLms();
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "scheduled" | "live" | "recorded">("all");

  const [form, setForm] = useState({ 
    title: "", 
    courseId: "", 
    startAt: "", 
    durationMinutes: "60",
    meetingType: "jitsi" as "jitsi" | "external",
    meetingLink: "",
    hostEmail: "tanvirulislam5386@gmail.com"
  });

  const publishedCourses = state.courses.filter((c) => c.status === "published");
  const scheduled = state.liveClasses.filter((lc) => lc.status === "scheduled").length;
  const live = state.liveClasses.filter((lc) => lc.status === "live").length;
  const recorded = state.liveClasses.filter((lc) => lc.status === "recorded").length;

  const filteredClasses = state.liveClasses.filter((lc) => {
    const matchFilter = filter === "all" || lc.status === filter;
    const matchSearch = lc.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      await scheduleLiveClass({ 
        title: form.title, 
        courseId: form.courseId, 
        startAt: form.startAt, 
        durationMinutes: Number(form.durationMinutes), 
        meetingType: form.meetingType,
        meetingLink: form.meetingType === "external" ? form.meetingLink : undefined
      });
      setAlert({ type: "success", msg: `"${form.title}" scheduled successfully!` });
      setShowCreate(false);
      setForm({ title: "", courseId: "", startAt: "", durationMinutes: "60", meetingType: "jitsi", meetingLink: "", hostEmail: "tanvirulislam5386@gmail.com" });
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
        subtitle="Schedule, manage, and monitor all live learning sessions."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Scheduled", value: scheduled, icon: Video, color: "from-blue-500 to-cyan-500", bg: "from-blue-500/10 to-cyan-500/10" },
          { label: "Live Now", value: live, icon: Play, color: "from-red-500 to-pink-500", bg: "from-red-500/10 to-pink-500/10" },
          { label: "Recorded", value: recorded, icon: Archive, color: "from-purple-500 to-indigo-500", bg: "from-purple-500/10 to-indigo-500/10" },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className={`rounded-xl p-6 bg-gradient-to-br ${stat.bg} border border-gradient-to-r ${stat.color} border-opacity-10`}>
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} shadow-lg mb-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{stat.label}</p>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {alert && (
        <div className={`mb-6 rounded-xl p-4 text-sm flex items-center justify-between font-semibold ${alert.type === "success" ? "bg-green-100/80 text-green-700 border border-green-300 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100/80 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-400"}`}>
          <span>{alert.msg}</span>
          <button type="button" onClick={() => setAlert(null)} className="opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Search and Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 flex gap-3 w-full">
          <SearchBar 
            value={search}
            onChange={setSearch}
            placeholder="Search live classes…"
            className="flex-1"
          />
        </div>
        <button 
          type="button" 
          onClick={() => setShowCreate(true)} 
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white font-semibold hover:shadow-lg transition hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Schedule Class
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {["all", "scheduled", "live", "recorded"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
              filter === f
                ? "bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white shadow-lg"
                : "bg-card border border-border text-muted-foreground hover:border-[#E8A020]/50"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Live Classes Grid */}
      <div className="grid gap-6">
        {filteredClasses.length === 0 ? (
          <EmptyState
            icon={<Video className="w-8 h-8" />}
            title="No live classes found"
            description={search ? `No classes match "${search}".` : "Schedule your first live class to connect with students."}
            action={<button type="button" onClick={() => setShowCreate(true)} className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white font-semibold hover:shadow-lg transition">Schedule Class</button>}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((lc) => {
              const course = state.courses.find((c) => c.id === lc.courseId);
              const startDate = new Date(lc.startAt);
              const isUpcoming = startDate > new Date();
              
              return (
                <div key={lc.id} className="group rounded-xl border border-border hover:border-[#E8A020]/50 bg-card overflow-hidden hover:shadow-lg transition-all">
                  {/* Header with Status */}
                  <div className="relative h-32 bg-gradient-to-br from-[#1A1A2E] to-[#2d2d50] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="relative text-center">
                      <Video className="w-12 h-12 text-white/80 mx-auto mb-2" />
                      <p className="text-xs uppercase tracking-wider text-white/70 font-semibold">Live Session</p>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        lc.status === "live" 
                          ? "bg-red-500/90 text-white animate-pulse" 
                          : lc.status === "scheduled"
                          ? "bg-blue-500/90 text-white"
                          : "bg-purple-500/90 text-white"
                      }`}>
                        {lc.status === "live" ? "🔴 LIVE" : lc.status === "scheduled" ? "📅 SCHEDULED" : "✓ RECORDED"}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-foreground mb-1 line-clamp-2">{lc.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4">{course?.title ?? "Unknown Course"}</p>

                    {/* Details Grid */}
                    <div className="space-y-2 mb-4 pb-4 border-b border-border/50">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {startDate.toLocaleDateString("en-BD", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mic className="w-3.5 h-3.5" />
                        {lc.durationMinutes} minutes · {lc.meetingType === "jitsi" ? "Jitsi" : "External Link"}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {lc.status === "scheduled" && (
                        <button 
                          type="button" 
                          onClick={() => handleStatus(lc.id, "live")}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/20 text-red-600 hover:bg-red-500/30 font-semibold text-xs transition"
                        >
                          <Play className="w-3.5 h-3.5" /> Go Live
                        </button>
                      )}
                      {lc.status === "live" && (
                        <button 
                          type="button" 
                          onClick={() => handleStatus(lc.id, "recorded")}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-purple-500/20 text-purple-600 hover:bg-purple-500/30 font-semibold text-xs transition"
                        >
                          <StopCircle className="w-3.5 h-3.5" /> End Class
                        </button>
                      )}
                      {lc.meetingUrl && (
                        <a 
                          href={lc.meetingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 font-semibold text-xs transition"
                        >
                          <Send className="w-3.5 h-3.5" /> Join
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl border border-border max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl text-foreground">Schedule Live Class</h2>
                <p className="text-sm text-muted-foreground mt-1">Create a new live session for your students</p>
              </div>
              <button 
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-muted-foreground hover:text-foreground transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Class Title *</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#E8A020]/60 focus:ring-1 focus:ring-[#E8A020]/20 transition" 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  placeholder="e.g. Weekly Q&A Session" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Course *</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60 focus:ring-1 focus:ring-[#E8A020]/20 transition" 
                  value={form.courseId} 
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })} 
                  required
                >
                  <option value="">Select a course</option>
                  {publishedCourses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Start Date & Time *</label>
                <input 
                  type="datetime-local" 
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60 focus:ring-1 focus:ring-[#E8A020]/20 transition" 
                  value={form.startAt} 
                  onChange={(e) => setForm({ ...form, startAt: e.target.value })} 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Duration (minutes)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60 focus:ring-1 focus:ring-[#E8A020]/20 transition" 
                  value={form.durationMinutes} 
                  onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} 
                  min={15} 
                  max={300} 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Meeting Type</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60 focus:ring-1 focus:ring-[#E8A020]/20 transition" 
                  value={form.meetingType} 
                  onChange={(e) => setForm({ ...form, meetingType: e.target.value as "jitsi" | "external" })}
                >
                  <option value="jitsi">Jitsi</option>
                  <option value="external">External Link (Google Meet, Zoom, etc.)</option>
                </select>
              </div>

              {form.meetingType === "external" && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Meeting Link</label>
                  <input 
                    type="url" 
                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#E8A020]/60 focus:ring-1 focus:ring-[#E8A020]/20 transition" 
                    value={form.meetingLink} 
                    onChange={(e) => setForm({ ...form, meetingLink: e.target.value })} 
                    placeholder="https://meet.google.com/..." 
                    required 
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-border">
                <button 
                  type="submit" 
                  disabled={creating}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white font-semibold hover:shadow-lg transition disabled:opacity-50"
                >
                  {creating ? "Scheduling…" : "Schedule Class"}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground font-semibold hover:bg-card/80 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
