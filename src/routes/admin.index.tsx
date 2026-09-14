import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CATEGORIES as FALLBACK_CATEGORIES, MENU_ITEMS as FALLBACK_ITEMS } from "@/data/menu";
import { useLiveMenu } from "@/lib/menu-db";
import { supabase } from "@/integrations/supabase/client";
import { BULK_ORDERS, OFFERS } from "@/data/site";
import { rupees } from "@/lib/shop";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { categories: liveCategories, items: liveItems, loading, reload } = useLiveMenu();
  const CATEGORIES = liveCategories.length > 0 ? liveCategories : FALLBACK_CATEGORIES;
  const MENU_ITEMS = liveItems ?? FALLBACK_ITEMS;
  const [category, setCategory] = useState(CATEGORIES[0]?.id ?? "thali");
  const [msg, setMsg] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (CATEGORIES.length > 0 && !CATEGORIES.some((c) => c.id === category)) {
      setCategory(CATEGORIES[0].id);
    }
  }, [CATEGORIES, category]);

  const toggleAvailability = async (id: string, current: boolean) => {
    setBusyId(id);
    setMsg("");
    const { error } = await supabase.from("menu_items").update({ available: !current }).eq("id", id);
    if (error) {
      setMsg(error.message);
    } else {
      await reload();
    }
    setBusyId(null);
  };

  const available = MENU_ITEMS.filter((i) => i.available).length;
  const pipeline = BULK_ORDERS.reduce((s, b) => s + (b.quoted ?? 0), 0);
  const items = MENU_ITEMS.filter((i) => i.categoryId === category);

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-10">
      <h1 className="font-display text-3xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Menu availability, live offers and bulk enquiries at a glance.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { k: `${available}/${MENU_ITEMS.length}`, v: "Dishes available" },
          { k: `${CATEGORIES.length}`, v: "Categories" },
          { k: `${OFFERS.length}`, v: "Active offers" },
          { k: rupees(pipeline), v: "Bulk pipeline" },
        ].map((s) => (
          <div key={s.v} className="rounded-3xl border border-border bg-card p-6">
            <p className="font-display text-3xl font-bold text-primary">{s.k}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{s.v}</p>
          </div>
        ))}
      </div>

      <section className="mt-10 rounded-3xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold">Food menu manager</h2>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/menu"
              className="rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
            >
              Open full menu editor
            </Link>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold"
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {msg && (
          <p className="mt-4 rounded-xl bg-muted p-3 text-sm font-semibold text-foreground">{msg}</p>
        )}
        {loading && liveItems === null ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading live menu…</p>
        ) : (
          <ul className="mt-6 divide-y divide-border">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-4 py-3">
                <img src={i.image} alt="" className="size-12 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{i.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {rupees(i.price)} • {i.rating}★{i.bestSeller ? " • Bestseller" : ""}
                  </p>
                </div>
                <button
                  disabled={busyId === i.id}
                  onClick={() => void toggleAvailability(i.id, i.available)}
                  className={`rounded-full px-4 py-2 text-xs font-bold disabled:opacity-60 ${
                    i.available ? "bg-veg-soft text-veg" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {busyId === i.id ? "Saving…" : i.available ? "Available" : "Unavailable"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 rounded-3xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold">Recent bulk enquiries</h2>
          <Link to="/admin/patner" className="text-sm font-semibold text-primary">
            Manage partners →
          </Link>
        </div>
        <ul className="mt-5 space-y-3">
          {BULK_ORDERS.map((b) => (
            <li
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-muted p-4"
            >
              <div>
                <p className="text-sm font-bold">{b.customer}</p>
                <p className="text-xs text-muted-foreground">
                  {b.items} • {b.qty} items • delivery {b.delivery}
                </p>
              </div>
              <span className="text-sm font-bold text-primary">
                {b.quoted ? rupees(b.quoted) : "Not quoted"}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
