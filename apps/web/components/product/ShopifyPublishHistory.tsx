import { AlertCircle, CheckCircle2, ExternalLink, Store } from "lucide-react";
import type { ShopifyPublishEvent } from "@/lib/shopify-publish-history";

export function ShopifyPublishHistory({ events }: { events: ShopifyPublishEvent[] }) {
  return (
    <div className="border border-line bg-white p-4 sm:p-6">
      <div className="flex items-center gap-2">
        <Store className="h-5 w-5" aria-hidden />
        <h2 className="text-xl font-semibold">Shopify history</h2>
      </div>
      <p className="mt-2 text-sm text-muted">
        Recent draft and publish attempts for this product.
      </p>

      {events.length ? (
        <div className="mt-5 divide-y divide-line border-y border-line">
          {events.map((event) => (
            <div key={event.id} className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {event.status === "COMPLETED" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-action" aria-hidden />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 text-red-700" aria-hidden />
                  )}
                  <div>
                    <p className="text-sm font-semibold">
                      {event.status === "COMPLETED" ? `${event.mode} product created` : "Publish failed"}
                    </p>
                    <p className="mt-1 text-xs text-muted">{formatPublishTime(event.updatedAt)}</p>
                  </div>
                </div>
                {event.adminUrl ? (
                  <a
                    href={event.adminUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="studio-focus inline-flex items-center gap-1 text-xs font-semibold text-action underline-offset-4 hover:underline"
                  >
                    Open Shopify <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                ) : null}
              </div>

              {event.status === "COMPLETED" ? (
                <dl className="mt-3 grid gap-2 text-xs text-muted sm:grid-cols-3">
                  <PublishStat label="Images" value={formatCount(event.uploadedImageCount)} />
                  <PublishStat label="Skipped" value={`${event.skippedImageCount}`} />
                  <PublishStat label="Handle" value={event.handle || "Pending"} />
                </dl>
              ) : null}

              {event.error ? (
                <details className="mt-3 border border-red-100 bg-red-50 p-3 text-xs text-red-800">
                  <summary className="cursor-pointer font-semibold">Show publish error</summary>
                  <p className="mt-2 break-words leading-5">{event.error}</p>
                </details>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 border border-line bg-canvas p-4 text-sm text-muted">
          No Shopify publish attempts yet.
        </div>
      )}
    </div>
  );
}

function PublishStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className="mt-1 truncate font-semibold text-ink">{value}</dd>
    </div>
  );
}

function formatCount(value?: number) {
  return value === undefined ? "Unknown" : `${value}`;
}

function formatPublishTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}
