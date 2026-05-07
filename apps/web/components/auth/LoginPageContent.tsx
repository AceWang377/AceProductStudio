"use client";

import Link from "next/link";
import { CheckCircle2, ImagePlus, ShieldCheck, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { LoginForm } from "@/components/auth/LoginForm";
import type { AuthStatusType } from "@/lib/auth-messages";
import { siteConfig } from "@/lib/site";

const loginStepIcons = [ImagePlus, Store, CheckCircle2] as const;

export function LoginPageContent({
  initialStatus,
  initialStatusType,
  nextPath
}: {
  initialStatus: string;
  initialStatusType: AuthStatusType;
  nextPath: string;
}) {
  const { t } = useLanguage();
  const copy = t.auth.login;

  return (
    <div className="grid min-h-[70vh] gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center">
      <section>
        <p className="text-sm font-medium text-action">{copy.secureAccess}</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight">
          {copy.titlePrefix} {siteConfig.name}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-muted">{copy.description}</p>
        <div className="mt-8 max-w-xl divide-y divide-line border-y border-line">
          {copy.steps.map((step, index) => (
            <LoginStep
              key={step.title}
              icon={loginStepIcons[index] ?? CheckCircle2}
              title={step.title}
              detail={step.detail}
            />
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <LoginForm
          initialStatus={initialStatus}
          initialStatusType={initialStatusType}
          nextPath={nextPath}
        />
        <div className="border border-line bg-white p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-action" aria-hidden />
            <div>
              <h2 className="text-sm font-semibold">{copy.safety.title}</h2>
              <p className="mt-1 text-sm leading-6 text-muted">{copy.safety.body}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <Link className="text-action" href="/support">
              {copy.safety.support}
            </Link>
            <Link className="text-action" href="/privacy">
              {copy.safety.privacy}
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}

function LoginStep({
  icon: Icon,
  title,
  detail
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
}) {
  return (
    <div className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 py-4">
      <span className="flex h-9 w-9 items-center justify-center rounded bg-white text-action">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-muted">{detail}</span>
      </span>
    </div>
  );
}
