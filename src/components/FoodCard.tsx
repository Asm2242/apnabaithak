import { Heart, Star } from "lucide-react";
import { useState } from "react";
import type { MenuItem } from "@/data/menu";
import { priceFor, rupees, useShop } from "@/lib/shop";

export function VegDot({ className = "" }: { className?: string }) {
  return (
    <span
      aria-label="Pure vegetarian"
      className={`grid size-4 place-items-center rounded-[3px] border-2 border-veg ${className}`}
    >
      <span className="size-1.5 rounded-full bg-veg" />
    </span>
  );
}

export function FoodCard({ item }: { item: MenuItem }) {
  const { add, wishlist, toggleWish } = useShop();
  const hasPortions = item.half != null && item.full != null;
  const [portion, setPortion] = useState<"Half" | "Full" | "Regular">(
    hasPortions ? "Half" : "Regular",
  );
  const [added, setAdded] = useState(false);
  const wished = wishlist.includes(item.id);

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-shadow hover:shadow-xl">
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-card/95 p-1.5">
            <VegDot />
          </span>
          {item.bestSeller && (
            <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
              Bestseller
            </span>
          )}
        </div>
        <button
          onClick={() => toggleWish(item.id)}
          aria-label={wished ? `Remove ${item.name} from wishlist` : `Save ${item.name}`}
          className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-card/95 text-foreground transition-colors hover:text-primary"
        >
          <Heart className={`size-4 ${wished ? "fill-primary text-primary" : ""}`} />
        </button>
        {!item.available && (
          <div className="absolute inset-0 grid place-items-center bg-ink/65 text-sm font-bold text-ink-foreground">
            Currently unavailable
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base font-bold leading-snug">{item.name}</h3>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-veg-soft px-2 py-0.5 text-xs font-bold text-veg">
            <Star className="size-3 fill-current" />
            {item.rating}
          </span>
        </div>
        {item.description && (
          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
        )}

        {hasPortions && (
          <div className="mt-3 inline-flex w-fit rounded-full border border-border p-0.5">
            {(["Half", "Full"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPortion(p)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  portion === p ? "bg-ink text-ink-foreground" : "text-muted-foreground"
                }`}
              >
                {p} {rupees(priceFor(item, p))}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="font-display text-xl font-bold text-primary">
            {rupees(priceFor(item, portion))}
          </span>
          <button
            disabled={!item.available}
            onClick={() => {
              add(item, portion);
              setAdded(true);
              window.setTimeout(() => setAdded(false), 1200);
            }}
            className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-glow disabled:cursor-not-allowed disabled:opacity-40"
          >
            {added ? "Added ✓" : "Add +"}
          </button>
        </div>
      </div>
    </article>
  );
}
