import { SeoLandingPage } from "@/components/seo/SeoLandingPage";
import {
  getSeoPageMetadata,
  getSeoPageStructuredData,
  seoPages
} from "@/lib/seo-pages";

const pageKey = "shopifyAiProductListingGenerator";
const page = seoPages[pageKey];

export const metadata = getSeoPageMetadata(pageKey);

export default function ShopifyAiProductListingGeneratorPage() {
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
