"use client";

import { useEffect } from "react";
import { AlertTriangle, LifeBuoy } from "lucide-react";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export default function GlobalError({
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
    <html lang="en">
      <body>
        <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10 sm:px-6">
          <section className="w-full border border-line bg-white p-6 sm:p-8">
            <div className="flex h-11 w-11 items-center justify-center rounded bg-red-50 text-red-700">
              <AlertTriangle className="h-5 w-5" aria-hidden />
            </div>
            <p className="mt-6 text-sm text-muted">Application error</p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight">
              AI Product Studio could not start
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              This is usually a temporary deployment or configuration issue. Try
              again, or contact support with the error reference.
            </p>
            <p className="mt-4 break-words border border-line bg-canvas p-3 text-xs text-muted">
              {error.digest ? `Error reference: ${error.digest}` : error.message}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reset}
                className="studio-focus inline-flex h-10 items-center rounded bg-action px-4 text-sm font-semibold text-white"
              >
                Try again
              </button>
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="studio-focus inline-flex h-10 items-center gap-2 rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas"
              >
                Contact support
                <LifeBuoy className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
