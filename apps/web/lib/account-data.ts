import "server-only";
import { getCurrentUser } from "@/lib/auth";
import { listCreditLedger } from "@/lib/credits";
import { deleteStoredMedia } from "@/lib/media-storage";
import { createSupabaseAdminClient, isSupabaseStorageEnabled } from "@/lib/supabase-admin";
import { listProducts, readState } from "@/lib/store";

type StorageError = {
  code?: string;
  message?: string;
};

function isMissingTableError(error: StorageError | null | undefined) {
  const message = error?.message?.toLowerCase() ?? "";
  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    message.includes("could not find the table") ||
    (message.includes("relation") && message.includes("does not exist"))
  );
}

export async function exportCurrentAccountData() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in before exporting account data.");

  const [products, credits, state] = await Promise.all([
    listProducts(),
    listCreditLedger(1000),
    readState()
  ]);

  return {
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email ?? null
    },
    shopifyConnection: state.shopifyConnection
      ? {
          shopDomain: state.shopifyConnection.shopDomain,
          isActive: state.shopifyConnection.isActive,
          accessTokenHint: state.shopifyConnection.accessTokenHint,
          webhookStatus: state.shopifyConnection.webhookStatus,
          webhookCallbackUrl: state.shopifyConnection.webhookCallbackUrl,
          webhookLastRegisteredAt: state.shopifyConnection.webhookLastRegisteredAt,
          webhookLastError: state.shopifyConnection.webhookLastError
        }
      : null,
    products,
    credits,
    note:
      "Shopify access tokens, client secrets, Supabase service keys, Stripe secrets, and OpenAI keys are never included in account exports."
  };
}

export async function deleteCurrentAccountData() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in before deleting account data.");
  if (!isSupabaseStorageEnabled()) {
    throw new Error("Supabase service role is required before account deletion can run.");
  }

  const supabase = createSupabaseAdminClient();
  const userId = user.id;
  const { data: imageRows, error: imageError } = await supabase
    .from("product_images")
    .select("storage_key")
    .eq("user_id", userId);

  if (imageError && !isMissingTableError(imageError)) {
    throw new Error(`Could not load stored images for deletion: ${imageError.message}`);
  }

  await deleteStoredMedia(
    ((imageRows ?? []) as Array<{ storage_key?: string | null }>).map((row) => row.storage_key)
  ).catch(() => null);

  const deleteSteps = [
    supabase.from("growth_monitor_runs").delete().eq("user_id", userId),
    supabase.from("rate_limits").delete().eq("user_id", userId),
    supabase.from("credit_ledger").delete().eq("user_id", userId),
    supabase.from("credit_accounts").delete().eq("user_id", userId),
    supabase.from("jobs").delete().eq("user_id", userId),
    supabase.from("product_images").delete().eq("user_id", userId),
    supabase.from("products").delete().eq("user_id", userId),
    supabase.from("stores").delete().eq("user_id", userId)
  ];

  for (const step of deleteSteps) {
    const { error } = await step;
    if (error && !isMissingTableError(error)) {
      throw new Error(`Could not delete account data: ${error.message}`);
    }
  }

  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) throw new Error(`Could not delete Supabase auth user: ${authError.message}`);

  return {
    deletedAt: new Date().toISOString(),
    userId,
    email: user.email ?? null
  };
}
