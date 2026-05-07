import { NextResponse } from "next/server";
import { deleteCurrentAccountData } from "@/lib/account-data";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (body.confirmation !== "DELETE") {
    return NextResponse.json(
      { error: "Type DELETE to confirm account deletion." },
      { status: 400 }
    );
  }

  try {
    const result = await deleteCurrentAccountData();
    const supabase = await createClient();
    await supabase.auth.signOut();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Account deletion failed."
      },
      { status: 500 }
    );
  }
}
