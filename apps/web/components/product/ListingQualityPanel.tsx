"use client";

import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Gauge,
  ImageIcon,
  PenLine,
  ShoppingBag,
  Store
} from "lucide-react";
import type { ProductReadiness, ReadinessGroup, ReadinessTab } from "@/lib/product-readiness";

const groupLabels: Record<ReadinessGroup, string> = {
  connection: "Connection",
  media: "Media",
  copy: "Copy",
  commerce: "Commerce"
};

const groupIcons: Record<ReadinessGroup, typeof Store> = {
  connection: Store,
  media: ImageIcon,
  copy: PenLine,
  commerce: ShoppingBag
};

export function ListingQualityPanel({
  readiness,
  onOpenTab
}: {
  readiness: ProductReadiness;
  onOpenTab: (tab: ReadinessTab) => void;
}) {
  const grouped = Object.entries(groupLabels).map(([group, label]) => {
    const items = readiness.items.filter((item) => item.group === group);
    const complete = items.filter((item) => item.complete).length;
    return { group: group as ReadinessGroup, label, items, complete };
  });

  return (
    <div className="border border-line bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Gauge className="mt-0.5 h-5 w-5 text-action" aria-hidden />
          <div>
            <h2 className="text-base font-semibold">Listing quality</h2>
            <p className="mt-1 text-sm text-muted">{readiness.level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold leading-none">{readiness.score}</p>
          <p className="mt-1 text-xs text-muted">/100</p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded bg-canvas">
        <div
          className="h-full rounded bg-action transition-[width]"
          style={{ width: `${readiness.score}%` }}
        />
      </div>

      {readiness.nextItem ? (
        <button
          type="button"
          onClick={() => onOpenTab(readiness.nextItem!.tab)}
          className="studio-focus mt-4 flex w-full items-center justify-between gap-3 rounded border border-line bg-canvas px-3 py-3 text-left text-sm hover:bg-white"
        >
          <span>
            <span className="block font-semibold">Next fix: {readiness.nextItem.label}</span>
            <span className="mt-1 block text-xs text-muted">{readiness.nextItem.detail}</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-action" aria-hidden />
        </button>
      ) : (
        <div className="mt-4 flex items-start gap-3 rounded border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-900">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>This listing is ready for a Shopify draft review.</p>
        </div>
      )}

      <div className="mt-4 divide-y divide-line border-y border-line">
        {grouped.map(({ group, label, items, complete }) => {
          const Icon = groupIcons[group];
          return (
            <details key={group} className="group py-3" open={group === readiness.nextItem?.group}>
              <summary className="studio-focus flex cursor-pointer list-none items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-semibold">
                  <Icon className="h-4 w-4 text-muted" aria-hidden />
                  {label}
                </span>
                <span className="text-xs text-muted">
                  {complete}/{items.length}
                </span>
              </summary>
              <div className="mt-3 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    {item.complete ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-action" aria-hidden />
                    ) : (
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs leading-5 text-muted">{item.detail}</p>
                    </div>
                    {!item.complete ? (
                      <button
                        type="button"
                        onClick={() => onOpenTab(item.tab)}
                        className="studio-focus shrink-0 rounded px-2 py-1 text-xs font-semibold text-action hover:bg-canvas"
                      >
                        Fix
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
