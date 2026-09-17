import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, MapPin, Phone, Star, Truck, Utensils } from "lucide-react";
import { CATEGORIES as FALLBACK_CATEGORIES, MENU_ITEMS as FALLBACK_ITEMS } from "@/data/menu";
import { useLiveMenu } from "@/lib/menu-db";
import { useHomeContent } from "@/lib/home-content";
import { GALLERY, OFFERS, RESTAURANT } from "@/data/site";
import { FoodCard, VegDot } from "@/components/FoodCard";
import { rupees } from "@/lib/shop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Apna Baithak — Pure Veg Restaurant in Eldeco City, Lucknow" },
      {
        name: "description",
        content:
          "Order pure vegetarian thali, maggi, pizza, momos, Chinese and combos from Apna Baithak, Eldeco City Lucknow. Open 7:30 AM to 10 PM, all days.",
      },
      { property: "og:title", content: "Apna Baithak — Pure Veg Restaurant, Lucknow" },
      {
        property: "og:description",
        content: "81 freshly cooked pure veg dishes. Thali, maggi, pizza, momos, Chinese and combos.",
      },
      { property: "og:image", content: `${RESTAURANT.logo}` },
      { name: "twitter:image", content: `${RESTAURANT.logo}` },
    ],
  }),
  component: Home,
});

function Home() {
  const { categories: liveCategories, items: liveItems } = useLiveMenu();
  const { content: H } = useHomeContent();
  const CATEGORIES = liveCategories.length > 0 ? liveCategories : FALLBACK_CATEGORIES;
  const MENU_ITEMS = liveItems ?? FALLBACK_ITEMS;
  const bestSellers = MENU_ITEMS.filter((i) => i.bestSeller).slice(0, 8);
  const combos = MENU_ITEMS.filter((i) => i.categoryId === "combos");
  const heroShots = [H.hero_img1, H.hero_img2, H.hero_img3, H.hero_img4].filter((s) => s.trim() !== "");
  const fallbackHero = GALLERY.filter((g) => g.kind === "Food").slice(0, 4);
  const heroPics = heroShots.length > 0 ? heroShots : fallbackHero.map((g) => g.src);
  const visitPics = [H.visit_img1, H.visit_img2, H.visit_img3, H.visit_img4].filter(
    (s) => s.trim() !== "",
  );
  const fallbackVisit = GALLERY.filter((g) => g.kind === "Restaurant")
    .slice(0, 4)
    .map((g) => g.src);
  const visitShots = visitPics.length > 0 ? visitPics : fallbackVisit;
  const waNumber = H.whatsapp || RESTAURANT.whatsapp;
  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent("Hi! I'd like to place an order at Apna Baithak.")}`;

  return (
    <>
      <section className="hero-surface text-ink-foreground">
        <div className="mx-auto grid max-w-[1400px] items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-ink-foreground/20 bg-ink-foreground/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]">
              <VegDot /> {H.hero_badge}
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] md:text-7xl">
              {H.hero_title1}
              <span className="block text-primary">{H.hero_title2}</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-ink-foreground/75">
              {H.hero_description} Over {MENU_ITEMS.length} dishes, every one of them pure veg.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/menu"
                className="rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-glow"
              >
                {H.order_now_label}
              </Link>
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-ink-foreground/25 px-7 py-3.5 text-sm font-bold"
              >
                {H.whatsapp_label}
              </a>
              <a
                href={`tel:${H.phone}`}
                className="rounded-full border border-ink-foreground/25 px-7 py-3.5 text-sm font-bold"
              >
                {H.call_label} {H.phone_display}
              </a>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {[
                { k: `${MENU_ITEMS.length}+`, v: "Dishes" },
                { k: `${CATEGORIES.length}`, v: "Categories" },
                { k: `${H.rating}★`, v: "Rated" },
              ].map((s) => (
                <div key={s.v} className="rounded-2xl bg-ink-foreground/10 px-4 py-3">
                  <dt className="font-display text-2xl font-bold text-primary">{s.k}</dt>
                  <dd className="text-xs uppercase tracking-wider text-ink-foreground/65">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {heroPics.map((src, i) => (
              <img
                key={src + i}
                src={src}
                alt="Apna Baithak food"
                className={`h-44 w-full rounded-3xl border border-ink-foreground/10 object-cover md:h-60 ${
                  i % 2 === 1 ? "translate-y-6" : ""
                }`}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-ink-foreground/10">
          <div className="mx-auto grid max-w-[1400px] gap-4 px-5 py-6 sm:grid-cols-3">
            {[
              { icon: Clock, t: H.hours, s: H.open_text },
              { icon: Truck, t: `Free delivery over ${rupees(H.free_delivery_at)}`, s: H.nearby_text },
              { icon: MapPin, t: H.area, s: H.dinein_text },
            ].map((f) => (
              <div key={f.t} className="flex items-center gap-3">
                <f.icon className="size-5 text-primary" />
                <span className="leading-tight">
                  <span className="block text-sm font-semibold">{f.t}</span>
                  <span className="block text-xs text-ink-foreground/60">{f.s}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section title={H.craving_title} subtitle={H.craving_subtitle}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to="/menu"
              search={{ category: c.id }}
              className="group rounded-3xl border border-border bg-card p-5 text-center transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg"
            >
              <span className="text-4xl">{c.icon}</span>
              <p className="mt-3 font-display text-base font-bold">{c.name}</p>
              <p className="text-xs text-muted-foreground">
                {MENU_ITEMS.filter((i) => i.categoryId === c.id).length} items
              </p>
            </Link>
          ))}
        </div>
      </Section>

      <Section title={H.offers_title} subtitle={H.offers_subtitle}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {OFFERS.slice(0, 4).map((o) => (
            <div
              key={o.id}
              className="rounded-3xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
            >
              <span className="text-3xl">{o.emoji}</span>
              <p className="mt-3 font-display text-2xl font-bold text-primary">{o.label}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{o.desc}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-foreground/60">
                Min order {rupees(o.minOrder)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/offers"
            className="rounded-full border border-border bg-card px-6 py-3 text-sm font-bold"
          >
            See all offers
          </Link>
        </div>
      </Section>

      <Section title={H.combos_title} subtitle={H.combos_subtitle}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {combos.map((c) => (
            <FoodCard key={c.id} item={c} />
          ))}
        </div>
      </Section>

      <Section title={H.best_title} subtitle={H.best_subtitle}>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bestSellers.map((i) => (
            <FoodCard key={i.id} item={i} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/menu"
            className="rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground"
          >
            Browse full menu
          </Link>
        </div>
      </Section>

      <section className="mx-auto mt-20 max-w-[1400px] px-5">
        <div className="grid gap-8 rounded-4xl border border-border bg-card p-8 lg:grid-cols-2 lg:p-12">
          <div>
            <h2 className="font-display text-3xl font-bold">{H.visit_title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{H.visit_desc}</p>
            <ul className="mt-6 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
                {H.address}
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-5 shrink-0 text-primary" />
                {H.hours} • {H.days}
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-5 shrink-0 text-primary" />
                <a href={`tel:${H.phone}`}>{H.phone_display}</a>
              </li>
              <li className="flex gap-3">
                <Star className="mt-0.5 size-5 shrink-0 text-primary" />
                Rated {H.rating} by Eldeco City diners
              </li>
              <li className="flex gap-3">
                <Utensils className="mt-0.5 size-5 shrink-0 text-primary" />
                Bulk & party orders welcome
              </li>
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={RESTAURANT.maps}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-ink-foreground"
              >
                Get directions
              </a>
              <Link
                to="/contact"
                className="rounded-full border border-border px-6 py-3 text-sm font-bold"
              >
                Contact us
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {visitShots.map((src, i) => (
              <img
                key={src + i}
                src={src}
                alt="Apna Baithak restaurant"
                loading="lazy"
                className="h-40 w-full rounded-2xl object-cover md:h-52"
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto mt-20 max-w-[1400px] px-5">
      <div className="mb-8 text-center">
        <h2 className="font-display text-3xl font-bold md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
