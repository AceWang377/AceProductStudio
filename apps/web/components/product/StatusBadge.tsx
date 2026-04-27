import { statusLabel } from "@/lib/status";
import type { JobStatus, ProductStatus, ShopifyStatus } from "@/lib/types";
import clsx from "clsx";

export function StatusBadge({
  status
}: {
  status: ProductStatus | ShopifyStatus | JobStatus;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded px-2 py-1 text-xs font-medium",
        status.includes("FAILED")
          ? "bg-red-50 text-red-700"
          : status.includes("READY") || status.includes("COMPLETED")
            ? "bg-emerald-50 text-emerald-700"
            : status.includes("PROCESSING") || status.includes("GENERATING")
              ? "bg-blue-50 text-blue-700"
              : "bg-stone-100 text-stone-700"
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
