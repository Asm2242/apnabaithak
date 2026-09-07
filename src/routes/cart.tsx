import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { MENU_ITEMS } from "@/data/menu";
import { FREE_DELIVERY_AT } from "@/data/site";
import { FoodCard } from "@/components/FoodCard";
import { PageHero } from "@/components/PageHero";
import { rupees, useShop } from "@/lib/shop";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart | Apna Baithak" },
      {
        name: "description",
        content: "Review your pure veg order, apply offers and head to checkout at Apna Baithak.",
      },
      { property: "og:title", content: "Your Cart — Apna Baithak" },
      { property: "og:description", content: "Review your order before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, setQty, remove, clear, subtotal, discount, delivery, total, bestOffer, ready } =
    useShop();
  const trending = MENU_ITEMS.filter((i) => i.bestSeller).slice(0, 4);

  return (
    <>
      <PageHero
        eyebrow="Almost there"
        title="Your Cart"
        subtitle="Check the items, adjust quantities, and we'll apply the best offer automatically."
      />

      <section className="mx-auto max-w-[1400px] px-5 py-12">
        {!ready ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Loading your cart…</p>
        ) : lines.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-14 text-center">
            <ShoppingBag className="mx-auto size-12 text-muted-foreground" />
            <h2 className="mt-5 font-display text-2xl font-bold">Your cart is empty</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Add a thali, some chaap or a combo and it'll show up here.
            </p>
            <Link
              to="/menu"
              className="mt-6 inline-block rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground"
            >
              Browse the menu
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {lines.map((l) => (
                <div
                  key={l.key}
                  className="flex gap-4 rounded-3xl border border-border bg-card p-4"
                >
                  <img
                    src={l.image}
                    alt={l.name}
                    className="size-24 shrink-0 rounded-2xl object-cover"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-display text-base font-bold">{l.name}</h2>
                        <p className="text-xs text-muted-foreground">
                          {l.portion} • {rupees(l.price)} each
                        </p>
                      </div>
                      <button
                        onClick={() => remove(l.key)}
                        aria-label={`Remove ${l.name}`}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center gap-3 rounded-full border border-border px-2 py-1">
                        <button
                          onClick={() => setQty(l.key, l.qty - 1)}
                          aria-label="Decrease quantity"
                          className="grid size-7 place-items-center rounded-full hover:bg-muted"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold">{l.qty}</span>
                        <button
                          onClick={() => setQty(l.key, l.qty + 1)}
                          aria-label="Increase quantity"
                          className="grid size-7 place-items-center rounded-full hover:bg-muted"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="font-display text-lg font-bold text-primary">
                        {rupees(l.price * l.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={clear}
                className="text-sm font-semibold text-muted-foreground underline"
              >
                Clear cart
              </button>
            </div>

            <aside className="h-fit rounded-3xl border border-border bg-card p-6 lg:sticky lg:top-24">
              <h2 className="font-display text-xl font-bold">Bill summary</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <Row label="Item total" value={rupees(subtotal)} />
                {discount > 0 && (
                  <Row label={`Discount (${bestOffer?.label})`} value={`− ${rupees(discount)}`} good />
                )}
                <Row
                  label="Delivery"
                  value={delivery === 0 ? "FREE" : rupees(delivery)}
                  good={delivery === 0}
                />
                {subtotal > 0 && subtotal < FREE_DELIVERY_AT && (
                  <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
                    Add {rupees(FREE_DELIVERY_AT - subtotal)} more for free delivery.
                  </p>
                )}
                <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-bold">
                  <dt>To pay</dt>
                  <dd className="text-primary">{rupees(total)}</dd>
                </div>
              </dl>
              <Link
                to="/checkout"
                className="mt-6 block rounded-full bg-primary px-6 py-3.5 text-center text-sm font-bold text-primary-foreground"
              >
                Proceed to checkout
              </Link>
              <Link
                to="/menu"
                className="mt-3 block rounded-full border border-border px-6 py-3.5 text-center text-sm font-bold"
              >
                Add more items
              </Link>
            </aside>
          </div>
        )}

        <div className="mt-16">
          <h2 className="font-display text-2xl font-bold">Trending right now</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trending.map((i) => (
              <FoodCard key={i.id} item={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Row({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={good ? "font-semibold text-veg" : "font-semibold"}>{value}</dd>
    </div>
  );
}
