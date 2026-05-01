import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  if (!code) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "The sign-in link is missing an authorization code.");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) throw error;

    return NextResponse.redirect(new URL(next, requestUrl.origin));
  } catch (error) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set(
      "error",
      error instanceof Error ? error.message : "Could not finish signing in."
    );
    return NextResponse.redirect(loginUrl);
  }
}
