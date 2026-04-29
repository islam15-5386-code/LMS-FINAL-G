"use client";

import Link from "next/link";
import { DashboardLayout, PageHeader } from "@/components/dashboard/DashboardLayout";

export default function BillingCancelPage() {
  return (
    <DashboardLayout role="admin">
      <PageHeader title="Payment Canceled" subtitle="Checkout was canceled or failed before completion." />
      <div className="card">
        <p className="text-sm text-muted-foreground">No charge was completed. You can retry from billing dashboard.</p>
        <Link href="/admin/billing" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
          Retry Payment
        </Link>
      </div>
    </DashboardLayout>
  );
}
