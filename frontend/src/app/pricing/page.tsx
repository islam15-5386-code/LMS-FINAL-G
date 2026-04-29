"use client";

import Link from "next/link";

const plans = [
  { name: "Starter", price: "৳49/mo", desc: "Best for small institutes." },
  { name: "Growth", price: "৳149/mo", desc: "Best for growing vendors." },
  { name: "Professional", price: "৳349/mo", desc: "Best for large LMS operations." },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f7f9ff] to-white px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-slate-900">Subscription Plans</h1>
        <p className="mt-3 text-slate-600">Stripe-powered subscriptions with optional SSLCommerz fallback.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-wide text-slate-500">{plan.name}</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{plan.price}</p>
              <p className="mt-2 text-sm text-slate-600">{plan.desc}</p>
              <Link
                href="/admin/billing"
                className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Continue Checkout
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
