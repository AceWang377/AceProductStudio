import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(scriptDir, "..");
const screenshotDir = resolve(appDir, "test-results/visual");
const configuredBaseUrl = process.env.VISUAL_CHECK_BASE_URL || process.env.SMOKE_TEST_BASE_URL;
const routePaths = (process.env.VISUAL_CHECK_ROUTES || "/,/login,/shopify-seo-geo-optimizer")
  .split(",")
  .map((route) => route.trim())
  .filter(Boolean);
const routes = routePaths.map((path) => ({
  name: path === "/" ? "home" : path.replace(/^\/+/, "").replace(/[^a-z0-9-]+/gi, "-"),
  path
}));

let devServer;
let devServerLog = "";

try {
  await mkdir(screenshotDir, { recursive: true });
  const baseUrl = configuredBaseUrl || await startDevServer();
  const browser = await launchBrowser();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
    storageState: process.env.VISUAL_CHECK_STORAGE_STATE || undefined
  });
  const page = await context.newPage();
  const results = [];

  for (const route of routes) {
    const url = new URL(route.path, baseUrl).toString();
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
    const status = response?.status() ?? 0;
    const bodyText = await page.locator("body").innerText({ timeout: 10_000 }).catch(() => "");
    const screenshotPath = resolve(screenshotDir, `${route.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    results.push({
      route: route.path,
      finalUrl: page.url(),
      status,
      screenshot: screenshotPath,
      missingPage: /This page does not exist|404/i.test(bodyText)
    });
  }

  await context.close();
  await browser.close();

  for (const result of results) {
    const warning = result.missingPage ? " possible 404 content" : "";
    const redirected = new URL(result.finalUrl).pathname !== result.route ? ` redirected to ${result.finalUrl}` : "";
    console.log(`${result.status} ${result.route} -> ${result.screenshot}${redirected}${warning}`);
  }

  const failed = results.filter((result) => result.status >= 400 || result.missingPage);
  if (failed.length) {
    throw new Error(`Visual check found ${failed.length} route issue(s).`);
  }
} finally {
  if (devServer) {
    devServer.kill("SIGTERM");
  }
}

async function launchBrowser() {
  const preferredChannel = process.env.PLAYWRIGHT_CHANNEL || "chrome";

  try {
    return await chromium.launch({ channel: preferredChannel, headless: true });
  } catch (channelError) {
    try {
      return await chromium.launch({ headless: true });
    } catch (bundledError) {
      console.error(
        `Could not launch Playwright browser. Install a browser with "npx playwright install chromium" or set PLAYWRIGHT_CHANNEL to an installed Chrome channel.\n\nPreferred channel error: ${channelError}\n\nBundled browser error: ${bundledError}`
      );
      throw bundledError;
    }
  }
}

async function startDevServer() {
  const port = Number(process.env.VISUAL_CHECK_PORT || 3020);
  const baseUrl = `http://localhost:${port}`;

  devServer = spawn(
    process.execPath,
    ["../../node_modules/next/dist/bin/next", "dev", "--port", String(port)],
    {
      cwd: appDir,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  devServer.stdout.on("data", (data) => {
    const text = data.toString();
    devServerLog += text;
    if (process.env.VISUAL_CHECK_VERBOSE) process.stdout.write(text);
  });
  devServer.stderr.on("data", (data) => {
    const text = data.toString();
    devServerLog += text;
    if (process.env.VISUAL_CHECK_VERBOSE) process.stderr.write(text);
  });

  await waitForServer(baseUrl);
  return baseUrl;
}

async function waitForServer(baseUrl) {
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Keep waiting while Next.js starts.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 500));
  }

  throw new Error(`Timed out waiting for ${baseUrl}\n\nDev server output:\n${devServerLog.trim()}`);
}
