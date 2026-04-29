"use client";

import { useState } from "react";
import { Plus, Grid, List, Filter, X } from "lucide-react";
import { DashboardLayout, PageHeader, SearchBar } from "@/components/dashboard/DashboardLayout";
import { AdminCoursePanel } from "@/components/admin/admin-panels";
import { createAdminCourseOnBackend, fetchAdminTeachersFromBackend } from "@/lib/api/lms-backend";

export default function AdminCoursesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [teachers, setTeachers] = useState<Array<{ id: number; name: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    category: "Technology",
    description: "",
    price: "0",
    level: "Beginner",
    status: "draft" as "draft" | "published",
    teacher_id: "",
  });

  const openCreateModal = async () => {
    setErrorMessage("");
    setShowCreate(true);
    try {
      const response = await fetchAdminTeachersFromBackend();
      setTeachers((response.data ?? []).map((t) => ({ id: Number(t.id), name: String(t.name) })));
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to load teachers.");
    }
  };

  const handleCreateCourse = async () => {
    if (!form.title.trim() || !form.category.trim() || !form.description.trim()) {
      setErrorMessage("Title, category and description are required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    try {
      await createAdminCourseOnBackend({
        title: form.title.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        price: Number(form.price || "0"),
        level: form.level.trim() || "Beginner",
        status: form.status,
        teacher_id: form.teacher_id ? Number(form.teacher_id) : undefined,
      });

      setShowCreate(false);
      setForm({
        title: "",
        category: "Technology",
        description: "",
        price: "0",
        level: "Beginner",
        status: "draft",
        teacher_id: "",
      });
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Failed to create course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="Course Management"
        subtitle="Design, assign teachers, manage students, and monitor course status across your institution."
      />

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center justify-between">
        <div className="flex-1 flex gap-3 w-full">
          <SearchBar 
            value={search} 
            onChange={setSearch} 
            placeholder="Search courses by name, teacher, or code..."
            className="flex-1"
          />
          <button className="p-3 rounded-xl border border-border hover:border-[#E8A020]/50 transition">
            <Filter className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            type="button"
            className={`p-3 rounded-xl transition ${
              viewMode === "grid"
                ? "bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white shadow-lg"
                : "border border-border hover:border-[#E8A020]/50"
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            type="button"
            className={`p-3 rounded-xl transition ${
              viewMode === "list"
                ? "bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white shadow-lg"
                : "border border-border hover:border-[#E8A020]/50"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => void openCreateModal()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white font-semibold hover:shadow-lg transition hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          New Course
        </button>
      </div>

      <div className="space-y-6">
        <AdminCoursePanel refreshKey={refreshKey} />
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card rounded-xl border border-border max-w-lg w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-serif text-xl text-foreground">Create New Course</h2>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleCreateCourse();
              }}
              className="p-6 space-y-3"
            >
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Category</label>
                <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Price</label>
                  <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Level</label>
                  <input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60">
                    <option value="draft">draft</option>
                    <option value="published">published</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Teacher (optional)</label>
                  <select value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-[#E8A020]/60">
                    <option value="">Unassigned</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={String(t.id)}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

              <div className="flex gap-3 pt-4 border-t border-border">
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white font-semibold disabled:opacity-50">
                  {isSubmitting ? "Creating..." : "Create Course"}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground font-semibold hover:bg-card/80">
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
