import "server-only";
import { createSupabaseAdminClient, isSupabaseStorageEnabled } from "@/lib/supabase-admin";

type StorageError = {
  code?: string;
  message?: string;
};

function isMissingJobsTable(error: StorageError | null | undefined) {
  const message = error?.message?.toLowerCase() ?? "";
  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    message.includes("could not find the table") ||
    (message.includes("relation") && message.includes("does not exist"))
  );
}

export async function markStaleJobsFailed(options?: { olderThanMinutes?: number }) {
  const olderThanMinutes = options?.olderThanMinutes ?? 45;
  if (!isSupabaseStorageEnabled()) {
    return {
      enabled: false,
      staleJobsMarked: 0,
      cutoff: new Date(Date.now() - olderThanMinutes * 60 * 1000).toISOString()
    };
  }

  const supabase = createSupabaseAdminClient();
  const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000).toISOString();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("jobs")
    .update({
      status: "FAILED",
      progress: 100,
      error:
        "This job was marked failed by maintenance because it stayed queued or processing for too long. Please retry the action.",
      updated_at: now
    })
    .in("status", ["QUEUED", "PROCESSING"])
    .lt("updated_at", cutoff)
    .select("id");

  if (error) {
    if (isMissingJobsTable(error)) {
      return { enabled: false, staleJobsMarked: 0, cutoff };
    }
    throw new Error(`Could not mark stale jobs failed: ${error.message}`);
  }

  return {
    enabled: true,
    staleJobsMarked: (data ?? []).length,
    cutoff
  };
}
