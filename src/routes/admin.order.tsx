import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { rupees } from "@/lib/shop";
import {
  NEXT_STATUS,
  ORDER_STATUSES,
  STATUS_LABEL,
  STATUS_TONE,
  isOrderStatus,
  type OrderStatus,
} from "@/lib/order-status";

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  address: string;
  mode: string;
  payment_method: string;
  status: string;
  total: number;
  created_at: string;
  delivery_partner_id: string | null;
};

type Item = { id: string; order_id: string; name: string; portion: string; qty: number; price: number };
type History = {
  id: string;
  order_id: string;
  status: string;
  changed_by_name: string;
  note: string;
  created_at: string;
};
type Partner = { id: string; full_name: string; phone: string | null };

export const Route = createFileRoute("/admin/order")({
  head: () => ({
    meta: [
      { title: "Orders | Apna Baithak Admin" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Live order queue with status workflow and history." },
      { property: "og:title", content: "Orders — Apna Baithak Admin" },
      { property: "og:description", content: "Live order queue." },
    ],
  }),
  component: AdminOrders,
});

function AdminOrders() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [history, setHistory] = useState<History[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const [{ data: o }, { data: it }, { data: h }, { data: roles }] = await Promise.all([
      supabase
        .from("orders")
        .select(
          "id,order_code,customer_name,phone,address,mode,payment_method,status,total,created_at,delivery_partner_id",
        )
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("order_items").select("id,order_id,name,portion,qty,price"),
      supabase
        .from("order_status_history")
        .select("id,order_id,status,changed_by_name,note,created_at")
        .order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id").eq("role", "delivery"),
    ]);
    setOrders((o ?? []) as Order[]);
    setItems((it ?? []) as Item[]);
    setHistory((h ?? []) as History[]);
    const ids = (roles ?? []).map((r) => r.user_id);
    if (ids.length) {
      const { data: p } = await supabase.from("profiles").select("id,full_name,phone").in("id", ids);
      setPartners((p ?? []) as Partner[]);
    } else {
      setPartners([]);
    }
  }, []);

  useEffect(() => {
    void load();
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => void load())
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_status_history" },
        () => void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load]);

  const changeStatus = async (order: Order, next: OrderStatus) => {
    setMsg("");
    const patch: Record<string, unknown> = { status: next, updated_at: new Date().toISOString() };
    if (next === "delivered") patch['delivered_at'] = new Date().toISOString();
    const { error } = await supabase.from("orders").update(patch).eq("id", order.id);
    if (error) {
      setMsg(error.message);
      return;
    }
    await supabase.from("order_status_history").insert({
      order_id: order.id,
      status: next,
      changed_by: user?.id ?? null,
      changed_by_name: profile?.full_name || user?.email || "Admin",
      note: "Status updated from admin panel",
    });
    await load();
  };

  const assign = async (order: Order, partnerId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ delivery_partner_id: partnerId || null })
      .eq("id", order.id);
    if (error) {
      setMsg(error.message);
      return;
    }
    const partner = partners.find((p) => p.id === partnerId);
    await supabase.from("order_status_history").insert({
      order_id: order.id,
      status: order.status,
      changed_by: user?.id ?? null,
      changed_by_name: profile?.full_name || "Admin",
      note: partner ? `Assigned to ${partner.full_name}` : "Delivery partner removed",
    });
    await load();
  };

  const shown = useMemo(
    () => (orders ?? []).filter((o) => filter === "all" || o.status === filter),
    [orders, filter],
  );

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-10">
      <h1 className="font-display text-3xl font-bold">Orders ({orders?.length ?? 0})</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Live from the database. New orders and status changes appear here instantly.
      </p>

      {msg && (
        <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm font-semibold text-destructive">
          {msg}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {(["all", ...ORDER_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s as "all" | OrderStatus)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              filter === s ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card"
            }`}
          >
            {s === "all" ? "All" : STATUS_LABEL[s as OrderStatus]}
          </button>
        ))}
      </div>

      {orders === null ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading orders…</p>
      ) : shown.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-border bg-card p-14 text-center">
          <p className="font-display text-xl font-bold">No orders here yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Orders placed at checkout will appear on this screen.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {shown.map((o) => {
            const status = isOrderStatus(o.status) ? o.status : "pending";
            const lines = items.filter((i) => i.order_id === o.id);
            const log = history.filter((h) => h.order_id === o.id);
            return (
              <li key={o.id} className="rounded-3xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-bold">{o.order_code}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString("en-IN")}
                    </p>
                    <p className="mt-2 text-sm">
                      {o.customer_name} • {o.phone} • {o.mode} • {o.payment_method.toUpperCase()}
                    </p>
                    {o.address && (
                      <p className="mt-1 max-w-md text-xs text-muted-foreground">{o.address}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_TONE[status]}`}>
                      {STATUS_LABEL[status]}
                    </span>
                    <p className="mt-2 font-display text-xl font-bold text-primary">
                      {rupees(Number(o.total))}
                    </p>
                  </div>
                </div>

                <ul className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm text-muted-foreground">
                  {lines.map((l) => (
                    <li key={l.id} className="flex justify-between">
                      <span>
                        {l.name} ({l.portion}) × {l.qty}
                      </span>
                      <span>{rupees(Number(l.price) * l.qty)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {NEXT_STATUS[status].map((next) => (
                    <button
                      key={next}
                      onClick={() => void changeStatus(o, next)}
                      className={`rounded-full px-4 py-2 text-xs font-bold ${
                        next === "cancelled"
                          ? "border border-border text-destructive"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      Mark {STATUS_LABEL[next]}
                    </button>
                  ))}
                  {NEXT_STATUS[status].length === 0 && (
                    <span className="text-xs text-muted-foreground">Workflow finished.</span>
                  )}

                  <select
                    value={o.delivery_partner_id ?? ""}
                    onChange={(e) => void assign(o, e.target.value)}
                    className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold"
                  >
                    <option value="">No delivery partner</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.full_name || p.phone || p.id.slice(0, 8)}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setOpen(open === o.id ? null : o.id)}
                    className="rounded-full border border-border px-4 py-2 text-xs font-bold"
                  >
                    {open === o.id ? "Hide history" : `History (${log.length})`}
                  </button>
                </div>

                {open === o.id && (
                  <ol className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                    {log.length === 0 && (
                      <li className="text-muted-foreground">No changes recorded yet.</li>
                    )}
                    {log.map((h) => (
                      <li key={h.id} className="flex flex-wrap justify-between gap-2">
                        <span className="font-semibold">
                          {isOrderStatus(h.status) ? STATUS_LABEL[h.status] : h.status}
                          {h.note ? ` — ${h.note}` : ""}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {h.changed_by_name || "System"} •{" "}
                          {new Date(h.created_at).toLocaleString("en-IN")}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
