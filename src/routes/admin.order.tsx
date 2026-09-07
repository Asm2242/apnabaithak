import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { rupees, type CartLine } from "@/lib/shop";

type LocalOrder = {
  id: string;
  placedAt: string;
  items: CartLine[];
  total: number;
  name: string;
  phone: string;
  address: string;
  mode: string;
  payment: string;
};

const STATUSES = ["Placed", "Preparing", "Out for delivery", "Delivered", "Cancelled"] as const;

export const Route = createFileRoute("/admin/order")({
  component: AdminOrders,
});

function AdminOrders() {
  const [orders, setOrders] = useState<LocalOrder[] | null>(null);
  const [status, setStatus] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<string>("All");

  useEffect(() => {
    try {
      setOrders(JSON.parse(window.localStorage.getItem("ab_orders") ?? "[]"));
    } catch {
      setOrders([]);
    }
  }, []);

  const shown = (orders ?? []).filter(
    (o) => filter === "All" || (status[o.id] ?? "Placed") === filter,
  );

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-10">
      <h1 className="font-display text-3xl font-bold">Orders ({orders?.length ?? 0})</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Customer orders with items, totals and status. Connecting the database will make these
        permanent across devices.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {["All", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              filter === s ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {orders === null ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading…</p>
      ) : shown.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-border bg-card p-14 text-center">
          <p className="font-display text-xl font-bold">No orders here yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Orders placed through checkout will appear on this screen.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {shown.map((o) => (
            <li key={o.id} className="rounded-3xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg font-bold">{o.id}</p>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(o.placedAt).toLocaleString("en-IN")}
                  </p>
                  <p className="mt-2 text-sm">
                    {o.name} • {o.phone} • {o.mode} • {o.payment}
                  </p>
                  {o.address && (
                    <p className="mt-1 max-w-md text-xs text-muted-foreground">{o.address}</p>
                  )}
                </div>
                <select
                  value={status[o.id] ?? "Placed"}
                  onChange={(e) => setStatus((s) => ({ ...s, [o.id]: e.target.value }))}
                  className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold"
                >
                  {STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <ul className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm text-muted-foreground">
                {o.items.map((l) => (
                  <li key={l.key} className="flex justify-between">
                    <span>
                      {l.name} ({l.portion}) × {l.qty}
                    </span>
                    <span>{rupees(l.price * l.qty)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-right font-display text-lg font-bold text-primary">
                {rupees(o.total)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
