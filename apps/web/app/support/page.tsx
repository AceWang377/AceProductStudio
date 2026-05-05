import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CircleHelp, Mail, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `Support | ${siteConfig.name}`,
  description: "Support for AceStudio"
};

const helpItems = [
  {
    title: "Shopify connection",
    body: "Use the original myshopify.com domain for the store you are authorized to manage. Reconnect if Shopify permissions change.",
    href: "/settings/shopify"
  },
  {
    title: "Generation or upload issue",
    body: "Check the product job history first. Failed jobs usually include the OpenAI, storage, or credit error that blocked the action.",
    href: "/usage"
  },
  {
    title: "Launch readiness",
    body: "The launch page checks environment variables, database columns, storage, Shopify OAuth, credits, and rate limits.",
    href: "/launch"
  }
];

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="grid gap-6 border-b border-line pb-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <p className="text-sm text-muted">Support</p>
          <h1 className="mt-2 text-3xl font-semibold">Get help with AceStudio</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            For account access, Shopify publishing, product generation, storage,
            credits, or billing questions, contact support with the account email
            and product/job details.
          </p>
        </div>
        <div className="border border-line bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded bg-emerald-50 text-action">
              <Mail className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm text-muted">Email support</p>
              <a
                className="font-semibold text-action underline-offset-4 hover:underline"
                href={`mailto:${siteConfig.supportEmail}`}
              >
                {siteConfig.supportEmail}
              </a>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted">
            Include your login email, Shopify store domain, product title, and
            the latest failed job message if one appears.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {helpItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="studio-focus group border border-line bg-white p-5 transition hover:border-action hover:bg-canvas"
          >
            <div className="flex items-center justify-between gap-3">
              <CircleHelp className="h-5 w-5 text-action" aria-hidden />
              <ArrowUpRight className="h-4 w-4 text-muted transition group-hover:text-action" aria-hidden />
            </div>
            <h2 className="mt-5 text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
          </Link>
        ))}
      </section>

      <section className="border border-line bg-white p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-action" aria-hidden />
          <h2 className="text-lg font-semibold">Before publishing live</h2>
        </div>
        <div className="mt-4 grid gap-4 text-sm text-muted md:grid-cols-3">
          <p>Publish as draft first and review the product in Shopify Admin.</p>
          <p>Check generated images, SEO copy, price, SKU, and inventory.</p>
          <p>Remove any claim that is not supported by your real product details.</p>
        </div>
      </section>
    </div>
  );
}
