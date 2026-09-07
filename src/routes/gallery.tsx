import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { GALLERY } from "@/data/site";
import { PageHero } from "@/components/PageHero";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Restaurant & Food Photos | Apna Baithak" },
      {
        name: "description",
        content:
          "Photos of the Apna Baithak restaurant in Eldeco City, Lucknow and our pure vegetarian dishes — thali, chaap, momos and more.",
      },
      { property: "og:title", content: "Gallery — Apna Baithak" },
      { property: "og:description", content: "Inside our baithak and the food we serve." },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const [filter, setFilter] = useState<"All" | "Restaurant" | "Food">("All");
  const [active, setActive] = useState<number | null>(null);
  const shown = GALLERY.filter((g) => filter === "All" || g.kind === filter);

  return (
    <>
      <PageHero
        eyebrow="Take a look"
        title="Gallery"
        subtitle="Our restaurant after dark, the live wok, and the plates that keep people coming back."
      />

      <section className="mx-auto max-w-[1400px] px-5 py-12">
        <div className="mb-8 flex justify-center gap-2">
          {(["All", "Restaurant", "Food"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
                filter === f ? "border-ink bg-ink text-ink-foreground" : "border-border bg-card"
              }`}
            >
              {f}
              <span className="ml-2 text-xs opacity-60">
                {f === "All" ? GALLERY.length : GALLERY.filter((g) => g.kind === f).length}
              </span>
            </button>
          ))}
        </div>

        <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {shown.map((g, i) => (
            <button
              key={g.src}
              onClick={() => setActive(i)}
              className="group mb-4 block w-full overflow-hidden rounded-3xl border border-border bg-card"
            >
              <img
                src={g.src}
                alt={g.caption}
                loading="lazy"
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="block px-4 py-3 text-left text-xs font-semibold capitalize text-muted-foreground">
                {g.caption}
              </span>
            </button>
          ))}
        </div>
      </section>

      {active !== null && shown[active] && (
        <div
          className="fixed inset-0 z-60 grid place-items-center bg-ink/90 p-5"
          onClick={() => setActive(null)}
        >
          <button
            aria-label="Close image"
            className="absolute right-5 top-5 grid size-11 place-items-center rounded-full bg-ink-foreground/15 text-ink-foreground"
            onClick={() => setActive(null)}
          >
            <X className="size-5" />
          </button>
          <figure onClick={(e) => e.stopPropagation()} className="max-w-3xl">
            <img
              src={shown[active].src}
              alt={shown[active].caption}
              className="max-h-[75vh] w-full rounded-3xl object-contain"
            />
            <figcaption className="mt-3 text-center text-sm capitalize text-ink-foreground/80">
              {shown[active].caption}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
