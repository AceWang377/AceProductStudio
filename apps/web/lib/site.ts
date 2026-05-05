export const siteConfig = {
  name: "AceStudio",
  company: process.env.NEXT_PUBLIC_COMPANY_NAME?.trim() || "AceStudio",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "support@aceproductstudio.com",
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
    return configuredUrl.replace(/\/$/, "");
  }

  return "https://acezerotrading.com";
}
