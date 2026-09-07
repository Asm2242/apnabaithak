import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <section className="hero-surface text-ink-foreground">
      <div className="mx-auto max-w-[1100px] px-5 py-16 text-center md:py-20">
        {eyebrow && (
          <span className="inline-block rounded-full border border-ink-foreground/20 bg-ink-foreground/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-5 font-display text-4xl font-bold leading-tight md:text-6xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-sm text-ink-foreground/75 md:text-base">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
