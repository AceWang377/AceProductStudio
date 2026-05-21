const baseUrl = (process.env.SMOKE_TEST_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  .replace(/\/$/, "");
const canonicalOrigin = "https://acezerotrading.com";
const canonicalHost = new URL(canonicalOrigin).hostname;

const checks = [
  { path: "/", name: "landing page", statuses: [200] },
  { path: "/login", name: "login page", statuses: [200] },
  { path: "/resources", name: "resources page", statuses: [200] },
  { path: "/robots.txt", name: "robots.txt", statuses: [200] },
  { path: "/sitemap.xml", name: "sitemap.xml", statuses: [200] },
  { path: "/api/health", name: "health endpoint", statuses: [200, 503] }
];

async function checkRoute(check) {
  const url = `${baseUrl}${check.path}`;
  const response = await fetch(url, { redirect: "manual" });
  if (!check.statuses.includes(response.status)) {
    throw new Error(`${check.name} returned ${response.status} for ${url}`);
  }
  return `${check.name}: ${response.status}`;
}

async function fetchText(path) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status} for ${url}`);
  }
  return response.text();
}

function assertNoRedirectSourceUrls(text, source) {
  const blockedValues = [
    "https://www.acezerotrading.com",
    "http://www.acezerotrading.com",
    "http://acezerotrading.com"
  ];

  for (const value of blockedValues) {
    if (text.includes(value)) {
      throw new Error(`${source} contains redirect source URL ${value}`);
    }
  }
}

function extractSitemapLocs(xml) {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);
}

async function checkCanonicalSeoSignals() {
  const [homeHtml, robotsText, sitemapXml] = await Promise.all([
    fetchText("/"),
    fetchText("/robots.txt"),
    fetchText("/sitemap.xml")
  ]);

  assertNoRedirectSourceUrls(homeHtml, "landing page HTML");
  assertNoRedirectSourceUrls(robotsText, "robots.txt");
  assertNoRedirectSourceUrls(sitemapXml, "sitemap.xml");

  const canonicalMatch = homeHtml.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  if (!canonicalMatch || canonicalMatch[1].replace(/\/$/, "") !== canonicalOrigin) {
    throw new Error(`landing page canonical must be ${canonicalOrigin}`);
  }

  if (!robotsText.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`)) {
    throw new Error(`robots.txt must point to ${canonicalOrigin}/sitemap.xml`);
  }

  const sitemapLocs = extractSitemapLocs(sitemapXml);
  if (sitemapLocs.length === 0) {
    throw new Error("sitemap.xml contains no loc entries");
  }

  for (const loc of sitemapLocs) {
    const url = new URL(loc);
    if (url.protocol !== "https:" || url.hostname !== canonicalHost) {
      throw new Error(`sitemap.xml contains non-canonical URL ${loc}`);
    }
  }

  return `canonical SEO signals: ${sitemapLocs.length} sitemap URLs`;
}

async function checkProductionRedirects() {
  const redirectChecks = [
    "https://www.acezerotrading.com/",
    "http://www.acezerotrading.com/",
    "http://acezerotrading.com/"
  ];
  const results = [];

  for (const url of redirectChecks) {
    let currentUrl = url;
    const chain = [];

    for (let hop = 0; hop < 3; hop += 1) {
      const response = await fetch(currentUrl, { redirect: "manual" });
      const location = response.headers.get("location");
      chain.push(`${response.status}${location ? ` -> ${location}` : ""}`);

      if ([301, 308].includes(response.status) && location) {
        currentUrl = new URL(location, currentUrl).toString();
        continue;
      }

      if (response.status !== 200 || currentUrl.replace(/\/$/, "") !== canonicalOrigin) {
        throw new Error(`${url} resolved incorrectly: ${chain.join(" | ")}`);
      }

      results.push(`${url}: ${chain.join(" | ")}`);
      break;
    }

    if (chain.length >= 3 && !chain.at(-1)?.startsWith("200")) {
      throw new Error(`${url} did not resolve to ${canonicalOrigin} within 3 hops: ${chain.join(" | ")}`);
    }
  }

  return results;
}

const results = [];
for (const check of checks) {
  results.push(await checkRoute(check));
}

const base = new URL(baseUrl);
if (base.protocol === "https:" && base.hostname === canonicalHost) {
  results.push(await checkCanonicalSeoSignals());
  results.push(...await checkProductionRedirects());
}

console.log(`Smoke test passed for ${baseUrl}`);
for (const result of results) {
  console.log(`- ${result}`);
}
