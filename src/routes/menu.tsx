import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FoodCard } from "@/components/FoodCard";
import { PageHero } from "@/components/PageHero";
import { useLiveMenu } from "@/lib/menu-db";

type MenuSearch = { category?: string | undefined };

export const Route = createFileRoute("/menu")({
  validateSearch: (search: Record<string, unknown>): MenuSearch => ({
    category: typeof search["category"] === "string" ? search["category"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Full Menu — Pure Veg Dishes | Apna Baithak Lucknow" },
      {
        name: "description",
        content:
          "Browse the complete Apna Baithak menu: thali, roasted chaap, momos, Chinese, main course, burgers, beverages and combos. All 100% vegetarian.",
      },
      { property: "og:title", content: "Full Menu — Apna Baithak" },
      {
        property: "og:description",
        content: "Pure vegetarian dishes across every category, freshly cooked to order.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { category } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { categories, items: all, loading } = useLiveMenu();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"popular" | "low" | "high" | "rating">("popular");
  const [bestOnly, setBestOnly] = useState(false);

  const active = category ?? "all";
  const source = all ?? [];

  const items = useMemo(() => {
    let list = source.filter((i) => (active === "all" ? true : i.categoryId === active));
    if (bestOnly) list = list.filter((i) => i.bestSeller);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description ?? "").toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    if (sort === "low") sorted.sort((a, b) => a.price - b.price);
    if (sort === "high") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    if (sort === "popular") sorted.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller));
    return sorted;
  }, [source, active, bestOnly, query, sort]);

  const setCategory = (id: string) =>
    navigate({ search: id === "all" ? {} : { category: id }, resetScroll: false });

  return (
    <>
      <PageHero
        eyebrow="Pure Veg Kitchen"
        title="Our Full Menu"
        subtitle={`${source.length} dishes across ${categories.length} categories — thali, chaap, momos, Chinese, combos and more.`}
      />

      <div className="sticky top-[72px] z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-5 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dishes, e.g. malai chaap, momos, noodles"
                className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm outline-none focus:border-primary"
              />
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setBestOnly((v) => !v)}
                className={`rounded-full border px-4 py-3 text-sm font-semibold ${
                  bestOnly
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card"
                }`}
              >
                Bestsellers
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold outline-none"
              >
                <option value="popular">Sort: Popular</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>
          </div>

          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
            <CatChip
              label="All"
              icon="🍴"
              count={source.length}
              active={active === "all"}
              onClick={() => setCategory("all")}
            />
            {categories.map((c) => (
              <CatChip
                key={c.id}
                label={c.name}
                icon={c.icon}
                count={source.filter((i) => i.categoryId === c.id).length}
                active={active === c.id}
                onClick={() => setCategory(c.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1400px] px-5 py-10">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading the kitchen menu…</p>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Showing <strong className="text-foreground">{items.length}</strong> dishes
            </p>
            {items.length === 0 ? (
              <div className="rounded-3xl border border-border bg-card p-14 text-center">
                <p className="font-display text-xl font-bold">No dishes matched that search</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try a different keyword or pick another category.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((i) => (
                  <FoodCard key={i.id} item={i} />
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

function CatChip({
  label,
  icon,
  count,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${
        active ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card"
      }`}
    >
      <span>{icon}</span>
      {label}
      <span className={`text-xs ${active ? "text-ink-foreground/60" : "text-muted-foreground"}`}>
        {count}
      </span>
    </button>
  );
}
