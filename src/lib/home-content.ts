// Home page editable content — single row id='main' in Supabase `home_content`.
// Falls back to DEFAULT_HOME so site never breaks. Same pattern as menu-db.

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FREE_DELIVERY_AT, RESTAURANT } from "@/data/site";

export type HomeContent = {
  hero_badge: string;
  hero_title1: string;
  hero_title2: string;
  hero_description: string;
  order_now_label: string;
  whatsapp_label: string;
  call_label: string;
  phone: string;
  phone_display: string;
  whatsapp: string;
  area: string;
  address: string;
  hours: string;
  days: string;
  rating: number;
  free_delivery_at: number;
  open_text: string;
  nearby_text: string;
  dinein_text: string;
  craving_title: string;
  craving_subtitle: string;
  offers_title: string;
  offers_subtitle: string;
  combos_title: string;
  combos_subtitle: string;
  best_title: string;
  best_subtitle: string;
  visit_title: string;
  visit_desc: string;
  hero_img1: string;
  hero_img2: string;
  hero_img3: string;
  hero_img4: string;
  visit_img1: string;
  visit_img2: string;
  visit_img3: string;
  visit_img4: string;
};

export const DEFAULT_HOME: HomeContent = {
  hero_badge: "100% Pure Vegetarian",
  hero_title1: "Ghar jaisa",
  hero_title2: "swaad, roz taaza",
  hero_description:
    "Apna Baithak serves freshly cooked thalis, tandoori chaap, momos and Indo-Chinese from our kitchen in Eldeco City, Lucknow.",
  order_now_label: "Order Now",
  whatsapp_label: "WhatsApp Order",
  call_label: "Call",
  phone: RESTAURANT.phone,
  phone_display: RESTAURANT.phoneDisplay,
  whatsapp: RESTAURANT.whatsapp,
  area: RESTAURANT.area,
  address: RESTAURANT.address,
  hours: RESTAURANT.hours,
  days: RESTAURANT.days,
  rating: RESTAURANT.rating,
  free_delivery_at: FREE_DELIVERY_AT,
  open_text: "Open all days",
  nearby_text: "Nearby areas",
  dinein_text: "Dine-in & takeaway",
  craving_title: "What are you craving?",
  craving_subtitle: "Ten categories, all pure veg",
  offers_title: "Today's offers",
  offers_subtitle: "Save more on bigger orders",
  combos_title: "Value combos",
  combos_subtitle: "Full meals for one, family or party",
  best_title: "Best sellers",
  best_subtitle: "Most loved by our regulars",
  visit_title: "Visit our baithak",
  visit_desc:
    "Dine in, pick up, or get it delivered. Our kitchen is fully vegetarian — no eggs, no exceptions.",
  hero_img1: "/images/foods/special-thali.jpg",
  hero_img2: "/images/foods/steam-momos-6-pc.jpg",
  hero_img3: "/images/foods/mini-combo.jpg",
  hero_img4: "/images/foods/jeera-rice.jpg",
  visit_img1: "",
  visit_img2: "",
  visit_img3: "",
  visit_img4: "",
};

// same live pattern as menu-db
export function useHomeContent() {
  const [content, setContent] = useState<HomeContent>(DEFAULT_HOME);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    // 1) try Supabase table (fast, realtime)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("home_content")
        .select("*")
        .eq("id", "main")
        .maybeSingle();
      if (!error && data) {
        setContent((prev) => ({ ...prev, ...data }));
        setLoading(false);
        return;
      }
      // if table missing, will fall through to storage fallback
      if (error && !String(error.message).includes("Could not find the table")) {
        // real error but not schema cache — still try fallback
      }
    } catch {
      // ignore, try fallback
    }
    // 2) fallback: fetch from storage via public API (no schema cache, always works)
    try {
      const res = await fetch("/api/public/home-content", { cache: "no-store" });
      if (res.ok) {
        const j = (await res.json()) as Partial<HomeContent>;
        if (j && Object.keys(j).length > 0) {
          setContent((prev) => ({ ...prev, ...j }));
        }
      }
    } catch {
      // keep defaults
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const channel = supabase
      .channel("home-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "home_content" }, () => void load())
      .subscribe();
    // also poll storage every 15s for fallback
    const iv = window.setInterval(() => void load(), 15000);
    const onVis = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      void supabase.removeChannel(channel);
      window.clearInterval(iv);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  return { content, loading, reload: load };
}
