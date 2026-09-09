import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { rupees } from "@/lib/shop";

type Category = { id: string; name: string };

type Item = {
  id: string;
  category_id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  half_price: number | null;
  full_price: number | null;
  is_veg: boolean;
  best_seller: boolean;
  spicy: boolean;
  available: boolean;
};

export const Route = createFileRoute("/admin/menu")({
  head: () => ({
    meta: [
      { title: "Menu Editor | Apna Baithak Admin" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Edit dish prices, photos and descriptions." },
      { property: "og:title", content: "Menu Editor — Apna Baithak" },
      { property: "og:description", content: "Edit dish prices, photos and descriptions." },
    ],
  }),
  component: AdminMenu,
});

const empty = (categoryId: string): Item => ({
  id: "",
  category_id: categoryId,
  name: "",
  description: "",
  image: "",
  price: 0,
  half_price: null,
  full_price: null,
  is_veg: true,
  best_seller: false,
  spicy: false,
  available: true,
});

function AdminMenu() {
  const [cats, setCats] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[] | null>(null);
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Item | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [{ data: c }, { data: i }] = await Promise.all([
      supabase.from("categories").select("id,name").order("sort_order"),
      supabase
        .from("menu_items")
        .select(
          "id,category_id,name,description,image,price,half_price,full_price,is_veg,best_seller,spicy,available",
        )
        .order("category_id")
        .order("sort_order"),
    ]);
    setCats((c ?? []) as Category[]);
    setItems((i ?? []) as Item[]);
  };

  useEffect(() => {
    void load();
  }, []);

  const shown = useMemo(
    () =>
      (items ?? []).filter(
        (i) =>
          (cat === "all" || i.category_id === cat) &&
          (q.trim() === "" || i.name.toLowerCase().includes(q.trim().toLowerCase())),
      ),
    [items, cat, q],
  );

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    setMsg("");
    const payload = {
      id: editing.id.trim(),
      category_id: editing.category_id,
      name: editing.name.trim(),
      description: editing.description,
      image: editing.image,
      price: Number(editing.price) || 0,
      half_price: editing.half_price === null ? null : Number(editing.half_price),
      full_price: editing.full_price === null ? null : Number(editing.full_price),
      is_veg: editing.is_veg,
      best_seller: editing.best_seller,
      spicy: editing.spicy,
      available: editing.available,
    };
    if (!payload.id || !payload.name) {
      setBusy(false);
      setMsg("Dish id and name are required.");
      return;
    }
    const { error } = isNew
      ? await supabase.from("menu_items").insert(payload)
      : await supabase.from("menu_items").update(payload).eq("id", payload.id);
    setBusy(false);
    if (error) {
      setMsg(error.message);
      return;
    }
    setEditing(null);
    setIsNew(false);
    setMsg("Saved.");
    await load();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this dish permanently?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    setMsg(error ? error.message : "Deleted.");
    await load();
  };

  const toggle = async (item: Item) => {
    const { error } = await supabase
      .from("menu_items")
      .update({ available: !item.available })
      .eq("id", item.id);
    if (error) setMsg(error.message);
    await load();
  };

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Menu editor</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Change price, photo, description and availability. Changes go live instantly.
          </p>
        </div>
        <button
          onClick={() => {
            setIsNew(true);
            setEditing(empty(cats[0]?.id ?? ""));
          }}
          className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          + Add dish
        </button>
      </div>

      {msg && (
        <p className="mt-4 rounded-xl bg-muted p-3 text-sm font-semibold text-foreground">{msg}</p>
      )}

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search dish…"
          className="input max-w-xs"
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="input max-w-xs">
          <option value="all">All categories</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {items === null ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading dishes…</p>
      ) : shown.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">No dishes match this filter.</p>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((i) => (
            <li key={i.id} className="flex gap-4 rounded-3xl border border-border bg-card p-4">
              <img
                src={i.image}
                alt={i.name}
                className="size-24 shrink-0 rounded-2xl object-cover"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-bold">{i.name}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{i.description}</p>
                <p className="mt-1 text-sm font-bold text-primary">{rupees(i.price)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setIsNew(false);
                      setEditing(i);
                    }}
                    className="rounded-full border border-border px-3.5 py-1.5 text-xs font-bold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => void toggle(i)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${
                      i.available ? "bg-veg-soft text-veg" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {i.available ? "Available" : "Sold out"}
                  </button>
                  <button
                    onClick={() => void remove(i.id)}
                    className="rounded-full border border-border px-3.5 py-1.5 text-xs font-bold text-destructive"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl border border-border bg-card p-6">
            <h2 className="font-display text-2xl font-bold">{isNew ? "Add dish" : "Edit dish"}</h2>

            {isNew && (
              <label className="mt-4 block">
                <span className="label">Dish id (short, e.g. paneer-tikka)</span>
                <input
                  className="input"
                  value={editing.id}
                  onChange={(e) => setEditing({ ...editing, id: e.target.value })}
                />
              </label>
            )}

            <label className="mt-4 block">
              <span className="label">Name</span>
              <input
                className="input"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </label>

            <label className="mt-4 block">
              <span className="label">Category</span>
              <select
                className="input"
                value={editing.category_id}
                onChange={(e) => setEditing({ ...editing, category_id: e.target.value })}
              >
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 block">
              <span className="label">Description</span>
              <textarea
                rows={3}
                className="input"
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </label>

            <label className="mt-4 block">
              <span className="label">Photo (path or link)</span>
              <input
                className="input"
                placeholder="/images/foods/thali.jpg"
                value={editing.image}
                onChange={(e) => setEditing({ ...editing, image: e.target.value })}
              />
            </label>
            {editing.image && (
              <img
                src={editing.image}
                alt=""
                className="mt-3 h-32 w-full rounded-2xl object-cover"
              />
            )}

            <div className="mt-4 grid grid-cols-3 gap-3">
              <label className="block">
                <span className="label">Price ₹</span>
                <input
                  type="number"
                  className="input"
                  value={editing.price}
                  onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                />
              </label>
              <label className="block">
                <span className="label">Half ₹</span>
                <input
                  type="number"
                  className="input"
                  value={editing.half_price ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      half_price: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </label>
              <label className="block">
                <span className="label">Full ₹</span>
                <input
                  type="number"
                  className="input"
                  value={editing.full_price ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      full_price: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
              {(
                [
                  ["available", "Available"],
                  ["best_seller", "Bestseller"],
                  ["spicy", "Spicy"],
                ] as const
              ).map(([k, l]) => (
                <label key={k} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editing[k]}
                    onChange={(e) => setEditing({ ...editing, [k]: e.target.checked })}
                  />
                  {l}
                </label>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                disabled={busy}
                onClick={() => void save()}
                className="flex-1 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
              >
                {busy ? "Saving…" : "Save changes"}
              </button>
              <button
                onClick={() => {
                  setEditing(null);
                  setIsNew(false);
                }}
                className="rounded-full border border-border px-6 py-3 text-sm font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
