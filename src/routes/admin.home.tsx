import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ImageDropzone } from "@/components/ImageDropzone";
import { DEFAULT_HOME, type HomeContent } from "@/lib/home-content";

export const Route = createFileRoute("/admin/home")({
  head: () => ({
    meta: [
      { title: "Home Page Editor | Apna Baithak Admin" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Edit homepage hero text, buttons, info strip and sections." },
    ],
  }),
  component: AdminHome,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
const db = () => (supabase as any).from("home_content");
/* eslint-enable @typescript-eslint/no-explicit-any */

const SECTIONS: { title: string; fields: (keyof HomeContent)[] }[] = [
  {
    title: "Hero — sabse upar bada text",
    fields: ["hero_badge", "hero_title1", "hero_title2", "hero_description"],
  },
  {
    title: "Buttons + Contact",
    fields: ["order_now_label", "whatsapp_label", "call_label", "phone", "phone_display", "whatsapp"],
  },
  {
    title: "Address / Time / Rating",
    fields: ["area", "address", "hours", "days", "rating", "free_delivery_at"],
  },
  {
    title: "Info strip — chhota patti",
    fields: ["open_text", "nearby_text", "dinein_text"],
  },
  {
    title: "Sections — neeche wale headings",
    fields: [
      "craving_title",
      "craving_subtitle",
      "offers_title",
      "offers_subtitle",
      "combos_title",
      "combos_subtitle",
      "best_title",
      "best_subtitle",
      "visit_title",
      "visit_desc",
    ],
  },
];

const LABELS: Record<keyof HomeContent, string> = {
  hero_badge: "Top badge (100% Pure Vegetarian)",
  hero_title1: "Bada heading line 1 (Ghar jaisa)",
  hero_title2: "Bada heading line 2 (swaad, roz taaza)",
  hero_description: "Hero description (lamba text)",
  order_now_label: "Order button text",
  whatsapp_label: "WhatsApp button text",
  call_label: "Call button prefix (Call)",
  phone: "Phone (tel: link, digits only)",
  phone_display: "Phone display (+91 ...)",
  whatsapp: "WhatsApp number (91...)",
  area: "Area (Eldeco City, Lucknow)",
  address: "Full address",
  hours: "Hours (7:30 AM – 10:00 PM)",
  days: "Days (All Days)",
  rating: "Rating (4.6)",
  free_delivery_at: "Free delivery over ₹",
  open_text: "Hours sub-text (Open all days)",
  nearby_text: "Delivery sub-text (Nearby areas)",
  dinein_text: "Area sub-text (Dine-in & takeaway)",
  craving_title: "Craving heading",
  craving_subtitle: "Craving sub-heading",
  offers_title: "Offers heading",
  offers_subtitle: "Offers sub-heading",
  combos_title: "Combos heading",
  combos_subtitle: "Combos sub-heading",
  best_title: "Best sellers heading",
  best_subtitle: "Best sellers sub-heading",
  visit_title: "Visit heading",
  visit_desc: "Visit description",
  hero_img1: "Hero photo 1",
  hero_img2: "Hero photo 2",
  hero_img3: "Hero photo 3",
  hero_img4: "Hero photo 4",
  visit_img1: "Visit photo 1",
  visit_img2: "Visit photo 2",
  visit_img3: "Visit photo 3",
  visit_img4: "Visit photo 4",
};

const LONG: (keyof HomeContent)[] = ["hero_description", "address", "visit_desc"];

const IMAGE_FIELDS: { key: keyof HomeContent; label: string }[] = [
  { key: "hero_img1", label: "Hero photo 1 (upar right)" },
  { key: "hero_img2", label: "Hero photo 2" },
  { key: "hero_img3", label: "Hero photo 3" },
  { key: "hero_img4", label: "Hero photo 4" },
  { key: "visit_img1", label: "Visit photo 1 (neeche restaurant)" },
  { key: "visit_img2", label: "Visit photo 2" },
  { key: "visit_img3", label: "Visit photo 3" },
  { key: "visit_img4", label: "Visit photo 4" },
];

function AdminHome() {
  const [form, setForm] = useState<HomeContent>(DEFAULT_HOME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await db().select("*").eq("id", "main").maybeSingle();
      if (error) {
        if (error.message.includes("home_content") || error.message.includes("schema cache")) {
          setMissing(true);
          setMsg("Table 'home_content' abhi bani nahi hai — neeche SQL chala do, phir save karo.");
        } else {
          setMsg(error.message);
        }
      } else if (data) {
        setForm({ ...DEFAULT_HOME, ...data });
      }
      setLoading(false);
    })();
  }, []);

  const set = (k: keyof HomeContent, v: string) =>
    setForm((f) => ({
      ...f,
      [k]:
        k === "rating" || k === "free_delivery_at"
          ? v === "" ? 0 : Number(v)
          : v,
    }));

  const save = async () => {
    setSaving(true);
    setMsg("");
    const payload = { id: "main", ...form, updated_at: new Date().toISOString() };
    const { error } = await db().upsert(payload, { onConflict: "id" });
    setSaving(false);
    if (error) {
      if (error.message.includes("home_content") || error.message.includes("schema cache")) {
        setMissing(true);
        setMsg("Table 'home_content' nahi mili. Pehle Supabase me SQL chalao (supabase/home_content.sql).");
      } else {
        setMsg(error.message);
      }
      return;
    }
    setMissing(false);
    setMsg("Saved! Homepage abhi live update ho gaya.");
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-[900px] px-5 py-10">
        <p className="text-sm text-muted-foreground">Loading home content…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[900px] px-5 py-10">
      <h1 className="font-display text-3xl font-bold">Home page editor</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Upar ka bada text, buttons, phone, address, timing aur neeche ke sections — sab yaha se
        badlo. Save karte hi website par live.
      </p>

      {msg && (
        <p className="mt-4 rounded-xl bg-muted p-3 text-sm font-semibold text-foreground">{msg}</p>
      )}

      {missing && (
        <div className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-sm">
          <p className="font-bold">Ek baar ka setup bacha hai (2 min):</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
            <li>Supabase Dashboard kholo → SQL Editor → New query</li>
            <li>
              Repo me <code className="font-mono">supabase/home_content.sql</code> file kholo, pura
              copy karke paste karo → Run
            </li>
            <li>Wapas aao, page refresh karke Save dabao</li>
          </ol>
        </div>
      )}

      {SECTIONS.map((s) => (
        <section key={s.title} className="mt-8 rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-xl font-bold">{s.title}</h2>
          <div className="mt-4 grid gap-4">
            {s.fields.map((k) => (
              <label key={k} className="block">
                <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {LABELS[k]}
                </span>
                {LONG.includes(k) ? (
                  <textarea
                    rows={3}
                    className="input"
                    value={String(form[k] ?? "")}
                    onChange={(e) => set(k, e.target.value)}
                  />
                ) : (
                  <input
                    className="input"
                    type={k === "rating" || k === "free_delivery_at" ? "number" : "text"}
                    value={String(form[k] ?? "")}
                    onChange={(e) => set(k, e.target.value)}
                  />
                )}
              </label>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-8 rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold">Photos — drag & drop</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Photo par click karo ya photo kheench ke box me chhodo (drag & drop). Upload hote hi
          neeche link aa jayega. Save dabana mat bhoolo.
        </p>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          {IMAGE_FIELDS.map((f) => (
            <div key={f.key} className="rounded-2xl border border-border p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {f.label}
              </p>
              <ImageDropzone
                value={String(form[f.key] ?? "")}
                onChange={(url) => set(f.key, url)}
              />
              <input
                className="input mt-3"
                placeholder="ya link paste karo: /images/foods/thali.jpg"
                value={String(form[f.key] ?? "")}
                onChange={(e) => set(f.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </section>

      <button
        disabled={saving}
        onClick={() => void save()}
        className="mt-8 w-full rounded-full bg-primary px-6 py-4 text-sm font-bold text-primary-foreground disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save home page"}
      </button>
    </main>
  );
}
