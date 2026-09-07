import { Link } from "@tanstack/react-router";
import { Clock, Instagram, MapPin, MessageCircle, Phone } from "lucide-react";
import { RESTAURANT, waLink } from "@/data/site";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={RESTAURANT.logo}
              alt="Apna Baithak"
              className="h-12 w-12 rounded-full border border-ink-foreground/20"
            />
            <div>
              <p className="font-display text-xl font-bold">APNA BAITHAK</p>
              <p className="text-xs tracking-[0.2em] text-primary">PURE VEG RESTAURANT</p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm text-ink-foreground/70">
            100% pure vegetarian kitchen in Eldeco City, Lucknow. Freshly cooked thalis, chaap,
            momos, Chinese and combos — served hot every single day.
          </p>
        </div>

        <div>
          <h3 className="font-display text-lg font-bold">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-foreground/75">
            {[
              { to: "/menu", label: "Full Menu" },
              { to: "/combos", label: "Combos" },
              { to: "/offers", label: "Offers" },
              { to: "/gallery", label: "Gallery" },
              { to: "/about", label: "About Us" },
              { to: "/contact", label: "Contact" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg font-bold">Your Orders</h3>
          <ul className="mt-4 space-y-2 text-sm text-ink-foreground/75">
            {[
              { to: "/cart", label: "Cart" },
              { to: "/checkout", label: "Checkout" },
              { to: "/orders", label: "My Orders" },
              { to: "/wishlist", label: "Wishlist" },
              { to: "/account", label: "My Account" },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg font-bold">Visit Us</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-foreground/75">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{RESTAURANT.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
              <a href={`tel:${RESTAURANT.phone}`}>{RESTAURANT.phoneDisplay}</a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                {RESTAURANT.hours} • {RESTAURANT.days}
              </span>
            </li>
            <li className="flex gap-3">
              <MessageCircle className="mt-0.5 size-4 shrink-0 text-primary" />
              <a href={waLink("Hi! I would like to place an order.")}>WhatsApp Order</a>
            </li>
            <li className="flex gap-3">
              <Instagram className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>@apnabaithak</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-foreground/10 px-5 py-5 text-center text-xs text-ink-foreground/55">
        © {new Date().getFullYear()} Apna Baithak Pure Vegetarian Restaurant, Eldeco City, Lucknow.
        All rights reserved.
      </div>
    </footer>
  );
}
