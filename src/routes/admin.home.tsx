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
    ],
  }),
  component: AdminHome,
});

const SECTIONS: { title: string; fields: (keyof HomeContent)[] }[] = [
  { title: "Hero — sabse upar bada text", fields: ["hero_badge", "hero_title1", "hero_title2", "hero_description"] },
  { title: "Buttons + Contact", fields: ["order_now_label", "whatsapp_label", "call_label", "phone", "phone_display", "whatsapp"] },
  { title: "Address / Time / Rating", fields: ["area", "address", "hours", "days", "rating", "free_delivery_at"] },
  { title: "Info strip — chhota patti", fields: ["open_text", "nearby_text", "dinein_text"] },
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
  hero_badge: "Top badge",
  hero_title1: "Bada heading line 1 (Ghar jaisa)",
  hero_title2: "Bada heading line 2 (swaad, roz taaza)",
  hero_description: "Hero description",
  order_now_label: "Order button text",
  whatsapp_label: "WhatsApp button text",
  call_label: "Call prefix",
  phone: "Phone digits",
  phone_display: "Phone display (+91 ...)",
  whatsapp: "WhatsApp number",
  area: "Area",
  address: "Full address",
  hours: "Hours",
  days: "Days",
  rating: "Rating",
  free_delivery_at: "Free delivery over ₹",
  open_text: "Hours sub-text",
  nearby_text: "Delivery sub-text",
  dinein_text: "Area sub-text",
  craving_title: "Craving heading",
  craving_subtitle: "Craving sub",
  offers_title: "Offers heading",
  offers_subtitle: "Offers sub",
  combos_title: "Combos heading",
  combos_subtitle: "Combos sub",
  best_title: "Best sellers heading",
  best_subtitle: "Best sellers sub",
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
  { key: "visit_img1", label: "Visit photo 1 (neeche)" },
  { key: "visit_img2", label: "Visit photo 2" },
  { key: "visit_img3", label: "Visit photo 3" },
  { key: "visit_img4", label: "Visit photo 4" },
];

function AdminHome() {
  const [form, setForm] = useState<HomeContent>(DEFAULT_HOME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).from("home_content").select("*").eq("id", "main").maybeSingle();
      if (!alive) return;
      if (error) {
        setMsg({ kind: "err", text: error.message });
      } else if (data) {
        setForm({ ...DEFAULT_HOME, ...data });
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const set = (k: keyof HomeContent, v: string) =>
    setForm((f) => ({ ...f, [k]: k === "rating" || k === "free_delivery_at" ? (v === "" ? 0 : Number(v)) : v }));

  const save = async () => {
    setSaving(true);
    setMsg(null);
    const { id: _id, ...rest } = form as HomeContent & { id?: string };
    void _id;
    const payload = { ...rest, updated_at: new Date().toISOString() };

    // 1) try Supabase table first (menu jaisa)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tableOk = false;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: upErr, data: upData } = await (supabase as any)
        .from("home_content")
        .update(payload)
        .eq("id", "main")
        .select("id");
      if (!upErr) {
        if (!upData || upData.length === 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error: insErr } = await (supabase as any).from("home_content").insert({ id: "main", ...payload });
          if (!insErr) tableOk = true;
          else if (String(insErr.message).includes("Could not find the table")) tableOk = false;
          else {
            setSaving(false);
            setMsg({ kind: "err", text: insErr.message });
            return;
          }
        } else {
          tableOk = true;
        }
      } else if (String(upErr.message).includes("Could not find the table")) {
        tableOk = false;
      } else {
        setSaving(false);
        setMsg({ kind: "err", text: upErr.message });
        return;
      }
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      if (m.includes("Could not find the table")) tableOk = false;
    }

    // 2) always also save to storage (bypasses schema cache, guarantees read via public API)
    try {
      const blob = new Blob([JSON.stringify({ id: "main", ...payload })], { type: "application/json" });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: upErr2 } = await (supabase as any).storage.from("menu").upload("home_content.json", blob, {
        upsert: true,
        contentType: "application/json",
      });
      if (upErr2 && !String(upErr2.message).includes("Could not find")) {
        // if storage fails but table succeeded, still ok
        if (!tableOk) {
          setSaving(false);
          setMsg({ kind: "err", text: upErr2.message });
          return;
        }
      } else {
        tableOk = true;
      }
    } catch (e) {
      if (!tableOk) {
        setSaving(false);
        setMsg({ kind: "err", text: e instanceof Error ? e.message : String(e) });
        return;
      }
    }

    setSaving(false);
    if (tableOk) setMsg({ kind: "ok", text: "Saved! Homepage ab live hai — hard refresh (Ctrl+Shift+R) karo." });
  };

  if (loading) return <main className="mx-auto max-w-[900px] px-5 py-10 text-sm text-muted-foreground">Loading…</main>;

  return (
    <main className="mx-auto max-w-[900px] px-5 py-10">
      <h1 className="font-display text-3xl font-bold">Home editor</h1>
      <p className="mt-1 text-sm text-muted-foreground">Menu ki tarah — change karo, Save dabao, homepage turant update.</p>
      {msg && (
        <p className={`mt-4 rounded-xl p-3 text-sm font-semibold ${msg.kind === "ok" ? "bg-veg-soft text-veg" : "bg-destructive/10 text-destructive"}`}>
          {msg.text}
        </p>
      )}

      {SECTIONS.map((s) => (
        <section key={s.title} className="mt-8 rounded-3xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">{s.title}</h2>
          <div className="mt-4 grid gap-4">
            {s.fields.map((k) => (
              <label key={k} className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">{LABELS[k]}</span>
                {LONG.includes(k) ? (
                  <textarea rows={3} className="input" value={String(form[k] ?? "")} onChange={(e) => set(k, e.target.value)} />
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
        <h2 className="font-display text-lg font-bold">Photos — drag & drop</h2>
        <p className="mt-1 text-sm text-muted-foreground">Box par click karo ya photo kheench ke chhodo, phir Save dabao.</p>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          {IMAGE_FIELDS.map((f) => (
            <div key={f.key} className="rounded-2xl border border-border p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{f.label}</p>
              <ImageDropzone value={String(form[f.key] ?? "")} onChange={(url) => set(f.key, url)} />
              <input
                className="input mt-2"
                placeholder="/images/foods/thali.jpg"
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
      <p className="mt-3 text-center text-xs text-muted-foreground">Save ke baad homepage ko hard refresh karo (Ctrl+Shift+R).</p>
    </main>
  );
}
