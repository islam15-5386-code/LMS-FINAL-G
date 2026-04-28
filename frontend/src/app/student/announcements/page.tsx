"use client";

import { DashboardLayout, PageHeader } from "@/components/dashboard/DashboardLayout";
import { StudentAnnouncementsPanel } from "@/components/student/student-panels";

export default function StudentAnnouncementsPage() {
  return (
    <DashboardLayout role="student">
      <PageHeader
        title="Announcements"
        subtitle="Stay updated with the latest messages from your teachers and the institute."
      />
      <StudentAnnouncementsPanel />
    </DashboardLayout>
  );
}
