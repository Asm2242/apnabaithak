import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { rupees } from "@/lib/shop";

type Bulk = {
  id: string;
  customer_name: string;
  company: string;
  phone: string;
  email: string;
  items: string;
  qty: number;
  delivery_at: string;
  quoted: number | null;
  status: string;
  created_at: string;
};

const STATUSES = ["new", "quoted", "confirmed", "done", "lost"] as const;

export const Route = createFileRoute("/admin/patner")({
  head: () => ({
    meta: [
      { title: "Partners | Apna Baithak Admin" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Bulk order and partner enquiries." },
      { property: "og:title", content: "Partners — Apna Baithak Admin" },
      { property: "og:description", content: "Bulk order enquiries." },
    ],
  }),
  component: AdminPartners,
});

function AdminPartners() {
  const [rows, setRows] = useState<Bulk[] | null>(null);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [draft, setDraft] = useState({ customer_name: "", company: "", phone: "", items: "", qty: "" });

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("bulk_orders")
      .select("id,customer_name,company,phone,email,items,qty,delivery_at,quoted,status,created_at")
      .order("created_at", { ascending: false });
    setRows((data ?? []) as Bulk[]);
  }, []);

  useEffect(() => {
    void load();
    const channel = supabase
      .channel("admin-bulk")
      .on("postgres_changes", { event: "*", schema: "public", table: "bulk_orders" }, () =>
        void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (draft.customer_name.trim().length < 2) {
      setNotice({ kind: "err", text: "Enter the partner or contact name." });
      return;
    }
    if (!/^\d{10}$/.test(draft.phone)) {
      setNotice({ kind: "err", text: "Phone must be a 10-digit number." });
      return;
    }
    const { error } = await supabase.from("bulk_orders").insert({
      customer_name: draft.customer_name.trim(),
      company: draft.company.trim() || draft.customer_name.trim(),
      phone: draft.phone,
      items: draft.items.trim() || "To be confirmed",
      qty: Number(draft.qty) || 0,
      status: "new",
    });
    if (error) {
      setNotice({ kind: "err", text: error.message });
      return;
    }
    setDraft({ customer_name: "", company: "", phone: "", items: "", qty: "" });
    setNotice({ kind: "ok", text: "Partner enquiry added." });
    await load();
  };

  const patch = async (row: Bulk, values: Partial<Bulk>) => {
    const { error } = await supabase
      .from("bulk_orders")
      .update({ ...values, updated_at: new Date().toISOString() })
      .eq("id", row.id);
    if (error) setNotice({ kind: "err", text: error.message });
    await load();
  };

  const remove = async (row: Bulk) => {
    if (!window.confirm(`Remove ${row.company}?`)) return;
    const { error } = await supabase.from("bulk_orders").delete().eq("id", row.id);
    setNotice(error ? { kind: "err", text: error.message } : { kind: "ok", text: "Removed." });
    await load();
  };

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-10">
      <h1 className="font-display text-3xl font-bold">Partners & bulk orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {rows?.length ?? 0} enquiries stored in the database, updating live.
      </p>

      {notice && (
        <p
          className={`mt-5 rounded-2xl p-4 text-sm font-semibold ${
            notice.kind === "ok" ? "bg-veg-soft text-veg" : "bg-destructive/10 text-destructive"
          }`}
        >
          {notice.text}
        </p>
      )}

      <form onSubmit={add} className="mt-6 rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-xl font-bold">Add a partner enquiry</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-5">
          <input
            className="input"
            placeholder="Contact name"
            value={draft.customer_name}
            onChange={(e) => setDraft({ ...draft, customer_name: e.target.value })}
          />
          <input
            className="input"
            placeholder="Company"
            value={draft.company}
            onChange={(e) => setDraft({ ...draft, company: e.target.value })}
          />
          <input
            className="input"
            placeholder="Phone (10 digits)"
            value={draft.phone}
            onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
          />
          <input
            className="input"
            placeholder="Items"
            value={draft.items}
            onChange={(e) => setDraft({ ...draft, items: e.target.value })}
          />
          <input
            className="input"
            type="number"
            placeholder="Quantity"
            value={draft.qty}
            onChange={(e) => setDraft({ ...draft, qty: e.target.value })}
          />
        </div>
        <button className="mt-4 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
          Add enquiry
        </button>
      </form>

      {rows === null ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading enquiries…</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-3xl border border-border bg-card">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {["Partner", "Contact", "Items", "Qty", "Quoted", "Status", ""].map((h) => (
                  <th key={h} className="px-5 py-3 font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-4">
                    <p className="font-semibold">{r.company}</p>
                    <p className="text-xs text-muted-foreground">{r.customer_name}</p>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{r.phone}</td>
                  <td className="px-5 py-4 text-muted-foreground">{r.items}</td>
                  <td className="px-5 py-4">{r.qty}</td>
                  <td className="px-5 py-4">
                    <input
                      type="number"
                      defaultValue={r.quoted ?? ""}
                      placeholder="—"
                      onBlur={(e) =>
                        void patch(r, {
                          quoted: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                      className="w-24 rounded-xl border border-border bg-card px-3 py-1.5 text-sm font-semibold text-primary"
                    />
                    <span className="ml-2 text-xs text-muted-foreground">
                      {r.quoted ? rupees(Number(r.quoted)) : ""}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={r.status}
                      onChange={(e) => void patch(r, { status: e.target.value })}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold capitalize"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => void remove(r)}
                      className="text-xs font-bold text-destructive"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
