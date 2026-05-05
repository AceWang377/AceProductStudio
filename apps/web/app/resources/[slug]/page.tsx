import { notFound } from "next/navigation";
import { SeoArticlePage } from "@/components/seo/SeoArticlePage";
import {
  getSeoResourceMetadata,
  getSeoResourceStructuredData,
  seoResourceList,
  seoResources,
  type SeoResourceSlug
} from "@/lib/seo-resources";

type ResourcePageParams = Promise<{
  slug: string;
}>;

export function generateStaticParams() {
  return seoResourceList.map((article) => ({
    slug: article.slug
  }));
}

export async function generateMetadata({ params }: { params: ResourcePageParams }) {
  const { slug } = await params;
  if (!isSeoResourceSlug(slug)) return {};
  return getSeoResourceMetadata(slug);
}

export default async function ResourceArticlePage({ params }: { params: ResourcePageParams }) {
  const { slug } = await params;
  if (!isSeoResourceSlug(slug)) notFound();

  const article = seoResources[slug];

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getSeoResourceStructuredData(slug)) }}
      />
      <SeoArticlePage article={article} />
    </>
  );
}

function isSeoResourceSlug(value: string): value is SeoResourceSlug {
  return value in seoResources;
}
