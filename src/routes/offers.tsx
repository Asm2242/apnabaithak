import { createFileRoute, Link } from "@tanstack/react-router";
import { FREE_DELIVERY_AT, OFFERS } from "@/data/site";
import { PageHero } from "@/components/PageHero";
import { rupees, useShop } from "@/lib/shop";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & Discounts | Apna Baithak Lucknow" },
      {
        name: "description",
        content:
          "Live offers at Apna Baithak: ₹75 and ₹150 flat discounts, free items worth ₹200 and ₹250, plus custom bulk order pricing.",
      },
      { property: "og:title", content: "Offers & Discounts — Apna Baithak" },
      {
        property: "og:description",
        content: "Flat discounts, free items and bulk pricing on pure veg orders.",
      },
    ],
  }),
  component: OffersPage,
});

const TONES: Record<string, string> = {
  orange: "from-primary to-primary-glow text-primary-foreground",
  brown: "from-ink to-ink/80 text-ink-foreground",
  green: "from-veg to-veg/80 text-white",
  purple: "from-[oklch(0.45_0.16_300)] to-[oklch(0.58_0.15_310)] text-white",
};

function OffersPage() {
  const { subtotal, bestOffer } = useShop();

  return (
    <>
      <PageHero
        eyebrow="Save More"
        title="Offers & Discounts"
        subtitle="Discounts apply automatically at checkout. The best eligible offer for your cart is always the one we use."
      />

      <section className="mx-auto max-w-[1400px] px-5 py-14">
        <div className="mb-10 rounded-3xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Your cart is at <strong className="text-foreground">{rupees(subtotal)}</strong>.{" "}
            {bestOffer
              ? `You've unlocked ${bestOffer.label}.`
              : `Add ${rupees(Math.max(0, 499 - subtotal))} more to unlock ₹75 off.`}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {OFFERS.map((o) => {
            const unlocked = subtotal >= o.minOrder;
            return (
              <article
                key={o.id}
                className="overflow-hidden rounded-3xl border border-border bg-card"
              >
                <div className={`bg-linear-to-br ${TONES[o.tone]} p-7`}>
                  <div className="flex items-start justify-between">
                    <span className="text-4xl">{o.emoji}</span>
                    <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wide">
                      {o.badge}
                    </span>
                  </div>
                  <p className="mt-5 font-display text-3xl font-bold">{o.label}</p>
                </div>
                <div className="p-6">
                  <p className="text-sm text-muted-foreground">{o.desc}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-foreground/60">
                      Min order {rupees(o.minOrder)}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        unlocked ? "bg-veg-soft text-veg" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {unlocked ? "Unlocked" : "Locked"}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-12 rounded-3xl border border-border bg-card p-7">
          <h2 className="font-display text-2xl font-bold">How offers work</h2>
          <ul className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <li>• Only one discount applies per order — always the highest you qualify for.</li>
            <li>• Free-item offers are chosen by you when the order is confirmed.</li>
            <li>• Delivery is free on orders over {rupees(FREE_DELIVERY_AT)}.</li>
            <li>• Bulk pricing is quoted separately by our team.</li>
          </ul>
          <Link
            to="/menu"
            className="mt-6 inline-block rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground"
          >
            Start an order
          </Link>
        </div>
      </section>
    </>
  );
}
