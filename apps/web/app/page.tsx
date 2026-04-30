import { redirect } from "next/navigation";

type HomeSearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({
  searchParams
}: {
  searchParams?: HomeSearchParams;
}) {
  const params = searchParams ? await searchParams : {};
  const code = firstParam(params.code);
  const next = firstParam(params.next) || "/dashboard";

  if (code) {
    redirect(`/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`);
  }

  redirect("/dashboard");
}
