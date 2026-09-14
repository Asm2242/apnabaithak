// Home page editable content — lives in Supabase `home_content` (single row id='main').
// Falls back to static defaults so site never breaks if table is missing.

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

/* eslint-disable @typescript-eslint/no-explicit-any */
const db = () => (supabase as any).from("home_content");
/* eslint-enable @typescript-eslint/no-explicit-any */

export function useHomeContent() {
  const [content, setContent] = useState<HomeContent>(DEFAULT_HOME);
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data, error } = await db().select("*").eq("id", "main").maybeSingle();
      if (error) {
        if (error.message.includes("home_content") || error.message.includes("schema cache")) {
          setTableMissing(true);
        }
        setLoading(false);
        return;
      }
      if (data) {
        setContent({ ...DEFAULT_HOME, ...data });
        setTableMissing(false);
      }
    } catch {
      setTableMissing(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    let channel: { unsubscribe?: () => void } | undefined;
    try {
      const ch = supabase
        .channel("home-content")
        .on("postgres_changes", { event: "*", schema: "public", table: "home_content" }, () =>
          void load(),
        )
        .subscribe();
      channel = ch as unknown as { unsubscribe?: () => void };
    } catch {
      channel = undefined;
    }
    return () => {
      try {
        if (channel?.unsubscribe) channel.unsubscribe();
      } catch {
        /* noop */
      }
      try {
        void supabase.removeChannel(channel as never);
      } catch {
        /* noop */
      }
    };
  }, [load]);

  return { content, loading, tableMissing, reload: load };
}
