"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, TrendingUp, Users, CreditCard, DollarSign } from "lucide-react";
import { DashboardLayout, PageHeader } from "@/components/dashboard/DashboardLayout";
import { useMockLms } from "@/providers/mock-lms-provider";
import type { PlanTier } from "@/lib/mock-lms";

const PLANS: Array<{ id: PlanTier; label: string; price: number; seats: number; desc: string; features: string[] }> = [
  { 
    id: "Starter", 
    label: "Starter", 
    price: 49, 
    seats: 100, 
    desc: "For small institutes getting started.",
    features: ["Up to 100 students", "1 admin seat", "Basic reporting", "Community support"]
  },
  { 
    id: "Growth", 
    label: "Growth", 
    price: 149, 
    seats: 500, 
    desc: "For growing institutes with more learners.",
    features: ["Up to 500 students", "5 admin seats", "Advanced analytics", "Priority email support"]
  },
  { 
    id: "Professional", 
    label: "Professional", 
    price: 349, 
    seats: 2000, 
    desc: "For large institutes at scale.",
    features: ["Up to 2000 students", "Unlimited admin seats", "Custom reports", "24/7 phone support"]
  },
];

export default function AdminBillingPage() {
  const { state, updatePlan } = useMockLms();
  const { billing, invoices } = state;
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const utilization = billing.seatLimit ? Math.round((billing.activeStudents / billing.seatLimit) * 100) : 0;
  const isOverLimit = billing.seatLimit && billing.activeStudents > billing.seatLimit;

  async function handlePlanChange(planId: PlanTier) {
    setSaving(true);
    try {
      await updatePlan(planId);
      setAlert({ type: "success", msg: `Plan upgraded to ${planId} successfully.` });
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      setAlert({ type: "error", msg: err instanceof Error ? err.message : "Failed to update plan." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="Billing & Subscription"
        subtitle="Manage your plan, seats, invoices, and billing information from a single dashboard."
      />

      {alert && (
        <div className={`mb-6 rounded-xl p-4 text-sm flex items-center justify-between font-semibold ${alert.type === "success" ? "bg-green-100/80 text-green-700 border border-green-300 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100/80 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-400"}`}>
          <span className="flex items-center gap-2">
            {alert.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {alert.msg}
          </span>
          <button type="button" onClick={() => setAlert(null)} className="opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Left Column */}
        <div className="grid gap-6 content-start">
          {/* Current Plan Card */}
          <div className="card relative overflow-hidden bg-gradient-to-br from-[#1A1A2E] via-[#2d2d50] to-[#1A1A2E] border-0 shadow-xl text-white">
            <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-[#E8A020]/15 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_50%)]" />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/50 font-semibold">Current Plan</p>
                  <p className="font-serif text-4xl text-white mt-2">{billing.plan}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/50 font-semibold mb-1">Monthly Cost</p>
                  <p className="text-3xl font-bold text-[#E8A020]">৳{billing.monthlyPrice ?? 0}</p>
                </div>
              </div>

              {/* Plan Details Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="rounded-xl p-4 bg-white/5 backdrop-blur border border-white/10">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">Active Students</p>
                  <p className="text-2xl font-bold text-white mt-2">{billing.activeStudents}</p>
                  <p className="text-xs text-white/60 mt-1">Learners</p>
                </div>
                <div className="rounded-xl p-4 bg-white/5 backdrop-blur border border-white/10">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">Seat Limit</p>
                  <p className="text-2xl font-bold text-white mt-2">{billing.seatLimit ?? "∞"}</p>
                  <p className="text-xs text-white/60 mt-1">Total Capacity</p>
                </div>
                <div className="rounded-xl p-4 bg-white/5 backdrop-blur border border-white/10">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">Per Seat Cost</p>
                  <p className="text-2xl font-bold text-white mt-2">৳{billing.overagePerSeat ?? 0}</p>
                  <p className="text-xs text-white/60 mt-1">Overage</p>
                </div>
                <div className="rounded-xl p-4 bg-white/5 backdrop-blur border border-white/10">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">Utilization</p>
                  <p className="text-2xl font-bold text-[#E8A020] mt-2">{utilization}%</p>
                  <p className="text-xs text-white/60 mt-1">Capacity Used</p>
                </div>
              </div>

              {/* Seat Utilization Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-white">Seat Utilization</span>
                  <span className="text-xs text-white/70">{billing.activeStudents} of {billing.seatLimit} used</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden bg-white/10 border border-white/20">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#E8A020] to-orange-400"
                    style={{
                      width: `${Math.min(utilization, 100)}%`
                    }}
                  />
                </div>
              </div>

              {/* Alerts */}
              {isOverLimit && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/20 border border-red-400/50">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-300">Seat limit exceeded!</p>
                    <p className="text-xs text-red-200 mt-0.5">You have {billing.activeStudents - billing.seatLimit} extra students. Overage fees apply.</p>
                  </div>
                </div>
              )}
              {!isOverLimit && utilization > 80 && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/20 border border-amber-400/50">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-300">Nearing seat limit</p>
                    <p className="text-xs text-amber-200 mt-0.5">You have {billing.seatLimit - billing.activeStudents} seats remaining. Consider upgrading soon.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Invoices Section */}
          <div className="card">
            <h3 className="font-serif text-xl text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#E8A020]" />
              Recent Invoices
            </h3>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6 bg-background/50 rounded-lg">No invoices yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr className="bg-background/50">
                      <th>Invoice ID</th>
                      <th>Amount (BDT)</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.slice(0, 8).map((inv) => (
                      <tr key={inv.id} className="group hover:bg-[#E8A020]/5">
                        <td className="font-mono text-xs text-muted-foreground group-hover:text-foreground">{String(inv.id).slice(0, 12)}…</td>
                        <td className="font-semibold text-foreground">৳{inv.amountBdt}</td>
                        <td className="text-sm text-muted-foreground">
                          {inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString("en-BD") : "Not issued"}
                        </td>
                        <td>
                          <span className={`badge text-xs font-semibold ${
                            inv.paymentStatus === "paid" 
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                              : inv.paymentStatus === "overdue" 
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" 
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}>
                            {inv.paymentStatus.charAt(0).toUpperCase() + inv.paymentStatus.slice(1)}
                          </span>
                        </td>
                        <td className="text-center">
                          <button className="text-xs text-blue-600 hover:text-blue-700 font-semibold">Download</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Plan Selector */}
        <div className="card content-start">
          <h3 className="font-serif text-xl text-foreground mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#E8A020]" />
            Upgrade Your Plan
          </h3>
          <p className="text-sm text-muted-foreground mb-6">Select a plan that fits your institution needs.</p>
          
          <div className="grid gap-4 mb-6">
            {PLANS.map((plan) => {
              const isCurrent = billing.plan === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`rounded-xl border-2 p-5 transition-all cursor-pointer group ${
                    isCurrent 
                      ? "border-[#E8A020] bg-gradient-to-br from-[#E8A020]/10 to-orange-500/5 shadow-lg" 
                      : "border-border hover:border-[#E8A020]/60 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-lg text-foreground">{plan.label}</p>
                        {isCurrent && (
                          <span className="badge badge-warning text-[10px] font-bold">Current</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{plan.desc}</p>
                      <p className="text-2xl font-bold text-[#E8A020]">৳{plan.price.toLocaleString()}<span className="text-xs text-muted-foreground font-normal">/mo</span></p>
                      <p className="text-xs text-muted-foreground mt-1">{plan.seats.toLocaleString()} students</p>
                    </div>
                    {isCurrent ? (
                      <CheckCircle className="w-6 h-6 text-[#E8A020] shrink-0 mt-1" />
                    ) : null}
                  </div>
                  
                  {/* Plan Features */}
                  <div className="space-y-2 mb-4 pb-4 border-t border-border/50">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground group-hover:text-foreground transition pt-2">
                        <CheckCircle className="w-3 h-3 text-[#E8A020] flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => handlePlanChange(plan.id)}
                      disabled={saving}
                      className="w-full btn-primary text-xs px-3 py-2 font-semibold"
                    >
                      {saving ? "Updating..." : "Select Plan"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-white/5 dark:to-white/10 p-4 border border-border/50">
            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">Billing Overview</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Annual Savings</p>
                <p className="text-lg font-bold text-[#E8A020]">৳{(billing.monthlyPrice * 12 * 0.15).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Next Billing</p>
                <p className="text-lg font-bold text-foreground">30 days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
