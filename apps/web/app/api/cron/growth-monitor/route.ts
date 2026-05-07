import { NextResponse } from "next/server";
import { runGrowthMonitor } from "@/lib/growth-monitoring";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const output = await runGrowthMonitor({});
    return NextResponse.json({
      ok: true,
      checkedAt: new Date().toISOString(),
      output
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        checkedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Growth monitor cron failed."
      },
      { status: 500 }
    );
  }
}
