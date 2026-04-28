"use client";

import { DashboardLayout, PageHeader } from "@/components/dashboard/DashboardLayout";
import { CompliancePanel } from "@/components/admin/admin-panels";
import { CheckCircle, AlertCircle, TrendingUp, Download } from "lucide-react";

export default function AdminComplianceReportsPage() {
  // Sample compliance stats
  const complianceStats = [
    { label: "Total Compliance Records", value: "157", icon: CheckCircle, color: "from-blue-500 to-cyan-500", bg: "from-blue-500/10 to-cyan-500/10" },
    { label: "Fully Certified", value: "98", icon: CheckCircle, color: "from-green-500 to-emerald-500", bg: "from-green-500/10 to-emerald-500/10" },
    { label: "In Progress", value: "45", icon: AlertCircle, color: "from-amber-500 to-orange-500", bg: "from-amber-500/10 to-orange-500/10" },
    { label: "Compliance Rate", value: "62%", icon: TrendingUp, color: "from-purple-500 to-pink-500", bg: "from-purple-500/10 to-pink-500/10" },
  ];

  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="Compliance Reports"
        subtitle="Track completion evidence, certifications, and create audit-ready reports for regulatory compliance."
      />

      {/* Compliance Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {complianceStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="card group hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:shadow-xl transition-shadow inline-block mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold group-hover:text-foreground transition">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground mt-2 group-hover:scale-110 origin-left transition-transform">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg transition hover:-translate-y-0.5">
          <Download className="w-4 h-4" />
          Export CSV Report
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-lg transition hover:-translate-y-0.5">
          <Download className="w-4 h-4" />
          Export PDF Report
        </button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#E8A020] text-[#E8A020] font-semibold hover:bg-[#E8A020]/10 transition">
          Send Reminders
        </button>
      </div>

      <CompliancePanel />
    </DashboardLayout>
  );
}
