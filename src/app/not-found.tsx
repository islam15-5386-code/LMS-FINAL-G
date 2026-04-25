import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <p className="rounded-full border border-foreground/10 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground shadow-soft">
        Route not found
      </p>
      <h1 className="mt-6 font-serif text-6xl">404</h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">
        That path is not wired into the rebuilt app yet. Head back to the homepage or open one of the documented LMS routes.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-soft">
          Go home
        </Link>
        <Link href="/admin/dashboard" className="rounded-full border border-foreground/15 px-5 py-3 text-sm font-semibold">
          Admin dashboard
        </Link>
      </div>
    </main>
  );
}
