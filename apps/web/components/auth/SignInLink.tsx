"use client";

import Link from "next/link";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function SignInLink() {
  const { t } = useLanguage();

  return (
    <Link
      href="/login"
      className="studio-focus inline-flex h-10 items-center rounded bg-action px-3 text-sm font-semibold text-white"
    >
      {t.shell.signIn}
    </Link>
  );
}
