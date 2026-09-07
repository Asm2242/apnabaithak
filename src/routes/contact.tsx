import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { RESTAURANT, waLink } from "@/data/site";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Location | Apna Baithak, Eldeco City Lucknow" },
      {
        name: "description",
        content:
          "Call +91 9454999442 or visit Apna Baithak in Eldeco City, Lucknow. Open 7:30 AM to 10 PM daily. Bulk and party orders welcome.",
      },
      { property: "og:title", content: "Contact Apna Baithak" },
      {
        property: "og:description",
        content: "Address, phone, timings and bulk order enquiries.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", people: "", date: "", message: "" });
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <PageHero
        eyebrow="Say hello"
        title="Contact Us"
        subtitle="Reservations, bulk orders or a quick question about the menu — we're one call away."
      />

      <section className="mx-auto max-w-[1400px] px-5 py-14">
        <div className="grid gap-6 md:grid-cols-3">
          <a
            href={`tel:${RESTAURANT.phone}`}
            className="rounded-3xl border border-border bg-card p-7 transition-shadow hover:shadow-lg"
          >
            <Phone className="size-7 text-primary" />
            <h2 className="mt-4 font-display text-lg font-bold">Call us</h2>
            <p className="mt-1 text-sm text-muted-foreground">{RESTAURANT.phoneDisplay}</p>
          </a>
          <a
            href={waLink("Hi Apna Baithak!")}
            target="_blank"
            rel="noreferrer"
            className="rounded-3xl border border-border bg-card p-7 transition-shadow hover:shadow-lg"
          >
            <MessageCircle className="size-7 text-veg" />
            <h2 className="mt-4 font-display text-lg font-bold">WhatsApp</h2>
            <p className="mt-1 text-sm text-muted-foreground">Order or ask, we reply fast</p>
          </a>
          <div className="rounded-3xl border border-border bg-card p-7">
            <Clock className="size-7 text-primary" />
            <h2 className="mt-4 font-display text-lg font-bold">Timings</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {RESTAURANT.hours} • {RESTAURANT.days}
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-7">
            <h2 className="font-display text-2xl font-bold">Bulk & party enquiry</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tell us the headcount and date, and we'll send a quote.
            </p>
            {sent ? (
              <div className="mt-6 rounded-2xl bg-veg-soft p-6 text-center">
                <p className="font-display text-lg font-bold text-veg">Enquiry noted!</p>
                <p className="mt-1 text-sm text-veg/80">
                  We'll ring you on {form.phone || "your number"} shortly.
                </p>
              </div>
            ) : (
              <form
                className="mt-6 grid gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <Field label="Your name">
                  <input
                    required
                    value={form.name}
                    onChange={set("name")}
                    className="input"
                    placeholder="Full name"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Phone">
                    <input
                      required
                      pattern="[0-9]{10}"
                      value={form.phone}
                      onChange={set("phone")}
                      className="input"
                      placeholder="10-digit number"
                    />
                  </Field>
                  <Field label="Number of people">
                    <input
                      type="number"
                      min={1}
                      value={form.people}
                      onChange={set("people")}
                      className="input"
                      placeholder="e.g. 50"
                    />
                  </Field>
                </div>
                <Field label="Delivery date">
                  <input type="date" value={form.date} onChange={set("date")} className="input" />
                </Field>
                <Field label="What do you need?">
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={set("message")}
                    className="input"
                    placeholder="Thali x50, mini combos, etc."
                  />
                </Field>
                <button className="rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground">
                  Send enquiry
                </button>
              </form>
            )}
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <iframe
              title="Apna Baithak location map"
              className="h-72 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=26.9381402,80.9129123&z=17&output=embed"
            />
            <div className="p-7">
              <h2 className="font-display text-2xl font-bold">Find us</h2>
              <p className="mt-3 flex gap-3 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
                {RESTAURANT.address}
              </p>
              <a
                href={RESTAURANT.maps}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-block rounded-full bg-ink px-6 py-3 text-sm font-bold text-ink-foreground"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
