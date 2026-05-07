import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, ClipboardCheck, ShieldCheck } from "lucide-react";
import { requireCurrentUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/credits";
import { realUserQaSuite } from "@/lib/qa-suite";
import { ReleaseQaChecklist } from "@/components/qa/ReleaseQaChecklist";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Release QA"
};

export default async function ReleaseQaPage() {
  const user = await requireCurrentUser();
  if (!isAdminEmail(user.email)) redirect("/dashboard");

  return (
    <div className="space-y-6">
      <section className="grid gap-5 border-b border-line pb-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <p className="text-sm text-muted">Release testing</p>
          <h1 className="mt-1 text-3xl font-semibold">{realUserQaSuite.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            {realUserQaSuite.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/launch"
              className="studio-focus inline-flex h-10 items-center gap-2 rounded border border-line bg-white px-4 text-sm font-semibold hover:bg-canvas"
            >
              Open launch checklist
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/admin"
              className="studio-focus inline-flex h-10 items-center gap-2 rounded bg-action px-4 text-sm font-semibold text-white"
            >
              Open admin support
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
        <aside className="border border-line bg-white p-5">
          <ShieldCheck className="h-5 w-5 text-action" aria-hidden />
          <h2 className="mt-3 font-semibold">Admin-only QA</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            This page is a real-user journey checklist for your internal release run. It is not visible to normal merchant accounts.
          </p>
        </aside>
      </section>

      <section className="border border-line bg-white p-5">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-action" aria-hidden />
          <h2 className="text-lg font-semibold">Preflight</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {realUserQaSuite.preflight.map((item) => (
            <div key={item} className="border border-line bg-canvas p-3 text-sm leading-6 text-muted">
              {item}
            </div>
          ))}
        </div>
      </section>

      <ReleaseQaChecklist version={realUserQaSuite.version} steps={realUserQaSuite.steps} />
    </div>
  );
}
