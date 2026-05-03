import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, LifeBuoy } from "lucide-react";
import { siteConfig } from "@/lib/site";

type EmptyStateAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

export function EmptyState({
  icon: Icon,
  eyebrow,
  title,
  body,
  detail,
  actions = []
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
  detail?: string;
  actions?: EmptyStateAction[];
}) {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center py-12">
      <div className="w-full border border-line bg-white p-6 sm:p-8">
        <div className="flex h-11 w-11 items-center justify-center rounded bg-emerald-50 text-action">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <p className="mt-6 text-sm text-muted">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
        {detail ? (
          <p className="mt-4 break-words border border-line bg-canvas p-3 text-xs text-muted">
            {detail}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`studio-focus inline-flex h-10 items-center gap-2 rounded px-4 text-sm font-semibold ${
                action.variant === "secondary"
                  ? "border border-line bg-white hover:bg-canvas"
                  : "bg-action text-white"
              }`}
            >
              {action.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ))}
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="studio-focus inline-flex h-10 items-center gap-2 rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas"
          >
            Contact support
            <LifeBuoy className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
