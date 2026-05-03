import { NextResponse } from "next/server";
import {
  COPY_GENERATION_CREDIT_COST,
  IMAGE_GENERATION_CREDIT_COST,
  getCreditAccount
} from "@/lib/credits";

export async function GET() {
  const account = await getCreditAccount();

  return NextResponse.json({
    balance: account.balance,
    enabled: account.enabled,
    isUnlimited: Boolean(account.isUnlimited),
    costs: {
      image: IMAGE_GENERATION_CREDIT_COST,
      copy: COPY_GENERATION_CREDIT_COST
    }
  });
}
