"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, CircleAlert, Loader2, LockKeyhole, Mail } from "lucide-react";
import type { AuthStatusType } from "@/lib/auth-messages";
import { createClient } from "@/utils/supabase/client";

export function LoginForm({
  initialStatus = "",
  initialStatusType = "idle",
  nextPath = "/dashboard"
}: {
  initialStatus?: string;
  initialStatusType?: AuthStatusType;
  nextPath?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [status, setStatus] = useState(initialStatus);
  const [statusType, setStatusType] = useState<AuthStatusType>(initialStatusType);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isStartingGoogle, setIsStartingGoogle] = useState(false);

  function getAuthRedirectUrl() {
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || window.location.origin).replace(/\/$/, "");
    return `${appUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`;
  }

  function resetStatus() {
    setStatus("");
    setStatusType("idle");
  }

  async function startGoogleSignIn() {
    setIsStartingGoogle(true);
    resetStatus();

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: getAuthRedirectUrl()
      }
    });

    if (error) {
      setStatus(error.message);
      setStatusType("error");
      setIsStartingGoogle(false);
    }
  }

  async function onPasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmittingPassword(true);
    resetStatus();

    const supabase = createClient();
    const action =
      authMode === "signup"
        ? supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: getAuthRedirectUrl()
            }
          })
        : supabase.auth.signInWithPassword({
            email,
            password
          });

    const { data, error } = await action;

    if (error) {
      setStatus(error.message);
      setStatusType("error");
    } else if (data.session) {
      window.location.assign(nextPath);
      return;
    } else if (authMode === "signup") {
      setStatus("Account created. Confirm your email if Supabase asks for verification, then sign in.");
      setStatusType("success");
    } else {
      setStatus("Signed in. Redirecting...");
      setStatusType("success");
      window.location.assign(nextPath);
      return;
    }

    setIsSubmittingPassword(false);
  }

  async function onMagicLinkSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSendingLink(true);
    resetStatus();

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getAuthRedirectUrl()
      }
    });

    if (error) {
      setStatus(error.message);
      setStatusType("error");
    } else {
      setStatus("Sign-in link sent. Open the email on this device to continue.");
      setStatusType("success");
    }

    setIsSendingLink(false);
  }

  const busy = isSendingLink || isSubmittingPassword || isStartingGoogle;

  return (
    <div className="border border-line bg-white p-6 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-ink text-white">
          <LockKeyhole className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Sign in</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Continue with Google, email and password, or a backup magic link.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={startGoogleSignIn}
        disabled={busy}
        className="studio-focus mt-6 inline-flex h-11 w-full items-center justify-center gap-3 rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas disabled:opacity-60"
      >
        {isStartingGoogle ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Opening Google...
          </>
        ) : (
          <>
            <span className="grid h-5 w-5 place-items-center rounded-full border border-line text-xs font-bold">
              G
            </span>
            Continue with Google
          </>
        )}
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" />
        <span>Email account</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="grid grid-cols-2 gap-2 rounded border border-line bg-canvas p-1">
        <button
          type="button"
          onClick={() => setAuthMode("signin")}
          className={`h-9 rounded text-sm font-semibold ${
            authMode === "signin" ? "bg-white text-ink shadow-sm" : "text-muted"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setAuthMode("signup")}
          className={`h-9 rounded text-sm font-semibold ${
            authMode === "signup" ? "bg-white text-ink shadow-sm" : "text-muted"
          }`}
        >
          Create account
        </button>
      </div>

      <form onSubmit={onPasswordSubmit} className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Email address</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="studio-focus mt-2 h-11 w-full rounded border border-line px-3 disabled:bg-canvas disabled:text-muted"
            placeholder="you@example.com"
            type="email"
            autoComplete="email"
            disabled={busy}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="studio-focus mt-2 h-11 w-full rounded border border-line px-3 disabled:bg-canvas disabled:text-muted"
            placeholder="At least 8 characters"
            type="password"
            autoComplete={authMode === "signup" ? "new-password" : "current-password"}
            minLength={8}
            disabled={busy}
            required
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="studio-focus inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmittingPassword ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {authMode === "signup" ? "Creating account..." : "Signing in..."}
            </>
          ) : authMode === "signup" ? (
            "Create account"
          ) : (
            "Sign in with password"
          )}
        </button>
      </form>

      <form onSubmit={onMagicLinkSubmit} className="mt-4 border-t border-line pt-4">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Mail className="h-4 w-4 text-action" aria-hidden />
          Backup magic link
        </p>
        <p className="mt-1 text-xs leading-5 text-muted">
          Use this if you forgot your password or cannot use Google.
        </p>
        <button
          type="submit"
          disabled={busy || !email}
          className="studio-focus mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas disabled:opacity-60"
        >
          {isSendingLink ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Sending link...
            </>
          ) : (
            "Send magic link"
          )}
        </button>
      </form>

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
    </div>
  );
}
