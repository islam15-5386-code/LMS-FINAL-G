"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { useLms, dashboardPathForRole } from "@/providers/lms-provider";

// Quick-access demo credentials
const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@example.com", password: "password123", color: "#E8A020" },
  { role: "Teacher", email: "teacher@example.com", password: "password123", color: "#0f766e" },
  { role: "Student", email: "student@example.com", password: "password123", color: "#7c3aed" },
];

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useLms();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [branding, setBranding] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/tenant/current');
        if (!res.ok) return;
        const json = await res.json();
        if (mounted) setBranding(json.data ?? json);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await signIn(email, password);
      router.replace(dashboardPathForRole(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleDemo(acc: typeof DEMO_ACCOUNTS[number]) {
    setEmail(acc.email);
    setPassword(acc.password);
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Visual panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden" style={{ background: "linear-gradient(145deg, #0f1424 0%, #1A1A2E 50%, #111827 100%)" }}>
        {/* Ambient glows */}
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-[#E8A020]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-16 right-8 w-48 h-48 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-[1.1rem] flex items-center justify-center font-serif text-lg text-white" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(232,160,32,0.4))" }}>
            SL
          </div>
          <div>
            <p className="font-serif text-xl font-semibold text-white">Smart LMS</p>
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">Learning Platform</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <h1 className="font-serif text-5xl leading-[1.08] text-white">
            Empowering<br />learning across<br /><span className="text-[#E8A020]">Bangladesh.</span>
          </h1>
          <p className="mt-6 text-base text-white/60 leading-relaxed max-w-sm">
            A multi-tenant AI-powered LMS built for institutes, teachers, and students with professional tools for every role.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-10">
            {[
              { label: "Institutes", value: "50+" },
              { label: "Students", value: "12k+" },
              { label: "Certificates", value: "4k+" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.06)" }}>
                <p className="font-serif text-2xl text-white">{value}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10">
          <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-sm text-white/75 leading-relaxed italic">
              &ldquo;Smart LMS transformed how we manage our 500 students. The AI assessment tools alone save us hours every week.&rdquo;
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0" style={{ background: "linear-gradient(135deg, #0f766e, #E8A020)" }}>
                AR
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Ayesha Rahman</p>
                <p className="text-xs text-white/45">Admin, Betopia Academy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-[0.9rem] flex items-center justify-center font-serif text-base text-white"
                 style={{ background: branding?.primaryColor ?? "linear-gradient(135deg, #1A1A2E, #E8A020)", backgroundColor: branding?.primaryColor ?? undefined }}>
              {branding?.logoText ?? 'SL'}
            </div>
            <p className="font-serif text-xl font-semibold">{branding?.tenantName ?? 'Smart LMS'}</p>
          </div>

          <h2 className="font-serif text-3xl text-foreground">{branding?.siteTitle ?? 'Welcome back'}</h2>
          <p className="text-muted-foreground mt-2 text-sm">Sign in to your {branding?.tenantName ?? 'account'} to continue.</p>

          {/* Demo account quick-fill */}
          <div className="mt-6 p-4 rounded-2xl border border-dashed border-border/80 bg-muted/20">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleDemo(acc)}
                  className="rounded-xl border p-2.5 text-center transition-all hover:-translate-y-0.5 hover:shadow-sm"
                  style={{ borderColor: acc.color + "40", background: acc.color + "0a" }}
                >
                  <p className="text-xs font-semibold" style={{ color: acc.color }}>{acc.role}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{acc.email.split("@")[0]}</p>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">Click a role to auto-fill, then click Sign In.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="alert-error mt-4">
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="mt-6 grid gap-4">
            <div>
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="form-input"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="form-label mb-0" htmlFor="password">Password</label>
                <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPwd ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full justify-center py-3.5 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-foreground font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
