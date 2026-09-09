import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Menu as MenuIcon, Phone, ShoppingCart, X } from "lucide-react";
import { RESTAURANT } from "@/data/site";
import { rupees, useShop } from "@/lib/shop";
import { useAuth } from "@/lib/auth";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/combos", label: "Combos" },
  { to: "/offers", label: "Offers" },
  { to: "/about", label: "About" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { count, subtotal } = useShop();
  const { profile, user, signOut } = useAuth();
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "";
  const customer = user ? { name: displayName } : null;
  const logout = () => {
    void signOut();
  };
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1500px] items-center gap-3 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <img
            src={RESTAURANT.logo}
            alt="Apna Baithak logo"
            className="h-11 w-11 rounded-full border border-border object-cover"
          />
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold tracking-tight text-foreground">
              APNA BAITHAK
            </span>
            <span className="block text-[10px] font-semibold tracking-[0.18em] text-primary">
              PURE VEG • ELDECO CITY
            </span>
          </span>
        </Link>

        <span className="ml-2 hidden shrink-0 rounded-full bg-veg-soft px-3 py-1.5 text-[11px] font-bold text-veg xl:inline">
          ● PURE VEG
        </span>

        <nav className="mx-auto hidden items-center gap-1 rounded-full border border-border bg-card px-2 py-1.5 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary data-[status=active]:bg-ink data-[status=active]:text-ink-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a
            href={`tel:${RESTAURANT.phone}`}
            className="hidden items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-ink-foreground xl:flex"
          >
            <Phone className="size-4" /> {RESTAURANT.phoneDisplay}
          </a>
          <Link
            to="/wishlist"
            aria-label="Wishlist"
            className="hidden size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:text-primary sm:flex"
          >
            <Heart className="size-4" />
          </Link>
          {customer ? (
            <>
              <Link
                to="/account"
                className="hidden rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold sm:block"
              >
                {customer.name.split(" ")[0]}
              </Link>
              <button
                onClick={logout}
                className="hidden rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground sm:block"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold sm:block"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="hidden rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground sm:block"
              >
                Sign Up
              </Link>
            </>
          )}
          <Link
            to="/cart"
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-primary-foreground"
          >
            <span className="grid size-7 place-items-center rounded-full bg-primary-foreground/20">
              <ShoppingCart className="size-4" />
            </span>
            <span className="text-left leading-tight">
              <span className="block text-sm font-bold">Cart</span>
              <span className="block text-[11px]">
                {rupees(subtotal)}
                {count > 0 ? ` • ${count}` : ""}
              </span>
            </span>
          </Link>
          <button
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full border border-border bg-card lg:hidden"
          >
            {open ? <X className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-card px-4 py-3 lg:hidden">
          <nav className="grid gap-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: n.to === "/" }}
                className="rounded-xl px-4 py-3 text-sm font-medium data-[status=active]:bg-ink data-[status=active]:text-ink-foreground"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-border px-4 py-2.5 text-center text-sm font-semibold"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
              >
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
