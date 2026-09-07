import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero } from "@/components/PageHero";
import { rupees, useShop } from "@/lib/shop";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | Apna Baithak" },
      {
        name: "description",
        content: "Confirm your delivery details and place your pure veg order with Apna Baithak.",
      },
      { property: "og:title", content: "Checkout — Apna Baithak" },
      { property: "og:description", content: "Place your order in a few seconds." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { lines, subtotal, discount, delivery, total, bestOffer, clear, customer, ready } =
    useShop();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: customer?.name ?? "",
    phone: customer?.phone ?? "",
    address: "",
    landmark: "",
    mode: "delivery" as "delivery" | "takeaway",
    payment: "cod" as "cod" | "upi",
    notes: "",
  });

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(form.phone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    if (form.mode === "delivery" && form.address.trim().length < 10) {
      setError("Please give a full delivery address.");
      return;
    }
    setError("");
    const id = `AB${Date.now().toString().slice(-6)}`;
    const order = {
      id,
      placedAt: new Date().toISOString(),
      items: lines,
      subtotal,
      discount,
      delivery,
      total,
      ...form,
    };
    try {
      const prev = JSON.parse(window.localStorage.getItem("ab_orders") ?? "[]");
      window.localStorage.setItem("ab_orders", JSON.stringify([order, ...prev]));
    } catch {
      /* ignore */
    }
    clear();
    setPlaced(id);
  };

  if (placed) {
    return (
      <>
        <PageHero eyebrow="Confirmed" title="Order placed!" />
        <section className="mx-auto max-w-xl px-5 py-14 text-center">
          <div className="rounded-3xl border border-border bg-card p-10">
            <p className="text-sm text-muted-foreground">Your order number is</p>
            <p className="mt-2 font-display text-3xl font-bold text-primary">{placed}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              We'll call {form.phone} to confirm. Typical prep time is 25–35 minutes.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                to="/orders"
                className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
              >
                View my orders
              </Link>
              <Link to="/menu" className="rounded-full border border-border px-6 py-3 text-sm font-bold">
                Order something else
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (ready && lines.length === 0) {
    return (
      <>
        <PageHero eyebrow="Checkout" title="Nothing to check out yet" />
        <section className="mx-auto max-w-xl px-5 py-14 text-center">
          <div className="rounded-3xl border border-border bg-card p-12">
            <p className="text-sm text-muted-foreground">
              Your cart is empty. Pick a few dishes and come back.
            </p>
            <button
              onClick={() => navigate({ to: "/menu" })}
              className="mt-6 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground"
            >
              Browse the menu
            </button>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero eyebrow="Last step" title="Checkout" subtitle="Confirm your details and we'll start cooking." />

      <section className="mx-auto max-w-[1200px] px-5 py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-7">
            <h2 className="font-display text-xl font-bold">Delivery details</h2>

            <div className="mt-5 inline-flex rounded-full border border-border p-1">
              {(["delivery", "takeaway"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, mode: m }))}
                  className={`rounded-full px-5 py-2 text-sm font-semibold capitalize ${
                    form.mode === m ? "bg-ink text-ink-foreground" : "text-muted-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Full name">
                <input required value={form.name} onChange={set("name")} className="input" />
              </Field>
              <Field label="Phone">
                <input
                  required
                  value={form.phone}
                  onChange={set("phone")}
                  className="input"
                  placeholder="10-digit number"
                />
              </Field>
            </div>

            {form.mode === "delivery" && (
              <div className="mt-4 grid gap-4">
                <Field label="Delivery address">
                  <textarea
                    rows={3}
                    value={form.address}
                    onChange={set("address")}
                    className="input"
                    placeholder="House / flat, street, sector"
                  />
                </Field>
                <Field label="Landmark (optional)">
                  <input value={form.landmark} onChange={set("landmark")} className="input" />
                </Field>
              </div>
            )}

            <Field label="Cooking instructions (optional)">
              <textarea rows={2} value={form.notes} onChange={set("notes")} className="input" />
            </Field>

            <h2 className="mt-8 font-display text-xl font-bold">Payment</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { id: "cod", t: "Cash on delivery", d: "Pay when it arrives" },
                { id: "upi", t: "UPI on delivery", d: "Scan and pay at the door" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, payment: p.id as "cod" | "upi" }))}
                  className={`rounded-2xl border p-4 text-left ${
                    form.payment === p.id ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <p className="text-sm font-bold">{p.t}</p>
                  <p className="text-xs text-muted-foreground">{p.d}</p>
                </button>
              ))}
            </div>

            {error && (
              <p className="mt-5 rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive">
                {error}
              </p>
            )}

            <button className="mt-7 w-full rounded-full bg-primary px-6 py-4 text-sm font-bold text-primary-foreground">
              Place order • {rupees(total)}
            </button>
          </form>

          <aside className="h-fit rounded-3xl border border-border bg-card p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-bold">Order summary</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {lines.map((l) => (
                <li key={l.key} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {l.name} <span className="text-xs">({l.portion}) × {l.qty}</span>
                  </span>
                  <span className="shrink-0 font-semibold">{rupees(l.price * l.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Item total</dt>
                <dd className="font-semibold">{rupees(subtotal)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Discount ({bestOffer?.label})</dt>
                  <dd className="font-semibold text-veg">− {rupees(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd className="font-semibold">{delivery === 0 ? "FREE" : rupees(delivery)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-bold">
                <dt>To pay</dt>
                <dd className="text-primary">{rupees(total)}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-4 block first:mt-0">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
