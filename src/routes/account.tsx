import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, LogOut, Mail, Phone, ShoppingBag, User } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { useShop } from "@/lib/shop";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account | Apna Baithak" },
      {
        name: "description",
        content: "Manage your Apna Baithak profile, orders and saved dishes.",
      },
      { property: "og:title", content: "My Account — Apna Baithak" },
      { property: "og:description", content: "Your profile and order history." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { wishlist } = useShop();
  const { user, profile, loading, signOut, isAdmin, isDelivery } = useAuth();
  const ready = !loading;
  const customer = user
    ? {
        name: profile?.full_name || user.email?.split("@")[0] || "Guest",
        email: profile?.email || user.email || "",
        phone: profile?.phone || "—",
        code: profile?.user_code ?? "",
      }
    : null;
  const logout = () => {
    void signOut();
  };

  return (
    <>
      <PageHero eyebrow="Your profile" title="My Account" />
      <section className="mx-auto max-w-3xl px-5 py-14">
        {!ready ? (
          <p className="text-center text-sm text-muted-foreground">Loading…</p>
        ) : !customer ? (
          <div className="rounded-3xl border border-border bg-card p-12 text-center">
            <User className="mx-auto size-12 text-muted-foreground" />
            <h2 className="mt-5 font-display text-2xl font-bold">Please log in</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to see your profile, orders and saved dishes.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/login"
                className="rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-full border border-border px-7 py-3.5 text-sm font-bold"
              >
                Create account
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-3xl border border-border bg-card p-7">
              <div className="flex items-center gap-4">
                <span className="grid size-16 place-items-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {customer.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <h2 className="font-display text-2xl font-bold">{customer.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    Member ID: <strong>{customer.code || "—"}</strong>
                  </p>
                  {(isAdmin || isDelivery) && (
                    <Link to="/admin" className="text-xs font-bold text-primary">
                      Open admin panel →
                    </Link>
                  )}
                </div>
              </div>
              <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl bg-muted p-4">
                  <Mail className="size-4 text-primary" /> {customer.email}
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-muted p-4">
                  <Phone className="size-4 text-primary" /> {customer.phone}
                </div>
              </dl>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Link
                to="/orders"
                className="flex items-center gap-4 rounded-3xl border border-border bg-card p-6"
              >
                <ShoppingBag className="size-6 text-primary" />
                <span>
                  <span className="block font-display text-lg font-bold">My Orders</span>
                  <span className="block text-xs text-muted-foreground">Track and reorder</span>
                </span>
              </Link>
              <Link
                to="/wishlist"
                className="flex items-center gap-4 rounded-3xl border border-border bg-card p-6"
              >
                <Heart className="size-6 text-primary" />
                <span>
                  <span className="block font-display text-lg font-bold">Wishlist</span>
                  <span className="block text-xs text-muted-foreground">
                    {wishlist.length} saved dishes
                  </span>
                </span>
              </Link>
            </div>

            <button
              onClick={logout}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-sm font-bold text-destructive"
            >
              <LogOut className="size-4" /> Log out
            </button>
          </>
        )}
      </section>
    </>
  );
}
