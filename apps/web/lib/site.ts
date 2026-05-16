export const siteConfig = {
  name: "AceStudio",
  company: process.env.NEXT_PUBLIC_COMPANY_NAME?.trim() || "ACE ZERP TRADING LTD",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "admin@acezerotrading.com",
  url: getPublicSiteUrl()
};

function getPublicSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (
    configuredUrl &&
    /^https?:\/\//.test(configuredUrl) &&
    !configuredUrl.includes("localhost") &&
    !configuredUrl.includes("127.0.0.1")
  ) {
    try {
      const url = new URL(configuredUrl);
      const hostname = url.hostname.replace(/^www\./, "");
      if (hostname === "acezerotrading.com" || hostname === "studio.acezerotrading.com") {
        return `https://${hostname}`;
      }
      if (hostname.endsWith(".vercel.app")) return "https://studio.acezerotrading.com";
      url.protocol = "https:";
      url.hostname = hostname;
      url.pathname = "";
      url.search = "";
      url.hash = "";
      return url.toString().replace(/\/$/, "");
    } catch {
      return "https://acezerotrading.com";
    }
  }

  return "https://studio.acezerotrading.com";
}
