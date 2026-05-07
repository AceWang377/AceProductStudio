import "server-only";
import { createSign } from "crypto";
import { createSupabaseAdminClient, isSupabaseStorageEnabled } from "@/lib/supabase-admin";
import type { ShopifyConnection } from "@/lib/types";
import { siteConfig } from "@/lib/site";

const SEARCH_CONSOLE_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const SEARCH_CONSOLE_API_BASE = "https://searchconsole.googleapis.com/webmasters/v3";
const CUSTOM_SEARCH_URL = "https://www.googleapis.com/customsearch/v1";
const MAX_CRAWL_URLS = 24;

export type GrowthMonitorRunType = "search_console" | "technical_seo" | "ai_visibility" | "full";
type GrowthMonitorStatus = "completed" | "partial" | "failed";

export type SearchConsoleSummary = {
  configured: boolean;
  siteUrl?: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  topQueries: Array<{
    query: string;
    page?: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  sitemaps: Array<{
    path: string;
    lastSubmitted?: string;
    isPending?: boolean;
    warnings?: string;
    errors?: string;
  }>;
  error?: string;
};

export type TechnicalSeoSummary = {
  targetUrl: string;
  checkedUrls: number;
  brokenLinks: Array<{ url: string; source?: string; status?: number; error?: string }>;
  redirects: Array<{ url: string; finalUrl: string; status: number; hops: number }>;
  sitemapUrls: string[];
  robotsFound: boolean;
  sitemapFound: boolean;
  canonicalHostConsistent: boolean;
  error?: string;
};

export type AiVisibilitySummary = {
  configured: boolean;
  searchedQueries: number;
  mentions: Array<{
    query: string;
    found: boolean;
    topResult?: string;
    matchedUrl?: string;
    position?: number;
  }>;
  score: number;
  error?: string;
};

export type GrowthKeywordOpportunity = {
  query: string;
  page?: string;
  opportunityType: "low_ctr" | "striking_distance" | "zero_click" | "ai_visibility_gap";
  priority: "high" | "medium" | "low";
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  reason: string;
  recommendedAction: string;
};

export type GrowthActionPlanItem = {
  key: string;
  priority: "high" | "medium" | "low";
  title: string;
  detail: string;
  actionType:
    | "rewrite_title_meta"
    | "expand_product_content"
    | "add_faq_schema"
    | "fix_technical_seo"
    | "improve_ai_visibility"
    | "submit_sitemap";
  targetUrl?: string;
  query?: string;
  estimatedImpact: string;
};

export type GrowthMonitorOutput = {
  searchConsole: SearchConsoleSummary;
  technicalSeo: TechnicalSeoSummary;
  aiVisibility: AiVisibilitySummary;
  keywordOpportunities: GrowthKeywordOpportunity[];
  actionPlan: GrowthActionPlanItem[];
  commercialReadinessScore: number;
  recommendations: string[];
};

export type GrowthMonitorRun = {
  id: string;
  runType: GrowthMonitorRunType;
  status: GrowthMonitorStatus;
  targetUrl?: string;
  output?: Partial<GrowthMonitorOutput>;
  error?: string | null;
  createdAt: string;
};

type PersistableRun = {
  userId?: string | null;
  storeId?: string | null;
  runType: GrowthMonitorRunType;
  status: GrowthMonitorStatus;
  targetUrl?: string;
  input?: Record<string, unknown>;
  output?: Partial<GrowthMonitorOutput>;
  error?: string;
};

type SearchAnalyticsRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

function env(name: string) {
  return process.env[name]?.trim();
}

function normalizePrivateKey(value?: string) {
  return value?.replace(/\\n/g, "\n");
}

function base64Url(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function signedJwt({ clientEmail, privateKey }: { clientEmail: string; privateKey: string }) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(JSON.stringify({
    iss: clientEmail,
    scope: SEARCH_CONSOLE_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    exp: now + 3600,
    iat: now
  }));
  const unsignedToken = `${header}.${payload}`;
  const signature = createSign("RSA-SHA256").update(unsignedToken).sign(privateKey);
  return `${unsignedToken}.${base64Url(signature)}`;
}

async function getGoogleAccessToken() {
  const clientEmail = env("GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL");
  const privateKey = normalizePrivateKey(env("GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY"));
  if (!clientEmail || !privateKey) {
    throw new Error("Google Search Console service-account env vars are missing.");
  }

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: signedJwt({ clientEmail, privateKey })
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || typeof data.access_token !== "string") {
    throw new Error(typeof data.error_description === "string" ? data.error_description : "Could not get Google access token.");
  }
  return data.access_token as string;
}

function daysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function configuredSearchConsoleSiteUrl(targetUrl: string) {
  return env("GOOGLE_SEARCH_CONSOLE_SITE_URL") || targetUrl;
}

async function fetchSearchConsoleSummary(targetUrl: string): Promise<SearchConsoleSummary> {
  const siteUrl = configuredSearchConsoleSiteUrl(targetUrl);
  if (!env("GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL") || !env("GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY")) {
    return {
      configured: false,
      siteUrl,
      clicks: 0,
      impressions: 0,
      ctr: 0,
      position: 0,
      topQueries: [],
      sitemaps: [],
      error: "Search Console credentials are not configured yet."
    };
  }

  try {
    const accessToken = await getGoogleAccessToken();
    const encodedSite = encodeURIComponent(siteUrl);
    const analyticsResponse = await fetch(`${SEARCH_CONSOLE_API_BASE}/sites/${encodedSite}/searchAnalytics/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        startDate: daysAgo(31),
        endDate: daysAgo(3),
        dimensions: ["query", "page"],
        rowLimit: 10,
        searchType: "web"
      })
    });
    const analytics = await analyticsResponse.json().catch(() => ({}));
    if (!analyticsResponse.ok) {
      throw new Error(analytics.error?.message || "Search Analytics request failed.");
    }

    const sitemapResponse = await fetch(`${SEARCH_CONSOLE_API_BASE}/sites/${encodedSite}/sitemaps`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const sitemapData = await sitemapResponse.json().catch(() => ({}));
    const rows = Array.isArray(analytics.rows) ? analytics.rows as SearchAnalyticsRow[] : [];
    const totals = rows.reduce<{
      clicks: number;
      impressions: number;
      positionWeighted: number;
    }>(
      (sum, row) => ({
        clicks: sum.clicks + Number(row.clicks ?? 0),
        impressions: sum.impressions + Number(row.impressions ?? 0),
        positionWeighted: sum.positionWeighted + Number(row.position ?? 0) * Number(row.impressions ?? 0)
      }),
      { clicks: 0, impressions: 0, positionWeighted: 0 }
    );

    return {
      configured: true,
      siteUrl,
      clicks: Math.round(totals.clicks),
      impressions: Math.round(totals.impressions),
      ctr: totals.impressions ? Number((totals.clicks / totals.impressions).toFixed(4)) : 0,
      position: totals.impressions ? Number((totals.positionWeighted / totals.impressions).toFixed(1)) : 0,
      topQueries: rows.map((row) => ({
        query: String(row.keys?.[0] ?? ""),
        page: typeof row.keys?.[1] === "string" ? row.keys[1] : undefined,
        clicks: Math.round(Number(row.clicks ?? 0)),
        impressions: Math.round(Number(row.impressions ?? 0)),
        ctr: Number(Number(row.ctr ?? 0).toFixed(4)),
        position: Number(Number(row.position ?? 0).toFixed(1))
      })),
      sitemaps: Array.isArray(sitemapData.sitemap)
        ? sitemapData.sitemap.map((sitemap: Record<string, unknown>) => ({
          path: String(sitemap.path ?? ""),
          lastSubmitted: typeof sitemap.lastSubmitted === "string" ? sitemap.lastSubmitted : undefined,
          isPending: Boolean(sitemap.isPending),
          warnings: sitemap.warnings != null ? String(sitemap.warnings) : undefined,
          errors: sitemap.errors != null ? String(sitemap.errors) : undefined
        }))
        : []
    };
  } catch (error) {
    return {
      configured: true,
      siteUrl,
      clicks: 0,
      impressions: 0,
      ctr: 0,
      position: 0,
      topQueries: [],
      sitemaps: [],
      error: error instanceof Error ? error.message : "Search Console request failed."
    };
  }
}

function safeUrl(value: string) {
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol)) return null;
    if (/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.0\.0)/i.test(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

async function fetchWithRedirectInfo(url: string, maxHops = 5) {
  let currentUrl = url;
  let hops = 0;
  let status = 0;

  while (hops <= maxHops) {
    const response = await fetch(currentUrl, {
      redirect: "manual",
      headers: { "User-Agent": "AceStudioGrowthBot/1.0 (+https://acezerotrading.com)" }
    });
    status = response.status;
    const location = response.headers.get("location");
    if (!location || status < 300 || status >= 400) {
      const contentType = response.headers.get("content-type") ?? "";
      const text = contentType.includes("text") || contentType.includes("xml") || contentType.includes("html")
        ? await response.text().catch(() => "")
        : "";
      return { status, finalUrl: currentUrl, hops, text, contentType };
    }
    currentUrl = new URL(location, currentUrl).toString();
    hops += 1;
  }

  return { status, finalUrl: currentUrl, hops, text: "", contentType: "" };
}

function extractSitemapUrls(xml: string) {
  return [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)]
    .map((match) => match[1]?.trim())
    .filter((url): url is string => Boolean(url));
}

function extractLinks(html: string, baseUrl: string) {
  const base = new URL(baseUrl);
  return [...html.matchAll(/href=["']([^"']+)["']/gi)]
    .map((match) => match[1]?.trim())
    .filter((href): href is string => Boolean(href && !href.startsWith("#") && !href.startsWith("mailto:") && !href.startsWith("tel:")))
    .map((href) => {
      try {
        return new URL(href, base).toString();
      } catch {
        return null;
      }
    })
    .filter((url): url is string => Boolean(url))
    .filter((url) => new URL(url).origin === base.origin);
}

async function fetchTechnicalSeoSummary(targetUrl: string): Promise<TechnicalSeoSummary> {
  const target = safeUrl(targetUrl);
  if (!target) {
    return {
      targetUrl,
      checkedUrls: 0,
      brokenLinks: [],
      redirects: [],
      sitemapUrls: [],
      robotsFound: false,
      sitemapFound: false,
      canonicalHostConsistent: false,
      error: "Target URL is not a public HTTP/HTTPS URL."
    };
  }

  try {
    const robotsUrl = new URL("/robots.txt", target).toString();
    const sitemapUrl = new URL("/sitemap.xml", target).toString();
    const [home, robots, sitemap] = await Promise.all([
      fetchWithRedirectInfo(target.toString()),
      fetchWithRedirectInfo(robotsUrl).catch(() => null),
      fetchWithRedirectInfo(sitemapUrl).catch(() => null)
    ]);
    const sitemapUrls = sitemap?.status === 200 ? extractSitemapUrls(sitemap.text).slice(0, MAX_CRAWL_URLS) : [];
    const homepageLinks = home.text ? extractLinks(home.text, target.toString()).slice(0, MAX_CRAWL_URLS) : [];
    const urlsToCheck = Array.from(new Set([target.toString(), ...sitemapUrls, ...homepageLinks])).slice(0, MAX_CRAWL_URLS);
    const checks = await Promise.all(urlsToCheck.map(async (url) => {
      try {
        const result = await fetchWithRedirectInfo(url);
        return { url, ...result };
      } catch (error) {
        return { url, status: 0, finalUrl: url, hops: 0, text: "", contentType: "", error };
      }
    }));

    const brokenLinks = checks
      .filter((check) => check.status >= 400 || check.status === 0)
      .map((check) => ({
        url: check.url,
        status: check.status || undefined,
        error: check.error instanceof Error ? check.error.message : undefined
      }));
    const redirects = checks
      .filter((check) => check.hops > 0)
      .map((check) => ({
        url: check.url,
        finalUrl: check.finalUrl,
        status: check.status,
        hops: check.hops
      }));

    return {
      targetUrl: target.toString(),
      checkedUrls: checks.length,
      brokenLinks,
      redirects,
      sitemapUrls,
      robotsFound: robots?.status === 200,
      sitemapFound: sitemap?.status === 200 && sitemapUrls.length > 0,
      canonicalHostConsistent: checks.every((check) => safeUrl(check.finalUrl)?.hostname.replace(/^www\./, "") === target.hostname.replace(/^www\./, ""))
    };
  } catch (error) {
    return {
      targetUrl: target.toString(),
      checkedUrls: 0,
      brokenLinks: [],
      redirects: [],
      sitemapUrls: [],
      robotsFound: false,
      sitemapFound: false,
      canonicalHostConsistent: false,
      error: error instanceof Error ? error.message : "Technical SEO crawler failed."
    };
  }
}

function buildVisibilityQueries({
  targetUrl,
  products,
  connection
}: {
  targetUrl: string;
  products: Array<{ title?: string; product?: { title?: string } }>;
  connection?: ShopifyConnection;
}) {
  const hostname = safeUrl(targetUrl)?.hostname.replace(/^www\./, "") || "acezerotrading.com";
  const productTitles = products
    .map((product) => product.title || product.product?.title)
    .filter((title): title is string => Boolean(title))
    .slice(0, 4);
  return Array.from(new Set([
    `AceStudio Shopify AI product listing generator`,
    `${hostname} Shopify SEO GEO`,
    connection?.shopDomain ? `${connection.shopDomain} product SEO` : "",
    ...productTitles.map((title) => `${title} Shopify product`)
  ].filter(Boolean))).slice(0, 8);
}

async function fetchAiVisibilitySummary({
  targetUrl,
  products,
  connection
}: {
  targetUrl: string;
  products: Array<{ title?: string; product?: { title?: string } }>;
  connection?: ShopifyConnection;
}): Promise<AiVisibilitySummary> {
  const apiKey = env("GOOGLE_CUSTOM_SEARCH_API_KEY");
  const engineId = env("GOOGLE_CUSTOM_SEARCH_ENGINE_ID");
  const queries = buildVisibilityQueries({ targetUrl, products, connection });
  if (!apiKey || !engineId) {
    return {
      configured: false,
      searchedQueries: 0,
      mentions: queries.map((query) => ({ query, found: false })),
      score: 0,
      error: "Google Programmable Search credentials are not configured yet."
    };
  }

  const targetHost = safeUrl(targetUrl)?.hostname.replace(/^www\./, "") ?? "";
  const mentions = await Promise.all(queries.map(async (query) => {
    const url = new URL(CUSTOM_SEARCH_URL);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("cx", engineId);
    url.searchParams.set("q", query);
    url.searchParams.set("num", "5");
    const response = await fetch(url);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { query, found: false, topResult: undefined, matchedUrl: undefined };
    }
    const items = Array.isArray(data.items) ? data.items : [];
    const matchIndex = items.findIndex((item: Record<string, unknown>) => {
      const link = typeof item.link === "string" ? item.link : "";
      return safeUrl(link)?.hostname.replace(/^www\./, "") === targetHost;
    });
    return {
      query,
      found: matchIndex >= 0,
      topResult: typeof items[0]?.link === "string" ? items[0].link : undefined,
      matchedUrl: matchIndex >= 0 && typeof items[matchIndex]?.link === "string" ? items[matchIndex].link : undefined,
      position: matchIndex >= 0 ? matchIndex + 1 : undefined
    };
  }));

  const foundCount = mentions.filter((mention) => mention.found).length;
  return {
    configured: true,
    searchedQueries: queries.length,
    mentions,
    score: queries.length ? Math.round((foundCount / queries.length) * 100) : 0
  };
}

function buildRecommendations(output: Omit<GrowthMonitorOutput, "recommendations">) {
  const recommendations: string[] = [];
  if (!output.searchConsole.configured) {
    recommendations.push("Connect Google Search Console credentials to import clicks, impressions, CTR, and query data.");
  } else if (output.searchConsole.topQueries.some((query) => query.impressions > 20 && query.ctr < 0.02)) {
    recommendations.push("Rewrite titles/meta descriptions for high-impression, low-CTR queries.");
  }
  if (!output.technicalSeo.sitemapFound) {
    recommendations.push("Submit a valid sitemap.xml and make sure it appears in Google Search Console.");
  }
  if (output.technicalSeo.brokenLinks.length) {
    recommendations.push("Fix broken internal links before pushing more SEO/GEO content.");
  }
  if (output.technicalSeo.redirects.some((redirect) => redirect.hops > 1)) {
    recommendations.push("Reduce redirect chains so product URLs resolve in one hop.");
  }
  if (!output.aiVisibility.configured) {
    recommendations.push("Add Google Programmable Search credentials to start AI visibility proxy monitoring.");
  } else if (output.aiVisibility.score < 50) {
    recommendations.push("Create answer-friendly FAQ, comparison, and product-use pages for queries where your site is not visible.");
  }
  return recommendations;
}

function keywordPriority({
  impressions,
  ctr,
  position
}: {
  impressions: number;
  ctr: number;
  position: number;
}): "high" | "medium" | "low" {
  if (impressions >= 50 && (ctr < 0.015 || (position >= 8 && position <= 20))) return "high";
  if (impressions >= 15 && (ctr < 0.03 || (position >= 8 && position <= 30))) return "medium";
  return "low";
}

function buildKeywordOpportunities(searchConsole: SearchConsoleSummary, aiVisibility: AiVisibilitySummary) {
  const opportunities = new Map<string, GrowthKeywordOpportunity>();
  for (const query of searchConsole.topQueries) {
    const priority = keywordPriority(query);
    if (query.impressions >= 10 && query.clicks === 0) {
      opportunities.set(`zero:${query.query}:${query.page ?? ""}`, {
        query: query.query,
        page: query.page,
        opportunityType: "zero_click",
        priority,
        clicks: query.clicks,
        impressions: query.impressions,
        ctr: query.ctr,
        position: query.position,
        reason: "This query already gets impressions but no clicks, so the snippet may not match search intent.",
        recommendedAction: "Rewrite the SEO title and meta description around the exact buyer intent, then add a short FAQ answer for this query."
      });
      continue;
    }
    if (query.impressions >= 20 && query.ctr < 0.02) {
      opportunities.set(`ctr:${query.query}:${query.page ?? ""}`, {
        query: query.query,
        page: query.page,
        opportunityType: "low_ctr",
        priority,
        clicks: query.clicks,
        impressions: query.impressions,
        ctr: query.ctr,
        position: query.position,
        reason: "This query has meaningful visibility but a weak click-through rate.",
        recommendedAction: "Improve the title promise, meta description specificity, and product benefit language for this query."
      });
    }
    if (query.position >= 8 && query.position <= 20 && query.impressions >= 10) {
      opportunities.set(`distance:${query.query}:${query.page ?? ""}`, {
        query: query.query,
        page: query.page,
        opportunityType: "striking_distance",
        priority,
        clicks: query.clicks,
        impressions: query.impressions,
        ctr: query.ctr,
        position: query.position,
        reason: "This query is close to page-one or higher page-one ranking, so content improvements can have leverage.",
        recommendedAction: "Expand the page with product facts, comparison context, buyer FAQs, and image alt text that directly mention this query."
      });
    }
  }

  for (const mention of aiVisibility.mentions) {
    if (!mention.found) {
      opportunities.set(`ai:${mention.query}`, {
        query: mention.query,
        opportunityType: "ai_visibility_gap",
        priority: "medium",
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: 0,
        reason: "The site was not visible for this AI-search proxy query.",
        recommendedAction: "Create answer-friendly FAQ, comparison, and product-use content that directly satisfies this query."
      });
    }
  }

  return Array.from(opportunities.values())
    .sort((a, b) => {
      const priorityScore = { high: 3, medium: 2, low: 1 };
      return priorityScore[b.priority] - priorityScore[a.priority] || b.impressions - a.impressions;
    })
    .slice(0, 10);
}

function buildActionPlan({
  searchConsole,
  technicalSeo,
  aiVisibility,
  keywordOpportunities
}: {
  searchConsole: SearchConsoleSummary;
  technicalSeo: TechnicalSeoSummary;
  aiVisibility: AiVisibilitySummary;
  keywordOpportunities: GrowthKeywordOpportunity[];
}) {
  const items: GrowthActionPlanItem[] = [];
  const topKeyword = keywordOpportunities[0];

  if (!searchConsole.configured) {
    items.push({
      key: "connect-search-console",
      priority: "high",
      title: "Connect Google Search Console",
      detail: "Ranking optimization needs query, impression, CTR, and position data from the user's verified domain.",
      actionType: "expand_product_content",
      estimatedImpact: "Turns the audit from generic SEO advice into query-specific optimization."
    });
  }

  if (topKeyword) {
    items.push({
      key: `keyword-${topKeyword.opportunityType}-${topKeyword.query}`,
      priority: topKeyword.priority,
      title: `Optimize for "${topKeyword.query}"`,
      detail: topKeyword.reason,
      actionType: topKeyword.opportunityType === "low_ctr" || topKeyword.opportunityType === "zero_click"
        ? "rewrite_title_meta"
        : "expand_product_content",
      targetUrl: topKeyword.page,
      query: topKeyword.query,
      estimatedImpact: topKeyword.impressions
        ? `${topKeyword.impressions} recent impressions at ${(topKeyword.ctr * 100).toFixed(1)}% CTR.`
        : "Improves answer-engine coverage for a missing visibility query."
    });
  }

  if (!technicalSeo.sitemapFound) {
    items.push({
      key: "submit-sitemap",
      priority: "high",
      title: "Submit and validate sitemap",
      detail: "A missing or unreadable sitemap slows down discovery of product and landing pages.",
      actionType: "submit_sitemap",
      targetUrl: technicalSeo.targetUrl,
      estimatedImpact: "Improves crawl discovery for new product and SEO landing pages."
    });
  }

  if (technicalSeo.brokenLinks.length) {
    items.push({
      key: "fix-broken-links",
      priority: "high",
      title: "Fix broken internal links",
      detail: `${technicalSeo.brokenLinks.length} broken links were found during the live crawl.`,
      actionType: "fix_technical_seo",
      targetUrl: technicalSeo.brokenLinks[0]?.url,
      estimatedImpact: "Protects crawl quality and prevents users landing on dead pages."
    });
  }

  if (technicalSeo.redirects.some((redirect) => redirect.hops > 1)) {
    items.push({
      key: "reduce-redirects",
      priority: "medium",
      title: "Reduce redirect chains",
      detail: "Some URLs require multiple redirect hops before loading the final page.",
      actionType: "fix_technical_seo",
      targetUrl: technicalSeo.redirects.find((redirect) => redirect.hops > 1)?.url,
      estimatedImpact: "Improves crawl efficiency and page experience."
    });
  }

  if (aiVisibility.configured && aiVisibility.score < 60) {
    items.push({
      key: "ai-visibility-content",
      priority: "medium",
      title: "Create AI-answer content blocks",
      detail: "Visibility checks suggest the site is not consistently appearing for brand/product answer queries.",
      actionType: "improve_ai_visibility",
      estimatedImpact: "Improves GEO readiness with FAQs, comparisons, and concrete buyer answers."
    });
  }

  return items.slice(0, 6);
}

function buildCommercialReadinessScore({
  searchConsole,
  technicalSeo,
  aiVisibility,
  actionPlan
}: {
  searchConsole: SearchConsoleSummary;
  technicalSeo: TechnicalSeoSummary;
  aiVisibility: AiVisibilitySummary;
  actionPlan: GrowthActionPlanItem[];
}) {
  let score = 0;
  if (searchConsole.configured) score += 25;
  if (searchConsole.topQueries.length) score += 20;
  if (technicalSeo.sitemapFound) score += 15;
  if (!technicalSeo.brokenLinks.length) score += 15;
  if (technicalSeo.canonicalHostConsistent) score += 10;
  if (aiVisibility.configured) score += 10;
  if (actionPlan.some((item) => item.priority === "high")) score += 5;
  return Math.max(0, Math.min(100, score));
}

async function persistGrowthMonitorRun(run: PersistableRun) {
  if (!isSupabaseStorageEnabled()) return null;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("growth_monitor_runs")
    .insert({
      user_id: run.userId ?? null,
      store_id: run.storeId ?? null,
      run_type: run.runType,
      status: run.status,
      target_url: run.targetUrl ?? null,
      input: run.input ?? {},
      output: run.output ?? {},
      error: run.error ?? null
    })
    .select("*")
    .single();
  if (error) {
    throw new Error(`Could not save growth monitor run: ${error.message}`);
  }
  return data;
}

function mapRun(row: Record<string, unknown>): GrowthMonitorRun {
  return {
    id: String(row.id),
    runType: String(row.run_type) as GrowthMonitorRunType,
    status: String(row.status) as GrowthMonitorStatus,
    targetUrl: typeof row.target_url === "string" ? row.target_url : undefined,
    output: row.output && typeof row.output === "object" ? row.output as Partial<GrowthMonitorOutput> : undefined,
    error: typeof row.error === "string" ? row.error : null,
    createdAt: typeof row.created_at === "string" ? row.created_at : new Date().toISOString()
  };
}

export async function listLatestGrowthMonitorRuns(userId: string, limit = 3) {
  if (!isSupabaseStorageEnabled()) return [];
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("growth_monitor_runs")
    .select("*")
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return (data ?? []).map((row) => mapRun(row as Record<string, unknown>));
}

export async function runGrowthMonitor({
  userId,
  storeId,
  connection,
  targetUrl,
  products = []
}: {
  userId?: string | null;
  storeId?: string | null;
  connection?: ShopifyConnection;
  targetUrl?: string;
  products?: Array<{ title?: string; product?: { title?: string } }>;
}) {
  const finalTargetUrl = targetUrl || env("GROWTH_MONITOR_SITE_URL") || siteConfig.url;
  const [searchConsole, technicalSeo, aiVisibility] = await Promise.all([
    fetchSearchConsoleSummary(finalTargetUrl),
    fetchTechnicalSeoSummary(finalTargetUrl),
    fetchAiVisibilitySummary({ targetUrl: finalTargetUrl, products, connection })
  ]);
  const outputWithoutRecommendations = { searchConsole, technicalSeo, aiVisibility };
  const keywordOpportunities = buildKeywordOpportunities(searchConsole, aiVisibility);
  const actionPlan = buildActionPlan({
    ...outputWithoutRecommendations,
    keywordOpportunities
  });
  const output: GrowthMonitorOutput = {
    ...outputWithoutRecommendations,
    keywordOpportunities,
    actionPlan,
    commercialReadinessScore: buildCommercialReadinessScore({
      ...outputWithoutRecommendations,
      actionPlan
    }),
    recommendations: buildRecommendations({
      ...outputWithoutRecommendations,
      keywordOpportunities,
      actionPlan,
      commercialReadinessScore: 0
    })
  };
  const status: GrowthMonitorStatus =
    searchConsole.error || technicalSeo.error || aiVisibility.error ? "partial" : "completed";

  await persistGrowthMonitorRun({
    userId,
    storeId,
    runType: "full",
    status,
    targetUrl: finalTargetUrl,
    input: { targetUrl: finalTargetUrl },
    output
  });

  return output;
}
