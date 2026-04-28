"use client";

import { useState } from "react";
import { ShieldCheck, Filter, Download, Search } from "lucide-react";
import { DashboardLayout, PageHeader, SearchBar, EmptyState } from "@/components/dashboard/DashboardLayout";
import { useMockLms } from "@/providers/mock-lms-provider";

export default function AdminAuditLogsPage() {
  const { state } = useMockLms();
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("7days");

  const filtered = state.auditEvents.filter((e) =>
    (e.actor.toLowerCase().includes(search.toLowerCase()) ||
    e.action.toLowerCase().includes(search.toLowerCase()) ||
    e.target.toLowerCase().includes(search.toLowerCase())) &&
    (actionFilter === "all" || e.action.includes(actionFilter))
  );

  const actionTypes = ["all", "created", "updated", "deleted", "accessed"];

  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="Audit Logs"
        subtitle="Track all user actions, system changes, and security events for compliance and troubleshooting."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="card bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-200/50 dark:border-blue-900/30">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Events</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{state.auditEvents.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-200/50 dark:border-green-900/30">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">This Week</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{Math.floor(state.auditEvents.length * 0.35)}</p>
        </div>
        <div className="card bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-200/50 dark:border-amber-900/30">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Active Users</p>
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-2">{new Set(state.auditEvents.map(e => e.actor)).size}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-200/50 dark:border-purple-900/30">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Critical Events</p>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{state.auditEvents.filter(e => e.action.includes("delete")).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex-1 flex gap-3 w-full">
          <SearchBar 
            value={search} 
            onChange={setSearch} 
            placeholder="Search by actor, action, or target…"
            className="flex-1"
          />
          <button className="p-3 rounded-xl border border-border hover:border-[#E8A020]/50 transition">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action and Date Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-muted-foreground">Filter:</span>
          {actionTypes.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActionFilter(f)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${actionFilter === f ? "bg-gradient-to-r from-[#1A1A2E] to-[#E8A020] text-white shadow-lg" : "bg-card border border-border text-muted-foreground hover:border-[#E8A020]/50"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm font-semibold text-muted-foreground">Period:</span>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs font-semibold border border-border bg-card hover:border-[#E8A020]/50 transition"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="w-8 h-8" />}
            title="No audit events"
            description="Audit events will appear here as users take actions."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50/50 to-transparent dark:from-white/5">
                  <th className="w-12">#</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event, idx) => {
                  const isDelete = event.action.includes("delete");
                  const isUpdate = event.action.includes("update");
                  
                  return (
                    <tr key={event.id} className={`group hover:bg-gradient-to-r transition-all ${
                      isDelete 
                        ? "hover:from-red-500/5 hover:to-transparent" 
                        : isUpdate 
                        ? "hover:from-amber-500/5 hover:to-transparent"
                        : "hover:from-blue-500/5 hover:to-transparent"
                    }`}>
                      <td className="text-xs text-muted-foreground font-mono group-hover:font-bold">{idx + 1}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="avatar w-8 h-8 text-[10px] shrink-0 font-bold shadow-sm group-hover:shadow-md transition">
                            {event.actor.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-foreground">{event.actor}</span>
                            <p className="text-xs text-muted-foreground">{event.actor.toLowerCase().replace(" ", ".")}@system</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                            isDelete 
                              ? "bg-red-500/20 text-red-700" 
                              : isUpdate 
                              ? "bg-amber-500/20 text-amber-700"
                              : "bg-blue-500/20 text-blue-700"
                          }`}>
                            {event.action.split("_")[0].toUpperCase()}
                          </div>
                          <span className="text-sm text-foreground max-w-[200px] truncate">{event.action}</span>
                        </div>
                      </td>
                      <td className="text-sm text-muted-foreground max-w-[160px] truncate group-hover:text-foreground transition">{event.target}</td>
                      <td className="text-xs font-mono text-muted-foreground group-hover:bg-white/10 px-2 py-1 rounded transition">{event.ipAddress}</td>
                      <td className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(event.timestamp).toLocaleString("en-BD", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isDelete
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}>
                          {isDelete ? "⚠️ Delete" : "✓ Success"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
