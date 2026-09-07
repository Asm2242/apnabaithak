import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, Clock, HeartHandshake, ChefHat } from "lucide-react";
import { CATEGORIES, MENU_ITEMS } from "@/data/menu";
import { GALLERY, RESTAURANT } from "@/data/site";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Pure Veg Since Day One | Apna Baithak" },
      {
        name: "description",
        content:
          "Apna Baithak is a 100% pure vegetarian restaurant in Eldeco City, Lucknow, serving thalis, chaap, momos and Chinese from 7:30 AM to 10 PM daily.",
      },
      { property: "og:title", content: "About Apna Baithak" },
      {
        property: "og:description",
        content: "A fully vegetarian kitchen in Eldeco City, Lucknow.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Story"
        title="A baithak for pure veg food lovers"
        subtitle="One kitchen, no compromises — everything we cook is fully vegetarian, made fresh through the day."
      />

      <section className="mx-auto max-w-[1400px] px-5 py-14">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold">Cooked the way we'd cook at home</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Apna Baithak started with a simple idea: a place in {RESTAURANT.area} where a family
              can sit down and eat honest vegetarian food, without checking twice about what's in
              the kitchen. Our tandoor, our wok and our thali counter all run pure veg.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Today the menu runs to {MENU_ITEMS.length} dishes across {CATEGORIES.length}{" "}
              categories — from a ₹199 thali to tandoori momos, malai chaap, Indo-Chinese and party
              combos. Everything is prepared to order, seven days a week from{" "}
              {RESTAURANT.hours}.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { k: `${MENU_ITEMS.length}+`, v: "Dishes" },
                { k: "100%", v: "Pure Veg" },
                { k: `${RESTAURANT.rating}★`, v: "Rating" },
              ].map((s) => (
                <div key={s.v} className="rounded-2xl border border-border bg-card px-4 py-4">
                  <p className="font-display text-2xl font-bold text-primary">{s.k}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {GALLERY.filter((g) => g.kind === "Restaurant")
              .slice(0, 4)
              .map((g) => (
                <img
                  key={g.src}
                  src={g.src}
                  alt={g.caption}
                  loading="lazy"
                  className="h-44 w-full rounded-3xl object-cover md:h-56"
                />
              ))}
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Leaf,
              t: "Strictly vegetarian",
              d: "No eggs, no shared equipment, no exceptions anywhere in the kitchen.",
            },
            {
              icon: ChefHat,
              t: "Made to order",
              d: "Chaap goes on the tandoor and noodles hit the wok only once you order.",
            },
            {
              icon: Clock,
              t: "Open 7:30 AM – 10 PM",
              d: "Breakfast, lunch, evening snacks and dinner — all days of the week.",
            },
            {
              icon: HeartHandshake,
              t: "Bulk & party orders",
              d: "Offices, schools and functions catered with custom quotes.",
            },
          ].map((f) => (
            <div key={f.t} className="rounded-3xl border border-border bg-card p-6">
              <f.icon className="size-7 text-primary" />
              <h3 className="mt-4 font-display text-lg font-bold">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-4xl bg-ink p-10 text-center text-ink-foreground lg:p-14">
          <h2 className="font-display text-3xl font-bold">Come sit with us</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-foreground/70">
            {RESTAURANT.address}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/menu"
              className="rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground"
            >
              See the menu
            </Link>
            <a
              href={RESTAURANT.maps}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-ink-foreground/25 px-7 py-3.5 text-sm font-bold"
            >
              Get directions
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
