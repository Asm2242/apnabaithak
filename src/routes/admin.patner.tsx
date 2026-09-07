import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BULK_ORDERS, type BulkOrder } from "@/data/site";
import { rupees } from "@/lib/shop";

export const Route = createFileRoute("/admin/patner")({
  component: AdminPartners,
});

function AdminPartners() {
  const [rows, setRows] = useState<BulkOrder[]>(BULK_ORDERS);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [draft, setDraft] = useState({ customer: "", company: "", phone: "", items: "", qty: "" });

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (draft.customer.trim().length < 2) {
      setNotice({ kind: "err", text: "Enter the partner or contact name." });
      return;
    }
    if (!/^\d{10}$/.test(draft.phone)) {
      setNotice({ kind: "err", text: "Phone must be a 10-digit number." });
      return;
    }
    setRows((prev) => [
      {
        id: `bulk-${Date.now()}`,
        customer: draft.customer.trim(),
        company: draft.company.trim() || draft.customer.trim(),
        phone: draft.phone,
        email: "",
        items: draft.items.trim() || "To be confirmed",
        qty: Number(draft.qty) || 0,
        delivery: "—",
        quoted: null,
        status: "new",
        created: new Date().toLocaleString("en-IN"),
      },
      ...prev,
    ]);
    setDraft({ customer: "", company: "", phone: "", items: "", qty: "" });
    setNotice({ kind: "ok", text: "Partner enquiry added." });
  };

  return (
    <main className="mx-auto max-w-[1400px] px-5 py-10">
      <h1 className="font-display text-3xl font-bold">Partners & bulk orders</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {rows.length} partner enquiries. Quotes and statuses become permanent once the database is
        connected.
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
            value={draft.customer}
            onChange={(e) => setDraft({ ...draft, customer: e.target.value })}
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

      <div className="mt-6 overflow-x-auto rounded-3xl border border-border bg-card">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {["Partner", "Contact", "Items", "Qty", "Delivery", "Quoted", "Status", ""].map(
                (h) => (
                  <th key={h} className="px-5 py-3 font-bold">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-5 py-4">
                  <p className="font-semibold">{r.company}</p>
                  <p className="text-xs text-muted-foreground">{r.customer}</p>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{r.phone}</td>
                <td className="px-5 py-4 text-muted-foreground">{r.items}</td>
                <td className="px-5 py-4">{r.qty}</td>
                <td className="px-5 py-4 text-muted-foreground">{r.delivery}</td>
                <td className="px-5 py-4 font-semibold text-primary">
                  {r.quoted ? rupees(r.quoted) : "—"}
                </td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold capitalize">
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => {
                      setRows((prev) => prev.filter((x) => x.id !== r.id));
                      setNotice({ kind: "ok", text: `Removed ${r.company}.` });
                    }}
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
    </main>
  );
}
