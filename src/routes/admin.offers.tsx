import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { OFFERS, type Offer } from "@/data/site";
import { rupees } from "@/lib/shop";

export const Route = createFileRoute("/admin/offers")({
  component: AdminOffers,
});

function AdminOffers() {
  const [offers, setOffers] = useState<Offer[]>(OFFERS);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [draft, setDraft] = useState({ label: "", desc: "", minOrder: "", value: "" });

  const addOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (draft.label.trim().length < 3) {
      setNotice({ kind: "err", text: "Offer label needs at least 3 characters." });
      return;
    }
    if (!Number(draft.minOrder) || Number(draft.minOrder) < 1) {
      setNotice({ kind: "err", text: "Minimum order must be a positive amount." });
      return;
    }
    setOffers((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        emoji: "🏷️",
        label: draft.label.trim(),
        desc: draft.desc.trim() || `Offer on orders above ₹${draft.minOrder}`,
        minOrder: Number(draft.minOrder),
        type: "flat",
        value: Number(draft.value) || 0,
        badge: "NEW",
        priority: prev.length + 1,
        tone: "orange",
      },
    ]);
    setDraft({ label: "", desc: "", minOrder: "", value: "" });
    setNotice({ kind: "ok", text: "Offer added." });
  };

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-10">
      <h1 className="font-display text-3xl font-bold">Offers</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {offers.length} offers configured. Changes here are local until the database is connected.
      </p>

      {notice && (
        <p
          className={`mt-5 rounded-2xl p-4 text-sm font-semibold ${
            notice.kind === "ok"
              ? "bg-veg-soft text-veg"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {notice.text}
        </p>
      )}

      <form onSubmit={addOffer} className="mt-6 rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold">Add an offer</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <input
            className="input"
            placeholder="Label e.g. ₹100 OFF"
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          />
          <input
            className="input"
            placeholder="Description"
            value={draft.desc}
            onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
          />
          <input
            className="input"
            type="number"
            placeholder="Min order ₹"
            value={draft.minOrder}
            onChange={(e) => setDraft({ ...draft, minOrder: e.target.value })}
          />
          <input
            className="input"
            type="number"
            placeholder="Discount ₹"
            value={draft.value}
            onChange={(e) => setDraft({ ...draft, value: e.target.value })}
          />
        </div>
        <button className="mt-4 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
          Add offer
        </button>
      </form>

      <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {offers.map((o) => (
          <li key={o.id} className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <span className="text-3xl">{o.emoji}</span>
              <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-bold">
                {o.badge}
              </span>
            </div>
            <p className="mt-4 font-display text-2xl font-bold text-primary">{o.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{o.desc}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Min order {rupees(o.minOrder)}
            </p>
            <button
              onClick={() => {
                setOffers((prev) => prev.filter((x) => x.id !== o.id));
                setNotice({ kind: "ok", text: `Deleted “${o.label}”.` });
              }}
              className="mt-4 rounded-full border border-border px-4 py-2 text-xs font-bold text-destructive"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
