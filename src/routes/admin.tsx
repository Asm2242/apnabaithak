import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { RESTAURANT } from "@/data/site";

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
  { to: "/admin/offers", label: "Offers", exact: false },
  { to: "/admin/order", label: "Orders", exact: false },
  { to: "/admin/patner", label: "Partners", exact: false },
] as const;

function AdminLayout() {
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
