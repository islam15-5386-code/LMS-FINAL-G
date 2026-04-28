"use client";

import { DashboardLayout, PageHeader } from "@/components/dashboard/DashboardLayout";
import { AdminCoursePanel } from "@/components/admin/admin-panels";

export default function AdminCoursesPage() {
  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="Course Management"
        subtitle="Assign teachers, manage students, and monitor course status."
      />
      <div className="space-y-6">
        <AdminCoursePanel />
      </div>
    </DashboardLayout>
  );
}
