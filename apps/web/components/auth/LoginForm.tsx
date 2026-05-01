"use client";

import { FormEvent, useState } from "react";
import { Mail } from "lucide-react";
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
  const [isSending, setIsSending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setStatus("");

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
    } else {
      setStatus("Check your email for the sign-in link.");
    }

    setIsSending(false);
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md border border-line bg-white p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded bg-ink text-white">
        <Mail className="h-5 w-5" aria-hidden />
      </div>
      <h1 className="mt-5 text-2xl font-semibold">Sign in to AI Product Studio</h1>
      <p className="mt-2 text-sm text-muted">
        Use your email to access your own products, Shopify stores, jobs, and future credit balance.
      </p>
      <label className="mt-6 block">
        <span className="text-sm font-medium">Email address</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="studio-focus mt-2 h-11 w-full rounded border border-line px-3"
          placeholder="you@example.com"
          type="email"
          required
        />
      </label>
      <button
        type="submit"
        disabled={isSending}
        className="studio-focus mt-4 h-11 w-full rounded bg-action px-4 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isSending ? "Sending link..." : "Send sign-in link"}
      </button>
      {status ? <p className="mt-4 text-sm text-muted">{status}</p> : null}
    </form>
  );
}
