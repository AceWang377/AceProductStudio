"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, CircleAlert, Loader2, Mail } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function LoginForm({
  initialStatus = "",
  nextPath = "/dashboard"
}: {
  initialStatus?: string;
  nextPath?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [statusType, setStatusType] = useState<"idle" | "success" | "error">(
    initialStatus ? "error" : "idle"
  );
  const [isSending, setIsSending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setStatus("");
    setStatusType("idle");

    const supabase = createClient();
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, "");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${appUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`
      }
    });

    if (error) {
      setStatus(error.message);
      setStatusType("error");
    } else {
      setStatus("Sign-in link sent. Open the email on this device to continue.");
      setStatusType("success");
    }

    setIsSending(false);
  }

  return (
    <form onSubmit={onSubmit} className="border border-line bg-white p-6 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-ink text-white">
          <Mail className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Email sign-in</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            We will send a secure one-time link. No password is required.
          </p>
        </div>
      </div>
      <label className="mt-6 block">
        <span className="text-sm font-medium">Email address</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="studio-focus mt-2 h-11 w-full rounded border border-line px-3 disabled:bg-canvas disabled:text-muted"
          placeholder="you@example.com"
          type="email"
          disabled={isSending}
          required
        />
      </label>
      <button
        type="submit"
        disabled={isSending}
        className="studio-focus mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isSending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Sending link...
          </>
        ) : (
          "Send sign-in link"
        )}
      </button>
      {status ? (
        <div
          className={`mt-4 flex items-start gap-2 border p-3 text-sm ${
            statusType === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {statusType === "error" ? (
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          )}
          <p>{status}</p>
        </div>
      ) : null}
    </form>
  );
}
