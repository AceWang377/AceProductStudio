import { NextResponse } from "next/server";
import { getLaunchReadiness, summarizeReadiness } from "@/lib/launch-readiness";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const groups = await getLaunchReadiness();
    const summary = summarizeReadiness(groups);

    return NextResponse.json(
      {
        ok: summary.launchReady,
        ready: summary.ready,
        warnings: summary.warnings,
        missing: summary.missing,
        total: summary.total,
        checkedAt: new Date().toISOString()
      },
      {
        status: summary.launchReady ? 200 : 503,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Health check failed",
        checkedAt: new Date().toISOString()
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }
}
