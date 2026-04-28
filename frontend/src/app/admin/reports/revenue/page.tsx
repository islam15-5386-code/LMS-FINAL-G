"use client";

import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Section } from "@/components/shared/lms-core";

type MonthData = { month: string; total: number };

export default function AdminRevenuePage() {
  const [data, setData] = useState<MonthData[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/reports/revenue`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setTotal(json.data.total ?? 0);
        // Normalize months into objects
        setData((json.data.by_month ?? []).map((m: any) => ({ month: m.month, total: Number(m.total) })));
      } catch (err) {
        console.error("Failed to load revenue:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <Section title="Revenue" subtitle="Track payments and revenue over time (admin only).">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          <div className="text-lg font-semibold">Total revenue: BDT {total?.toFixed(2)}</div>
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No revenue data for the selected period.</p>
          ) : (
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </Section>
  );
}
