import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero } from "@/components/PageHero";
import { useShop } from "@/lib/shop";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create an Account | Apna Baithak" },
      {
        name: "description",
        content: "Sign up at Apna Baithak to save favourites, reorder faster and track your orders.",
      },
      { property: "og:title", content: "Sign Up — Apna Baithak" },
      { property: "og:description", content: "Create your Apna Baithak account." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { signup } = useShop();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <PageHero eyebrow="Join us" title="Create Account" subtitle="It takes about ten seconds." />
      <section className="mx-auto max-w-md px-5 py-14">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!/^\d{10}$/.test(form.phone)) {
              setError("Enter a valid 10-digit phone number.");
              return;
            }
            if (form.password.length < 6) {
              setError("Password must be at least 6 characters.");
              return;
            }
            const res = signup(form);
            if (!res.ok) setError(res.error ?? "Could not create account.");
            else navigate({ to: "/account" });
          }}
          className="rounded-3xl border border-border bg-card p-7"
        >
          {[
            { k: "name", l: "Full name", t: "text", p: "Your name" },
            { k: "email", l: "Email", t: "email", p: "you@example.com" },
            { k: "phone", l: "Phone", t: "tel", p: "10-digit number" },
            { k: "password", l: "Password", t: "password", p: "Minimum 6 characters" },
          ].map((f) => (
            <label key={f.k} className="mt-4 block first:mt-0">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {f.l}
              </span>
              <input
                required
                type={f.t}
                placeholder={f.p}
                value={form[f.k as keyof typeof form]}
                onChange={set(f.k as keyof typeof form)}
                className="input"
              />
            </label>
          ))}
          {error && (
            <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive">
              {error}
            </p>
          )}
          <button className="mt-6 w-full rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground">
            Create account
          </button>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary">
              Login
            </Link>
          </p>
        </form>
      </section>
    </>
  );
}
