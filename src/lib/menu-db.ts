import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { MenuCategory, MenuItem } from "@/data/menu";

type Row = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  image: string;
  price: number;
  half_price: number | null;
  full_price: number | null;
  rating: number | null;
  best_seller: boolean;
  available: boolean;
  sort_order: number;
};

/** Live menu straight from the database, so admin edits and deletes show up instantly. */
export function useLiveMenu() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[] | null>(null);

  const load = useCallback(async () => {
    const [{ data: cats }, { data: rows }] = await Promise.all([
      supabase
        .from("categories")
        .select("id,name,icon,sort_order,active")
        .eq("active", true)
        .order("sort_order"),
      supabase
        .from("menu_items")
        .select(
          "id,category_id,name,description,image,price,half_price,full_price,rating,best_seller,available,sort_order",
        )
        .order("sort_order"),
    ]);

    const catList = (cats ?? []).map((c) => ({
      id: c.id as string,
      name: c.name as string,
      icon: (c.icon as string) || "🍽️",
    }));
    setCategories(catList);

    const nameById = new Map(catList.map((c) => [c.id, c.name]));
    setItems(
      ((rows ?? []) as Row[]).map((r) => ({
        id: r.id,
        name: r.name,
        image: r.image,
        price: Number(r.price),
        half: r.half_price === null ? null : Number(r.half_price),
        full: r.full_price === null ? null : Number(r.full_price),
        rating: Number(r.rating ?? 4.5),
        category: nameById.get(r.category_id) ?? "",
        categoryId: r.category_id,
        description: r.description,
        bestSeller: r.best_seller,
        available: r.available,
      })),
    );
  }, []);

  useEffect(() => {
    void load();
    const channel = supabase
      .channel("live-menu")
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, () =>
        void load(),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, () =>
        void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load]);

  return { categories, items, loading: items === null, reload: load };
}
