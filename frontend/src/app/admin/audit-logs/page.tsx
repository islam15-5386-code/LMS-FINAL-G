"use client";

import { useState } from "react";
import { ShieldCheck, Search } from "lucide-react";
import { DashboardLayout, PageHeader, SearchBar, EmptyState } from "@/components/dashboard/DashboardLayout";
import { useMockLms } from "@/providers/mock-lms-provider";

export default function AdminAuditLogsPage() {
  const { state } = useMockLms();
  const [search, setSearch] = useState("");

  const filtered = state.auditEvents.filter((e) =>
    e.actor.toLowerCase().includes(search.toLowerCase()) ||
    e.action.toLowerCase().includes(search.toLowerCase()) ||
    e.target.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="admin">
      <PageHeader
        title="Audit Logs"
        subtitle="Track all user actions and system events for compliance."
      />

      <div className="mb-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by actor, action, or target…" />
      </div>

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
                <tr>
                  <th>#</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((event, idx) => (
                  <tr key={event.id}>
                    <td className="text-xs text-muted-foreground font-mono">{idx + 1}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar w-7 h-7 text-[10px] shrink-0">
                          {event.actor.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-foreground">{event.actor}</span>
                      </div>
                    </td>
                    <td className="text-sm text-foreground max-w-[200px] truncate">{event.action}</td>
                    <td className="text-sm text-muted-foreground max-w-[160px] truncate">{event.target}</td>
                    <td className="text-xs font-mono text-muted-foreground">{event.ipAddress}</td>
                    <td className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
