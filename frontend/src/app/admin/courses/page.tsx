"use client";

import { useState } from "react";
import { BookOpen, Plus, Grid, List, Search, Filter } from "lucide-react";
import { DashboardLayout, PageHeader, SearchBar } from "@/components/dashboard/DashboardLayout";
import { AdminCoursePanel } from "@/components/admin/admin-panels";

export default function AdminCoursesPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");

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
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white font-semibold hover:shadow-lg transition hover:-translate-y-0.5">
          <Plus className="w-4 h-4" />
          New Course
        </button>
      </div>

      <div className="space-y-6">
        <AdminCoursePanel />
      </div>
    </DashboardLayout>
  );
}
