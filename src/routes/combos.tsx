import { createFileRoute, Link } from "@tanstack/react-router";
import { MENU_ITEMS } from "@/data/menu";
import { FoodCard } from "@/components/FoodCard";
import { PageHero } from "@/components/PageHero";
import { rupees } from "@/lib/shop";

export const Route = createFileRoute("/combos")({
  head: () => ({
    meta: [
      { title: "Value Combos & Thali Meals | Apna Baithak Lucknow" },
      {
        name: "description",
        content:
          "Mini, family and party combos plus thali meals from Apna Baithak. Complete pure veg meals at one price.",
      },
      { property: "og:title", content: "Value Combos — Apna Baithak" },
      {
        property: "og:description",
        content: "Complete pure veg meal combos for one person, the family or a full party.",
      },
    ],
  }),
  component: CombosPage,
});

function CombosPage() {
  const combos = MENU_ITEMS.filter((i) => i.categoryId === "combos");
  const thalis = MENU_ITEMS.filter((i) => i.categoryId === "thali");
  const cheapest = Math.min(...combos.map((c) => c.price));

  return (
    <>
      <PageHero
        eyebrow="Complete Meals"
        title="Combos & Thalis"
        subtitle={`Full plates, one price. Combos start at ${rupees(cheapest)} and scale all the way up to party size.`}
      />

      <section className="mx-auto max-w-[1400px] px-5 py-14">
        <h2 className="font-display text-3xl font-bold">Combo meals</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything portioned and packed together — ideal for lunch at work or dinner at home.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {combos.map((c) => (
            <FoodCard key={c.id} item={c} />
          ))}
        </div>

        <h2 className="mt-16 font-display text-3xl font-bold">Thali</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Roti, sabji, daal, rice and salad on a single tray.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {thalis.map((t) => (
            <FoodCard key={t.id} item={t} />
          ))}
        </div>

        <div className="mt-16 rounded-4xl border border-border bg-card p-8 text-center lg:p-12">
          <h2 className="font-display text-3xl font-bold">Ordering for a crowd?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            Offices, schools and functions — we take bulk orders with custom pricing. Tell us the
            headcount and the date, and we'll send a quote.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground"
            >
              Request a bulk quote
            </Link>
            <Link
              to="/menu"
              className="rounded-full border border-border px-7 py-3.5 text-sm font-bold"
            >
              Browse full menu
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
