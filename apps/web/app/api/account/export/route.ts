import { requireCurrentUser } from "@/lib/auth";
import { exportCurrentAccountData } from "@/lib/account-data";

export const dynamic = "force-dynamic";

function timestamp() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET() {
  await requireCurrentUser();
  const data = await exportCurrentAccountData();

  return Response.json(data, {
    headers: {
      "Content-Disposition": `attachment; filename="acestudio-account-export-${timestamp()}.json"`,
      "Cache-Control": "no-store"
    }
  });
}
