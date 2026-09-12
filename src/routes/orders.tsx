import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { rupees } from "@/lib/shop";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_LABEL, STATUS_TONE, isOrderStatus } from "@/lib/order-status";

type Order = {
  id: string;
  order_code: string;
  status: string;
  payment_method: string;
  payment_status: string;
  mode: string;
  total: number;
  created_at: string;
};
type Item = { id: string; order_id: string; name: string; portion: string; qty: number; price: number };

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders | Apna Baithak" },
      {
        name: "description",
        content: "Track your Apna Baithak orders and reorder your favourite pure veg meals.",
      },
      { property: "og:title", content: "My Orders — Apna Baithak" },
      { property: "og:description", content: "Your live order history and tracking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const load = useCallback(async () => {
    if (!user) {
      setOrders([]);
      return;
    }
    const { data: o } = await supabase
      .from("orders")
      .select("id,order_code,status,payment_method,payment_status,mode,total,created_at")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });
    const list = (o ?? []) as Order[];
    setOrders(list);
    if (list.length) {
      const { data: it } = await supabase
        .from("order_items")
        .select("id,order_id,name,portion,qty,price")
        .in(
          "order_id",
          list.map((x) => x.id),
        );
      setItems((it ?? []) as Item[]);
    } else {
      setItems([]);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void load();
    if (!user) return;
    const channel = supabase
      .channel("my-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => void load())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [authLoading, user, load]);

  return (
    <>
      <PageHero eyebrow="Order history" title="My Orders" />
      <section className="mx-auto max-w-3xl px-5 py-14">
        {authLoading || orders === null ? (
          <p className="text-center text-sm text-muted-foreground">Loading…</p>
        ) : !user ? (
          <div className="rounded-3xl border border-border bg-card p-14 text-center">
            <h2 className="font-display text-2xl font-bold">Log in to see your orders</h2>
            <Link
              to="/login"
              className="mt-6 inline-block rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground"
            >
              Login
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-14 text-center">
            <ShoppingBag className="mx-auto size-12 text-muted-foreground" />
            <h2 className="mt-5 font-display text-2xl font-bold">No orders yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your next order will show up here.
            </p>
            <Link
              to="/menu"
              className="mt-6 inline-block rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground"
            >
              Start ordering
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => {
              const status = isOrderStatus(o.status) ? o.status : "pending";
              const lines = items.filter((i) => i.order_id === o.id);
              return (
                <li key={o.id} className="rounded-3xl border border-border bg-card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-bold">Order {o.order_code}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(o.created_at).toLocaleString("en-IN")} • {o.mode} •{" "}
                        {o.payment_method.toUpperCase()} —{" "}
                        {o.payment_status === "paid" ? "Paid" : "Payment pending"}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_TONE[status]}`}>
                      {STATUS_LABEL[status]}
                    </span>
                  </div>
                  <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                    {lines.map((l) => (
                      <li key={l.id} className="flex justify-between">
                        <span>
                          {l.name} ({l.portion}) × {l.qty}
                        </span>
                        <span>{rupees(Number(l.price) * l.qty)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                    <Link
                      to="/track/$code"
                      params={{ code: o.order_code }}
                      className="rounded-full border border-border px-5 py-2 text-sm font-bold"
                    >
                      Track order
                    </Link>
                    <p className="font-display text-lg font-bold text-primary">
                      {rupees(Number(o.total))}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
