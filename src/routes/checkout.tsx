import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero } from "@/components/PageHero";
import { rupees, useShop } from "@/lib/shop";
import { useAuth } from "@/lib/auth";
import {
  confirmOnlinePayment,
  placeOnlineOrder,
  placeOrder,
  type PlaceOrderInput,
} from "@/lib/orders.functions";

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

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load the payment window. Check your internet."));
    document.body.appendChild(s);
  });
}

function CheckoutPage() {
  const { lines, subtotal, discount, delivery, total, bestOffer, clear, ready } = useShop();
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [placed, setPlaced] = useState<string | null>(null);
  const [paidNote, setPaidNote] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
    address: "",
    landmark: "",
    mode: "delivery" as "delivery" | "takeaway",
    payment: "online" as "cod" | "upi" | "online",
    notes: "",
  });

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const buildInput = (): PlaceOrderInput | null => {
    if (!/^\d{10}$/.test(form.phone)) {
      setError("Enter a valid 10-digit phone number.");
      return null;
    }
    if (form.mode === "delivery" && form.address.trim().length < 10) {
      setError("Please give a full delivery address.");
      return null;
    }
    setError("");
    return {
      items: lines.map((l) => ({ item_id: l.id, portion: l.portion, qty: l.qty })),
      customer_name: form.name,
      phone: form.phone,
      address: form.address,
      landmark: form.landmark,
      notes: form.notes,
      mode: form.mode,
      payment_method: form.payment === "online" ? "razorpay" : form.payment,
    };
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    const input = buildInput();
    if (!input || busy) return;
    setBusy(true);
    try {
      if (form.payment === "online") {
        const created = await placeOnlineOrder({ data: input });
        await loadRazorpayScript();
        if (!window.Razorpay) throw new Error("Payment window could not open. Try again.");

        const result = await new Promise<{ ok: boolean; error?: string }>((resolve) => {
          const rzp = new window.Razorpay!({
            key: created.razorpay_key_id,
            amount: Math.round(created.total * 100),
            currency: "INR",
            name: "Apna Baithak",
            description: `Order ${created.order_code}`,
            order_id: created.razorpay_order_id,
            prefill: { name: form.name, contact: form.phone, email: user.email ?? "" },
            theme: { color: "#c2410c" },
            modal: { ondismiss: () => resolve({ ok: false, error: "Payment was cancelled." }) },
            handler: (resp: {
              razorpay_payment_id: string;
              razorpay_signature: string;
            }) => {
              confirmOnlinePayment({
                data: {
                  order_id: created.id,
                  razorpay_payment_id: resp.razorpay_payment_id,
                  razorpay_signature: resp.razorpay_signature,
                },
              })
                .then(() => resolve({ ok: true }))
                .catch((err: Error) => resolve({ ok: false, error: err.message }));
            },
          });
          rzp.open();
        });

        if (!result.ok) {
          setError(result.error ?? "Payment failed. Your order is saved — you can pay on delivery.");
          setBusy(false);
          return;
        }
        setPaidNote(true);
        clear();
        setPlaced(created.order_code);
      } else {
        const created = await placeOrder({ data: input });
        clear();
        setPlaced(created.order_code);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
    setBusy(false);
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
              {paidNote
                ? "Payment received. We'll start cooking right away."
                : `We'll call ${form.phone} to confirm. Typical prep time is 25–35 minutes.`}
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
        {!authLoading && !user && (
          <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm font-semibold">
            Please <Link to="/login" className="text-primary underline">log in</Link> or{" "}
            <Link to="/signup" className="text-primary underline">create an account</Link> to place
            your order — it takes 30 seconds.
          </div>
        )}
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
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { id: "online", t: "Pay online", d: "UPI, card, netbanking — pay now" },
                { id: "cod", t: "Cash on delivery", d: "Pay when it arrives" },
                { id: "upi", t: "UPI on delivery", d: "Scan and pay at the door" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, payment: p.id as "cod" | "upi" | "online" }))}
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

            <button
              disabled={busy || authLoading}
              className="mt-7 w-full rounded-full bg-primary px-6 py-4 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {busy
                ? "Processing…"
                : form.payment === "online"
                  ? `Pay ${rupees(total)} securely`
                  : `Place order • ${rupees(total)}`}
            </button>
            {form.payment === "online" && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Secure payment by Razorpay. Your card details never touch our servers.
              </p>
            )}
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
