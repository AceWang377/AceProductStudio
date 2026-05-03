"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { EmptyState } from "@/components/system/EmptyState";

export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <EmptyState
        icon={AlertTriangle}
        eyebrow="Something went wrong"
        title="This page could not load"
        body="Try again once. If it keeps happening, contact support and include the error reference below."
        detail={error.digest ? `Error reference: ${error.digest}` : error.message}
        actions={[
          { href: "/dashboard", label: "Back to dashboard" },
          { href: "/launch", label: "Check launch status", variant: "secondary" }
        ]}
      />
      <div className="mx-auto -mt-8 max-w-2xl">
        <button
          type="button"
          onClick={reset}
          className="studio-focus inline-flex h-10 items-center gap-2 rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas"
        >
          Try again
          <RefreshCw className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
