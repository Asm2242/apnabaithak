import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { rupees, useShop, type CartLine } from "@/lib/shop";

type LocalOrder = {
  id: string;
  placedAt: string;
  items: CartLine[];
  total: number;
  mode: string;
  payment: string;
};

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders | Apna Baithak" },
      {
        name: "description",
        content: "Track your Apna Baithak orders and reorder your favourite pure veg meals.",
      },
      { property: "og:title", content: "My Orders — Apna Baithak" },
      { property: "og:description", content: "Your order history." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const { customer } = useShop();
  const [orders, setOrders] = useState<LocalOrder[] | null>(null);

  useEffect(() => {
    try {
      setOrders(JSON.parse(window.localStorage.getItem("ab_orders") ?? "[]"));
    } catch {
      setOrders([]);
    }
  }, []);

  return (
    <>
      <PageHero eyebrow="Order history" title="My Orders" />
      <section className="mx-auto max-w-3xl px-5 py-14">
        {orders === null ? (
          <p className="text-center text-sm text-muted-foreground">Loading…</p>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-14 text-center">
            <ShoppingBag className="mx-auto size-12 text-muted-foreground" />
            <h2 className="mt-5 font-display text-2xl font-bold">No orders yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {customer
                ? "Your next order will show up here."
                : "Place an order or log in to see your history."}
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
            {orders.map((o) => (
              <li key={o.id} className="rounded-3xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-bold">Order {o.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.placedAt).toLocaleString("en-IN")} • {o.mode} • {o.payment}
                    </p>
                  </div>
                  <span className="rounded-full bg-veg-soft px-3 py-1 text-xs font-bold text-veg">
                    Placed
                  </span>
                </div>
                <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                  {o.items.map((l) => (
                    <li key={l.key} className="flex justify-between">
                      <span>
                        {l.name} ({l.portion}) × {l.qty}
                      </span>
                      <span>{rupees(l.price * l.qty)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-border pt-3 text-right font-display text-lg font-bold text-primary">
                  {rupees(o.total)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
