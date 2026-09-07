import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { FoodCard } from "@/components/FoodCard";
import { PageHero } from "@/components/PageHero";
import { itemById, useShop } from "@/lib/shop";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Saved Dishes | Apna Baithak" },
      {
        name: "description",
        content: "Your saved pure veg dishes at Apna Baithak, ready to add to the cart.",
      },
      { property: "og:title", content: "Wishlist — Apna Baithak" },
      { property: "og:description", content: "Dishes you saved for later." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist, ready } = useShop();
  const items = wishlist.map(itemById).filter((i) => i != null);

  return (
    <>
      <PageHero eyebrow="Saved for later" title="Wishlist" subtitle="Tap the heart on any dish to keep it here." />
      <section className="mx-auto max-w-[1400px] px-5 py-12">
        {!ready ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading your wishlist…</p>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-14 text-center">
            <Heart className="mx-auto size-12 text-muted-foreground" />
            <h2 className="mt-5 font-display text-2xl font-bold">Nothing saved yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse the menu and tap the heart on dishes you want to remember.
            </p>
            <Link
              to="/menu"
              className="mt-6 inline-block rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground"
            >
              Browse the menu
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((i) => (
              <FoodCard key={i.id} item={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
