import "server-only";
import { randomUUID } from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/credits";
import { createSupabaseAdminClient, isSupabaseStorageEnabled } from "@/lib/supabase-admin";

export type RateLimitResult = {
  ok: boolean;
  enabled: boolean;
  limit: number;
  remaining: number;
  resetAt: string;
  retryAfterSeconds: number;
  userId?: string;
  error?: string;
  isUnlimited?: boolean;
};

type RateLimitInput = {
  key: "upload_image" | "copy_generation" | "image_generation";
  limit: number;
  windowSeconds: number;
};

type StorageError = {
  code?: string;
  message?: string;
};

function isMissingRateLimitTableError(error: StorageError | null | undefined) {
  const message = error?.message?.toLowerCase() ?? "";
  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    message.includes("rate_limits") ||
    message.includes("could not find the table") ||
    (message.includes("relation") && message.includes("does not exist"))
  );
}

function getWindowStart(now: Date, windowSeconds: number) {
  const windowMs = windowSeconds * 1000;
  return new Date(Math.floor(now.getTime() / windowMs) * windowMs);
}

export async function enforceRateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  const now = new Date();
  const windowStart = getWindowStart(now, input.windowSeconds);
  const resetAt = new Date(windowStart.getTime() + input.windowSeconds * 1000);
  const retryAfterSeconds = Math.max(1, Math.ceil((resetAt.getTime() - now.getTime()) / 1000));

  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      enabled: true,
      limit: input.limit,
      remaining: 0,
      resetAt: resetAt.toISOString(),
      retryAfterSeconds,
      error: "Sign in before using this action."
    };
  }

  if (isAdminEmail(user.email)) {
    return {
      ok: true,
      enabled: true,
      limit: input.limit,
      remaining: input.limit,
      resetAt: resetAt.toISOString(),
      retryAfterSeconds,
      userId: user.id,
      isUnlimited: true
    };
  }

  if (!isSupabaseStorageEnabled()) {
    return {
      ok: true,
      enabled: false,
      limit: input.limit,
      remaining: input.limit,
      resetAt: resetAt.toISOString(),
      retryAfterSeconds,
      userId: user.id
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data: existing, error: selectError } = await supabase
    .from("rate_limits")
    .select("id,count")
    .eq("user_id", user.id)
    .eq("action_key", input.key)
    .eq("window_start", windowStart.toISOString())
    .maybeSingle();

  if (selectError) {
    if (isMissingRateLimitTableError(selectError)) {
      return {
        ok: true,
        enabled: false,
        limit: input.limit,
        remaining: input.limit,
        resetAt: resetAt.toISOString(),
        retryAfterSeconds,
        userId: user.id
      };
    }
    throw new Error(`Could not check rate limit: ${selectError.message}`);
  }

  const currentCount = Number(existing?.count ?? 0);
  if (currentCount >= input.limit) {
    return {
      ok: false,
      enabled: true,
      limit: input.limit,
      remaining: 0,
      resetAt: resetAt.toISOString(),
      retryAfterSeconds,
      userId: user.id,
      error: `Limit reached for this action. Try again after ${resetAt.toISOString()}.`
    };
  }

  const nextCount = currentCount + 1;
  const write = existing
    ? await supabase
        .from("rate_limits")
        .update({ count: nextCount, updated_at: now.toISOString() })
        .eq("id", existing.id)
    : await supabase.from("rate_limits").insert({
        id: randomUUID(),
        user_id: user.id,
        action_key: input.key,
        window_start: windowStart.toISOString(),
        count: nextCount,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      });

  if (write.error) {
    if (isMissingRateLimitTableError(write.error)) {
      return {
        ok: true,
        enabled: false,
        limit: input.limit,
        remaining: input.limit,
        resetAt: resetAt.toISOString(),
        retryAfterSeconds,
        userId: user.id
      };
    }
    throw new Error(`Could not update rate limit: ${write.error.message}`);
  }

  return {
    ok: true,
    enabled: true,
    limit: input.limit,
    remaining: Math.max(0, input.limit - nextCount),
    resetAt: resetAt.toISOString(),
    retryAfterSeconds,
    userId: user.id
  };
}

export function rateLimitHeaders(result: RateLimitResult) {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": result.resetAt,
    ...(result.ok ? {} : { "Retry-After": String(result.retryAfterSeconds) })
  };
}
