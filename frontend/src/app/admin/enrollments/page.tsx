"use client";

import { useState } from "react";
import { DashboardLayout, PageHeader, SearchBar } from "@/components/dashboard/DashboardLayout";
import { EnrollmentManagementPanel } from "@/components/admin/admin-panels";
import { Filter, Download, Plus } from "lucide-react";

export default function AdminEnrollmentsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="Enrollment Management"
        subtitle="Monitor and manage student enrollments, track progress, and update enrollment statuses."
      />

      {/* Controls Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          {/* Search and Filters */}
          <div className="flex-1 flex gap-3 w-full items-center">
            <SearchBar 
              value={search}
              onChange={setSearch}
              placeholder="Search enrollments by student, course, or code…"
              className="flex-1"
            />
            <button className="p-3 rounded-xl border border-border hover:border-[#E8A020]/50 transition-colors shrink-0">
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border hover:border-[#E8A020]/50 text-sm font-semibold transition-colors hover:bg-[#E8A020]/5">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white font-semibold hover:shadow-lg transition hover:-translate-y-0.5">
              <Plus className="w-4 h-4" />
              New Enrollment
            </button>
          </div>
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
            {["all", "active", "completed", "pending"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                  filter === f
                    ? "bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white shadow-lg"
                    : "bg-card border border-border text-muted-foreground hover:border-[#E8A020]/50 hover:bg-card/80"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            <label className="text-sm font-semibold text-muted-foreground">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:border-[#E8A020]/50 transition-colors cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Student Name</option>
              <option value="course">Course</option>
              <option value="progress">Progress</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enrollment Management Panel */}
      <div className="space-y-6">
        <EnrollmentManagementPanel />
      </div>
    </DashboardLayout>
  );
}
