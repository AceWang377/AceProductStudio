import { SeoLandingPage } from "@/components/seo/SeoLandingPage";
import {
  getSeoPageMetadata,
  getSeoPageStructuredData,
  seoPages
} from "@/lib/seo-pages";

const pageKey = "zhShopifyProductImageDescriptionTool";
const page = seoPages[pageKey];

export const metadata = getSeoPageMetadata(pageKey);

export default function ZhShopifyProductImageDescriptionAiToolPage() {
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
