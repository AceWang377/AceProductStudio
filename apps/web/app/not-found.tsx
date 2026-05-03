import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/system/EmptyState";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: `Page not found | ${siteConfig.name}`
};

export default function NotFound() {
  return (
    <EmptyState
      icon={SearchX}
      eyebrow="404"
      title="This page does not exist"
      body="The page may have moved, or the product link may belong to another workspace."
      actions={[
        { href: "/dashboard", label: "Back to dashboard" },
        { href: "/products", label: "View products", variant: "secondary" }
      ]}
    />
  );
}
