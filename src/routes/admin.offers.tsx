import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { rupees } from "@/lib/shop";

type Offer = {
  id: string;
  code: string | null;
  emoji: string;
  label: string;
  description: string;
  min_order: number;
  discount_type: string;
  value: number;
  badge: string;
  priority: number;
  active: boolean;
};

export const Route = createFileRoute("/admin/offers")({
  head: () => ({
    meta: [
      { title: "Offers | Apna Baithak Admin" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Create, edit and remove customer offers." },
      { property: "og:title", content: "Offers — Apna Baithak Admin" },
      { property: "og:description", content: "Manage discounts and offers." },
    ],
  }),
  component: AdminOffers,
});

const blank = {
  emoji: "🏷️",
  label: "",
  description: "",
  min_order: "",
  discount_type: "flat",
  value: "",
  badge: "OFFER",
  priority: "1",
};

function AdminOffers() {
  const [offers, setOffers] = useState<Offer[] | null>(null);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [draft, setDraft] = useState(blank);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("offers")
      .select("id,code,emoji,label,description,min_order,discount_type,value,badge,priority,active")
      .order("priority", { ascending: false });
    setOffers((data ?? []) as Offer[]);
  }, []);

  useEffect(() => {
    void load();
    const channel = supabase
      .channel("admin-offers")
      .on("postgres_changes", { event: "*", schema: "public", table: "offers" }, () => void load())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (draft.label.trim().length < 3) {
      setNotice({ kind: "err", text: "Offer label needs at least 3 characters." });
      return;
    }
    if (!Number(draft.min_order) || Number(draft.min_order) < 1) {
      setNotice({ kind: "err", text: "Minimum order must be a positive amount." });
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("offers").insert({
      emoji: draft.emoji || "🏷️",
      label: draft.label.trim(),
      description: draft.description.trim() || `Offer on orders above ₹${draft.min_order}`,
      min_order: Number(draft.min_order),
      discount_type: draft.discount_type,
      value: Number(draft.value) || 0,
      badge: draft.badge || "OFFER",
      priority: Number(draft.priority) || 1,
      active: true,
    });
    setBusy(false);
    if (error) {
      setNotice({ kind: "err", text: error.message });
      return;
    }
    setDraft(blank);
    setNotice({ kind: "ok", text: "Offer added." });
    await load();
  };

  const saveEdit = async () => {
    if (!editing) return;
    setBusy(true);
    const { error } = await supabase
      .from("offers")
      .update({
        label: editing.label,
        description: editing.description,
        emoji: editing.emoji,
        badge: editing.badge,
        min_order: Number(editing.min_order) || 0,
        discount_type: editing.discount_type,
        value: Number(editing.value) || 0,
        priority: Number(editing.priority) || 1,
        active: editing.active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editing.id);
    setBusy(false);
    setNotice(
      error ? { kind: "err", text: error.message } : { kind: "ok", text: "Offer updated." },
    );
    if (!error) setEditing(null);
    await load();
  };

  const remove = async (o: Offer) => {
    if (!window.confirm(`Delete “${o.label}”?`)) return;
    const { error } = await supabase.from("offers").delete().eq("id", o.id);
    setNotice(error ? { kind: "err", text: error.message } : { kind: "ok", text: "Offer deleted." });
    await load();
  };

  const toggle = async (o: Offer) => {
    const { error } = await supabase.from("offers").update({ active: !o.active }).eq("id", o.id);
    if (error) setNotice({ kind: "err", text: error.message });
    await load();
  };

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-10">
      <h1 className="font-display text-3xl font-bold">Offers</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {offers?.length ?? 0} offers saved in the database. Changes go live immediately.
      </p>

      {notice && (
        <p
          className={`mt-5 rounded-2xl p-4 text-sm font-semibold ${
            notice.kind === "ok" ? "bg-veg-soft text-veg" : "bg-destructive/10 text-destructive"
          }`}
        >
          {notice.text}
        </p>
      )}

      <form onSubmit={add} className="mt-6 rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold">Add an offer</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <input
            className="input"
            placeholder="Label e.g. ₹100 OFF"
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          />
          <input
            className="input"
            placeholder="Description"
            value={draft.description}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
          <input
            className="input"
            type="number"
            placeholder="Min order ₹"
            value={draft.min_order}
            onChange={(e) => setDraft({ ...draft, min_order: e.target.value })}
          />
          <select
            className="input"
            value={draft.discount_type}
            onChange={(e) => setDraft({ ...draft, discount_type: e.target.value })}
          >
            <option value="flat">Flat ₹</option>
            <option value="percent">Percent %</option>
          </select>
          <input
            className="input"
            type="number"
            placeholder="Discount"
            value={draft.value}
            onChange={(e) => setDraft({ ...draft, value: e.target.value })}
          />
          <input
            className="input"
            type="number"
            placeholder="Priority"
            value={draft.priority}
            onChange={(e) => setDraft({ ...draft, priority: e.target.value })}
          />
        </div>
        <button
          disabled={busy}
          className="mt-4 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          Add offer
        </button>
      </form>

      {offers === null ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading offers…</p>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((o) => (
            <li key={o.id} className="rounded-3xl border border-border bg-card p-6">
              <div className="flex items-start justify-between">
                <span className="text-3xl">{o.emoji}</span>
                <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-bold">{o.badge}</span>
              </div>
              <p className="mt-4 font-display text-2xl font-bold text-primary">{o.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{o.description}</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Min order {rupees(Number(o.min_order))} • {o.discount_type === "percent" ? `${o.value}%` : rupees(Number(o.value))} off
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setEditing(o)}
                  className="rounded-full border border-border px-4 py-2 text-xs font-bold"
                >
                  Edit
                </button>
                <button
                  onClick={() => void toggle(o)}
                  className={`rounded-full px-4 py-2 text-xs font-bold ${
                    o.active ? "bg-veg-soft text-veg" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {o.active ? "Active" : "Paused"}
                </button>
                <button
                  onClick={() => void remove(o)}
                  className="rounded-full border border-border px-4 py-2 text-xs font-bold text-destructive"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-2xl font-bold">Edit offer</h2>
            <label className="mt-4 block">
              <span className="label">Label</span>
              <input
                className="input"
                value={editing.label}
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
              />
            </label>
            <label className="mt-4 block">
              <span className="label">Description</span>
              <textarea
                rows={2}
                className="input"
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </label>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <label className="block">
                <span className="label">Min ₹</span>
                <input
                  type="number"
                  className="input"
                  value={editing.min_order}
                  onChange={(e) => setEditing({ ...editing, min_order: Number(e.target.value) })}
                />
              </label>
              <label className="block">
                <span className="label">Type</span>
                <select
                  className="input"
                  value={editing.discount_type}
                  onChange={(e) => setEditing({ ...editing, discount_type: e.target.value })}
                >
                  <option value="flat">Flat</option>
                  <option value="percent">Percent</option>
                </select>
              </label>
              <label className="block">
                <span className="label">Value</span>
                <input
                  type="number"
                  className="input"
                  value={editing.value}
                  onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) })}
                />
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                disabled={busy}
                onClick={() => void saveEdit()}
                className="flex-1 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
              >
                {busy ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="rounded-full border border-border px-6 py-3 text-sm font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
