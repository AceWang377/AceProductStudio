const baseUrl = (process.env.SMOKE_TEST_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  .replace(/\/$/, "");

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

const results = [];
for (const check of checks) {
  results.push(await checkRoute(check));
}

console.log(`Smoke test passed for ${baseUrl}`);
for (const result of results) {
  console.log(`- ${result}`);
}
