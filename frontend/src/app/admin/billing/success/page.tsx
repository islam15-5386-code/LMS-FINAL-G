"use client";

import Link from "next/link";
import { DashboardLayout, PageHeader } from "@/components/dashboard/DashboardLayout";

export default function BillingSuccessPage() {
  return (
    <DashboardLayout role="admin">
      <PageHeader title="Payment Success" subtitle="Your Stripe checkout completed successfully." />
      <div className="card">
        <p className="text-sm text-muted-foreground">Your subscription payment is being verified. Invoice and status will update shortly.</p>
        <Link href="/admin/billing" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
          Back to Billing
        </Link>
      </div>
    </DashboardLayout>
  );
}
