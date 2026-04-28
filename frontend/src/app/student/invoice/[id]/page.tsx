"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, Printer, ArrowLeft, Download, CreditCard, Building2, Calendar } from "lucide-react";
import { useMockLms } from "@/providers/mock-lms-provider";
import { fetchPaymentInvoiceOnBackend, getStoredToken } from "@/lib/api/lms-backend";
import { DashboardLayout, PageHeader } from "@/components/dashboard/DashboardLayout";
import { PrimaryButton, SecondaryButton, Badge, Section } from "@/components/shared/lms-core";
import type { Payment } from "@/lib/mock-lms";

export default function InvoicePage() {
  const params = useParams<{ id: string | string[] }>();
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const router = useRouter();
  const { state } = useMockLms();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoice() {
      if (!id) {
        setError("Invoice not found.");
        setLoading(false);
        return;
      }
      const token = getStoredToken();
      if (!token) {
        // Mock fallback
        const found = state.payments.find((p) => p.id === id);
        if (found) {
          setPayment(found);
        } else {
          setError("Invoice not found.");
        }
        setLoading(false);
        return;
      }

      try {
        const data = await fetchPaymentInvoiceOnBackend(id);
        setPayment((data as any).data as Payment);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load invoice.");
        // Try fallback to state
        const found = state.payments.find((p) => p.id === id);
        if (found) setPayment(found);
      } finally {
        setLoading(false);
      }
    }

    void loadInvoice();
  }, [id, state.payments]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <PageHeader title="Invoice" subtitle="Preparing your invoice..." />
        <div className="card flex min-h-[240px] items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Generating invoice...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !payment) {
    return (
      <DashboardLayout role="student">
        <PageHeader title="Invoice" subtitle="Unable to load this invoice." />
        <div className="card flex min-h-[240px] flex-col items-center justify-center gap-4">
          <p className="text-destructive">{error || "Invoice not found."}</p>
          <SecondaryButton onClick={() => router.push("/student/dashboard")}>
            Back to Dashboard
          </SecondaryButton>
        </div>
      </DashboardLayout>
    );
  }

  const course = state.courses.find(c => c.id === payment.courseId);

  return (
    <DashboardLayout role="student">
      <PageHeader title="Invoice" subtitle="Review payment details and print or download your invoice." />
      <div className="bg-muted/30 py-2 print:bg-white print:py-0">
      <div className="mx-auto max-w-3xl space-y-6 px-4">
        {/* Navigation - Hidden on print */}
        <div className="flex items-center justify-between print:hidden">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <SecondaryButton onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </SecondaryButton>
            <PrimaryButton onClick={() => router.push("/student/courses")}>
              Go to My Courses
            </PrimaryButton>
          </div>
        </div>

        {/* Slack-style Invoice Card */}
        <div className="overflow-hidden rounded-xl border border-foreground/5 bg-white p-12 shadow-sm print:rounded-none print:border-none print:p-0 print:shadow-none">
          {/* Header Row */}
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-foreground text-white">
                <span className="font-bold">{state.branding.logoText || "SL"}</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-foreground lowercase">
                {state.branding.tenantName.toLowerCase().replace(/\s+/g, '')}
              </span>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-black tracking-tight text-foreground">INVOICE</h1>
              <p className="text-muted-foreground"># {String(payment.id).split('-')[0]}</p>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-12 flex justify-between">
            {/* Left: Company & Billing */}
            <div className="space-y-8">
              <div className="text-sm leading-relaxed text-foreground">
                <p className="font-bold text-base">{state.branding.tenantName}</p>
                <p>123 Education Street</p>
                <p>{state.branding.city || "Dhaka"}, Bangladesh</p>
                <p>1212</p>
              </div>

              <div className="text-sm leading-relaxed">
                <p className="text-muted-foreground mb-1">Bill to:</p>
                <p className="font-bold text-base">{state.users.find(u => u.id === payment.userId)?.name || "Student"}</p>
                <p>Registered Student Account</p>
                <p>{state.users.find(u => u.id === payment.userId)?.email || "student@example.com"}</p>
              </div>
            </div>

            {/* Right: Dates & Balance */}
            <div className="w-64 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date:</span>
                <span className="text-foreground font-medium">{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Terms:</span>
                <span className="text-foreground font-medium">Due on Receipt</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Due Date:</span>
                <span className="text-foreground font-medium">{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="text-muted-foreground">Balance Due:</span>
                <span className="text-foreground font-medium">${(Number(payment.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="flex justify-between rounded-md bg-muted px-3 py-2 text-sm font-bold mt-4">
                <span className="text-foreground">Balance Due:</span>
                <span className="text-foreground font-black">${(Number(payment.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-12 overflow-hidden rounded-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-foreground text-white">
                  <th className="px-4 py-2 text-sm font-bold">Item</th>
                  <th className="px-4 py-2 text-right text-sm font-bold">Quantity</th>
                  <th className="px-4 py-2 text-right text-sm font-bold">Rate</th>
                  <th className="px-4 py-2 text-right text-sm font-bold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10 border-b border-foreground/10">
                <tr>
                  <td className="px-4 py-6">
                    <p className="font-bold text-foreground">{course?.title || "Online Course"}</p>
                    <p className="text-sm text-muted-foreground mt-1">Full access to curriculum and assessments</p>
                  </td>
                  <td className="px-4 py-6 text-right text-foreground">1</td>
                  <td className="px-4 py-6 text-right text-foreground">${(Number(payment.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-6 text-right text-foreground font-bold">${(Number(payment.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-8 flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="text-foreground font-medium">${(Number(payment.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (0%):</span>
                <span className="text-foreground font-medium">$0.00</span>
              </div>
              <div className="flex justify-between border-t border-foreground/10 pt-2 text-lg font-black tracking-tight">
                <span className="text-foreground uppercase">Total:</span>
                <span className="text-foreground font-black">${(Number(payment.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Footer - Only visible on web, or subtle on print */}
          <div className="mt-20 border-t border-foreground/5 pt-8 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Thank you for choosing {state.branding.tenantName}
          </div>
        </div>

        {/* Support Link - Hidden on print */}
        <p className="text-center text-xs text-muted-foreground print:hidden">
          Problems with the invoice? <button className="font-semibold text-primary underline">Contact Support</button>
        </p>
      </div>
      </div>
    </DashboardLayout>
  );
}
