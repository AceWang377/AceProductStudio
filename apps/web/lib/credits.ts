import "server-only";
import { randomUUID } from "crypto";
import { getCurrentUser } from "./auth";
import {
  createSupabaseAdminClient,
  isSupabaseStorageEnabled
} from "./supabase-admin";

export const TRIAL_CREDITS = 20;
export const IMAGE_GENERATION_CREDIT_COST = 1;
export const COPY_GENERATION_CREDIT_COST = 0;

export type CreditAccount = {
  balance: number;
  enabled: boolean;
};

async function getCurrentUserId() {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

export async function getCreditAccount(): Promise<CreditAccount> {
  if (!isSupabaseStorageEnabled()) {
    return { balance: TRIAL_CREDITS, enabled: false };
  }

  const userId = await getCurrentUserId();
  if (!userId) return { balance: 0, enabled: true };

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("credit_accounts")
    .select("balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`Could not load credits: ${error.message}`);
  if (data) return { balance: Number(data.balance ?? 0), enabled: true };

  const { data: inserted, error: insertError } = await supabase
    .from("credit_accounts")
    .insert({
      user_id: userId,
      balance: TRIAL_CREDITS,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select("balance")
    .single();

  if (insertError) throw new Error(`Could not create credit account: ${insertError.message}`);

  await supabase.from("credit_ledger").insert({
    id: randomUUID(),
    user_id: userId,
    amount: TRIAL_CREDITS,
    reason: "trial_credits",
    created_at: new Date().toISOString()
  });

  return { balance: Number(inserted.balance ?? TRIAL_CREDITS), enabled: true };
}

export async function spendCredits(input: {
  amount: number;
  reason: string;
  productId?: string;
}) {
  if (!isSupabaseStorageEnabled()) {
    return { ok: true, balance: TRIAL_CREDITS, enabled: false };
  }

  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Sign in before using credits.");

  const amount = Math.max(0, Math.floor(input.amount));
  const account = await getCreditAccount();
  if (amount === 0) return { ok: true, balance: account.balance, enabled: true };

  if (account.balance < amount) {
    return {
      ok: false,
      balance: account.balance,
      enabled: true,
      error: `Not enough credits. This action needs ${amount} credits, but you have ${account.balance}.`
    };
  }

  const nextBalance = account.balance - amount;
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("credit_accounts")
    .update({ balance: nextBalance, updated_at: now })
    .eq("user_id", userId);

  if (updateError) throw new Error(`Could not spend credits: ${updateError.message}`);

  const { error: ledgerError } = await supabase.from("credit_ledger").insert({
    id: randomUUID(),
    user_id: userId,
    amount: -amount,
    reason: input.reason,
    product_id: input.productId ?? null,
    created_at: now
  });

  if (ledgerError) throw new Error(`Could not record credit usage: ${ledgerError.message}`);

  return { ok: true, balance: nextBalance, enabled: true };
}

export async function grantCredits(input: {
  amount: number;
  reason: string;
  productId?: string;
}) {
  if (!isSupabaseStorageEnabled()) {
    return { balance: TRIAL_CREDITS, enabled: false };
  }

  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Sign in before using credits.");

  const amount = Math.max(0, Math.floor(input.amount));
  const account = await getCreditAccount();
  const nextBalance = account.balance + amount;
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("credit_accounts")
    .update({ balance: nextBalance, updated_at: now })
    .eq("user_id", userId);

  if (updateError) throw new Error(`Could not grant credits: ${updateError.message}`);

  const { error: ledgerError } = await supabase.from("credit_ledger").insert({
    id: randomUUID(),
    user_id: userId,
    amount,
    reason: input.reason,
    product_id: input.productId ?? null,
    created_at: now
  });

  if (ledgerError) throw new Error(`Could not record credit grant: ${ledgerError.message}`);

  return { balance: nextBalance, enabled: true };
}
