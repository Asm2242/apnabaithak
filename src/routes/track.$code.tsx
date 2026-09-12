import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { PageHero } from "@/components/PageHero";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { rupees } from "@/lib/shop";
import { ORDER_STATUSES, STATUS_LABEL, STATUS_TONE, isOrderStatus } from "@/lib/order-status";

type Order = {
  id: string;
  order_code: string;
  status: string;
  payment_status: string;
  payment_method: string;
  mode: string;
  address: string;
  total: number;
  created_at: string;
  delivery_partner_id: string | null;
};
type Item = { id: string; name: string; portion: string; qty: number; price: number };
type History = { id: string; status: string; note: string; changed_by_name: string; created_at: string };
type Loc = { lat: number; lng: number; updated_at: string };

export const Route = createFileRoute("/track/$code")({
  head: () => ({
    meta: [
      { title: "Track your order | Apna Baithak" },
      {
        name: "description",
        content:
          "Live status of your Apna Baithak order with kitchen updates and delivery partner location.",
      },
      { property: "og:title", content: "Track your order — Apna Baithak" },
      { property: "og:description", content: "Live order status and delivery location." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrackPage,
});

const FLOW = ORDER_STATUSES.filter((s) => s !== "cancelled");

function TrackPage() {
  const { code } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null | "missing">(null);
  const [items, setItems] = useState<Item[]>([]);
  const [log, setLog] = useState<History[]>([]);
  const [loc, setLoc] = useState<Loc | null>(null);

  const load = useCallback(async () => {
    const { data: o } = await supabase
      .from("orders")
      .select(
        "id,order_code,status,payment_status,payment_method,mode,address,total,created_at,delivery_partner_id",
      )
      .eq("order_code", code)
      .maybeSingle();
    if (!o) {
      setOrder("missing");
      return;
    }
    setOrder(o as Order);
    const [{ data: it }, { data: h }, { data: l }] = await Promise.all([
      supabase.from("order_items").select("id,name,portion,qty,price").eq("order_id", o.id),
      supabase
        .from("order_status_history")
        .select("id,status,note,changed_by_name,created_at")
        .eq("order_id", o.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("delivery_locations")
        .select("lat,lng,updated_at")
        .eq("order_id", o.id)
        .maybeSingle(),
    ]);
    setItems((it ?? []) as Item[]);
    setLog((h ?? []) as History[]);
    setLoc((l ?? null) as Loc | null);
  }, [code]);

  useEffect(() => {
    if (authLoading) return;
    void load();
    const channel = supabase
      .channel(`track-${code}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => void load())
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_status_history" },
        () => void load(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "delivery_locations" },
        () => void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [authLoading, load, code]);

  if (authLoading || order === null) {
    return (
      <>
        <PageHero eyebrow="Live tracking" title={`Order ${code}`} />
        <p className="mx-auto max-w-2xl px-5 py-14 text-center text-sm text-muted-foreground">
          Loading your order…
        </p>
      </>
    );
  }

  if (order === "missing") {
    return (
      <>
        <PageHero eyebrow="Live tracking" title="Order not found" />
        <section className="mx-auto max-w-xl px-5 py-14 text-center">
          <div className="rounded-3xl border border-border bg-card p-12">
            <p className="text-sm text-muted-foreground">
              {user
                ? "We couldn't find this order on your account."
                : "Please log in with the account used to place the order."}
            </p>
            <Link
              to={user ? "/orders" : "/login"}
              className="mt-6 inline-block rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground"
            >
              {user ? "My orders" : "Login"}
            </Link>
          </div>
        </section>
      </>
    );
  }

  const status = isOrderStatus(order.status) ? order.status : "pending";
  const cancelled = status === "cancelled";
  const stepIndex = FLOW.indexOf(status as (typeof FLOW)[number]);

  return (
    <>
      <PageHero eyebrow="Live tracking" title={`Order ${order.order_code}`} />
      <section className="mx-auto max-w-3xl space-y-6 px-5 py-12">
        <div className="rounded-3xl border border-border bg-card p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className={`rounded-full px-4 py-1.5 text-sm font-bold ${STATUS_TONE[status]}`}>
              {STATUS_LABEL[status]}
            </span>
            <span className="text-sm text-muted-foreground">
              {order.payment_method.toUpperCase()} •{" "}
              {order.payment_status === "paid" ? "Paid" : "Payment pending"}
            </span>
          </div>

          {cancelled ? (
            <p className="mt-5 rounded-2xl bg-destructive/10 p-4 text-sm font-semibold text-destructive">
              This order was cancelled. If money was deducted, it will be refunded by your bank.
            </p>
          ) : (
            <ol className="mt-6 space-y-3">
              {FLOW.map((s, idx) => (
                <li key={s} className="flex items-center gap-3 text-sm">
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                      idx <= stepIndex
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className={idx <= stepIndex ? "font-semibold" : "text-muted-foreground"}>
                    {STATUS_LABEL[s]}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card p-7">
          <h2 className="font-display text-xl font-bold">Delivery partner</h2>
          {order.mode !== "delivery" ? (
            <p className="mt-2 text-sm text-muted-foreground">
              This is a takeaway order — collect it from the restaurant.
            </p>
          ) : !order.delivery_partner_id ? (
            <p className="mt-2 text-sm text-muted-foreground">
              A delivery partner will be assigned once your food is ready.
            </p>
          ) : loc ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Last location update {new Date(loc.updated_at).toLocaleTimeString("en-IN")}
              </p>
              <a
                href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
              >
                See partner on map
              </a>
              <iframe
                title="Delivery partner location"
                className="mt-4 h-64 w-full rounded-2xl border border-border"
                src={`https://maps.google.com/maps?q=${loc.lat},${loc.lng}&z=15&output=embed`}
              />
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Partner assigned. Live location will appear once they start the trip.
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card p-7">
          <h2 className="font-display text-xl font-bold">Order details</h2>
          <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
            {items.map((l) => (
              <li key={l.id} className="flex justify-between">
                <span>
                  {l.name} ({l.portion}) × {l.qty}
                </span>
                <span>{rupees(Number(l.price) * l.qty)}</span>
              </li>
            ))}
          </ul>
          {order.address && <p className="mt-4 text-xs text-muted-foreground">{order.address}</p>}
          <p className="mt-4 border-t border-border pt-3 text-right font-display text-lg font-bold text-primary">
            {rupees(Number(order.total))}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-7">
          <h2 className="font-display text-xl font-bold">Activity</h2>
          <ol className="mt-4 space-y-2 text-sm">
            {log.length === 0 && <li className="text-muted-foreground">No updates yet.</li>}
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
        </div>
      </section>
    </>
  );
}
