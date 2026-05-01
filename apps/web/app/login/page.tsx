import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth";

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
  const error = firstParam(params.error);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <LoginForm initialStatus={error} nextPath={nextPath} />
    </div>
  );
}
