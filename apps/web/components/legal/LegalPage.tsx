import type { ReactNode } from "react";

export function LegalPage({
  eyebrow,
  title,
  updated,
  children
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="border-b border-line pb-6">
        <p className="text-sm text-muted">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm text-muted">Last updated: {updated}</p>
      </div>
      <div className="legal-copy mt-6 space-y-7 text-sm leading-7 text-muted">{children}</div>
    </div>
  );
}

export function LegalSection({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}
