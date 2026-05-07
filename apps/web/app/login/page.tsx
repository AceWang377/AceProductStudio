import { redirect } from "next/navigation";
import { LoginPageContent } from "@/components/auth/LoginPageContent";
import { getCurrentUser } from "@/lib/auth";
import { getAuthStatusMessage } from "@/lib/auth-messages";

export const dynamic = "force-dynamic";

type LoginSearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function safeNextPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export default async function LoginPage({
  searchParams
}: {
  searchParams?: LoginSearchParams;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  const params = searchParams ? await searchParams : {};
  const nextPath = safeNextPath(firstParam(params.next));
  const statusMessage = getAuthStatusMessage(firstParam(params.error));

  return (
    <LoginPageContent
      initialStatus={statusMessage.text}
      initialStatusType={statusMessage.type}
      nextPath={nextPath}
    />
  );
}
