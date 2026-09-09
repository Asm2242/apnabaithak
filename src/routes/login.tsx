import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero } from "@/components/PageHero";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login | Apna Baithak" },
      {
        name: "description",
        content: "Sign in to your Apna Baithak account to track orders and saved dishes.",
      },
      { property: "og:title", content: "Login — Apna Baithak" },
      { property: "og:description", content: "Sign in to your account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <>
      <PageHero eyebrow="Welcome back" title="Login" subtitle="Use your registered email." />
      <section className="mx-auto max-w-md px-5 py-14">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            setBusy(true);
            const res = await signIn(email.trim(), password);
            setBusy(false);
            if (!res.ok) setError(res.error ?? "Login failed.");
            else navigate({ to: "/account" });
          }}
          className="rounded-3xl border border-border bg-card p-7"
        >
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Email
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
            />
          </label>
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Password
            </span>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
          </label>
          {error && (
            <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive">
              {error}
            </p>
          )}
          <button
            disabled={busy}
            className="mt-6 w-full rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Login"}
          </button>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="font-semibold text-primary">
              Create an account
            </Link>
          </p>
        </form>
      </section>
    </>
  );
}
