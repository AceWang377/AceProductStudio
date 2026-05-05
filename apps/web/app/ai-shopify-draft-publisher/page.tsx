import { SeoLandingPage } from "@/components/seo/SeoLandingPage";
import {
  getSeoPageMetadata,
  getSeoPageStructuredData,
  seoPages
} from "@/lib/seo-pages";

const pageKey = "aiShopifyDraftPublisher";
const page = seoPages[pageKey];

export const metadata = getSeoPageMetadata(pageKey);

export default function AiShopifyDraftPublisherPage() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getSeoPageStructuredData(pageKey)) }}
      />
      <SeoLandingPage {...page} />
    </>
  );
}
