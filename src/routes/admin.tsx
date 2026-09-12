import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { RESTAURANT } from "@/data/site";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel | Apna Baithak" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Internal management panel for Apna Baithak." },
      { property: "og:title", content: "Admin Panel — Apna Baithak" },
      { property: "og:description", content: "Internal management panel." },
    ],
  }),
  component: AdminLayout,
});

const TABS = [
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/menu", label: "Menu", exact: false },
  { to: "/admin/offers", label: "Offers", exact: false },
  { to: "/admin/order", label: "Orders", exact: false },
  { to: "/admin/patner", label: "Partners", exact: false },
] as const;

function AdminLayout() {
  const { loading, user, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Checking access…
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-5">
        <div className="max-w-md rounded-3xl border border-border bg-card p-10 text-center">
          <h1 className="font-display text-2xl font-bold">Admin access only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {user
              ? "This account does not have admin permission."
              : "Please log in with an admin account to open this panel."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
            >
              Login
            </Link>
            <Link to="/" className="rounded-full border border-border px-6 py-3 text-sm font-bold">
              Back to site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-4 px-5 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={RESTAURANT.logo} alt="" className="size-10 rounded-full" />
            <span>
              <span className="block font-display text-lg font-bold">Apna Baithak</span>
              <span className="block text-[10px] font-bold tracking-[0.18em] text-primary">
                ADMIN PANEL
              </span>
            </span>
          </Link>
          <nav className="ml-auto flex flex-wrap gap-1">
            {TABS.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                activeOptions={{ exact: t.exact }}
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground data-[status=active]:bg-ink data-[status=active]:text-ink-foreground"
              >
                {t.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/"
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold"
          >
            View site
          </Link>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
