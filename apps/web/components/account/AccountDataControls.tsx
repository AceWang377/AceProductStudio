"use client";

import { useState } from "react";
import { Download, Loader2, Trash2 } from "lucide-react";

export function AccountDataControls() {
  const [confirmation, setConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const canDelete = confirmation === "DELETE";

  async function deleteAccount() {
    if (!canDelete || isDeleting) return;
    setIsDeleting(true);
    setMessage("");

    const response = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation })
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setMessage(payload.error || "Account deletion failed.");
      setIsDeleting(false);
      return;
    }

    window.location.assign("/login?status=account_deleted");
  }

  return (
    <div className="space-y-4">
      <div className="border border-line bg-white p-5">
        <div className="flex items-start gap-3">
          <Download className="mt-0.5 h-5 w-5 text-action" aria-hidden />
          <div>
            <h2 className="font-semibold">Account data export</h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Download a JSON export with products, generated media records, jobs, credit history, and Shopify connection
              hints. Secrets are excluded.
            </p>
            <a
              href="/api/account/export"
              className="studio-focus mt-4 inline-flex h-10 items-center gap-2 rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas"
            >
              Download JSON export
              <Download className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </div>
      </div>

      <div className="border border-red-200 bg-red-50 p-5 text-red-900">
        <div className="flex items-start gap-3">
          <Trash2 className="mt-0.5 h-5 w-5" aria-hidden />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">Delete account data</h2>
            <p className="mt-1 text-sm leading-6">
              Permanently deletes your products, generated image records, jobs, store connection, credit ledger, and
              login account. This cannot be undone.
            </p>
            <label className="mt-4 block text-sm font-semibold">
              Type DELETE to confirm
              <input
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className="studio-focus mt-2 h-10 w-full rounded border border-red-200 bg-white px-3 text-ink"
                placeholder="DELETE"
                disabled={isDeleting}
              />
            </label>
            <button
              type="button"
              onClick={deleteAccount}
              disabled={!canDelete || isDeleting}
              className="studio-focus mt-3 inline-flex h-10 items-center gap-2 rounded bg-red-700 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Trash2 className="h-4 w-4" aria-hidden />}
              Delete account
            </button>
            {message ? <p className="mt-3 break-words text-sm font-semibold">{message}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
